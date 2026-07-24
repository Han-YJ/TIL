# TanStack Query Suspense·에러 경계에서 자주 밟는 함정 2가지

Suspense + ErrorBoundary로 조회 로딩·에러를 처리할 때, 겉보기엔 멀쩡한데 실제 사용자 경로에서만 드러나는 함정 둘. 둘 다 "에러 상태를 언제 화면에 반영하느냐"와 "Suspense 훅이 언제 실행되느냐"에 관한 것이다.

## 1. `isError`는 refetch 실패까지 포함한다 — 초기 로드 실패만 잡으려면 `isLoadingError`

### 증상

상세 화면을 편집·저장 → **성공** → 그런데 화면이 통째로 에러로 바뀐다. 방금 저장한 데이터는 멀쩡히 캐시에 있는데도.

### 원인

```tsx
if (query.isError) return <ErrorFallback />; // ← 함정
```

`isError`는 "이 쿼리가 지금 에러 상태냐"이지 "데이터를 한 번도 못 받았느냐"가 아니다. 이미 성공적으로 로드된 뒤에 일어나는 **refetch 실패도 `isError = true`로 만든다** (`data`는 유지한 채).

저장 성공 → `invalidateQueries` → 활성 옵저버라 즉시 refetch → 그 refetch가 일시적으로 5xx → `isError`가 켜지고 위 분기로 들어간다. `refetchOnReconnect` 기본값이 `true`라 네트워크 복구 시점에도 같은 경로가 열린다.

query-core는 이 둘을 이미 구분해 둔다:

```
isLoadingError = isError && data === undefined   // 초기 로드 실패
isRefetchError = isError && data !== undefined    // 로드 후 refetch 실패
```

### 해법

"표시할 데이터가 아예 없는 실패"만 화면 대체로 처리한다:

```tsx
if (query.isLoadingError) return <ErrorFallback />;
// refetch 실패는 기존 화면 유지 (필요하면 조용한 stale 표시)
```

곁들여 알아둘 것 — **`placeholderData`(예: `keepPreviousData`, 목록 캐시 셸)는 `status === 'pending'`일 때만 주입된다.** 즉 에러 시점엔 placeholder가 자동으로 빠진다. "셸이 있어도 에러로 덮어야 하나?" 같은 수동 처리가 필요 없고, `isLoadingError`가 그 경우까지 정확히 가른다.

## 2. `useSuspenseQuery`를 여러 개 나란히 쓰면 직렬 waterfall이 된다

### 증상

한 컴포넌트에서 두 데이터를 각각 `useSuspenseQuery`로 가져오는데, 느린 경로(캐시 미스 후 재조회 등)에서 요청이 **순차로** 나간다. 병렬이면 1회 왕복인데 2회가 된다.

```tsx
const { data: a } = useSuspenseQuery(queryA); // pending이면 여기서 suspend
const { data: b } = useSuspenseQuery(queryB); // ← a 도착 전엔 실행조차 안 됨
```

### 원인

`useSuspenseQuery`는 pending이면 **그 자리에서 throw(suspend)** 한다. 함수가 거기서 끝나니 다음 줄이 실행되지 않는다. 그래서 A 왕복 → 리렌더 → B 왕복으로 직렬이 된다.

캐시 히트일 땐 둘 다 즉시 반환이라 안 드러나고, **캐시 미스 경로에서만** 두 배로 기다린다.

### 해법

여러 suspense 쿼리는 한 호출로 묶는다:

```tsx
const [{ data: a }, { data: b }] = useSuspenseQueries({
  queries: [queryA, queryB],
});
```

한 훅이 두 쿼리를 **먼저 등록하고** suspend하므로 병렬로 나간다. 코드량도 같다. 단, `useSuspenseQueries`는 전부 도착해야 렌더되므로(부분 렌더 없음), 두 데이터가 함께 필요한 경우에 맞다.

## 일반화

- **에러 상태를 화면에 반영할 땐 "데이터가 없느냐"와 "지금 에러냐"를 구분하라.** `isError`는 후자라 refetch 실패까지 포함한다. 이미 보여줄 게 있으면 화면을 덮지 말 것.
- **Suspense 훅은 pending에서 즉시 suspend한다.** 나란히 놓으면 순차 실행 = waterfall. 병렬이 필요하면 `*Queries` 계열로 묶는다. (같은 원리가 `useQueries`, React 19 `use`에도 적용된다.)
