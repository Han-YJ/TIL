# pdf.js 글자 층 — TextLayer 만 쓰면 반쪽이고, UserUnit 이 크기를 어긋낸다

PDF 를 캔버스로 그리는 미리보기에 "글자를 골라 복사" 를 붙였다. pdf.js 의 `TextLayer` 로 투명한 글자 span 을 캔버스 위에 겹치면 된다고 생각했는데, 두 군데서 걸렸다.

## 1. `TextLayer` 는 글자만 놓는다 — 선택 보정은 뷰어 쪽에 있다

`pdfjs-dist` 코어의 `TextLayer` 는 span 배치까지만 한다. 여러 줄을 끌어 고를 때 선택이 페이지 끝까지 튀지 않게 하는 장치는 뷰어 모듈(`web/pdf_viewer.mjs`)의 `TextLayerBuilder` 에 있다.

- 층 끝에 `.endOfContent` 블록을 두고, 누르는 동안(`selecting`) 층 전체로 편다
- Firefox · Chromium 148 이상이 아니면(Safari 포함) `selectionchange` 마다 그 블록을 선택 끝 글자 옆으로 옮긴다
- `pointerup` · `keyup` · `blur` 에서 원래대로 돌린다
- 복사할 때 NUL 문자를 지우고 유니코드를 정규화한다

처음엔 이걸 손으로 옮겼는데, 브라우저 분기 하나가 빠진 채 Chromium 에서만 확인하고 넘어갈 뻔했다. `TextLayerBuilder` 를 그대로 쓰면 이 동작이 pdfjs-dist 갱신을 따라온다.

뷰어 모듈은 import 시점에 전역 `pdfjsLib` 을 읽는다. 코어를 먼저 불러 전역에 넣은 뒤 동적 import 해야 한다.

```ts
const pdfjs = await import('pdfjs-dist');
globalThis.pdfjsLib ??= pdfjs;
const { TextLayerBuilder } = await import('pdfjs-dist/web/pdf_viewer.mjs');
```

덤으로, 같은 빌더에 `render({ viewport })` 를 다시 부르면 첫 렌더가 끝난 뒤에는 `TextLayer.update` 로 재배치만 한다. 확대할 때마다 글자를 다시 받지 않고, 사용자의 선택도 풀리지 않는다.

빌더는 생성자에서 층 div 에 `tabIndex = 0` 을 준다. 모달 안 미리보기라면 이름 없는 Tab 정지가 하나 생기니 `onAppend` 에서 `-1` 로 바꿀지 정해야 한다.

## 2. `viewport.scale` 에는 UserUnit 이 없다

글자 층 크기는 CSS 변수 `--total-scale-factor × 페이지 원래 크기` 로 잡힌다. 여기에 `viewport.scale` 을 넣었더니, `/UserUnit 2` 인 PDF 에서 글자 층이 캔버스의 절반 크기로 그려졌다.

```js
// pdfjs-dist PageViewport
this.scale = scale;   // UserUnit 이 빠진 값
scale *= userUnit;    // width · transform 은 이 값으로 계산
```

캔버스는 `viewport.width` 로 크기를 잡으니 UserUnit 이 들어가고, 글자 층은 빠진다. 대형 도면 PDF 가 주로 UserUnit 을 쓴다. 맞추려면 이렇게 넣는다.

```ts
pageBox.style.setProperty('--total-scale-factor', String(viewport.scale * viewport.userUnit));
```

확인은 `/UserUnit 2` 를 넣은 한 쪽짜리 PDF 를 직접 만들어 층과 캔버스의 `getBoundingClientRect()` 를 비교하는 것으로 했다.

## 정리

- 글자 선택을 붙이려면 `TextLayer` 가 아니라 `TextLayerBuilder` 단위로 가져온다 (전역 `pdfjsLib` 먼저)
- 글자 층 배율 = `viewport.scale * viewport.userUnit`
