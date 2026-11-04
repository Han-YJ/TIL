# Playwright `filter({ has })` — 안쪽 locator 는 걸러지는 요소 기준

## 요점
- `locator.filter({ has: inner })` 의 `inner` 는 **걸러지는 각 요소 안에서** 다시 조회됨 (공식 문서: "Inner locator is queried against the outer one")
- `inner` 의 셀렉터 체인 전체가 그 요소 안에서 성립해야 함 — 바깥 컨테이너에서 시작한 locator 를 넘기면 0건
- 시작점은 `page` 로 두는 것이 안전함 — `page.getByText(...)` 를 넘기면 「이 요소 안에 그 글자가 있는가」 로 읽힘

## 예
```ts
const picker = page.getByRole('listbox');

// ✗ 0건 — option 안에서 「listbox 안의 글자」 를 찾게 됨
picker.getByRole('option').filter({ has: picker.getByText('한빛철강', { exact: true }) });

// ○ option 안에서 그 글자를 찾음
picker.getByRole('option').filter({ has: picker.page().getByText('한빛철강', { exact: true }) });
```

## 이런 때 필요함
- option · row 의 접근 이름(accessible name)이 보조 글자까지 합쳐져 `getByRole('option', { name, exact: true })` 가 안 맞을 때
  - 예: 회사명 옆에 「발주 이력」 같은 보조 글자 → 접근 이름 「한빛철강 발주 이력」
- 행 안의 특정 글자 · 요소로 행을 고를 때 (`exact: true` 로 부분 일치 방지)

## 비슷한 것
- `filter({ hasText })` — 문자열 · 정규식으로 글자 포함 여부만 봄. 부분 일치라 「한빛」 이 「한빛철강」 도 잡음
- `filter({ hasNot })` — `has` 의 반대, 같은 기준(걸러지는 요소 안) 으로 조회됨
- 안쪽 · 바깥 locator 는 같은 frame 이어야 함
