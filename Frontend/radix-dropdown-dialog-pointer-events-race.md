# Radix DropdownMenu에서 같은 틱에 Dialog를 열면 페이지 전체가 클릭 불능이 될 수 있다

`DropdownMenuItem`의 `onSelect`에서 곧바로 Dialog를 여는 흔한 패턴이, 특정 타이밍에서 **모달을 닫은 뒤 body에 `pointer-events: none`이 영구 잔류**하는 버그를 만든다. 이후 페이지의 어떤 요소도 클릭되지 않는다 (키보드는 동작 — hit-testing만 죽는다).

```tsx
<DropdownMenuItem onSelect={() => setDialogOpen(true)}>직접 입력</DropdownMenuItem>
```

## 왜 생기나

Radix의 modal 계열 오버레이(DropdownMenu, Dialog)는 열릴 때 `body { pointer-events: none }`을 걸고 닫힐 때 복원한다. 그런데 `onSelect`는 메뉴 **닫힘 cleanup과 같은 틱**에 실행되므로:

1. 메뉴가 닫히며 자기 몫의 pointer-events 복원을 예약하고
2. 같은 틱에 Dialog가 열리며 다시 `none`을 걸면
3. 두 오버레이의 정리 순서가 꼬여 — Dialog를 닫아도 복원이 유실될 수 있다

## 타이밍 의존이라 사람은 재현 못 한다

이 버그의 함정: **수동 조작으로는 재현이 안 됐다.** 진단 스크립트를 두 변형으로 돌려서야 갈라졌다:

| 변형 | 결과 |
|---|---|
| 기계 타이밍 — 조작 간 지연 0ms (Playwright 기본 속도) | 재현 — 닫은 뒤 1초가 지나도 `body pointer-events: none` |
| 인간 타이밍 — 조작 간 500ms | 정상 복원 |

즉 좁은 레이스 윈도우다. e2e에서만 죽고 수동 QA는 통과하는 종류라 "테스트 환경 허상"으로 오판하기 쉬운데, DOM 상태 폴링(`getComputedStyle(document.body).pointerEvents`)으로 확인하면 실재하는 앱 상태다. **타이밍 의존이 의심되면 지연 0ms / 수백 ms 두 변형으로 진단을 이원화**하는 게 판별법.

## 해법: 열기를 다음 틱으로 미룬다

```tsx
function openDialog() {
  // 메뉴 닫힘 cleanup이 끝난 다음 틱에 연다
  setTimeout(() => setDialogOpen(true), 0);
}
```

메뉴의 pointer-events 정리가 완료된 뒤 Dialog가 자기 사이클을 시작하므로 복원이 꼬이지 않는다. 픽스 전 기계 타이밍에서 일관 실패하던 진단이 픽스 후 통과하는 것으로 검증했다.

체감 부작용은 없다 — 모달 등장이 한 틱 늦을 뿐이고, e2e의 auto-wait도 그대로 잡는다.
