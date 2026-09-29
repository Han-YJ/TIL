# Radix Dialog 는 토스트 클릭도 "바깥 클릭"으로 본다

드로어(Radix Dialog 기반)에서 저장이 실패해 에러 토스트가 떴다. 토스트의 X 를 눌러 닫았더니, 드로어가 닫히려 하면서 "저장하지 않은 변경이 있어요" 확인 모달이 떴다. 사용자는 토스트를 닫았을 뿐 드로어를 건드리지 않았다.

## 왜 걸리나

Radix `Dialog.Content` 는 콘텐츠 **DOM 트리 바깥**에서 일어난 pointer down·focus 를 `onInteractOutside` 로 알리고, 기본 동작으로 다이얼로그를 닫는다(`onOpenChange(false)`).

토스트 라이브러리(sonner 등)는 토스터를 `body` 바로 아래 별도 요소에 그린다. 화면에서는 드로어 위에 떠 있어도 DOM 에서는 다이얼로그 콘텐츠의 자식이 아니다. 그래서 토스트 클릭은 바깥 클릭과 구별되지 않는다.

- 드로어에 미저장 가드가 있으면 → 닫기 시도가 가드에 걸려 확인 모달이 뜬다
- 가드가 없으면 → 드로어가 그냥 닫혀 입력이 사라진다

모달이 열린 상태에서 뜨는 토스트는 대개 그 모달의 작업 결과라서, 이 조합은 생각보다 자주 만난다.

## 대응

토스트 영역 안의 상호작용이면 기본 동작을 막는다. 소비처마다 넣지 말고 Dialog 를 감싼 공용 컴포넌트 한 곳에 둔다.

```ts
function isToastInteraction(event: Event): boolean {
  const target = event.target;
  return target instanceof Element && target.closest('[data-sonner-toaster]') !== null;
}
```

```tsx
<DialogPrimitive.Content
  onInteractOutside={(event) => {
    if (isToastInteraction(event)) {
      event.preventDefault();
      return;
    }
    onInteractOutside?.(event); // 소비처 핸들러는 그대로 전달
  }}
>
```

- 셀렉터는 토스트 라이브러리가 토스터 루트에 붙이는 속성을 쓴다(sonner 는 `data-sonner-toaster`). 개별 토스트가 아니라 토스터 전체를 기준으로 잡아야 닫기 버튼·액션 버튼·빈 여백 클릭이 모두 걸린다.
- "바깥 클릭으로 닫지 않음" 옵션이 있는 모달이면 그 조건과 OR 로 묶는다.

## 테스트

토스터를 실제로 마운트하고, 그 안을 클릭했을 때 `onOpenChange` 가 한 번도 불리지 않는지 본다.

```tsx
render(
  <>
    <Toaster />
    <Drawer open onOpenChange={onOpenChange}>…</Drawer>
  </>
);
toast.error('저장하지 못했어요');
await user.click(await screen.findByText('저장하지 못했어요'));
expect(onOpenChange).not.toHaveBeenCalled();
```

가드 코드를 지우고 이 테스트가 실패하는지도 한 번 확인한다. 토스터를 마운트하지 않은 테스트는 문제 상황 자체를 만들지 못해 항상 통과한다.

## 정리

- Radix 의 "바깥"은 화면상 위치가 아니라 DOM 트리 기준이다.
- 포털로 따로 그려지는 UI(토스트, 전역 알림 등)는 전부 바깥으로 취급된다.
- 다이얼로그 위에서 쓰일 수 있는 포털 UI 는 공용 Dialog 래퍼의 `onInteractOutside` 에서 명시적으로 빼 준다.
