# 메뉴 항목을 고르는 순간 트리거를 disabled 로 만들면 포커스가 body 로 떨어진다

리스트 행마다 「⋮」 메뉴가 있고, 메뉴 항목을 고르면 서버 요청을 보낸다. 요청이 도는 동안 같은 행을 또 누르지 못하게 「⋮」 버튼에 `disabled={isPending}` 을 걸었다. 마우스로는 아무 문제가 없다. 키보드로 해 보면 항목을 고른 직후 포커스가 사라지고, 다음 Tab 이 문서 맨 처음에서 시작한다.

요청 결과로 확인 모달을 여는 흐름이면 증상이 하나 더 붙는다. 모달을 닫아도 포커스가 메뉴 버튼으로 돌아오지 않는다.

## 왜 걸리나

Radix DropdownMenu(그리고 대부분의 메뉴 구현)는 메뉴가 닫힐 때 포커스를 트리거로 돌려준다. 순서는 이렇다.

1. 항목 선택 → `onSelect` 실행 → mutation 시작 → `isPending = true` 로 리렌더
2. 메뉴 닫힘 → close auto-focus 가 트리거에 `focus()`
3. 그런데 트리거는 이미 `disabled` 다 — disabled 버튼은 포커스를 받지 않으므로 `focus()` 가 조용히 무시되고, 포커스는 `body` 에 남는다

확인 모달이 뒤따르면 상황이 더 나빠진다. Radix Dialog 는 열릴 때 그 순간의 포커스 요소를 기억했다가 닫힐 때 그리로 돌려주는데, 그 순간 포커스가 이미 `body` 다. 모달이 닫혀도 돌아갈 곳이 없다.

에러는 없다. 마우스 사용자에게는 안 보인다. 키보드·스크린리더 사용자만 위치를 잃는다.

## 대응

**진행 중 상태를 트리거의 `disabled` 에 연결하지 않는다.** 중복 요청은 트리거가 아니라 요청을 보내는 쪽에서 막는다.

```ts
// 트리거는 그대로 두고, 보내는 쪽에서 가드
designatePrimary: (id: string) => {
  if (!mutation.isPending) mutation.mutate(id);
},
```

- 트리거가 포커스 가능 상태로 남으므로 메뉴 close auto-focus 가 정상 동작하고, 뒤따르는 모달도 트리거를 복귀 대상으로 잡는다.
- 「요청 중」 을 보여 줘야 하면 `disabled` 대신 `aria-busy`, 스피너, `pointer-events-none` 같은 포커스를 빼앗지 않는 표시를 쓴다. 단 `pointer-events-none` 은 키보드 입력을 막지 못하므로([pointer-events-none-does-not-block-keyboard.md](./pointer-events-none-does-not-block-keyboard.md)) 실행 가드는 여전히 핸들러 쪽에 있어야 한다.
- 같은 함정은 「삭제하면 행이 사라지는」 경우에도 있다. 그때는 트리거 자체가 없어지므로 포커스를 보낼 다른 목적지(섹션 제목 등)를 따로 정해야 한다.

## 확인하는 법

마우스로는 재현되지 않는다. 키보드로 메뉴를 열고(Enter), 항목을 고른 뒤(Enter) 바로 `document.activeElement` 를 본다. `body` 면 이 문제다. e2e 에서는 항목 선택 직후 `expect(trigger).toBeFocused()` 를 단언하면 회귀를 잡는다.

관련: 트리거 없이 `open` 만으로 제어하는 Dialog 의 포커스 복귀는 [form-keyboard-pitfalls-checkbox-enter-and-dialog-focus-return.md](./form-keyboard-pitfalls-checkbox-enter-and-dialog-focus-return.md)
