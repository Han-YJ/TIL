# Playwright headless 에서 스크롤바 폭 결함이 재현되지 않을 때 — 기본 인자 `--hide-scrollbars`

표 열을 칸 폭에 맞춰 접는 화면이 있었다. 칸 폭을 열 최소 합과 비교해 접기 때문에 가로 스크롤은 생기지 않는다고 봤는데, 리뷰에서 「Windows 처럼 스크롤바가 폭을 차지하는 환경에서는 세로 스크롤바만큼 좁아져 가로 스크롤이 생긴다」 는 지적이 나왔다. Playwright 로 재 보니 넘침이 0 이었다. 지적이 틀린 걸까?

결론: **Playwright 가 띄우는 headless Chromium 은 기본 인자에 `--hide-scrollbars` 가 들어 있어, 클래식 스크롤바가 폭을 전혀 차지하지 않는다.** 스크롤바 폭 때문에 레이아웃이 바뀌는 결함은 이 인자를 빼고 띄워야 재현된다.

## 1. 재현이 안 되던 시도

세로로 넘치게 만든 스크롤 요소의 `offsetWidth - clientWidth` 를 재면 스크롤바 폭이 나와야 한다.

```js
const t = document.querySelector('[role=table]');
t.style.height = '90px';               // 세로로 넘치게
t.scrollHeight > t.clientHeight;       // true — 넘치긴 한다
t.offsetWidth - t.clientWidth;         // 0 — 스크롤바가 폭을 안 먹는다
```

- 페이지에 `::-webkit-scrollbar { width: 15px }` 를 주입해도 0 이었다
- 세로 넘침은 분명히 있었다 (`scrollHeight 144 > clientHeight 90`)

스타일 문제가 아니라, 브라우저가 스크롤바를 아예 그리지 않는 상태였다.

## 2. 해결 — 기본 인자에서 빼고 띄운다

```js
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
```

같은 측정이 이렇게 바뀌었다.

| | offsetWidth | clientWidth | 열 최소 합 | 가로 넘침 |
|---|---|---|---|---|
| `--hide-scrollbars` (기본) | 864 | 864 | 864 | 0 |
| 인자 뺌 | 864 | 849 | 864 | 15px |

지적이 맞았다. macOS 의 겹쳐 그리는 스크롤바와 똑같이 보이는 기본값 때문에, 클래식 스크롤바 환경의 결함이 가려져 있었던 것이다.

## 3. 그다음 — 판정은 스크롤 요소의 content box 로

재현한 뒤에는 「바깥 칸 폭」 대신 **스크롤 요소 자체를 ResizeObserver 로 관찰**하게 고쳤다. `contentRect` 는 서 있는 스크롤바 폭을 뺀 content box 라서, 스크롤바가 생기거나 없어질 때도 알림이 온다.

- 브라우저 스크롤바 폭을 한 번 재 기준값에 더하는 방법도 있지만, 세로 스크롤이 없을 때도 늘 일찍 접히고 서버 렌더 값(0)과 달라 hydration 직후 한 번 바뀐다
- 스크롤 요소를 직접 재면 스크롤바가 실제로 설 때만 폭이 줄어든다

## 정리

- 스크롤바 폭이 레이아웃에 영향을 주는지 Playwright 로 확인할 때는 `ignoreDefaultArgs: ['--hide-scrollbars']` 로 띄운다
- 측정 결과가 「폭 0」 이면 결함이 없다는 뜻이 아니라, 스크롤바가 숨겨져 있다는 뜻일 수 있다
- 「실제로 쓸 수 있는 폭」 은 바깥 컨테이너가 아니라 스크롤 요소의 content box 로 잰다
