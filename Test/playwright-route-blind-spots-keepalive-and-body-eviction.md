# Playwright 네트워크 가로채기의 사각지대 두 가지

둘 다 병렬 런에서 **가끔만** 빨개지는 플레이크로 나타났고, 재시도하면 통과했다. 단언은 멀쩡했다. 요청을 보고 있다고 믿었던 채널이 실제로는 그 순간 비어 있었다.

## 1. 닫힌 페이지의 keepalive 요청은 `route`에 안 걸린다

세션 만료를 검증하는 테스트였다. 흐름은 이렇다.

1. 로그인 콜백으로 세션을 굽는다 (착지 페이지가 뜬다)
2. 마지막 활동 시각 쿠키를 과거로 민다
3. 보호된 페이지로 가면 로그인 화면으로 튕겨야 한다

앱은 사용자 활동이 있을 때 `/api/activity` 로 ping 을 보내 이 쿠키를 현재 시각으로 갱신한다. 그래서 테스트는 이 경로를 막아 두고, 착지 페이지도 닫았다.

```ts
await context.route('**/api/activity', (route) => route.abort());
const page = await context.newPage();
await page.goto(callbackUrl);
await page.close();                  // 열린 페이지의 ping 이 늦게 오지 않게
await backdateActivity(context);     // 쿠키를 과거로
```

그런데 가끔 만료가 안 됐다. 쿠키를 민 직후에 다시 읽어 보면 값은 분명 과거였다. 그 뒤에 무언가가 현재 시각으로 덮고 있었다.

쿠키를 쓰는 곳을 전부 찾아 보니 콜백과 활동 ping 두 곳뿐이었다. 범인은 ping 이었다. 앱의 ping 은 `fetch(..., { keepalive: true })` 로 나간다. **keepalive 요청은 페이지가 닫힌 뒤에도 브라우저가 끝까지 보낸다.** 그런데 페이지가 사라진 뒤라 Playwright 의 가로채기 밖으로 나간다. `route.abort()` 를 걸어 뒀어도 서버에 도착해 `Set-Cookie` 를 돌려준다.

그래서 서버가 느린 부하 런에서만 터졌다. 착지 페이지의 하이드레이션이 늦으면 ping 이 `close()` 와 겹치고, 그 요청이 가로채기를 빠져나간다.

해결은 페이지를 아예 띄우지 않는 것이다. 준비 단계에 화면이 필요 없으면 `context.request` 로 콜백만 호출하면 된다. **`context.request` 는 브라우저 컨텍스트와 쿠키 저장소를 공유한다.** 응답의 `Set-Cookie` 가 그대로 컨텍스트에 쌓이고, 이후 `page.goto` 가 그 쿠키로 나간다.

```ts
const context = await browser.newContext();
const res = await context.request.get(callbackUrl, { maxRedirects: 0 });
expect(res.status()).toBe(307);
// 페이지가 한 번도 안 떴으니 ping 도 없다 — route.abort·page.close 우회도 필요 없다
```

`maxRedirects: 0` 으로 두면 콜백의 리다이렉트를 따라가지 않는다. 쿠키만 심고 끝난다. 리다이렉트 목적지(`location` 헤더)가 에러 페이지가 아닌지도 함께 단언할 수 있다.

**교훈**: "페이지를 닫았다"는 "그 페이지의 요청이 끝났다"가 아니다. 가로채기로 막는 방식은 페이지가 살아 있을 때만 성립한다. 준비 단계라면 차라리 요청이 생길 근원(페이지) 자체를 없애는 쪽이 확실하다.

## 2. 스트리밍 응답 본문은 읽기 전에 사라질 수 있다

목록 조회 응답에 특정 항목이 빠졌는지 단언하려고 응답을 기다렸다가 본문을 읽었다.

```ts
const res = await page.waitForResponse((r) => r.request().method() === 'POST');
const body = await res.text();   // 가끔 실패
```

가끔 이렇게 실패했다.

```
Network.getResponseBody: No data found for resource with given identifier
```

Chromium 은 응답 본문을 DevTools 버퍼에 잠깐만 들고 있다. 스트리밍 응답(React Server Components 의 flight 응답, Server Action 응답 등)이나 큰 응답은 **Playwright 가 읽기 전에 버퍼에서 밀려날 수 있다.** 이러면 요청은 성공했는데 본문만 못 읽는다. 병렬 런처럼 브라우저가 바쁠수록 잦다.

본문을 확실히 손에 넣으려면 응답을 관찰하지 말고 **직접 받아서 넘겨 주면** 된다.

```ts
let captured = '';
await page.route('**/items**', async (route) => {
  if (!route.request().postData()?.includes('"filters"')) return route.continue();
  const response = await route.fetch();          // 테스트가 직접 받는다
  const bytes = await response.body();
  captured = bytes.toString('utf8');
  await route.fulfill({ response, body: bytes }); // 받은 그대로 브라우저에 넘긴다
});
```

`route.fetch()` 는 테스트 프로세스가 요청을 보내고 응답을 받는다. 본문이 브라우저 버퍼를 거치지 않으니 밀려날 일이 없다. `fulfill` 에 `body` 를 명시해 두면 앱도 원래 응답을 그대로 받는다.

**교훈**: `waitForResponse` + `res.text()` 는 "응답을 봤다"까지만 보장한다. 본문을 단언의 근거로 쓸 거라면 `route.fetch()` 로 가로채서 직접 들고 있는다.
