# Data format

## toLocalString('en-US')
천의 자리마다 컴마 찍고 싶을 때 사용
```js
//key가 sal로 시작하면 천의자리마다 찍기
{key.startsWith('sal')
  ? value.toLocaleString('en-US')
  : value}
```

## String to Number
str *1 
## Intl.DateTimeFormat 은 옵션을 그대로 지키지 않는다

`month: '2-digit'` 을 줘도 로케일에 따라 한 자리로 나온다.

```js
const d = new Date('2026-08-21');
const f = (loc) => new Intl.DateTimeFormat(loc, { year: 'numeric', month: '2-digit' }).format(d);

f('ko-KR'); // "2026. 8."   ← 08 아님
f('zh-CN'); // "2026年8月"   ← 08 아님
f('en-US'); // "08/2026"
f('ja-JP'); // "2026/08"
f('de-DE'); // "08.2026"
```

더 헷갈리는 건, **같이 요청한 다른 필드에 따라 결과가 뒤집힌다**는 것.

```js
// ko-KR 인데 day 를 더하면 패딩이 돌아온다
new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit' }).format(d);
// "2026. 8."

new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
// "2026. 08. 21."
```

이유는 Intl 이 내가 준 옵션을 글자 그대로 적용하는 게 아니라, **옵션을 스켈레톤으로 보고 그 로케일에 있는 가장 가까운 날짜 패턴을 골라오기** 때문. 그 조합의 패턴이 로케일에 없으면 근사치가 오고 요청한 옵션이 조용히 떨어진다.

그래서 자리수가 중요하면 (`2026.08` 같은 고정 표기) 포맷터를 믿지 말고 직접 채워야 한다.

```js
const parts = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
}).formatToParts(d);

const year = parts.find((p) => p.type === 'year').value;
const month = parts.find((p) => p.type === 'month').value.padStart(2, '0'); // ← 직접
`${year}.${month}`; // "2026.08"
```

같은 함정이 `weekday`·`hour`·`hour12` 등 다른 옵션에도 있다. 표시 형식이 계약이면 테스트로 고정해 두는 게 안전하다 (1~9월에만 틀리는 식이라 실행 시점에 따라 안 걸릴 수 있음).
