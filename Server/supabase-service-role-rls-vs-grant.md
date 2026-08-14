# service_role인데 permission denied — RLS 우회와 테이블 GRANT는 별개다

Supabase의 `service_role` 키는 흔히 "전권"으로 이해되지만, 실제로 우회하는 것은 **RLS(Row Level Security)뿐**이다. 테이블 자체에 대한 **GRANT(SELECT·INSERT…)는 별도 권한 계층**이고, 그게 없으면 service_role로도 못 읽는다.

## 증상 패턴

- service_role 키로 만든 클라이언트인데 조회가 `permission denied for table <이름>`으로 실패
- 같은 키로 다른 테이블은 잘 읽힘
- 대시보드에서 만든 테이블은 되는데, 외부 마이그레이션 도구(Flyway·Liquibase·Prisma 등)로 만든 테이블만 안 됨

## 두 에러 코드로 원인을 즉시 가른다

PostgREST가 내려주는 코드가 다르므로 추측할 필요가 없다.

| 코드 | 의미 | 해석 |
| --- | --- | --- |
| `42501` | insufficient_privilege | **테이블은 있는데 GRANT가 없다** |
| `PGRST205` | Could not find the table in the schema cache | **그 스키마에 테이블이 없다** (오타·미노출 스키마) |

`42501`이면 "이름을 잘못 썼나" 의심할 필요가 없고, `PGRST205`면 권한을 뒤질 필요가 없다.

```js
const { error } = await admin.from('some_table').select('*').limit(1)
// error.code === '42501'    → 권한 문제
// error.code === 'PGRST205' → 테이블/스키마 문제
```

여러 테이블을 한 번에 찔러 보면 더 빨리 갈린다 — 존재하지 않는 이름 하나를 대조군으로 섞으면 `PGRST205`가 나와야 정상이고, 실제 테이블들이 `42501`이면 권한 문제로 확정된다.

## 왜 이런 차이가 생기나

Supabase 대시보드·마이그레이션으로 만든 테이블은 `anon`·`authenticated`·`service_role` 롤에 기본 GRANT가 붙는다. 반면 애플리케이션이 자기 마이그레이션 도구로 직접 만든 테이블은 **그 도구가 쓰는 롤이 소유자**가 되고, Supabase 롤에는 아무 권한도 부여되지 않는다. 스키마는 같은 `public`이라 PostgREST의 schema cache에는 잡히므로(그래서 `PGRST205`가 아니다) "보이는데 못 읽는" 상태가 된다.

## 교훈

- **RLS 우회 ≠ 만능 키.** service_role은 정책(policy)을 건너뛸 뿐, 롤에 없는 권한을 만들어내지 않는다
- 한 DB를 Supabase와 별도 백엔드가 함께 쓰는 구성이면 **테이블 소유권이 갈린다는 사실**을 전제로 설계할 것
- 필요하면 해당 롤에 명시적으로 부여한다 — 다만 운영에서 넓은 GRANT는 신중히
  ```sql
  GRANT SELECT ON TABLE some_table TO service_role;
  ```
- 에러 코드는 추측을 줄이는 가장 싼 도구다. 메시지만 읽지 말고 `code`를 볼 것
