# vitest `deps.optimizer` 로 묶은 패키지는 `importOriginal` 부분 목이 깨진다

vitest 공식 성능 가이드에는 import 가 무거운 패키지를 `deps.optimizer` 로 미리 한 파일로 묶으라는 처방이 있다. 실제로 효과가 컸다. 그런데 켜자마자 특정 테스트 몇 개만 이런 에러로 죽었다.

```
Error: [vitest] There was an error when mocking a module. If you are using "vi.mock" factory,
make sure there are no top level variables inside, since this call is hoisted to top of the file.
Caused by: Error: Cannot find module '/…/node_modules/.vite/vitest/<hash>/deps/@tanstack_react-query.js&v=d0b69396'
```

에러 메시지는 "팩토리 안에서 최상위 변수를 썼냐"고 묻는다. 그런데 그게 원인이 아니다.

## 환경

- vitest 4.1.6, Node 24
- 설정: 디자인 시스템 패키지(워크스페이스 소스)와 `@tanstack/react-query` 를 `ssr`·`client` 양쪽 optimizer `include` 에 넣음

```ts
deps: {
  optimizer: {
    ssr: { enabled: true, include: ['@acme/ui', '@tanstack/react-query'] },
    client: { enabled: true, include: ['@acme/ui', '@tanstack/react-query'] },
  },
},
```

## 무엇이 깨지고 무엇이 멀쩡한가

200개 파일 중 5개만 깨졌다. 공통점은 하나였다 — **묶은 패키지를 원본을 펼쳐서 일부만 바꾸는 목**.

```ts
// ✗ 깨짐 — 원본을 가져와 펼친 뒤 하나만 교체
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return { ...actual, useQueryClient: () => ({ prefetchQuery }) };
});

// ✗ 같은 에러 — importActual 로 바꿔도 동일
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return { ...actual, useQueryClient: () => ({ prefetchQuery }) };
});

// ○ 통과 — 원본을 안 가져오는 전체 대체 목
vi.mock('@acme/ui', () => ({ notify: { error: vi.fn() } }));
```

같은 패키지를 전체 대체로 목하는 파일들은 전부 통과했다. 실패는 "원본 모듈을 다시 불러오는 순간"에만 났다.

## 관찰한 것

실패 경로를 보면 사전 번들 산출물 `deps/<패키지>.js` 뒤에 버전 쿼리가 붙는데, `?v=` 가 아니라 **`&v=`** 다. 쿼리 시작 문자가 없으니 파일 이름의 일부가 되어 "그런 파일 없음" 이 된다. 이게 vitest 내부 어디서 생기는지까지는 추적하지 않았다 — 확인한 건 "부분 목에서만, 이 경로로, 재현된다" 까지다.

## 그래서

- **에러 문구를 믿지 말 것.** 호이스팅 경고처럼 보이지만 팩토리 코드와 무관하다. `Caused by` 줄의 경로에 `.vite/vitest/…/deps/` 가 보이면 사전 번들 쪽이다.
- 선택지는 둘이다(둘 다 이번엔 적용하지 않음 — 아래 이유).
  - 부분 목하는 패키지는 optimizer `include` 에서 뺀다.
  - 부분 목을 없앤다. 위 예라면 `useQueryClient` 를 갈아끼우는 대신 테스트용 `QueryClient` 를 Provider 로 넣고 그 메서드를 spy 하는 쪽이 원래 더 정직한 테스트다.
- 유지보수 비용을 같이 계산할 것. 지금 5개를 고쳐도, 다음에 누가 평범하게 `importOriginal` 을 쓰면 같은 에러를 만나고 원인을 찾는 데 시간을 쓴다. 이번엔 이 비용 때문에 optimizer 를 보류하고, import 를 무겁게 만든 원인(배럴 재수출)을 직접 끊는 쪽을 택했다 — 효과는 거의 같았다(워커 2개 기준 56초 → optimizer 42초 / 배럴 우회 45초). ([측정 과정은 따로 정리](./slow-tests-check-import-and-environment-first.md))
