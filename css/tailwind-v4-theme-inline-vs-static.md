# Tailwind v4: @theme inline vs @theme static

## 문제 상황

`@theme inline` 블록에서 정의한 CSS 변수를 `var(--color-brand-primarynormal)`로 동적으로 사용했는데, 빌드된 CSS에 변수가 생성되지 않아 "is not defined" 오류가 발생했습니다.

반면 `--color-status-warning`은 정상적으로 작동했습니다.

## 원인

Tailwind v4의 `@theme inline`은 **정적 분석**을 통해 실제로 사용된 변수만 생성합니다:

- ✅ `bg-status-warning` 같은 클래스로 사용 → 빌드에 포함됨
- ❌ `var(--color-brand-primarynormal)` 같은 인라인 스타일로만 사용 → 정적 분석에서 발견되지 않음

## 해결책

`@theme static`을 사용하면 정의된 모든 변수를 강제로 생성합니다.

```css
@theme static {
  --color-brand-primarynormal: var(--blue-50);
  --color-status-warning: var(--orange-50);
  /* 모든 변수가 빌드에 포함됨 */
}
```

## 언제 무엇을 사용할까?

### `@theme static` (권장)
- ✅ 디자인 시스템의 색상 토큰
- ✅ 동적으로 할당되는 변수 (`customColor` prop 등)
- ✅ 모든 토큰이 항상 사용 가능해야 하는 경우
- ✅ 예측 가능성과 안정성이 중요한 경우

### `@theme inline`
- ✅ 프로젝트 전체에서 사용되지 않는 임시/실험적 변수
- ✅ 번들 크기를 최소화해야 하는 경우
- ✅ 클래스로만 사용되는 변수

## 결론

디자인 시스템의 색상 토큰은 `@theme static`으로 생성하는 것이 안전합니다. 동적 할당을 지원하고, 모든 토큰이 항상 사용 가능하도록 보장할 수 있습니다.
그리고 tailwind 에서 동적 할당은 항상 조심! 해야 합니다.

## 참고

- Tailwind v4는 빌드 시 정적 분석만 수행하므로, 런타임에 동적으로 할당되는 변수는 `static`이 필요합니다.
- CSS 변수 자체는 크기가 매우 작아 오버헤드가 거의 없습니다.

