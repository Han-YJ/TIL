# RHF `watch()` 는 폼 루트 전체를 리렌더한다 — 표시 전용 구독은 `useWatch` 리프로 격리

react-hook-form 으로 "입력값을 헤더 제목에 실시간 반영" 같은 표시 전용 구독을 만들 때, `useForm()` 이 반환한 `watch()` 를 그 화면의 루트 컴포넌트에서 호출하면 **어느 필드든 한 글자 칠 때마다 루트 전체가 리렌더**된다. RHF 공식 문서가 명시하는 동작이다 — `watch` 는 폼 루트(또는 호출한 컴포넌트)를 리렌더하며, 성능 문제가 되면 `useWatch` 를 쓰라고 안내한다.

큰 컨테이너(드로어·모달·다탭 화면)의 루트에서 `watch('field')` 를 호출하면 헤더뿐 아니라 탭·모달·테이블까지 입력 키스트로크마다 함께 돈다.

## 격리 패턴

`useWatch` 는 **호출한 컴포넌트만** 구독자로 등록한다. 값을 실제로 그리는 지점(리프)으로 구독을 내리면 리렌더가 그 리프에 갇힌다.

```tsx
// ❌ 루트에서 watch — 타이핑마다 Drawer 전체 리렌더
function CreateDrawer() {
  const { control, watch } = useForm();
  return <Drawer.Header title={watch('name') || '새 항목'} ... />;
}

// ✅ 리프 컴포넌트로 격리 — 타이핑 리렌더가 이 컴포넌트에 갇힘
function WatchedTitle({ control }: { control: Control<FormInput> }) {
  const name = useWatch({ control, name: 'name' });
  return <>{name?.trim() || '새 항목'}</>;
}

function CreateDrawer() {
  const { control } = useForm();
  return <Drawer.Header title={<WatchedTitle control={control} />} ... />;
}
```

자식 컴포넌트에 통째로 내릴 수 있으면 `control` 만 prop 으로 넘기고 그 안에서 구독한다. 여러 필드는 배열형으로 한 번에:

```tsx
const [name, businessNumber] = useWatch({ control, name: ['name', 'businessNumber'] });
```

## 함께 알아둘 것

- 슬롯이 `ReactNode` 를 받으면(제목·부제 등) 문자열 대신 구독 리프 컴포넌트를 꽂는 식으로 기존 API 를 바꾸지 않고 격리할 수 있다.
- `watch` 를 커스텀 훅의 반환값으로 export 하고 있다면, 소비처가 어디서 호출하느냐에 따라 리렌더 범위가 달라진다 — 표시 전용이면 `watch` 대신 `control` 을 노출하는 편이 오용을 막는다.
- `useWatch({ control })` 에서 `control` 을 생략하면 `useFormContext` 로 폴백한다 — `FormProvider` 가 없으면 런타임 에러이므로 provider 없는 구조에서는 `control` 을 항상 명시한다.
