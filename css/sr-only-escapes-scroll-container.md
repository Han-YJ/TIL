# sr-only 요소가 스크롤 컨테이너를 벗어나 페이지 전체 스크롤을 만든다

## 문제 상황

화면을 꽉 채우는 레이아웃(`h-screen` 안에 `overflow-y: auto` 패널)인데, 목록 항목이 많아지면 패널 안 스크롤과 별도로 **페이지 전체에도 스크롤이 생기고** 아래쪽에 빈 흰 영역이 보였습니다.

```tsx
<nav className="min-h-0 flex-1 overflow-y-auto">
  {items.map((item) => (
    <button key={item.id}>
      {item.label}
      <span className="sr-only">{item.description}</span>
    </button>
  ))}
</nav>
```

## 원인

`sr-only`(Tailwind 기준)는 화면에서 숨기기 위해 `position: absolute` 를 씁니다.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

absolute 요소는 **가장 가까운 positioned 조상**(`position` 이 `static` 이 아닌 조상)을 기준(containing block)으로 놓입니다.

- 스크롤 컨테이너(`overflow-y: auto`)가 `position: static` 이면 그 요소의 기준이 아닙니다.
- 기준은 더 위의 positioned 조상, 없으면 초기 containing block(문서)이 됩니다.
- `overflow` 는 **자기 containing block 안의 자손만** 잘라냅니다. 그래서 기준이 바깥인 absolute 자손은 스크롤 컨테이너가 자르지도, 스크롤로 담지도 않습니다.
- 결과적으로 목록 아래쪽 항목의 sr-only 요소가 스크롤되기 전의 원래 위치(컨테이너 밖, 뷰포트 아래)에 놓여 **문서 높이를 늘리고**, 페이지 스크롤이 생깁니다.

1px 짜리 보이지 않는 요소라 개발자 도구로 찾기 전까지는 원인이 드러나지 않습니다.

## 해결 방법

스크롤 컨테이너를 positioned 로 만들어 absolute 자손의 기준이 되게 합니다.

```tsx
<nav className="relative min-h-0 flex-1 overflow-y-auto">
```

이제 sr-only 요소가 컨테이너 안에서 위치가 정해지고, 컨테이너가 잘라내므로 문서 높이에 영향을 주지 않습니다.

## 핵심 포인트

- `overflow: hidden/auto` 는 containing block 이 자기인 자손만 가둔다 — absolute 자손을 가두려면 컨테이너에 `position: relative`
- 접근성용 숨김 요소(`sr-only`, visually-hidden)도 absolute 라 같은 함정에 빠진다
- 「페이지에 원인 모를 스크롤 · 아래 빈 영역」이면 `document.documentElement.scrollHeight` 를 늘리는 absolute 요소부터 찾는다

## 참고

- [MDN — Layout and the containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)
- [MDN — overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
