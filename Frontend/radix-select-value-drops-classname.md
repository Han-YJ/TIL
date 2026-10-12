# Radix `Select.Value` 는 `className`·`style` 을 받아서 버린다

좁은 표 셀 안의 Select 에서 선택값이 두 줄로 감겼다. 값에 `truncate`(`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`)를 걸어도 그대로였다.

```tsx
<SelectTrigger>
  <SelectValue className="truncate" placeholder="선택" />
</SelectTrigger>
```

## 왜 안 걸리나

`@radix-ui/react-select` 2.2.6 의 `SelectValue` 구현:

```js
const { __scopeSelect, className, style, children, placeholder = "", ...valueProps } = props;
// ...
return jsx(Primitive.span, {
  ...valueProps,
  ref: composedRefs,
  style: { pointerEvents: "none" },
  children: shouldShowPlaceholder(context.value) ? jsx(Fragment, { children: placeholder }) : children,
});
```

- `className`·`style` 을 구조분해로 꺼낸 뒤 **어디에도 넘기지 않는다.** 타입상으로는 받는 prop 이라 컴파일러도 린터도 잡지 못한다
- `style` 은 `{ pointerEvents: "none" }` 으로 통째로 덮어쓴다
- span 에 `data-*` 표지가 없다. 트리거 쪽에서 `[&_[data-radix-select-value]]:truncate` 같은 자손 선택자로 걸어도 대상이 없다

## 우회: 스타일은 children 노드에 건다

```tsx
<SelectValue placeholder={<span className="block truncate">선택</span>}>
  <span className="block truncate">{label}</span>
</SelectValue>
```

- 값은 `children` 으로 넘긴 노드에 클래스를 건다
- **placeholder 도 노드로 넘겨야 한다.** placeholder 는 Fragment 안에 그대로 렌더되므로 문자열이면 스타일을 걸 자리가 없다. 값만 고치면 빈 상태에서 placeholder 가 여러 줄로 감겨 옆 행을 덮는 문제가 새로 드러난다

## 남는 한계

줄바꿈은 막히지만 말줄임표(`…`)는 나오지 않고 잘리기만 했다. Radix 가 만드는 중간 span 이 inline 이라 그 안쪽에서는 `text-overflow` 가 걸릴 폭 기준이 없고, 그 span 에는 위 이유로 클래스를 걸 수 없다. 말줄임표까지 필요하면 Radix 쪽을 감싸는 컴포넌트(디자인 시스템 Select)에서 따로 풀어야 한다.

여러 화면이 같은 Select 를 쓴다면 이 우회를 화면마다 넣지 말고 디자인 시스템의 Select 래퍼 안에 넣는 게 맞다. 문제는 컴포넌트 하나가 아니라 그 Select 를 쓰는 모든 곳에 있다.
