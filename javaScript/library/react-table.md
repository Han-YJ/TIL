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


## localization
```js
const localization = {
  body: {
    emptyDataSourceMessage: '데이터가 없습니다.',
  },
  toolbar: {
    exportTitle: '내보내기',
    exportCSVName: '엑셀 다운로드',
    showColumnsTitle: '컬럼보기',
    addRemoveColumns: '컬럼 추가/삭제',
  },
};
//홈페이지에는 exportName라고 나와있으나 exportCSVNmae or exportPDFName으로 사용해야 한다

<MaterialTable
  tableRef={tableRef}
  className={classes.table}
  title={title}
  icons={tableIcons}
  columns={columns}
  data={data}
  options={options}
  localization={localization}
  components={{
    Toolbar: (props) => (
      <MTableToolbar className={classes.toolbar} {...props} />
    ),
  }}
/>
```