# tiptap 편집기의 함정 두 가지 — 손대지 않은 폼이 dirty가 되고, 이미지 크기는 속성에 없다

tiptap 기반 리치 텍스트 편집기를 폼과 테스트에 붙이면서 같은 뿌리의 함정 두 개를 만났다. 둘 다 "편집기가 내가 준 값과 다른 모양으로 되돌려준다"는 데서 온다.

## 1. 아무것도 안 했는데 이탈 확인 모달이 뜬다

드로어를 열고 아무것도 입력하지 않은 채 [취소]를 눌렀는데 "저장하지 않은 변경이 있어요" 모달이 뜬다. 폼 필드 중 하나가 리치 텍스트 메모 칸이다.

### 왜 걸리나

react-hook-form 의 `isDirty` 는 현재 값과 `defaultValues` 를 비교한다. 메모 칸의 기본값은 `''` 이다.

그런데 tiptap 은 **마운트할 때 빈 문서를 `<p></p>` 로 직렬화해서 `onChange` 를 한 번 부른다.** 이 값을 `Controller` 의 `field.onChange` 에 그대로 흘리면 폼은 `'' → '<p></p>'` 변경으로 본다. 사용자는 한 글자도 안 쳤는데 `dirtyFields: { memo: true }` 가 된다.

같은 계열로, 서버에 저장된 HTML 이 블록 태그 사이에 줄바꿈을 품고 있으면(`</p>\n<p>`) 편집기가 그걸 `</p><p>` 로 다시 직렬화해 돌려준다. 저장본을 불러와 열기만 해도 "변경됨"이 된다.

원인을 추측하지 말고 렌더마다 폼 상태를 찍으면 바로 보인다.

```ts
// 테스트용 프로브 — 렌더마다 기록
log.push(`dirty=${formState.isDirty} fields=${JSON.stringify(formState.dirtyFields)} memo=${JSON.stringify(watch('memo'))}`);
// dirty=false fields={} memo=""
// dirty=true  fields={"memo":true} memo="<p></p>"   ← 마운트 직후
```

### 대응

"편집기를 거쳤을 뿐 사용자가 고치지 않은 문서"를 같은 값으로 보는 정규화 비교를 만들고, 같으면 폼 값을 건드리지 않는다.

```ts
function canonicalRichText(html: string): string {
  // 줄바꿈이 낀 태그 사이 공백은 화면에 나오지 않는다 — 걷는다
  const collapsed = html.replace(/>[ \t]*\r?\n\s*</g, '><').trim();
  // 빈 문단만 남은 문서는 빈 값과 같다
  return collapsed.replace(/<p>\s*<\/p>/g, '') === '' ? '' : collapsed;
}

export function sameRichText(a: string, b: string): boolean {
  return canonicalRichText(a) === canonicalRichText(b);
}
```

```tsx
<Controller
  control={control}
  name="memo"
  render={({ field }) => (
    <Editor
      value={field.value ?? ''}
      onChange={(next) => {
        if (!sameRichText(next, field.value ?? '')) field.onChange(next);
      }}
    />
  )}
/>
```

줄바꿈 없는 공백(`</b> <i>`)은 글자 사이 띄어쓰기라 남겨야 한다. 무조건 공백을 지우면 실제 편집을 놓친다.

비교를 폼마다 따로 쓰지 말고 **편집기를 감싼 필드 컴포넌트 한 곳**에 두면, 그 필드를 쓰는 모든 폼(생성·수정·인라인 추가)이 한 번에 고쳐진다.

## 2. 이미지 크기를 `width` 속성으로 단언했더니 null

이미지 크기 조정 핸들을 e2e 로 검증하려고 삽입한 `<img>` 의 `width` 를 읽었다.

```ts
await expect(image).toHaveAttribute('width', '200'); // received: null
```

### 왜 걸리나

tiptap 의 `ResizableNodeView` 는 크기를 `width`·`height` **HTML 속성이 아니라 인라인 style 로 그린다.** 저장되는 HTML(`getHTML()`)에는 속성으로 나가더라도 편집 중인 DOM 은 모양이 다르다. 편집 화면과 저장 결과를 같은 셀렉터로 읽으면 한쪽에서 빗나간다.

### 대응

편집 화면에서는 렌더된 박스로 읽는다.

```ts
async function size(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('이미지가 렌더되지 않았다');
  return { width: Math.round(box.width), height: Math.round(box.height) };
}

const before = await size(image);
// 핸들 드래그 …
const after = await size(image);
expect(after.width / after.height).toBeCloseTo(before.width / before.height, 1); // 비율 유지
```

저장값 검증은 따로 한다 — 저장 API 응답의 HTML 에서 `<img>` 의 `width`/`height` 속성을 읽는다. **편집 DOM 은 박스로, 저장본은 속성으로** 축을 나누면 둘 다 안정적이다.

## 정리

- 리치 편집기는 입력값을 그대로 돌려주지 않는다. 빈 값·줄바꿈이 직렬화 과정에서 바뀐다.
- 폼에 연결할 때는 정규화 동등 비교로 "사용자가 바꾼 것"만 통과시킨다.
- 편집 중 DOM 과 저장된 HTML 은 표현이 다를 수 있다. 테스트는 각자 맞는 축(렌더 박스 / 저장 속성)으로 읽는다.
