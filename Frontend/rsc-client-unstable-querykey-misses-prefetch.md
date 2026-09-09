# 서버와 클라가 각자 계산한 값이 queryKey 에 들어가면 prefetch 가 조용히 빗나간다

RSC 에서 `prefetchQuery` 로 첫 페인트를 채우고 클라이언트가 같은 옵션 객체로 `useQuery` 를 거는 구조는 이제 흔하다. 이때 **queryKey 를 만드는 값이 양쪽에서 각각 계산되면** 하이드레이션이 조용히 미스난다.

에러가 아니다. 화면은 정상으로 보인다. 그냥 첫 페인트 직후 요청이 한 번 더 나갈 뿐이다.

## 어떻게 만났나

목록 화면의 기간 필터에 "최근 1년" 기본값을 넣었다. URL 이 비어 있으면 그 범위를 뜻하도록 했으니 조회도 그 값을 써야 한다 — 그래서 서버·클라 양쪽에서 같은 헬퍼를 불렀다.

```ts
// 양쪽에서 각각 호출됐다
function recentOneYearRange(today = todayInSeoul()) {
  const end = parseDay(today);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  return { from: formatDay(start), to: today };
}

// RSC
await queryClient.prefetchQuery(listQuery({ ...recentOneYearRange(), ...rest }));
// 클라이언트
const { data } = useQuery(listQuery({ ...recentOneYearRange(), ...rest }));
```

같은 함수, 같은 인자, 같은 결과 — **거의 항상.** 자정을 사이에 두고 두 번 재면 `to` 가 하루 갈린다. 키가 갈리면 클라이언트 입장에서는 캐시에 없는 키라 그대로 재요청한다.

## 왜 늦게 발견되나

1. **재현 창이 좁다.** 서버 렌더와 클라 하이드레이션 사이(수십~수백 ms)에 날짜 경계가 끼어야 한다. 로컬 개발 시간대에는 사실상 안 걸린다
2. **실패 모드가 "정상 동작"과 구별이 안 된다.** 데이터는 맞고 화면도 맞다. 요청이 한 번 더 나가는 것뿐이라 로그에도 안 남고, 그 요청은 200 이다
3. **타입·테스트가 전부 통과한다.** 두 값이 같은 타입이고, 테스트는 날짜를 고정해서 넣으니 갈릴 일이 없다

즉 이건 **없어지지 않고 계속 조금씩 손해를 보는 종류**다. 자정 트래픽이 적으면 영원히 안 보인다.

## 대상은 날짜만이 아니다

queryKey 가 **호출 시점·환경에 의존하는 값**을 담고 있으면 전부 같은 부류다.

- `Date.now()` · `new Date()` 기반 파생값 (오늘·이번 주·N일 전)
- `Math.random()` · `crypto.randomUUID()` 로 만든 캐시 버스터
- 로케일·타임존 의존 포맷 (`toLocaleDateString()` — 서버 컨테이너와 브라우저의 TZ 가 다르면 아예 매번 갈린다)
- 브라우저에만 있는 값 (`window.innerWidth` 기반 페이지 크기 등) — 서버에서는 폴백이 들어가므로 100% 갈린다

마지막 항목은 오히려 낫다. 항상 갈리니 개발 중에 바로 보인다. **가끔만 갈리는 값이 제일 나쁘다.**

## 대응 — 한 번만 재고 내려보낸다

계산을 한쪽으로 몰고, 반대쪽은 그 값을 받아서 쓰기만 한다.

```ts
// RSC — 여기서 한 번만 잰다
const defaultRange = recentOneYearRange();
await queryClient.prefetchQuery(listQuery({ ...defaultRange, ...rest }));
return <ListSection defaultRange={defaultRange} ... />;

// 클라이언트 — 재지 않고 받은 값을 폴백으로만 쓴다
function ListSection({ defaultRange }: { defaultRange: DateRange }) {
  const range = resolveRange(urlFrom, urlTo, defaultRange);
  const { data } = useQuery(listQuery({ ...range, ...rest }));
}
```

포인트는 `defaultRange` 가 **운영 데이터가 아니라 파라미터**라는 것이다. RSC 가 목록 데이터를 props 로 내려보내는 건 캐시 소유권을 깨지만, 조회 조건 하나를 내려보내는 건 그 반대다 — 양쪽이 같은 키를 쓰게 만든다.

## 점검 방법

새 쿼리를 붙일 때 queryKey 를 만드는 값마다 한 줄로 묻는다.

> **이 값을 지금 한 번, 300ms 뒤에 한 번 재면 반드시 같은가?**

"거의 항상 같다"는 아니오다. 아니오면 한쪽에서 재서 내려보낸다.

## 배운 것

캐시 키의 요건은 "올바른 값"이 아니라 **"양쪽에서 결정적으로 같은 값"**이다. 두 요건은 대개 겹치지만, 시간이 끼면 갈라진다 — 두 값 다 맞는데도 캐시가 안 맞는 상태가 성립한다.
