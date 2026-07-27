# OpenAPI `format: date`는 TS 타입에 안 실린다 — 직렬화 불일치는 런타임 400으로만 드러난다

OpenAPI 스펙에서 날짜 파라미터는 `type: string` + `format: date`(`2026-01-01`) 또는 `format: date-time`(`2026-01-01T00:00:00Z`)으로 구분되지만, codegen이 만들어내는 TypeScript 타입은 **둘 다 그냥 `string`**이다. `format`은 JSON Schema의 annotation이라 타입 시스템으로 내려오지 않는다.

## 왜 위험한가

같은 "기간 필터"라도 API마다 계약이 다를 수 있다:

- A 화면의 API — `from`/`to`가 `date-time` → 사용자의 "하루" 경계를 로컬 타임존 기준으로 UTC datetime으로 환산해 보내는 게 **맞다** (KST 7월 27일 ≠ UTC 7월 27일)
- B 화면의 API — `from`/`to`가 `date` → 날짜 문자열을 **그대로** 보내야 하고, 하루 경계 시맨틱은 서버 소관

A 화면의 파라미터 빌더를 B 화면에 미러하면, datetime 문자열이 `LocalDate` 바인딩(Spring 등)에 꽂혀 400으로 거부된다. 이때 타입은 `string → string`이라 **tsc·리뷰 모두 통과**하고, 그 필터를 실제로 눌러보기 전까지는 아무도 모른다.

## 교훈

1. **파라미터 배선·미러 시 계약 문서의 `format`을 직접 대조한다** — 타입이 맞다는 것은 직렬화가 맞다는 뜻이 아니다.
2. 이 클래스는 정적 검사로 못 잡으므로 **실 서버를 때리는 테스트(e2e)가 유일한 자동 검출망**이다 — 실제로 e2e가 해당 필터를 처음 "눌러보면서" 발견됐다.
3. codegen이 branded type(`string & { __format: 'date' }`)을 지원하지 않는 한, 날짜 파라미터는 변환 함수 이름에 형식을 드러내는 것(`toDateParam` vs `toUtcDateTime`)이 실수 방지에 도움이 된다.
