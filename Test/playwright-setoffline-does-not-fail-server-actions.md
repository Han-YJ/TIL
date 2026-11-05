# Playwright `setOffline` 으로는 Server Action 실패를 만들 수 없다

저장 실패 토스트를 보려고 `context.setOffline(true)` 뒤 버튼을 눌렀더니, 토스트 없이 처리 중으로 멈췄다가 `setOffline(false)` 순간 저장이 그대로 실행됐다 (Next.js 16.3 · App Router).

## 확인한 것

- 요청 이벤트를 찍어 보면 오프라인 동안 Server Action `POST` 가 아예 나가지 않는다. 온라인으로 돌아온 순간 처음 전송된다 — 실패 뒤 재전송이 아니다.
- `experimental.useOffline` 은 꺼져 있었다 (`.next/required-server-files.json` 에서 확인). 원인을 그 재전송 경로로 짚기 전에 빌드 설정부터 볼 것.
- 클라이언트 쪽 응답 대기 상한(Promise.race)은 잠금만 풀 뿐, 요청은 나중에 그대로 실행된다.

## 실패를 만들려면

요청 자체를 끊는다.

```ts
await page.route('**/account/email-templates', (r) =>
  r.request().method() === 'POST' ? r.abort('internetdisconnected') : r.continue()
);
```

브라우저에서 직접 fetch 하는 요청(파일 업로드 등)은 `setOffline` 으로도 곧바로 실패한다 — 같은 화면 안에서도 갈린다.
