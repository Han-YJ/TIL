# TypeScript는 unreachable 코드에서 나로잉을 포기한다

함수 상단에 임시 early return(디버깅 스텁, 시뮬레이션 값 등)을 넣으면, **그 아래의 멀쩡하던 코드가 갑자기 possibly-undefined 에러를 낸다.**

```ts
async function load(): Promise<Item[]> {
  return MOCK_ITEMS; // ← 임시 스텁

  // 아래는 unreachable — 원래는 통과하던 코드인데 에러 발생
  const { data, error } = await fetchItems();
  if (error || !data?.list) throw new Error();
  return data.list.map(toItem);
  //     ^^^^ 'data' is possibly 'undefined' (TS18048)
}
```

## 왜?

TypeScript의 제어 흐름 분석(control flow analysis)은 **도달 가능한 경로**를 따라 타입을 좁힌다. early return으로 코드가 unreachable이 되면 그 구간의 흐름 분석이 수행되지 않아, `if (error || !data?.list)` 같은 가드의 나로잉 효과가 사라지고 선언 타입(`Data | undefined`) 그대로 남는다.

## 실무 시사점

- 스텁을 넣었더니 "원래 있던 코드"에서 타입 에러가 나면, 코드가 깨진 게 아니라 **스텁이 나로잉을 죽인 것** — 스텁 제거하면 돌아온다
- tsc를 깨지 않는 스텁이 필요하면 early return 대신 조건 분기로:

```ts
const STUB: Item[] | null = MOCK_ITEMS; // 끌 때는 null
if (STUB) return STUB;
// 아래 코드는 reachable 유지 → 나로잉 정상 동작
```
