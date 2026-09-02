# Playwright로 관측할 수 없는 것 세 가지

e2e가 초록인데 아무것도 지키지 않는 경우가 있다. 단언이 틀린 게 아니라 **관측 채널이 틀린** 경우다. 하루 사이에 셋을 연달아 밟았고, 셋 다 "그럴 것 같다"로 추정했다가 실측으로 뒤집혔다.

## 1. 서버에서 나가는 요청은 `page.route`에 걸리지 않는다

서버 컴포넌트에서 데이터를 읽고 Server Action으로 저장하는 앱(Next.js App Router 등)에서, 백엔드 실패 표면을 검증하려고 라우트를 가로챘다.

```ts
await page.route('**/api/v1/preferences**', (route) => route.fulfill({ status: 500 }));
await page.goto('/settings/notifications');
```

500이 안 뜬다. 화면은 멀쩡히 그려진다.

`page.route`는 **브라우저가 보내는 요청**만 가로챈다. 서버 컴포넌트의 fetch는 Node에서 나가고, Server Action도 브라우저→앱 서버 구간만 브라우저를 거칠 뿐 **앱 서버→백엔드 구간은 Node에서** 나간다. 브라우저는 그 요청을 본 적이 없다.

실측으로 확인한 값:

```
RSC 조회 후   backendHits=0   (화면은 정상 렌더 = 요청은 분명히 일어났다)
저장 커밋 후  backendHits=0   nextActionHits=1
```

`backendHits`는 `page.route` 핸들러 호출 수, `nextActionHits`는 `next-action` 헤더를 단 POST 수다. 저장 시 브라우저가 보낸 건 **앱 서버로 가는 POST 하나뿐**이고 백엔드로 가는 요청은 0건이다.

그래서 이 축의 실패 표면(조회 실패 화면·저장 실패 토스트)은 브라우저 e2e로 **유발할 방법이 없다.** 구현이 돼 있어도 덮을 수 없으므로 `uncoverable`로 적고 넘어가는 게 정직하다 — 억지로 덮으려 하면 실제로는 아무것도 안 지키는 초록이 남는다.

부수 효과 하나: 저 `nextActionHits` 카운터는 **"조작할 때마다 서버로 나가지 않는다"**를 잠그는 데 그대로 쓸 수 있다. 명시적 저장 폼에서 토글 3개를 바꾸는 동안 0건, `[저장]`에 정확히 1건 — 이건 브라우저 구간이라 관측된다.

## 2. `page.reload()`는 `beforeunload` 대화상자를 삼킨다

미저장 변경이 있을 때 새로고침을 막는 가드를 검증하려 했다.

```ts
let prompted = false;
page.on('dialog', () => { prompted = true; });
await page.reload();
expect(prompted).toBe(true);   // ❌ 항상 false
```

Playwright는 네비게이션 중 뜨는 `beforeunload` 대화상자를 **자동으로 dismiss하고 `dialog` 이벤트를 내지 않는다.** 가드가 정상 동작해도 관측되지 않는다.

가드가 실제로 붙어 있는지부터 갈라보면 이렇게 나온다:

```ts
const guarded = await page.evaluate(() => {
  const e = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(e);
  return e.defaultPrevented;   // true → 핸들러는 살아 있다
});
```

이벤트가 실제로 나오는 경로는 **`close({ runBeforeUnload: true })` 하나뿐**이다. 그리고 한 번 더 함정이 있다 — 이벤트는 `close()`가 **resolve된 뒤에** 온다.

```ts
// ❌ close 직후에 읽으면 항상 false (race)
await page.close({ runBeforeUnload: true });
expect(prompted).toBe(true);

// ✅ 먼저 기다릴 준비를 하고 닫는다
const dialog = page.waitForEvent('dialog', { timeout: 5_000 }).then(
  (d) => { void d.dismiss(); return true; },
  () => false
);
await page.close({ runBeforeUnload: true });
expect(await dialog).toBe(true);
```

이 단언은 "항상 참"이 되기 쉬우니 **변경이 없을 때는 안 뜬다**는 갈래를 같은 테스트에 두는 게 좋다. 그래야 단언이 실제로 갈린다는 게 증명된다.

## 3. 자동으로 사라지는 토스트는 그대로 완료 신호가 못 된다

저장이 끝났는지 확인하고 새로고침해서 값이 남았는지 보려 했다.

```ts
await saveButton.click();
await expect(saveButton).toBeDisabled();   // ❌ 저장 중에도 disabled다
await page.reload();
```

변경이 없을 때 비활성인 버튼은 **저장 중에도 비활성**인 경우가 많다. 그래서 이 단언은 클릭 직후 즉시 통과하고, 저장이 끝나기 전에 `reload()`가 나가 요청이 끊긴다. 화면에는 옛 값이 남는다.

그럼 성공 토스트를 기다리면 될 것 같지만, 토스트가 3초쯤 뒤 자동으로 사라지는 UI라면 이것도 틀린다.

```ts
await expect(page.getByText('저장했어요')).toBeVisible();   // ❌ 앞 회차의 잔여 토스트일 수 있다
```

한 테스트에서 두 번 저장하면(값을 바꿨다가 되돌리는 경우가 흔하다) 첫 토스트가 아직 떠 있는 채로 두 번째 단언이 통과한다. 신호를 이렇게 좁히면 해결된다.

```ts
async function commitSave(page) {
  await expect(page.getByText(SUCCESS)).toHaveCount(0);   // 직전 것이 사라질 때까지
  await saveButton(page).click();
  await expect(page.getByText(SUCCESS)).toHaveCount(1);   // 이번 커밋 1건
}
```

단언을 약화한 게 아니라 **강화**한 것이다 — "보인다"에서 "직전 것이 사라진 뒤 정확히 1건"으로.

## 정리

셋의 공통점은 **단언이 아니라 채널이 틀렸다**는 것이다. 그리고 셋 다 초록으로 통과하거나 엉뚱한 곳에서 빨개져서, 로그를 안 열면 원인을 메커니즘으로 상상하게 된다. 나는 세 번 다 상상부터 했고 세 번 다 틀렸다.

실패했을 때 열어볼 것은 정해져 있다 — **파이프로 자르지 않은 전체 출력, 종료 코드, trace, `error-context.md`의 페이지 스냅샷**. 마지막 것이 특히 강력하다. "필드가 표시 전용이 아니다"라며 빨개진 테스트의 스냅샷을 열었더니 화면 전체가 로그인 페이지였고, 단언은 처음부터 제 일을 하고 있었다.
