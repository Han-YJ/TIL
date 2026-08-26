# 체크박스는 켜졌는데 앱은 모른다

목록에서 행 두 개를 고르고 일괄 삭제하는 테스트가 있었다. 간헐적으로 빨개졌는데, 죽는 자리가 이상했다.

```js
for (const target of targets) {
  const checkbox = page.getByRole('checkbox', { name: `${target.name} 선택` });
  await checkbox.check({ force: true });
  await expect(checkbox).toBeChecked();   // ← 통과
}
await expect(selectionBar).toBeVisible();  // ← 여기서 죽는다
```

체크는 됐다고 하는데 "2개 선택됨" 액션 바가 안 뜬다. 체크가 됐으면 바가 떠야 하는 것 아닌가.

## `force` 는 DOM 만 바꾼다

`check({ force: true })` 는 actionability 검사를 건너뛰고 요소의 checked 를 직접 세운다. 그리고 `toBeChecked()` 는 **DOM 의 checked 속성**을 본다.

그래서 이런 상태가 성립한다:

```
DOM:    checked = true      → toBeChecked() 통과
React:  아무 일도 없었음     → 선택 목록은 여전히 빈 배열
```

하이드레이션이 끝나기 전이면 `onChange` 핸들러가 아직 안 붙어 있다. 마크업은 서버가 그려 보냈으니 체크박스는 **거기 있고 눌리기도 한다.** 다만 눌린 사실이 아무 데도 전달되지 않는다.

`force` 를 쓴 이유는 따로 있었다 — DS 체크박스가 실제 `input` 을 `sr-only` 로 숨기고 옆의 `span` 을 그리는 구조라, 합성 클릭이 span 에 가로막혀 안 먹었다. 그 우회가 **부작용으로 검증까지 우회**해 버렸다.

## 단언이 유실을 가려준다

문제는 실패하는 게 아니라 **실패가 늦게 드러난다**는 것이다.

`toBeChecked()` 가 통과하니 테스트는 다음 줄로 넘어간다. 진짜 실패는 몇 줄 뒤 액션 바에서 나고, 로그만 보면 "액션 바가 안 뜬다" 로 읽힌다. 액션 바 렌더를 의심하게 되고, 정작 원인인 선택 유실은 **초록 단언 뒤에 숨어 있다.**

## 고치는 방향은 "효과"로 옮기는 것

체크됐는지가 아니라 **체크가 무슨 일을 일으켰는지**를 본다.

```js
await expect(async () => {
  for (const target of targets) {
    const checkbox = page.getByRole('checkbox', { name: `${target.name} 선택` });
    await checkbox.setChecked(false, { force: true });
    await checkbox.setChecked(true, { force: true });
  }
  await expect(selectionBar).toBeVisible({ timeout: 2000 });
}).toPass({ timeout: 30000 });
```

껐다 켜는 건 되풀이할 때마다 `change` 를 다시 발화시키기 위해서다. 이미 checked 인 상태에서 `check()` 를 또 부르면 아무 일도 안 일어난다 — 그러면 재시도가 무의미해진다.

## 일반화하면

**상태를 직접 세우는 API 는 그 상태를 읽는 단언과 짝이 되면 아무것도 검증하지 못한다.**

| 조작 | 짝지으면 안 되는 단언 | 대신 볼 것 |
|---|---|---|
| `check({ force: true })` | `toBeChecked()` | 선택 개수 · 액션 바 · 저장 payload |
| `fill()` | `toHaveValue()` | 검증 메시지 · 버튼 활성화 |
| `evaluate(el => el.value = x)` | `toHaveValue()` | 그 값으로 바뀐 화면 |

셋 다 "내가 쓴 값을 내가 읽는" 구조다. 왕복이 앱을 한 번도 지나지 않는다.

부재 단언이 셀렉터가 틀려도 초록인 것과 같은 계열이다. 거기서는 **못 찾은 것과 없는 것**이 구분되지 않았고, 여기서는 **앱이 반응한 것과 DOM 만 바뀐 것**이 구분되지 않는다.

바꿔 말하면 — **단언은 내가 만든 사실이 아니라 앱이 만든 사실을 봐야 한다.**
