# 팝오버가 바깥 클릭에 안 닫힌다 — 그런데 앱 결함이 아니었다

Radix Popover 를 연 뒤 바깥을 클릭하면 닫혀야 하는데, 자동화 확인에서 5초 동안 열린 채로 남았다. 두 번 실행해 두 번, 클릭 위치를 바꿔도 같았다. 결함으로 보고 올릴 뻔했다.

```js
await trigger.click();
await expect(popover).toBeVisible();
await page.mouse.click(1300, 180);         // 본문 빈 곳
await expect(popover).toHaveCount(0);      // ← 5초 대기 후 실패
```

## 기각한 가설들

jsdom 컴포넌트 테스트(userEvent 로 바깥 클릭)에서는 정상으로 닫혔다. 그러니 "실제 페이지의 무언가가 막는다" 로 보고 하나씩 계측했다.

| 가설 | 확인 방법 | 결과 |
|---|---|---|
| 닫힌 채 마운트된 다른 Dialog·Select 레이어가 바깥 이벤트를 가로챔 | `[data-radix-popper-content-wrapper]` · 열린 `role=dialog` 개수 | 이 팝오버 하나뿐 |
| 어딘가 `stopPropagation` / `preventDefault` | window 캡처·버블 단계에 pointerdown 리스너 | 매번 도착, `defaultPrevented: false` |
| `body { pointer-events: none }` 잔재 | `document.body.style.pointerEvents` | 비어 있음 |
| `inert` · 덮는 요소 | 클릭 지점 `elementFromPoint` · `[inert]` 개수 | 평범한 div, 0개 |

전부 아니었다. 남은 질문은 "이벤트는 왔는데 Radix 는 왜 몰랐나" 였다.

## 원인: 리스너가 한 박자 늦게 붙는다

Radix 의 `DismissableLayer`(Popover · Dialog · DropdownMenu 공통)는 마운트 직후 바로 `document` 에 pointerdown 리스너를 붙이지 않는다. `setTimeout(0)` 뒤에 붙인다.

```js
// @radix-ui/react-dismissable-layer
const timerId = window.setTimeout(() => {
  ownerDocument.addEventListener('pointerdown', handlePointerDown);
}, 0);
```

여는 데 쓴 그 클릭이 곧바로 "바깥 클릭" 으로 잡혀 열리자마자 닫히는 것을 막으려는 장치다.

그래서 리스너 등록 시각과 클릭 시각을 찍어 봤다.

```
다시 여는 클릭        17055ms
바깥 pointerdown 도착  17061ms
Radix 리스너 등록      17063ms   ← 클릭보다 2ms 늦음
```

Playwright 는 `toBeVisible()` 이 통과하는 즉시 다음 클릭을 보낸다. 그 클릭이 리스너보다 먼저 도착하면 한 번은 그냥 버려진다. 같은 자리를 한 번 더 누르면 바로 닫혔다. 경합 폭이 수 ms 라 실행마다 결과가 갈렸고, 열고 500ms 뒤에 누른 10번은 전부 닫혔다.

사람 손으로는 닿을 수 없는 간격이라 사용자에게는 생기지 않는다.

## 테스트는 이렇게

"열린 직후 바깥 클릭" 을 단언해야 하면 클릭과 닫힘 확인을 함께 재시도로 묶는다.

```js
await expect(async () => {
  await page.mouse.click(1300, 180);
  await expect(popover).toHaveCount(0, { timeout: 500 });
}).toPass();
```

`waitForTimeout(100)` 도 통하지만 숫자에 기대는 것보다 재시도가 낫다.

## 정리

- Radix 계열 오버레이는 열린 뒤 `setTimeout(0)` 에 바깥 클릭 리스너를 붙인다. 연 직후 수 ms 안의 바깥 클릭은 놓친다.
- 자동화에서 "바깥 클릭에 안 닫힘" 을 보면, 앱 결함으로 판정하기 전에 클릭+닫힘 단언을 재시도로 묶어 다시 본다.
- jsdom 에서는 안 나고 실제 브라우저에서만 나는 건 "페이지가 뭔가 막는다" 보다 "타이밍" 을 먼저 의심해 볼 것. userEvent 는 동작 사이에 이벤트 루프를 한 번씩 넘겨 이 경합이 안 생긴다.
