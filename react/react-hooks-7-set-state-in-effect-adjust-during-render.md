# react-hooks 7.1 `set-state-in-effect` — 렌더 중 조정으로 바꿀 곳과 effect 로 남길 곳

`eslint-plugin-react-hooks` 7.1.1 은 `set-state-in-effect` · `refs` · `purity` 의 탐지 범위가 넓어졌다. 메이저 업데이트가 아니라 `eslint-config-next` 마이너 업데이트(16.3 → 16.4)만으로 끌려 들어오고, 그전까지 통과하던 코드가 한 번에 에러가 된다 (실측: 14건).

에러를 전부 같은 방식으로 고치면 안 된다. effect 안에서 `setState` 하는 코드는 두 종류로 갈린다.

## 1. props·파생값에 state 를 맞추는 effect → 렌더 중 조정

```tsx
// 전: 열림·필터가 바뀌면 활성 항목을 다시 맞춘다
useEffect(() => {
  if (!open) { setQuery(''); setActiveIndex(-1); return; }
  setActiveIndex((prev) => pickActive(prev, filtered));
}, [open, filtered]);
```

effect 는 커밋 뒤에 돈다. 그래서 한 번은 어긋난 값(지난 필터 기준 활성 항목)으로 그려지고, 다시 렌더된다. 이전 값을 state 로 들고 있다가 렌더 중에 비교한다.

```tsx
// 후: 바뀐 렌더에서 바로 맞춘다 — 어긋난 화면이 커밋되지 않는다
const [alignedFor, setAlignedFor] = useState({ open, filtered });
if (alignedFor.open !== open || alignedFor.filtered !== filtered) {
  setAlignedFor({ open, filtered });
  if (!open) { setQuery(''); setActiveIndex(-1); }
  else setActiveIndex((prev) => pickActive(prev, filtered));
}
```

- 렌더 중 `setState` 는 **자기 컴포넌트 state 에만**, 그리고 **조건 안에서만** 한다. 조건이 없으면 무한 렌더가 된다.
- `useRef` 로 이전 값을 들고 있으면 안 된다. 렌더 중에 ref 를 쓰게 되어 `refs` 규칙에 또 걸린다. 이전 값도 state 로 둔다.
- **무엇을 조건(트리거)에 넣을지가 가장 중요하다.** 기존 effect 의 의존성 배열을 그대로 옮기지 말고 「무엇이 바뀌면 다시 맞춰야 하는가」를 다시 정한다. 예: 선택 여부 판정 함수(`isSelected`)를 조건에 넣으면, 항목을 고를 때마다 활성 항목이 처음으로 돌아간다. 기존 코드는 의존성에서 빼고 `exhaustive-deps` disable 로 막아 두었는데, 렌더 중 조정에서는 그 함수를 조건에 넣지 않으면 되므로 disable 도 필요 없어진다.
- 포커스 이동이나 `scrollIntoView` 같은 DOM 부수효과는 effect 에 남긴다. 옮기는 것은 state 맞추기뿐이다.

## 2. 마운트 뒤에야 알 수 있는 값을 읽는 effect → effect 가 맞다

```tsx
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage 는 브라우저 전용이라 마운트 뒤에 읽는다
  setRestoreChecked(true);
}, []);
```

`sessionStorage` · `history.state` · DOMPurify(DOM 필요)처럼 서버 렌더에 없는 값은 렌더 중에 읽으면 하이드레이션이 어긋난다. 마운트 뒤에 effect 로 읽어 state 에 넣는 것이 맞다. lint 가 이 경우를 구분하지 못하므로, **사유를 적은 disable** 로 남긴다. `useSyncExternalStore` 로 바꿀 수 있는지 먼저 보되, 한 번 읽고 끝나는 값이면 effect 쪽이 단순하다.

## 같이 나오는 `refs` · `purity`

- 렌더 중 `ref.current = x` → 이벤트 핸들러나 effect 로 옮긴다. 핸들러에서 ref 를 읽는 함수를 JSX 에서 바로 만들어 넘기는 것(`onSelect={() => open(cb)}`)은 괜찮다.
- 렌더 중 `Date.now()` · `Math.random()` 으로 ref 초기화 (`useRef(Date.now())`) → `purity` 에 걸린다. `useRef(0)` 으로 두고, 마운트 effect 에서 시각을 넣는다.
- `form.handleSubmit(fn)` 처럼 ref 를 품은 함수를 렌더 중에 만들어 두는 형태 → 호출할 때 만들도록 감싼다: `const submit = (e) => form.handleSubmit(fn)(e)`.

## 요약

`set-state-in-effect` 에러가 나면 먼저 「이 state 는 props 에서 파생되는가, 브라우저에서만 읽히는가」를 묻는다. 파생이면 렌더 중 조정으로 바꾸고, 트리거는 의존성 배열이 아니라 의미로 다시 정한다. 브라우저 전용이면 effect 가 맞는 자리이므로 사유를 적은 disable 로 남긴다. 이번에 실제로 고친 14건은 9 대 5 로 갈렸다.
