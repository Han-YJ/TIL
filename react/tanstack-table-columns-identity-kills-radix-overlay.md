# TanStack Table columns 재생성이 셀 안의 Radix 오버레이를 닫아버린다

테이블 셀 안에 Radix Popover를 넣었더니, **열려 있던 팝오버가 백그라운드 refetch 순간 소리 없이 닫히는** 문제. e2e에서는 "팝오버 열기 클릭이 간헐적으로 유실"로 나타났다 — 클릭 직후 refetch가 겹치면 열리자마자 닫혀서 사실상 안 열린 것처럼 보인다.

## 원인 사슬

1. columns를 `useMemo`로 만들면서 **refetch마다 참조가 바뀌는 배열**(서버 데이터)을 deps에 넣었다
2. deps가 바뀌면 columns 배열이 통째로 재생성된다
3. react-table은 새 columns를 받으면 컬럼 정의가 바뀐 것으로 보고 **셀 서브트리를 remount**한다 (re-render가 아니라 remount)
4. Radix Popover/DropdownMenu는 비제어 모드에서 열림 상태를 컴포넌트 내부에 들고 있다 → remount = 상태 소실 = **닫힘**

세 라이브러리가 각자 정상 동작한 결과라 어느 한 곳의 버그가 아니고, 그래서 에러도 경고도 없다.

## 해법: 휘발 데이터는 ref-getter로

columns의 참조 안정성을 지키는 게 핵심이다. 셀이 필요로 하는 "자주 바뀌는 값"은 deps에 넣지 말고 **ref를 경유해 렌더 시점에 읽는다**:

```tsx
const volatileRef = useRef({ items });
volatileRef.current = { items };

const columns = useMemo<ColumnDef<Row>[]>(() => [
  {
    id: 'detail',
    // 팝오버 콘텐츠가 열리는 렌더 시점에 getter로 최신값을 읽는다
    cell: ({ row }) => (
      <DetailCell row={row.original} getItems={() => volatileRef.current.items} />
    ),
  },
], [/* 안정적인 값만 */]);
```

- columns가 재생성되지 않으니 셀은 remount 없이 re-render만 되고, 열린 오버레이가 유지된다
- getter는 팝오버가 **열리는 순간** 실행되므로 데이터 최신성도 잃지 않는다
- 같은 원리로 인라인 에디터의 입력 상태를 ref로 빼면 **한글 IME 조합이 깨지는 문제**도 함께 막는다 (타이핑마다 columns 재생성 → 입력 필드 remount → 조합 중단)

## 일반화

**"columns 참조가 바뀌면 셀은 remount된다"**를 전제로, 셀 내부에 상태를 가진 것(Radix 오버레이·비제어 input·IME 조합·애니메이션)이 있다면 columns의 deps를 의심하라. 증상이 "간헐적"으로 보이는 이유는 remount가 refetch 타이밍과 사용자 상호작용이 겹칠 때만 관찰되기 때문이다 — 부하가 걸린 e2e에서 먼저 드러난다.
