# React-table

## Column hide/show
## 1. setHiddenColumns, initialState.hiddenColumns 이용
```js
const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    allColumns,
    setHiddenColumns,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        hiddenColumns: [],
      },
    },
    useGlobalFilter,
    useSortBy
  );


const toggleCancelColumns = (e) => {
    const checked = e.currentTarget.checked;
    if (checked) {
      const cancelIds = allColumns
        .filter((column) => column.id.includes('cancel') === true)
        .map((item) => item.id);
      setHiddenColumns(cancelIds);
    } else {
      setHiddenColumns([]);
    }
  };

<label>
  <input type='checkbox' onChange={hideCancelColumns} />
  매출 건만 보기
</label>
```
### 참고
- https://react-table.tanstack.com/docs/api/useTable#instance-properties

## 2. getToggleHiddenProps, getToggleHideAllColumnsProps 이용

### 참고
- https://react-table.tanstack.com/docs/examples/column-hiding