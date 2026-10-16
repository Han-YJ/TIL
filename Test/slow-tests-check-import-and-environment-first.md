# 유닛 테스트가 느릴 때 테스트를 지우기 전에 볼 것 — import 와 environment

CI 의 유닛 테스트 스텝이 6~12분까지 늘었다. 테스트 파일이 200개, 케이스가 2,800개쯤 되니 "테스트가 많아져서" 로 보였다. 자연스러운 다음 생각은 "쓸모없는 테스트를 정리하자" 였다.

정리하기 전에 시간이 어디서 나는지부터 쟀다. 결론부터: **테스트 본문은 누적 시간의 6%였고, 나머지는 테스트를 실행하기도 전에 쓰이고 있었다.**

## 1. vitest 요약 줄을 쪼개서 읽는다

vitest 는 끝에 이런 줄을 찍는다.

```
Duration  318.40s (transform 23.09s, setup 25.66s, import 349.24s, tests 33.56s, environment 153.05s)
```

괄호 안 숫자는 **워커들의 시간을 합한 누적값**이라 벽시계(318초)보다 클 수 있다. 각 항목의 뜻:

| 항목 | 무엇 |
|---|---|
| `import` | 테스트 파일과 그 의존 모듈을 불러오는 데 쓴 시간 |
| `environment` | 파일마다 jsdom 같은 환경을 띄우는 시간 |
| `tests` | 실제 `it` 본문 실행 시간 |

CI 실측: import 349초 · environment 153초 · **tests 34초**.

테스트 케이스를 절반 지워도 줄어드는 건 34초 중 일부다. import·environment 는 **파일 단위**로 드는 비용이라, 케이스를 지워서는 안 줄고 파일을 통째로 지워야 파일당 2~3초씩 준다. "정리" 는 유지보수엔 의미가 있어도 속도 대책은 아니었다.

## 2. 무엇이 import 를 무겁게 하나 — `importDurations`

vitest 4 에는 느린 import 를 찍어주는 옵션이 있다.

```bash
vitest run --experimental.importDurations.print --experimental.importDurations.limit=25
```

```
Module                                      Self  Total
src/features/x/utils.order.test.ts          1ms  1.30s
 ↳ src/features/x/utils.ts                   8ms  1.29s
 ↳ ../../packages/ui/src/index.ts          119ms  1.76s
```

**순수 함수 테스트**가 디자인 시스템 패키지의 루트 `index.ts`(모든 컴포넌트를 다시 내보내는 배럴)를 1.3~1.8초씩 불러오고 있었다. 순수 함수가 컴포넌트를 쓸 리 없는데 따라가 보니 범인은 두 줄이었다.

```ts
// shared/lib/utils.ts
export { cn } from '@acme/ui';          // 클래스 합치기 함수 하나 때문에
// shared/lib/richText.ts
export { sameRichText } from '@acme/ui'; // 문자열 비교 함수 하나 때문에
```

함수 하나를 다시 내보내려고 배럴을 거치는 순간, 그 함수를 쓰는 모든 파일이 배럴이 내보내는 컴포넌트 전부와 그 의존성을 끌고 온다. 테스트 러너는 파일마다 이 모듈들을 실제로 평가하므로 그대로 비용이 된다.

## 3. 후보를 같은 조건으로 잰다

CI 러너와 맞추려고 로컬에서 `--maxWorkers=2` 로 고정하고, 각 안을 2회씩 쟀다(기준선 56초).

| 안 | 결과 | 깨진 것 |
|---|---|---|
| `isolate: false` (파일 간 모듈 공유) | 17초 | **48개 파일** — `vi.mock` 이 다른 파일로 샌다 |
| node 환경 파일만 `isolate: false` | 41초 | 19건 — 같은 이유 |
| `deps.optimizer` 로 패키지 사전 번들 | 42초 | 5개 파일 — 부분 목 ([별도 정리](./vitest-deps-optimizer-breaks-partial-mock.md)) |
| **재수출을 배럴 대신 하위 경로로** | **45초** | 없음 |
| 테스트 샤딩(2개 스텝) | 벽시계 ~절반 예상 | 없음, 대신 **과금 증가** |

고른 건 4번째다. `package.json` 의 `exports` 에 하위 경로 두 개를 열고, 재수출 두 줄의 출처만 바꿨다.

```jsonc
// packages/ui/package.json
"exports": {
  ".": "./src/index.ts",
  "./utils": "./src/lib/utils.ts",
  "./rich-text": "./src/application/TextEditor/sameRichText.ts"
}
```

```ts
export { cn } from '@acme/ui/utils';
```

샤딩을 뺀 이유: CI 는 스텝마다 컨테이너·clone·install 준비 시간이 따로 과금된다(이번 환경에서 ~100초). 스텝을 쪼개면 기다리는 시간은 줄지만 돈은 준비 시간만큼 더 나간다. 속도와 비용 중 무엇을 줄이려는지 먼저 정해야 고를 수 있다.

## 4. CI 에서 확인

| | 변경 전 | 변경 후 (1회차) | 변경 후 (2회차) |
|---|---|---|---|
| vitest 벽시계 | 318초 | 241초 | 313초 |
| import 누적 | 349초 | 200초 | 263초 |
| tests 누적 | 34초 | 34초 | 42초 |

2회차는 오히려 느려 보인다. 코드는 같은데 `tests`·`environment` 까지 모든 항목이 25% 정도 같이 늘었다 — 러너가 느렸던 것이다. CI 숫자는 회차마다 이렇게 흔들리므로 **러너 속도에 무관한 비율**로 비교했다.

- import ÷ tests: 변경 전 10.4 → 변경 후 5.9 / 6.3

두 회차 모두 import 가 테스트 본문 대비 약 40% 줄었다.

## 정리

- 느린 스위트 앞에서 "테스트가 많아서" 는 가설이지 사실이 아니다. 요약 줄의 `import`·`environment`·`tests` 비율부터 본다.
- import 가 크면 `importDurations` 로 상위 모듈을 찍는다. 유틸 하나를 배럴에서 재수출하는 한 줄이 순수 함수 테스트까지 무겁게 만든다.
- 남은 큰 덩어리는 environment(jsdom)다. 다음 차례는 DOM 이 실제로 필요 없는데 jsdom 으로 도는 파일을 node 환경으로 내리는 것이다.
- CI 시간을 비교할 땐 벽시계 말고 항목 간 비율로 — 러너 편차가 변경 효과보다 클 때가 있다.
