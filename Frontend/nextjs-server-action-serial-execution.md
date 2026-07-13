# Next.js Server Action은 직렬 실행된다

같은 클라이언트에서 발생한 Server Action 호출들은 **동시에 실행되지 않고 큐에 쌓여 순차 실행**된다. (mutation 순서 보장을 위한 Next.js의 의도된 설계)

## 왜 문제가 되나

Server Action을 TanStack Query의 `queryFn`으로 쓰는 구조에서 체감했다:

- 검색 input이 타이핑마다 queryKey를 바꿔 fetch를 발사하면, 글자 수만큼의 Server Action이 **직렬 큐**에 줄을 선다
- 요청당 백엔드 왕복이 300ms라면, 5글자 타이핑 = 마지막 결과가 최대 1.5초 뒤에 도착
- 병렬 HTTP였다면 마지막 요청만 기다리면 됐을 지연이, 직렬화 때문에 누적된다

같은 이유로 **여러 쿼리를 한꺼번에 prefetch하는 것도 위험** — 뒤에 오는 사용자 액션(저장 등)이 prefetch 뒤로 밀린다.

## 대응

- 타이핑마다 fetch하는 자동 검색 대신 **명시 실행(Enter/버튼) 또는 debounce**
- hover-intent prefetch처럼 **한 번에 1건만** 미리 당기기
- 다건 병렬 조회가 필요한 화면이면 queryFn을 Server Action 대신 Route Handler로 빼는 것도 선택지

## 확인 방법

Network 탭에서 같은 엔드포인트(`POST /`)의 Server Action 요청들이 워터폴로 순차 시작되는 것으로 확인 가능.
