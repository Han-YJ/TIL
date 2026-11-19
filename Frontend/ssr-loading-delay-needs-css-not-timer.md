# SSR 로딩 화면의 지연 표시는 JS 타이머가 아니라 CSS 로

로딩 스켈레톤에 **지연 표시**를 걸어 두었다. 200ms 안에 끝나면 아예 안 보이게 하는 흔한 처방이다 ([로딩 지연을 플래그 하나에 걸면 빈 상태가 샌다](./loading-delay-on-one-flag-leaks-empty-state.md)).

그런데 Next.js App Router 의 `loading.tsx` 에서 이상한 일이 생겼다. **메뉴를 눌러 이동할 때는 스켈레톤이 보이는데, 새로고침하면 빈 화면이 한참 가다 내용이 뜬다.**

## 왜 그런가

지연을 이렇게 구현하고 있었다.

```tsx
'use client';
export function DelayedFallback({ children }) {
  const show = useDelayedFlag(true, 200); // setTimeout 으로 200ms 뒤 true
  return show ? children : null;
}
```

클라이언트 이동에서는 이미 JS 가 떠 있으니 타이머가 돈다. 새로고침에서는 다르다.

1. 서버가 스트리밍으로 보낸 **첫 HTML 안의 fallback 은 `show = false` 상태로 렌더**된다 → `null`
2. 브라우저가 JS 를 받아 하이드레이션해야 비로소 타이머가 시작된다
3. 그 사이 서버 응답이 오면 fallback 은 한 번도 그려지지 않는다

새로고침에서 사용자가 가장 오래 기다리는 구간이 바로 「HTML 은 왔는데 JS 는 아직」 구간이다. JS 타이머로 만든 지연은 정확히 그 구간을 비운다.

## 대응 — 지연을 CSS 에 맡긴다

fallback 을 첫 HTML 부터 그리고, **보이는 시점만** CSS 애니메이션으로 늦춘다.

```css
@keyframes delayed-appear {
  from { visibility: hidden; }
}
```

```tsx
// 서버 컴포넌트 — 'use client' 가 필요 없다
export function DelayedFallback({ children }) {
  return (
    <div
      className="contents"
      style={{ animation: 'delayed-appear 0s backwards', animationDelay: '200ms' }}
    >
      {children}
    </div>
  );
}
```

요점 셋.

- **`0s` + `backwards`** — 애니메이션 길이는 0 이고, `backwards` 가 지연 동안 `from` 값(`hidden`)을 적용한다. 지연이 끝나는 순간 바로 보인다. 페이드가 아니라 스위치다
- **`visibility` 는 상속된다** — 래퍼에만 걸면 자식 전체가 숨는다. `opacity` 와 달리 숨은 동안 클릭도 안 받는다
- **`display: contents`** — 래퍼가 박스를 만들지 않아 fallback 이 원래 놓이던 flex/grid 배치가 그대로다. `contents` 요소 자신은 그려지지 않지만 `visibility` 는 자식에게 물려준다

`visibility: hidden` 은 자리를 차지한 채 숨으므로, 지연이 끝나 나타날 때 레이아웃이 튀지 않는다.

## 확인은 렌더 시점으로 잰다

처음엔 `MutationObserver` 로 fallback 이 DOM 에 붙는 순간 `getComputedStyle(...).visibility` 를 읽었는데 `visible` 이 나왔다. **CSS 파일이 아직 안 와서** 키프레임이 없었던 것이다. DOM 기준 측정은 「보였는가」 를 답하지 못한다.

JS 를 막고 HTML 을 중간에서 끊은 페이지에서 `requestAnimationFrame` 으로 프레임마다 표본을 떠서 다시 쟀다.

| 시점 | 상태 |
|---|---|
| 94ms | fallback DOM 있음 · `hidden` |
| 291ms | `visible` |

JS 없이도 지연이 지켜지고, 지연 뒤에는 하이드레이션을 기다리지 않고 보인다.

## 남는 것

- 애니메이션을 지원하지 않거나 끈 환경에서는 지연 없이 **바로 보이는 쪽**으로만 달라진다. 안 보이는 쪽으로 실패하지 않는다
- **최소 표시 시간**(한번 뜨면 N ms 유지)은 CSS 로 못 한다. fallback 을 걷는 시점은 프레임워크가 정하기 때문이다. 클라이언트에서 직접 그리는 스켈레톤(데이터 로딩 상태)은 여전히 JS 플래그가 맡고, 이 방식은 서버가 그리는 fallback 에만 쓴다
