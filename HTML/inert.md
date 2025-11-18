# HTML `inert` 속성

## 개요

HTML 표준 속성. 요소와 하위 요소를 비활성화.

## 기능

### 상호작용 차단

- 클릭, 포커스, 키보드 입력 차단
- 포인터 이벤트 차단

### 접근성 처리

- 스크린 리더에서 무시
- 포커스 트리에서 제외
- `aria-hidden`보다 강력

### 사용 시기

- 모달 닫힘 상태
- 오버레이/백드롭 비활성화 필요 시
- 접근성 경고 방지

## 사용 예시

```tsx
<div {...(!shouldAnimate && { inert: true })}>{/* 모달 콘텐츠 */}</div>
```

## `aria-hidden` vs `inert`

| 속성          | 상호작용 차단 | 접근성 처리 | 포커스 차단 |
| ------------- | ------------- | ----------- | ----------- |
| `aria-hidden` | ❌            | ✅          | ❌          |
| `inert`       | ✅            | ✅          | ✅          |

## 브라우저 지원

- Chrome 102+
- Firefox 112+
- Safari 15.5+
- Edge 102+

## 참고

- [MDN - inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- [W3C HTML Standard - inert](https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute)
