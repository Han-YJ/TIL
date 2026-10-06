# 무한 스크롤 목록이 다음 페이지 실패 한 번에 통째로 에러 화면이 된다

스크롤해서 두세 페이지를 받아 둔 목록이 있었다. 맨 아래에서 다음 페이지 요청이 실패하자, 이미 보고 있던 항목까지 전부 사라지고 「불러오지 못했어요」 화면 하나만 남았다. [다시 시도]를 누르니 첫 페이지부터 다시 그려져 스크롤 위치도 잃었다.

[TanStack Query Suspense·에러 경계 함정](./tanstack-query-suspense-error-pitfalls.md) 1번(「`isError`는 refetch 실패까지 포함한다」)의 무한 쿼리판이다. 다만 그 글의 처방(`isLoadingError`/`isRefetchError`로 가르기)을 그대로 옮기면 **다음 페이지 실패는 두 갈래 어디에도 안 잡힌다.** 아래는 `@tanstack/query-core` 5.100.9 소스 기준이다.

## 증상

흔한 모양의 무한 목록이다.

```tsx
const query = useInfiniteQuery(listOptions);

if (query.isPending) return <Skeleton />;
if (query.isError) return <ErrorState onRetry={() => queryClient.resetQueries({ queryKey })} />;

const items = query.data.pages.flatMap((p) => p.items);
return (
  <>
    {items.map(renderItem)}
    <div ref={sentinelRef} /> {/* 화면에 들어오면 fetchNextPage() */}
  </>
);
```

첫 로드 실패를 막으려고 쓴 `isError` 분기가, 다음 페이지 실패에서도 켜진다.

## 원인 — 에러는 데이터를 지우지 않고 status 만 바꾼다

쿼리가 실패하면 리듀서는 기존 state 를 펼친 채 `status`만 `'error'`로 덮는다. `data`는 그대로 남는다.

```ts
// query-core/src/query.ts — case 'error'
return {
  ...state,          // data 유지
  error,
  status: 'error',
  fetchStatus: 'idle',
  isInvalidated: true,
}
```

무한 쿼리에서 `fetchNextPage()`도 같은 쿼리의 fetch 라서, 실패하면 똑같이 `status: 'error'`가 된다. 받아 둔 `pages`는 멀쩡히 있는데 `isError`가 `true`다.

그럼 기존 글처럼 `isLoadingError`(데이터 없음)와 `isRefetchError`(데이터 있음)로 가르면 될 것 같지만, 무한 쿼리 옵저버는 `isRefetchError`를 다시 좁힌다.

```ts
// query-core/src/queryObserver.ts
isLoadingError: isError && !hasData,
isRefetchError: isError && hasData,

// query-core/src/infiniteQueryObserver.ts — createResult
const fetchDirection = state.fetchMeta?.fetchMore?.direction
const isFetchNextPageError = isError && fetchDirection === 'forward'
const isFetchPreviousPageError = isError && fetchDirection === 'backward'
// ...
isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
```

즉 무한 쿼리의 에러는 네 갈래로 나뉜다.

| 플래그 | 언제 | `data` |
|---|---|---|
| `isLoadingError` | 첫 로드 실패 | 없음 |
| `isRefetchError` | 무효화·포커스 등 **전체 재조회** 실패 | 있음 |
| `isFetchNextPageError` | `fetchNextPage()` 실패 | 있음 |
| `isFetchPreviousPageError` | `fetchPreviousPage()` 실패 | 있음 |

방향은 마지막 fetch 의 `fetchMeta.fetchMore.direction` 에서 온다. 일반 refetch 는 `fetchMore` 가 없어 방향이 비고, 그래서 그 실패는 `isRefetchError` 쪽으로 간다. `isLoadingError`/`isRefetchError` 둘만 보면 다음 페이지 실패는 **어느 쪽에도 안 걸린다.**

## 해법 — 전체 에러는 「데이터가 없을 때」만, 다음 페이지 실패는 그 자리에서

```tsx
if (query.isPending) return <Skeleton />;
// 받아 둔 게 없을 때만 목록 전체를 에러로 바꾼다
if (!query.data) return <ErrorState onRetry={() => query.refetch()} />;

return (
  <>
    {items.map(renderItem)}
    {query.isFetchNextPageError && (
      <InlineRetry onRetry={() => query.fetchNextPage()} />  // 하단 한 줄만
    )}
    <div ref={sentinelRef} />
  </>
);
```

`isPending` 다음 줄에서 `!data` 는 사실상 `isLoadingError` 와 같다. 플래그 이름 대신 「보여 줄 게 있느냐」로 쓰면 앞으로 에러 갈래가 늘어도 같은 실수를 안 한다. 전체 재조회 실패(`isRefetchError`)는 목록을 그대로 두는 쪽이 대개 맞다 — 다음 재조회가 성공하면 조용히 풀린다.

## 함정 2 — 목록을 남기자마자 감시자가 실패한 요청을 반복한다

에러 화면이 목록을 갈아치우던 때는 센티넬(`sentinelRef`)도 같이 사라져서 몰랐던 문제가 있다. 흔한 센티넬 effect 는 이렇다.

```tsx
useEffect(() => {
  if (!el || !hasNextPage) return;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !isFetchingNextPage) fetchNextPage();
  });
  io.observe(el);
  return () => io.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

`fetchNextPage()` 가 실패하면 `isFetchingNextPage` 가 `true → false` 로 바뀌고 effect 가 다시 돈다. IntersectionObserver 는 `observe()` 직후 **현재 교차 상태로 콜백을 한 번 부른다**(사양). 실패한 그 자리에서 센티넬은 여전히 화면 안이므로, 곧바로 `fetchNextPage()` 가 다시 나간다. 실패 → 재구독 → 즉시 재요청이 사용자 조작 없이 반복된다 (쿼리 `retry` 설정만큼 늦춰질 뿐 끊기지 않는다).

자동 로드를 실패 상태에서 멈추고, 재시도는 사용자가 누를 때만 한다.

```tsx
useEffect(() => {
  if (!el || !hasNextPage || isFetchNextPageError) return;  // 실패 뒤에는 감시하지 않는다
  // ...
}, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
```

## 함정 3 — 재시도를 `resetQueries` 로 만들면 받아 둔 페이지를 버린다

원래 코드의 [다시 시도]는 `resetQueries` 였다. 커서가 깨진 경우까지 덮으려는 의도였지만, 리셋은 쿼리를 초기 상태로 되돌려 **받아 둔 페이지 전부와 스크롤 위치를 버리고** 첫 페이지부터 다시 받는다. 다음 페이지 하나가 실패했을 때 고칠 대상은 그 한 페이지다.

- 다음 페이지 실패 → `fetchNextPage()`
- 데이터가 아예 없을 때 → `refetch()` (또는 커서 손상이 실제로 의심될 때만 `resetQueries`)

## 일반화

- **에러 플래그로 화면을 덮기 전에 「지금 보여 줄 데이터가 있느냐」를 먼저 묻는다.** TanStack 의 에러는 데이터를 지우지 않는다. 무한 쿼리에서는 그 에러가 어느 방향의 fetch 였는지까지 플래그가 갈라 준다.
- **실패 표면을 바꾸면 그 표면이 숨기고 있던 루프가 드러날 수 있다.** 목록을 남기는 순간 센티넬도 남는다. 「자동으로 다시 부르는 장치」(센티넬·폴링·포커스 재조회)가 실패 상태에서 어떻게 도는지 같이 본다.
- **재시도의 범위는 실패의 범위와 같게.** 한 페이지 실패에 쿼리 전체 리셋은 과하다.
