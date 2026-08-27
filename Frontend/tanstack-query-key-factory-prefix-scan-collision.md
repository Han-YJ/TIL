# TanStack Query 키 팩토리에서 detail 키를 list 프리픽스 아래 두면 스캔이 오염된다

키 매칭이 프리픽스 기반이라는 건 문서에 있다. 덜 알려진 건 그 사실이 **키 팩토리 설계에 거는 제약**이다.

흔한 팩토리 모양:

```ts
const listsKey = ['members', tenantId] as const;

lists:  () => listsKey,
page:   (params) => ({ queryKey: [...listsKey, params], ... }),
detail: (id)     => ({ queryKey: [...listsKey, 'detail', id], ... }),
```

`detail` 을 `lists()` 아래 두는 이유는 보통 **무효화 편의**다. mutation 뒤에 `invalidateQueries({ queryKey: lists() })` 한 줄이면 목록과 상세가 함께 무효화된다.

## 대가 — 스캔 계열이 형태가 다른 캐시를 집는다

`invalidateQueries` 는 무엇이 걸리든 상관없다. 문제는 **캐시를 읽어서 쓰는** 쪽이다.

```ts
// 목록 캐시를 훑어 상세 placeholder 를 만든다
const caches = queryClient.getQueriesData<{ members: Member[] }>({
  queryKey: memberQueries(tenantId).lists(),
});
for (const [, data] of caches) {
  const hit = data?.members.find((m) => m.id === id);   // 💥
  ...
}
```

`getQueriesData` 도 프리픽스로 매칭하므로 **`detail` 캐시까지 결과에 들어온다.** 그쪽 데이터는 목록이 아니라 단건 객체라 `.members` 가 없고, `data?.` 는 그걸 못 걸러 `undefined.find` 로 죽는다.

제네릭이 거짓말을 하고 있다는 것도 문제다. `getQueriesData<{ members: Member[] }>` 라고 선언하면 타입상 `members` 가 필수라 옵셔널 체인이 불필요해 보이고, 다음 사람이 "군더더기"로 지운다.

## 이 버그가 늦게 터지는 이유

두 조건이 겹쳐야 재현된다.

1. `detail` 캐시가 이미 있어야 한다 — 상세를 한 번 이상 연 뒤
2. **찾는 대상이 목록 캐시에 없어야 한다** — 있으면 그 항목에서 `return` 해버려 detail 항목까지 순회가 안 간다

그래서 "상세를 처음 열 때는 멀쩡하고, 두 번째부터 특정 조건에서만" 죽는다. 회귀 테스트를 쓸 때도 이걸 놓치기 쉽다 — 대상을 목록 캐시에 넣어두면 테스트가 그냥 통과한다.

## 대응

셋 중 하나를 고른다. 무효화 편의와 스캔 안전성이 같은 결정에 묶여 있다는 걸 인지하고 고르는 게 핵심이다.

- **키를 갈라놓는다** — `lists: () => ['members', t, 'list']` · `details: () => ['members', t, 'detail']`. 스캔이 깨끗해지는 대신 무효화를 두 번 하거나 상위 `['members', t]` 로 한다
- **읽는 쪽의 타입을 현실에 맞춘다** — `getQueriesData<{ members?: Member[] }>` 로 선언하고 옵셔널 체인을 둔다. 최소 변경이지만 스캔 대상이 넓다는 사실은 남는다
- **`predicate` 로 좁힌다** — `getQueriesData({ queryKey: lists(), predicate })`. 키 모양에 의존해 깨지기 쉽다

## 배경

이 문제는 목록이 **서버 페이징으로 바뀔 때** 새로 생기기 쉽다. 페이징 전에는 목록 캐시가 키 하나라 `getQueryData(lists())` 로 정확히 그 키만 읽으면 됐다. params 별로 캐시가 쪼개지면서 "어느 페이지 키인지 모르니 프리픽스로 전부 훑자"로 바뀌고, 그 순간 스캔 대상 집합에 `detail` 이 들어온다. 읽기 방식이 **단일 키 → 프리픽스 스캔**으로 바뀌는 커밋을 리뷰할 때 같은 프리픽스 아래 무엇이 사는지 확인할 것.
