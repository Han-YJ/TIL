# latest-ref 패턴은 React Compiler 시대에 깨진다 — 교과서 수정이 실 버그가 되는 케이스

`react-hooks/refs` lint 에러("Cannot access refs during render")를 만났을 때, 교과서적 수정(대입을 `useEffect`로 이동)이 오히려 **실제 버그를 만드는** 경우가 있다. 렌더 중 ref 대입이 의도된 설계(latest-ref 패턴)일 때다.

## 패턴이 존재했던 이유

TanStack Table 같은 구조에서 columns 정의는 `useMemo`로 안정화해야 한다 — 타이핑마다 columns가 재생성되면 셀 컴포넌트가 **remount**되고, input이 remount되면 **한글 IME 조합이 깨진다**. 그래서 자주 바뀌는 값(입력값·핸들러)을 columns 클로저에 넣지 않고 ref로 우회한다:

```tsx
const editorRef = useRef(null);
editorRef.current = { value, handleChange, ... }; // 렌더 중 대입 (lint 에러 지점)

const columns = useMemo(() => [{
  cell: () => <Input value={editorRef.current.value} ... /> // 렌더 시점에 최신값 읽기
}], [activeKey]); // value는 의존성에서 제외 → columns 안정
```

셀은 부모 재렌더마다 함께 재렌더되므로(remount 아님) ref에서 항상 최신값을 읽는다 — 클래식 React에서는 동작했다.

## 왜 이제 깨지나

이 패턴은 **"셀이 부모와 함께 매번 재렌더된다"는 암묵적 전제** 위에 서 있다. React Compiler가 셀 컴포넌트를 메모이즈하면 그 전제가 무너진다 — ref는 반응성이 없으므로, 재렌더가 스킵된 셀은 stale 값을 계속 보여준다. lint가 렌더 중 ref 접근을 금지하는 실질적 이유가 이것이다.

그리고 교과서 수정(useEffect로 대입 이동)은 더 나쁘다: effect는 커밋 후에 실행되므로 같은 커밋에서 렌더되는 셀은 **한 렌더 이전 값**을 읽는다 → 입력이 한 키씩 늦게 표시되는 버그.

## 대체: Context 구독

{% raw %}
```tsx
const EditorContext = createContext(null);

// 부모: 렌더마다 새 값 제공 (ref 대입 제거)
<EditorContext.Provider value={{ value, handleChange, ... }}>

// 셀: 모듈 레벨 컴포넌트로 분리해 구독
function EditorCell() {
  const ed = useContext(EditorContext);
  return <Input value={ed.value} ... />;
}
// columns는 여전히 안정: cell: () => <EditorCell />
```
{% endraw %}

- columns 안정성 유지 → 셀 remount 없음 → IME 보존 (원래 패턴의 목적 달성)
- context 변경은 **컴파일러가 메모이즈해도 구독 컴포넌트의 재렌더를 보장** — ref와 달리 반응성이 계약에 포함됨

## 요약

렌더 중 ref 대입을 발견하면 "왜 이 패턴을 썼는가"(대부분 메모 안정성 확보)를 먼저 파악하고, 그 불변식을 유지한 채 **반응성 있는 채널(Context)** 로 교체해야 한다. lint 에러를 기계적으로 useEffect로 옮기면 타이밍 버그가 된다.
