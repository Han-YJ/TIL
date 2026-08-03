# 키보드로 폼을 조작할 때 만나는 함정 둘 — checkbox의 Enter, 제어형 Dialog의 포커스 복귀

마우스로는 멀쩡한 폼이 키보드로 조작하면 어긋나는 지점이 있다. 같은 화면(동의 체크박스 + 약관 모달)을 키보드로 검증하다 두 개를 연달아 만났다 — 하나는 브라우저 기본 동작, 하나는 라이브러리의 암묵 전제가 원인이다.

## 함정 1 — checkbox에 포커스 두고 Enter를 누르면 체크가 아니라 폼이 제출된다

네이티브 `<input type="checkbox">`의 토글 키는 **Space 단독**이다 (WAI-ARIA checkbox 패턴도 Space만 규정). Enter는 checkbox에 아무 동작도 하지 않고, `<form>` 안이라면 **암묵적 폼 제출(implicit submission)** 로 넘어간다.

체감 증상: 필수 동의 체크박스에 포커스를 두고 Enter → 체크는 안 되고, 미완성 폼이 제출되어 검증 에러가 화면에 쏟아진다. 사용자 입장에선 "체크하려고 Enter 눌렀는데 에러가 떴다".

### 해법: preventDefault + click() 위임

```tsx
<input
  type="checkbox"
  onChange={(e) => handleChange(e.target.checked)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();      // 암묵적 폼 제출 차단
      e.currentTarget.click(); // 네이티브 click 경로로 토글
    }
  }}
/>
```

포인트는 상태를 직접 뒤집지 않고 **`click()`을 위임**하는 것. React 상태만 뒤집으면(`setChecked(!checked)`) uncontrolled 사용처에서 DOM의 `input.checked`가 안 바뀌어 FormData 직렬화가 어긋난다. `click()`은 브라우저가 checked를 토글하고 `change` 이벤트를 발화시키므로 controlled/uncontrolled 어느 쪽이든 기존 `onChange` 경로 하나로 일관되게 흐른다.

표준 이탈 여부: ARIA 관례에선 벗어나지만 Space 토글은 그대로 두고 Enter를 *추가*하는 것이라 기존 사용자를 해치지 않고, 대안(Enter → 의도치 않은 제출)이 명백히 더 나쁘다. Radix 같은 라이브러리는 반대로 Enter를 no-op으로 막는 쪽을 택한다 — 어느 쪽이든 "Enter가 폼 제출로 새는 것"만은 막는 게 공통분모다.

## 함정 2 — 제어형 Radix Dialog는 닫힐 때 돌아갈 곳을 모른다

Radix Dialog는 닫힐 때 포커스를 트리거로 되돌려주는데, 그 대상은 **`<Dialog.Trigger>`** 다. `open` prop만으로 제어하는 controlled 패턴(트리거는 그냥 `<button onClick={() => setOpen(true)}>`)에서는 Radix가 복귀 대상을 알 수 없어, 모달을 닫으면 포커스가 body로 떨어진다.

체감 증상: 모달 안에서 Tab으로 [확인] 버튼까지 가서 Enter로 닫음 → 포커스 소실 → 다음 Tab이 문서 처음부터 다시 시작. 키보드 사용자는 조작하던 위치를 완전히 잃는다. 마우스로는 절대 안 보이는 버그다.

### 해법: 여는 쪽에서 트리거를 저장하고, 닫힘 전이에서 직접 복귀

```tsx
const triggerRef = useRef<HTMLButtonElement | null>(null);
const [open, setOpen] = useState(false);

// 닫힘(open → false) 전이에서 저장해둔 트리거로 복귀
useEffect(() => {
  if (open || !triggerRef.current) return;
  triggerRef.current.focus();
  triggerRef.current = null;
}, [open]);

<button
  onClick={(e) => {
    triggerRef.current = e.currentTarget; // 어떤 버튼이 열었는지 기억
    setOpen(true);
  }}
>
  보기
</button>
```

- `e.currentTarget`을 저장하므로 같은 모달을 여는 트리거가 여러 개여도(약관 보기 버튼 2개 등) 각자 자기 자리로 돌아간다.
- 복귀를 effect(상태 전이)에 두면 [확인]·[닫기]·X·ESC·오버레이 클릭 등 **닫힘 경로가 몇 개든 공통**으로 동작한다 — 각 핸들러에 focus 호출을 흩뿌리지 않는다.
- Radix가 자체적으로 시도하는 close auto-focus보다 effect가 나중에 실행되므로 순서 충돌도 없다.

## 공통 교훈

둘 다 "마우스 경로는 완벽한데 키보드 경로가 죽는" 유형이라 수동 QA에서 잘 안 잡힌다. 폼+모달 화면은 **Tab과 Enter만으로 한 바퀴** 돌아보는 걸 검증 루틴에 넣을 것 — 이번 두 건 모두 그 한 바퀴에서 나왔다.
