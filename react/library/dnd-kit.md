# dnd-kit

`@dnd-kit/core` + `@dnd-kit/sortable` 정렬 목록에서 겪은 함정 모음.

## 목록

1. [sortable 의 id 는 배열 인덱스면 안 된다](#1-sortable-의-id-는-배열-인덱스면-안-된다)
2. [가변 크기 아이템은 CSS.Translate 를 써야 한다](#2-가변-크기-아이템은-csstranslate-를-써야-한다)

---

## 1. sortable 의 id 는 배열 인덱스면 안 된다

**증상** — 아이템을 끌어 놓으면 **원위치로 돌아가는 애니메이션**이 재생되는데, 실제 배열 순서는 정상적으로 바뀌어 있다. 에러도 경고도 없다.

```jsx
// ✗ 이렇게 하면 안 된다
<SortableContext items={items.map((_, i) => String(i))}>
  {items.map((item, i) => <Item key={i} id={String(i)} ... />)}
</SortableContext>
```

**원인** — 인덱스는 **위치에 붙은 이름**이다. 0번 아이템을 2번 자리로 옮겨도 `items` 배열의 0번째 요소는 여전히 id `"0"` 이다. dnd-kit 입장에서는 "id `0` 이 여전히 0번 슬롯에 있다" = 아무것도 안 움직였다. 그래서 드래그 노드를 원래 자리로 되돌리는 드롭 애니메이션을 재생한다. 그 사이 React 는 새 순서로 내용을 다시 그리니 **모션은 복귀, 내용은 변경**이라는 모순된 화면이 나온다.

**해법** — id 가 **아이템과 함께 이동하는 값**이어야 한다. 공식 예제도 값 자체를 id 로 쓴다.

```jsx
const [items, setItems] = useState([1, 2, 3]);   // 값 = id

<SortableContext items={items}>
  {items.map((id) => <Item key={id} id={id} />)}
</SortableContext>

function handleDragEnd({ active, over }) {
  if (active.id !== over.id) {
    setItems((items) =>
      arrayMove(items, items.indexOf(active.id), items.indexOf(over.id))
    );
  }
}
```

`arrayMove` 로 배열이 재배열되면 id 도 함께 따라간다. 데이터가 객체라면 **객체 자체에 안정 id 필드를 부여**한다. 서버 계약에 없는 필드라면 전송 직전에 벗기면 된다.

```ts
type DraftItem = ApiItem & { id: string };   // 뷰 모델
// 전송 시: items.map(({ id, ...rest }) => rest)
```

**우회하지 말 것** — 객체 참조 → id 를 `WeakMap` 으로 매핑해 렌더 중에 발급하는 방법이 떠오르는데, React 규칙 위반이라 `react-hooks/refs` 가 *"Cannot access refs during render"* 로 막는다. 식별자는 상태에 속한다.

## 2. 가변 크기 아이템은 CSS.Translate 를 써야 한다

**증상** — 폭(또는 높이)이 제각각인 아이템을 끌면, 드래그 중인 아이템이 **놓을 자리의 크기로 강제 변환**된다.

**원인** — `useSortable` 이 돌려주는 `transform` 에는 좌표뿐 아니라 배율이 들어 있다.

```ts
interface Transform extends Coordinates {
  z?: number;
  scaleX: number;   // ← 대상 슬롯 크기에 맞춘 배율
  scaleY: number;
}
```

`CSS.Transform.toString(transform)` 은 이 `scale` 까지 그대로 CSS 로 싣는다. 크기가 균일하면 배율이 1이라 티가 안 나고, 제각각이면 왜곡으로 드러난다.

**해법** — translate 성분만 적용한다.

```jsx
import { CSS } from '@dnd-kit/utilities';

// ✗ transform: CSS.Transform.toString(transform)
// ○
const style = { transform: CSS.Translate.toString(transform), transition };
```

**정렬 전략도 같이 확인** — `verticalListSortingStrategy` / `horizontalListSortingStrategy` 는 **아이템 크기가 균일한 한 줄 리스트** 전제로 오프셋을 계산한다. 폭이 제각각이거나 `flex-wrap` 으로 줄바꿈되는 레이아웃이면 실제 rect 를 재는 기본 전략을 쓴다.

```jsx
import { rectSortingStrategy } from '@dnd-kit/sortable';

<SortableContext items={ids} strategy={rectSortingStrategy}>
```

## 부록 — 방향키로 자리 옮기기

드래그 전용 UI 는 드래그를 수행하지 못하는 사용자를 배제한다(WCAG 2.2 SC 2.1.1). dnd-kit 의 `KeyboardSensor` 는 Space 로 드래그 모드에 진입한 뒤 방향키로 이동하는 모델인데, "handle 에 포커스를 두고 바로 좌우 방향키" 를 원하면 핸들에 `onKeyDown` 을 직접 달고 `PointerSensor` 만 등록하는 편이 단순하다. 이동 로직을 한 함수로 모아 드래그와 키보드가 같은 지점을 타게 하고, 결과는 `aria-live` 로 알린다(SC 4.1.3).

```jsx
const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

<button
  ref={setActivatorNodeRef}
  {...attributes}
  {...listeners}
  onKeyDown={(e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    move(index, index + (e.key === 'ArrowLeft' ? -1 : 1));
  }}
>
```
