# SSRF 방어에서 호스트 검사만으로는 부족하다 — 연결 시점에 해석된 IP를 검사하기 (Node)

사용자가 넘긴 URL을 서버가 대신 받아오는 기능(이미지 프록시, 웹훅 미리보기 등)은 내부망 주소를 거르는 검사를 둔다. 흔한 구현은 URL의 호스트가 `127.0.0.1`·`10.x`·`169.254.x` 같은 사설 IP인지 보는 것인데, **도메인 이름은 이 검사를 그대로 통과한다.**

## 우회 방법

- `127.0.0.1.nip.io` 처럼 **DNS가 내부 IP로 풀리는 이름**을 넣는다. 호스트 문자열은 공개 도메인이라 검사를 통과하고, 실제 연결은 `127.0.0.1` 로 간다.
- **DNS rebinding**: 검사할 때는 공개 IP, 연결할 때는 내부 IP를 돌려주는 짧은 TTL 도메인을 쓴다.

## 흔한 보완책과 그 한계

| 방법 | 한계 |
| --- | --- |
| 호스트 문자열 검사 | 도메인 이름은 전부 통과 |
| `dns.lookup()` 으로 먼저 해석해 검사 → 그다음 `fetch(url)` | 검사와 연결이 **각자 DNS를 해석**한다. 그 사이에 응답이 바뀌면(rebinding) 검사한 IP와 연결한 IP가 다르다 |
| 해석한 IP로 URL을 바꿔 요청 | HTTPS 인증서 검증·SNI·`Host` 헤더를 따로 맞춰야 해 번거롭다 |

`fetch`(Node 내장, undici 기반)에는 DNS 해석 결과를 끼워 넣을 자리가 없다. undici 의 `Agent({ connect: { lookup } })` 를 쓰려면 `undici` 패키지를 별도 의존성으로 들여야 한다.

## 해결: `http(s).request` 의 `lookup` 옵션

Node 표준 `http.request` / `https.request` 는 `lookup` 옵션을 받는다. 소켓이 연결 직전에 이 함수로 이름을 해석하고, **여기서 돌려준 주소로 그대로 연결**한다. 검사와 연결이 같은 해석 결과를 쓰므로 rebinding 틈이 없다.

```ts
import { lookup } from 'node:dns';
import type { LookupFunction } from 'node:net';

export const safeLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, '');
    // 하나라도 내부망이면 거부 — 여러 A/AAAA 중 하나만 내부여도 연결될 수 있다
    if (addresses.some(({ address }) => isPrivateIp(address))) {
      return callback(Object.assign(new Error(`private address: ${hostname}`), { code: 'EPRIVATE' }), '');
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

https.request(url, { lookup: safeLookup, signal }, onResponse);
```

## 실측으로 확인한 함정

- **`options.all` 이 `true` 로도 들어온다.** Node 20+ 는 `autoSelectFamily`(Happy Eyeballs)가 기본으로 켜져 있어 `lookup` 을 `{ all: true }` 로 부른다. 단일 주소만 돌려주는 구현은 이 경로에서 깨지니 두 형태를 모두 처리해야 한다.
- **IP 리터럴은 `lookup` 을 거치지 않는다.** `http://10.0.0.1/` 처럼 IP를 직접 쓰면 해석 단계가 없으므로, 호스트 문자열 검사는 그대로 남겨 둬야 한다(두 검사는 대체가 아니라 보완 관계).
- **리다이렉트는 직접 따라가며 홉마다 다시 검사한다.** `http.request` 는 리다이렉트를 따라가지 않는다. 버리는 3xx 응답의 본문은 소비하거나 취소해야 소켓이 남지 않는다.
- **응답을 웹 `Response` 로 감싸면 상태 코드에 따라 생성자가 던진다.** 204·205·304 처럼 본문이 없어야 하는 상태에 스트림 본문을 넘기거나 200~599 밖의 상태가 오면 `new Response()` 가 예외를 던진다. 이게 응답 콜백 안이라 Promise 로 잡히지 않고 미처리 예외가 되므로, 생성을 `try` 로 감싸 `reject` 해야 한다.
- **포트도 제한한다.** 공개 호스트라도 임의 포트를 허용하면 응답 상태 차이로 포트를 탐색할 수 있다. 이미지 프록시라면 기본 포트·80·443 만 받으면 충분하다.

## 검증 방법

외부 의존 없이 확인할 수 있다.

```ts
// localhost 는 시스템 리졸버가 로컬로 풀어 준다 — 이름이 내부 IP로 풀리는 경우를 재현
safeLookup('localhost', { all: false }, (err) => assert(err?.code === 'EPRIVATE'));
// IP 문자열은 dns.lookup 이 네트워크 없이 그대로 돌려준다
safeLookup('8.8.8.8', { all: true }, (err, addrs) => assert.deepEqual(addrs, [{ address: '8.8.8.8', family: 4 }]));
```

실제 네트워크에서는 `http://127.0.0.1.nip.io/` 가 `EPRIVATE` 로 막히는지 보면 된다.
