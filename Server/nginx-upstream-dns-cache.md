# nginx가 컨테이너 IP를 캐시해서 배포 후 502

도커 컴포즈 환경에서 nginx가 앱 컨테이너로 프록시할 때, **앱은 정상인데 전 경로가 502**가 되는 경우가 있다. 원인은 nginx의 DNS 해석 시점이다.

## 왜 생기나

```nginx
location / {
    proxy_pass http://gateway:8090;   # 호스트명이 리터럴
}
```

`proxy_pass`의 주소가 **리터럴 호스트명**이면 nginx는 그것을 **설정 로드 시점에 딱 한 번** 해석하고, 그 IP를 워커 프로세스가 물고 간다. 이후 DNS가 뭐라고 답하든 다시 묻지 않는다 — reload 전까지 영원히.

도커 컨테이너 IP는 **재생성될 때 바뀔 수 있다.** 배포로 앱 컨테이너를 새 이미지로 갈아끼우면 nginx는 그대로 살아있는 채 옛 IP를 두드린다.

```
connect() failed (111: Connection refused) while connecting to upstream,
upstream: "http://172.20.0.2:8090/"
```

## 왜 평소엔 안 터지나

앱 컨테이너만 재생성하면 옛 컨테이너가 지워지며 IP가 풀에 반납되고, 새 컨테이너가 **대개 그 IP를 그대로 다시 받는다.** 그래서 배포를 아무리 해도 멀쩡하다.

터지는 건 IP가 실제로 **손바뀌었을 때**다. 전형적으로 호스트 재부팅 — 컨테이너들이 기동 순서대로 IP를 새로 배분받으면서 자리가 섞인다. 그 뒤 배포가 겹치면 어긋난 채로 고정된다.

옛 IP를 **다른 컨테이너가 차지한 경우**가 특히 헷갈린다. 그 컨테이너는 살아있지만 다른 포트를 듣고 있어서, 결과는 똑같이 `Connection refused`다.

## 진단

nginx 컨테이너 **안에서** 이름을 다시 해석해보면 축이 갈린다.

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <앱컨테이너>
docker exec <nginx> getent hosts <앱컨테이너명>
docker logs <nginx> 2>&1 | grep "connect() failed"
```

- `getent`는 새 IP를 정상 반환하는데 error.log의 upstream만 옛 IP → **DNS는 멀쩡, nginx 워커의 캐시 문제 확정**
- `getent`도 실패 → 네트워크·이름 문제(다른 원인)

기동 시각도 근거가 된다. `docker ps`의 `Up N hours`에서 **nginx가 앱보다 먼저 떠 있으면** 성립 조건이 갖춰진 것이다.

## 즉시 복구

```bash
docker exec <nginx> nginx -s reload
```

무중단이고, 설정 검증에 실패하면 기존 프로세스가 그대로 유지된다.

`docker restart`는 주의해야 한다. 리터럴 호스트명은 **nginx 기동 시 해석에 성공해야** 뜨기 때문에, 앱 컨테이너가 없는 상태에서 nginx를 재시작하면 `host not found in upstream`으로 기동 자체가 실패한다. 502보다 나쁜 상태(연결 거부)가 된다.

## 근본 수정

도커 내장 DNS(`127.0.0.11`)를 매 요청 태운다. **`proxy_pass`에 변수를 쓰는 게 핵심** — 변수가 있어야 런타임에 재해석한다.

```nginx
resolver 127.0.0.11 valid=10s;
set $gw http://gateway:8090;
proxy_pass $gw;
```

주의: 변수형 `proxy_pass`는 URI 처리 방식이 달라진다. 경로를 다시 쓰는 설정이 있으면 `rewrite`를 함께 봐야 한다.

차선책은 배포 스크립트 말미에 `nginx -s reload`를 한 줄 넣는 것. 증상만 막지만 비용이 거의 없다.

## 곁가지 — `--wait`가 이걸 못 잡는 이유

```bash
docker compose up -d --wait --wait-timeout 180 gateway
```

compose는 **healthcheck가 정의되지 않은 서비스를 `running = ready`로 판정한다.** 그래서 `--wait`이 통과해도 "컨테이너가 떴다"까지만 보증한다. 앱이 부팅에 실패하든, 밖에서 아예 도달이 안 되든 배포는 초록으로 끝난다.

서비스마다 healthcheck를 정의해두면 이 층이 게이트가 된다. actuator가 없어도 인증 불필요한 아무 경로로 대체 가능하다.

```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:8090/v3/api-docs"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 30s
```

## 정리

- 리터럴 호스트명 `proxy_pass` = 시작 시 1회 해석 후 고착
- 컨테이너 IP가 손바뀌는 순간(주로 호스트 재부팅 + 배포)이 곧 장애
- `getent` vs error.log upstream 비교로 즉시 확정
- 복구는 `nginx -s reload`, 수정은 `resolver` + 변수 `proxy_pass`
- healthcheck 없는 서비스는 배포 게이트가 전면 중단을 초록으로 통과시킨다
