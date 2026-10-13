# 리버스 프록시 뒤의 앱이 보는 「요청 주소」는 공개 주소가 아니다

브라우저 → 리버스 프록시(로드밸런서·nginx 등) → 컨테이너 안 앱 구조에서, 앱이 받는 요청의 호스트·스킴은 **프록시가 앱에 다시 보낸 요청 기준**이다. 앱이 그 값으로 절대 URL(리다이렉트·콜백·링크)을 만들면 브라우저가 갈 수 없는 주소가 나온다.

## 겪은 증상

- 배포 환경에서만 로그아웃 뒤 브라우저가 `https://0.0.0.0:3000/auth/signin` 으로 이동했다. 로컬은 정상이었다
- `0.0.0.0:3000` 은 컨테이너 안에서 서버가 **바인딩한 주소**다. 공개 도메인이 아니다
- 스킴은 `https` 로 맞게 나오는데 호스트·포트만 내부 값이었다 — 그래서 「프록시가 https 를 안 넘긴다」 같은 설정 문제로 먼저 의심하게 된다

## 헷갈렸던 지점 — 같은 앱 안에서도 「일부 경로만」 깨진다

Next.js(16, standalone 배포)에서 관측한 것:

- 미들웨어의 리다이렉트는 공개 주소로 정상 이동했다
- route handler 에서 `request.nextUrl` 로 만든 리다이렉트만 바인딩 주소로 갔다

리다이렉트 일반이 깨진 게 아니어서, 「리다이렉트 하는 곳 전부」 가 아니라 **요청 객체의 URL 을 그대로 쓰는 자리**로 범위를 좁힐 수 있었다. 같은 프레임워크 안에서도 요청 URL 을 만드는 경로가 달라 결과가 갈린다 — 버전마다 다를 수 있으니 「프레임워크가 알아서 해 준다」 고 가정하지 않는 편이 안전하다.

## 대응 — 공개 origin 을 헤더로 만든다

프록시는 원래 요청 정보를 `X-Forwarded-Host`·`X-Forwarded-Proto`(또는 표준 `Forwarded`)로 넘긴다. 절대 URL 이 필요한 자리는 이 값으로 origin 을 만드는 헬퍼 하나를 공유한다.

```ts
export function publicOrigin(request: Request): string {
  const headers = request.headers;
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  const proto = headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '');
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

// return NextResponse.redirect(new URL('/auth/signin', publicOrigin(request)), 303);
```

- `X-Forwarded-*` 는 **우리 프록시가 덮어써서 넣을 때만** 믿을 수 있다. 프록시가 클라이언트가 보낸 값을 그대로 통과시키면 호스트 헤더 위조로 리다이렉트를 남의 도메인으로 보낼 수 있다 — 프록시 설정에서 덮어쓰기를 확인한다
- 공개 주소가 고정이면 헤더 대신 환경변수(`SITE_URL` 등)로 두는 것도 방법이다. 다만 프리뷰·여러 도메인 배포에서는 헤더 쪽이 맞다
- 상대 경로 리다이렉트(`Location: /auth/signin`)를 쓸 수 있는 자리면 origin 자체가 필요 없다

## 덤 — 같은 자리에서 405 도 함께 났다

서버 쪽 로그아웃 처리가 `fetch` 로 그 경로를 `POST` 로 부르는데 핸들러는 `GET` 만 받아 405 가 났다. 리다이렉트로 이어지는 엔드포인트는 호출 방식(GET 링크 · POST 폼·fetch)을 모두 받는지, POST 뒤 리다이렉트는 `303` 으로 GET 전환되는지 같이 확인한다.
