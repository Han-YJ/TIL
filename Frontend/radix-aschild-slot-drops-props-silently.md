# Radix `asChild`는 자식이 rest props를 펼칠 때만 동작한다 — 아니면 조용히 버려진다

`asChild`(내부적으로 `Slot`)는 래퍼 DOM을 하나 없애려고 쓰는 패턴이다. Radix는 자기 몫의 props를 자식 엘리먼트에 **병합해서 `cloneElement`** 한다.

```tsx
<TooltipTrigger asChild>
  <Toggle checked={checked} onCheckedChange={setChecked} />
</TooltipTrigger>
```

문제는 자식이 그 props를 **받을 자리를 열어두지 않았을 때**다. 위 `Toggle`이 자체 디자인 시스템 컴포넌트이고 prop을 닫힌 집합으로 선언했다면:

```tsx
// 넘어온 onPointerEnter · onFocus · aria-describedby · ref 는 여기서 증발한다
function Toggle({ checked, onCheckedChange, className }: ToggleProps) {
  return <button role="switch" aria-checked={checked} className={className} … />;
}
```

`Slot`은 props를 **넘겨주기만** 한다. 자식이 안 쓰면 그걸로 끝이다.

## 실패가 조용하다

이게 핵심이다. 에러도 경고도 없고 타입도 통과한다:

- `Slot`의 자식 props 타입은 `React.ReactElement` 수준이라 "이 컴포넌트가 `onPointerEnter`를 받나"를 검사하지 않는다
- 렌더는 정상이다 — 토글은 잘 보이고 잘 눌린다
- **툴팁만 영영 안 뜬다.** 기능이 통째로 없는 게 아니라 "가끔 안 되는 것처럼" 보여서 더 늦게 발견된다

`asChild`를 쓸 수 있는 자리인지 판단할 때 "자식이 DOM 엘리먼트냐"만 보게 되는데, 진짜 조건은 **자식이 rest props와 ref를 실제 DOM 노드까지 흘려보내느냐**다.

## 확인법 — DOM에 주입 흔적이 있는지 본다

동작하는 `asChild`는 자식 DOM 노드에 자기 속성을 남긴다. Tooltip이면 `aria-describedby`, Dropdown 트리거면 `data-state` / `aria-expanded` 같은 것들이다.

```
// 정상
<button role="switch" data-state="closed" aria-describedby="radix-:r7:" …>
// 버려진 경우 — 내가 준 prop만 있고 Radix 것이 없다
<button role="switch" …>
```

핸들러는 DOM에 안 보이지만, 속성이 하나도 안 붙었으면 **핸들러도 같이 버려진 것**이다. 병합은 전부 아니면 전무다.

## 해법 두 가지

**① 자식 컴포넌트를 못 고칠 때 — props를 받는 엘리먼트로 감싼다**

```tsx
<TooltipTrigger asChild>
  <span className="block w-full">
    <Toggle checked={checked} onCheckedChange={setChecked} />
  </span>
</TooltipTrigger>
```

`asChild`가 지우려던 래퍼가 도로 생기지만, 애초에 그 자리에 래퍼가 **필요했던** 것이다. 이때 래퍼는 자식 크기를 그대로 가져야 한다 — `span`은 기본이 inline이라 hover/focus 영역이 실제 컨트롤과 어긋난다.

**② 컴포넌트를 고칠 수 있을 때 — rest를 열고 ref를 흘린다**

```tsx
function Toggle({ checked, onCheckedChange, className, ...rest }: ToggleProps) {
  return <button role="switch" className={className} {...rest} … />;
}
```

React 19면 `ref`도 그냥 prop이라 `...rest`에 같이 실려 간다.

## 넓혀 보면

Radix만의 얘기가 아니다. `cloneElement`로 props를 주입하는 API 전반 — 자체 구현한 `Slot`, 컴파운드 컴포넌트의 암묵 prop 주입 — 이 다 같은 계약 위에 서 있다. **주입하는 쪽은 주는 것까지만 보장하고, 받는 쪽이 열려 있는지는 아무도 검사하지 않는다.**

그래서 디자인 시스템 컴포넌트를 만들 때 prop을 닫힌 집합으로 좁히는 선택은 "타입을 엄격하게 한다"로 끝나지 않는다. 그 컴포넌트를 `asChild` 슬롯에 넣는 순간 조용히 깨지는 사용처를 만든다.
