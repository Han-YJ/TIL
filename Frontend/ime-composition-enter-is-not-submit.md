# 한글 조합 중 Enter는 제출이 아니다

한글 이름을 입력하고 Enter로 저장하면 이름이 잘린 채 저장되는 버그를 만났다.

`홍길동`을 치고 Enter를 눌렀는데 `홍길`이 저장된다. 영문 이름으로 테스트하면 멀쩡하다.

## 왜 걸리나

한글·일본어·중국어 입력은 IME(Input Method Editor)를 거친다. 자모를 조합하는 동안 입력창에는 미확정 문자열이 떠 있고, **Enter는 그 조합을 확정하는 키**다. 조합이 끝나야 비로소 `input` 이벤트가 최종 값으로 발생한다.

그런데 `keydown`은 조합 확정 Enter에서도 똑같이 발생한다. 그래서 이런 핸들러는 확정 직전의 값을 읽는다.

```ts
onKeyDown={(e) => {
  if (e.key === 'Enter') save(value);   // value가 아직 확정 전이다
}}
```

영문은 조합 단계가 없어서 이 버그가 안 보인다. 그래서 **테스트를 영문으로 하면 절대 못 잡는다.**

## 대응

`KeyboardEvent.isComposing`으로 조합 중인지 판별한다. React에서는 합성 이벤트가 아니라 `nativeEvent`에 있다.

```ts
onKeyDown={(e) => {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
  e.preventDefault();
  save(value);
}}
```

`compositionstart`/`compositionend` 이벤트로 직접 플래그를 관리하는 방법도 있지만, 단발 판정에는 `isComposing` 하나면 충분하다.

## 호출부마다 쓰면 반드시 빠뜨린다

이 가드는 "Enter로 확정하는 입력"이라면 전부 필요하다. 문제는 호출부가 `onKeyDown`을 직접 달 때마다 사람이 기억해서 다시 써야 한다는 것이다.

실제로 한 코드베이스에서 Enter를 다루는 자리를 세어 보니 21곳이었고, 그중 텍스트 입력인 곳 몇 개에 가드가 빠져 있었다. 흥미롭게도 **자기가 Enter 시맨틱을 소유한 컴포넌트**(태그 입력, 검색형 셀렉트 등)에는 전부 들어 있었다. 빠진 곳은 범용 `Input`에 핸들러를 바깥에서 붙인 자리들이었다.

그래서 입력 컴포넌트가 슬롯으로 소유하는 쪽이 낫다.

```tsx
type InputProps = {
  /** Enter로 확정하는 입력의 실행 콜백. 조합 중 Enter는 무시한다. */
  onEnter?: () => void;
};

// 내부
onKeyDown={(event) => {
  props.onKeyDown?.(event);                  // 호출부 핸들러가 먼저
  if (!onEnter || event.defaultPrevented) return;
  if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
  event.preventDefault();
  onEnter();
}}
```

호출부는 `onEnter={handleSave}`만 쓰면 되고, 화살표·Escape처럼 다른 키도 다뤄야 하면 `onKeyDown`을 함께 넘긴다. 순서를 "호출부 먼저 → `defaultPrevented`면 중단"으로 두면 호출부가 Enter를 가로챌 여지도 남는다.

## 테스트

jsdom에서 `fireEvent.keyDown`에 `isComposing`을 실어 검증할 수 있다.

```ts
fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
expect(onEnter).not.toHaveBeenCalled();
```

주의할 점 하나 — 이 가드를 추가하면 **`nativeEvent` 없이 만든 가짜 이벤트를 넘기던 기존 테스트가 깨진다.** `{ key: 'Enter', preventDefault: vi.fn() }` 같은 객체를 쓰고 있었다면 `nativeEvent: { isComposing: false }`를 채워 실제 이벤트 모양에 맞춰야 한다.
