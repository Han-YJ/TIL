# pointer-events-none은 키보드를 막지 못한다

제출 버튼을 로딩 중에 `pointer-events-none cursor-wait`으로만 막아뒀다가, **포커스 상태에서 Enter를 두 번 누르면 제출이 2회 실행**되는 걸 뒤늦게 잡았다.

당연한 얘기지만 실수하기 쉽다 — `pointer-events`는 이름 그대로 **포인터 이벤트 전용**이다. 키보드로 버튼을 활성화하는 경로(Enter/Space)는 전혀 건드리지 않는다.

## 왜 이렇게 만들었었나

`disabled`를 쓰면 확실하지만 부작용이 딸려 온다. 디자인 시스템 버튼이 보통 이렇게 생겼다:

```css
disabled:pointer-events-none disabled:opacity-50
```

그런데 시안이 "처리 중에는 스피너만 돌고 버튼은 흐려지지 않는다"를 요구하는 경우가 있다. `disabled`를 붙이면 `opacity-50`이 따라와 시안과 어긋난다. 그래서 `disabled`를 떼고 로딩 상태에 `pointer-events-none`만 거는 선택을 하게 된다 — **시각 정합은 맞고 마우스도 막히니 다 된 것처럼 보인다.**

빠진 건 키보드다.

## 대응

시각 속성과 기능 가드가 충돌하면, 시각을 포기하는 게 아니라 **핸들러에 가드를 둔다.**

```tsx
function handleSubmit() {
  if (isPending) return;   // ← 입력 경로와 무관하게 막힌다
  startTransition(async () => { ... });
}
```

이러면 세 가지가 같이 해결된다.

- 키보드 Enter/Space 연타
- 마우스 연타 (첫 클릭의 리렌더가 페인트되기 전에 두 번째가 들어오는 경우)
- 시각 정합 (버튼을 `disabled`로 만들지 않으므로 흐려지지 않는다)

`isPending`이 리렌더 타이밍에 의존하는 게 불안하면 ref로 잠그면 된다. 다만 `useTransition`의 `isPending`은 `startTransition` 직후 같은 커밋에서 true가 되므로 대부분의 경우 충분하다.

## 판별 기준

**되돌릴 수 없는 작업**(결제, 메일 발송, 영구 저장)의 중복 실행 차단을 CSS에 맡기지 않는다. CSS는 어포던스이고, 가드는 핸들러의 몫이다.

반대로 단순히 "연타하면 지저분해 보인다" 수준이면 `disabled` 하나로 끝내는 게 싸다.
