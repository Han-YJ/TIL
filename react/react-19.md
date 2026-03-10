# 📦 React 19 핵심 요약 및 코드 가이드

## 1. 핵심 패러다임 변화

- **자동 최적화**: React Compiler 도입으로 `useMemo`, `useCallback` 수동 작성 불필요.
- **비동기 처리(Actions)**: `useTransition`으로 로딩/에러 상태 자동 관리.
- **서버/클라이언트 명확화**: `'use server'`, `'use client'` 지시어 표준화.
- **데이터 페칭**: use API를 통한 Promise/Context 읽기 간소화.

## 2. 주요 문법 및 API 개선

| 항목 | React 18 이전 | React 19.1.4+ |
|------|---------------|---------------|
| Ref 전달 | `forwardRef` 감싸기 필수 | 일반 Props로 `ref` 전달 |
| Context | `<Context.Provider>` 사용 | `<Context>` 직접 사용 |
| 메타데이터 | 별도 라이브러리(Helmet 등) | `<title>`, `<meta>` 자동 주입 |
| 폼 상태 | `useState`로 수동 관리 | `useFormStatus`, `useFormState` |

## 3. 리팩토링 실전 (Checkbox 예시)

기존의 복잡한 구조를 React 19 스타일로 간결하게 수정 가능.

### ✅ 개선 포인트

- **forwardRef 제거**: 컴포넌트 인자에서 `ref` 직접 추출.
- **useMemo 삭제**: 단순 비교 로직은 런타임 계산 혹은 컴파일러에 위임.
- **Ref 할당 로직**: 별도 함수 선언 없이 인라인으로 `indeterminate` 속성 제어.

### 📝 수정된 코드 구조

```typescript
// React 19 스타일 리팩토링
export const Checkbox = ({
  size = 'large',
  checked = false,
  ref, // props에서 직접 수신
  ...props
}: CheckboxProps) => {
  const checkboxId = props.id || useId();
  const isIndeterminate = props.type === 'indeterminate';

  return (
    <label className="inline-flex items-center gap-1">
      <input
        {...props}
        ref={(node) => {
          if (node) node.indeterminate = isIndeterminate; // 속성 주입
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="checkbox"
        className="sr-only"
      />
      {/* UI 렌더링 로직 */}
    </label>
  );
};
```
