# 서버에서 날짜를 포맷하면 컨테이너 타임존을 탄다

`Date#getFullYear()` · `getMonth()` · `getDate()` 는 **실행 프로세스의 타임존** 기준으로 값을 돌려준다. 브라우저에서는 그게 사용자 로컬이라 대개 의도와 맞지만, **서버에서 실행되면 컨테이너의 TZ** — 보통 UTC — 가 된다.

```js
// 서버에서만 실행되는 코드
function yearMonth(raw) {
  const d = new Date(raw);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}
```

`2026-02-01T00:30:00+09:00` 을 넣으면

- KST 머신 → `2026.02` (의도한 값)
- UTC 컨테이너 → 내부적으로 `2026-01-31T15:30Z` 이므로 **`2026.01`**

날짜가 하루, 월초·월말이면 한 달이 통째로 밀린다.

## 왜 늦게 발견되나

**로컬 개발에서는 재현이 안 된다.** 개발자 머신 TZ 가 서비스 TZ 와 같으면 정확히 동작하고, 배포된 컨테이너에서만 틀어진다. 게다가 값이 "완전히 깨지는" 게 아니라 **그럴듯하게 하나 밀린 값**이라 눈으로 훑어서는 안 잡힌다.

같은 값을 클라이언트에서도 그리는 화면이면 더 헷갈린다 — 클라 쪽은 브라우저 로컬이라 맞게 나오고 서버 산출물만 틀려서, 같은 날짜가 화면 두 곳에서 다르게 보인다.

## 대응

포맷할 때 타임존을 **명시**한다.

```js
const FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
});

function yearMonth(raw) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '-';   // 파싱 실패 시 NaN.NaN 방어
  const parts = FORMAT.formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  return `${year}.${month}`;
}
```

- 서버 TZ 를 환경변수(`TZ=Asia/Seoul`)로 맞추는 방법도 있지만, **코드가 배포 환경 설정에 의존하게 되므로** 포맷 지점에서 명시하는 쪽이 안전하다
- 반대 방향(로컬 달력일 → UTC Instant)도 같은 함정이 있다. `new Date('2026-02-01')` 은 UTC 자정으로 파싱되므로, 고정 오프셋을 붙여(`2026-02-01T00:00:00+09:00`) 명시적으로 만든다

## 어디를 봐야 하나

`import 'server-only'` 가 붙었거나 Server Component·Server Action·API 라우트에서만 도는 모듈에서 `getFullYear`/`getMonth`/`getDate`/`toLocaleDateString`(옵션 없이) 를 쓰고 있으면 전부 후보다.

```bash
grep -rn "getMonth()\|getFullYear()\|toLocaleDateString()" src/ | grep -v test
```
