# Tailwind CSS: Gradient 배경에서 Disabled 상태 처리

## 문제 상황

Button 컴포넌트에 gradient variant를 추가했을 때, disabled 상태에서도 gradient 배경이 그대로 유지되는 문제가 발생했습니다.

```tsx
// 문제가 있던 코드
{
  type: 'solid',
  variant: 'gradient',
  className: 'bg-gradient-to-r from-accent-blue to-[#7d5ef7] text-lable-inverse interaction-heavy disabled:bg-background-alternative disabled:text-lable-disabled',
}
```

## 원인

Tailwind CSS에서 `bg-gradient-to-r`은 `background-image`로 적용되고, `disabled:bg-background-alternative`는 `background-color`로 적용됩니다.

CSS에서 `background-image`가 `background-color`보다 우선순위가 높기 때문에, gradient가 배경색을 덮어씌워서 disabled 상태에서도 gradient가 보이게 됩니다.

## 해결 방법

disabled 상태에서 gradient를 제거하고 일반 배경색을 적용하려면:

1. `disabled:bg-none`으로 gradient를 제거
2. 그 다음 `disabled:bg-background-alternative`로 배경색 적용

```tsx
// 해결된 코드
{
  type: 'solid',
  variant: 'gradient',
  className: 'bg-gradient-to-r from-accent-blue to-[#7d5ef7] text-lable-inverse interaction-heavy disabled:bg-none disabled:bg-background-alternative disabled:text-lable-disabled',
}
```

## 핵심 포인트

- `bg-gradient-*` 클래스는 `background-image`로 렌더링됨
- `bg-*` 클래스는 `background-color`로 렌더링됨
- `background-image`가 `background-color`보다 우선순위가 높음
- gradient를 제거하려면 `bg-none`을 먼저 적용해야 함

## 참고

- Tailwind CSS에서 gradient는 `background-image` 속성으로 처리됨
- disabled 상태에서 gradient를 제거하려면 명시적으로 `bg-none`을 추가해야 함
- 클래스 순서는 중요하지 않지만, `bg-none`이 먼저 적용되어야 gradient가 제거됨
