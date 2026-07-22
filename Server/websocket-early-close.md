# 브라우저 WebSocket 조기 종료 두 가지 원인

브라우저 WebSocket이 예상보다 빨리 끊길 때, 클라이언트 코드가 아니라 서버·인프라 설정이 원인인 경우가 많다. 대표적으로 두 가지다.

## 1. 서버 same-origin 정책 → close 1002
- Spring WebSocket 등은 허용 Origin을 제한한다 (`setAllowedOrigins`)
- 브라우저는 WS 연결 시 `Origin` 헤더를 자동으로 붙이는데, 서버 허용 목록에 없으면 핸드셰이크 직후 **1002 (protocol error)** 로 종료
- 증상: 연결이 열리자마자 1002
- 확인: 서버 allowed origins 에 프론트 배포 도메인이 있는지

## 2. 리버스 프록시 idle timeout → close 1006
- nginx `proxy_read_timeout` (기본 60초): 업스트림 무통신 허용 시간
- WebSocket은 장수명 연결이라 서버→클라이언트 메시지가 없으면(idle) 프록시가 연결을 끊음 → **1006 (abnormal closure)**
- 증상: 정확히 60초(또는 설정값)마다 1006
- 해결: WS 경로의 `proxy_read_timeout` 을 크게(예: 1800s) 두거나, 서버가 주기적으로 ping 을 보내 idle 을 방지

## 원인 격리 팁
브라우저는 `Origin` 헤더를 임의로 바꿀 수 없지만, Node.js `ws` 클라이언트는 헤더를 직접 지정할 수 있다.

```js
const ws = new WebSocket(url, { headers: { Origin: 'https://app.example.com' } });
```

- Origin 헤더를 붙였을 때만 1002 → same-origin(1번) 문제
- 연결은 되는데 60초 후 1006 → idle timeout(2번) 문제

이렇게 두 원인을 분리해 서버·인프라 중 어디를 고쳐야 하는지 특정할 수 있다.
