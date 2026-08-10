# RHF 제출 사이클 중 호출한 `setError` 는 제출이 끝나며 유실된다 — 매크로태스크로 사이클 밖에서 호출

react-hook-form 에서 서버 에러를 필드 인라인으로 매핑할 때, `handleSubmit(onSubmit)` 의 `onSubmit` 안에서(즉 제출 사이클 안에서) `setError` 를 호출하면 **제출 사이클이 완료되는 시점에 그 에러가 지워질 수 있다**. 호출 자체는 성공하고 DOM 에 잠깐 에러가 붙었다가, `handleSubmit` 이 제출 후처리(내부 formState 정리)를 마치며 사라진다.

증상이 교묘하다 — 토스트·기타 부수효과는 다 동작하는데 필드 인라인만 안 보인다. React DevTools 나 DOM 스냅샷을 시점별로 찍어 보면 "에러가 붙었다가 지워지는" 순간이 잡힌다.

## 해결 — 제출 사이클 밖으로 지연

`setTimeout(0)` 매크로태스크로 미루면 `handleSubmit` 의 후처리가 끝난 뒤에 반영되어 유실되지 않는다.

```tsx
// ❌ 제출 사이클 안 — handleSubmit 후처리가 setError 를 지울 수 있음
const onSubmit = async (values: FormInput) => {
  const result = await save(values);
  if (result.conflict) {
    reset(toFormValues(result.latest));
    for (const field of result.conflictFields) {
      setError(field, { message: CONFLICT_MESSAGE });
    }
  }
};

// ✅ 매크로태스크로 지연 — 제출 사이클 완료 후 반영
const onSubmit = async (values: FormInput) => {
  const result = await save(values);
  if (result.conflict) {
    setTimeout(() => {
      reset(toFormValues(result.latest));
      for (const field of result.conflictFields) {
        setError(field, { message: CONFLICT_MESSAGE });
      }
    }, 0);
  }
};
```

## 함께 알아둘 것

- 상태 플래그 + `useEffect` 에서 `setError` 하는 우회도 가능하지만, `eslint-plugin-react-hooks` 최신 룰(`set-state-in-effect`)에 걸리는 코드 형태가 되기 쉽다 — 매크로태스크 지연이 더 단순하다.
- `reset()` 을 함께 쓸 때는 **reset 먼저, setError 나중** 순서여야 한다. `reset` 은 기본적으로 errors 를 함께 초기화하므로 역순이면 방금 세운 에러가 지워진다.
- 인라인 에러가 안 보이면 표시 배선 자체가 없는 경우도 의심할 것 — 검증 스키마에 걸리지 않던 필드는 에러 표시 prop 연결이 처음부터 빠져 있을 수 있다.
