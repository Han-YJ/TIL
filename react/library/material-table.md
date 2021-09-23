# material-table
- nested object를 사용하면 custom 해줘야 할 것들이 많다..!

## issue
- export
  - 한글 깨지는 현상 => '\uFEFF' 붙여서 해결
  - nested object render로 표시 했을 때, export하면 [object object]로 나오는 현상
    => exportAllData 로 해결 실패
    => exportCsv override로 해결 성공

## export csv override
```js
<MaterialTable
  tableRef={tableRef}
  className={classes.table}
  title={title}
  icons={tableIcons}
  columns={columns}
  data={data}
  options={{
    paging: false,
    sorting: true,
    grouping: false,
    draggable: false,
    searchFieldStyle: {
      width: 200,
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      marginRight: '1rem',
      padding: '0 12px',
    },
    exportButton: { csv: true, pdf: false },
    exportAllData: true,
    rowStyle: (rowData) => ({
      color: rowData.status === '취소' ? '#991919' : '#000000',
    }),
    exportCsv: (columnList, initialData) => {

      /* column */
      const columns = columnList.filter((columnDef) => {
        return (
          !columnDef.hidden &&
          columnDef.field &&
          columnDef.export !== false
        );
      });

      const headerRows = columns.map((row) => row.title);

      /* data */
      const data = initialData.map((rowData) =>
        columns.map((columnDef) => {
          if (columnDef.render) {
            let res = columnDef.render(rowData);
            if (res.includes(',')) {
              //toLocalestring 으로 , 삽입한 cell export 할 때 나눠서 출력되는 것 수정 
              res = parseFloat(res.replaceAll(',', ''));
            }
            return res;
          } else {
            return rowData[columnDef.field];
          }
        })
      );

        const { exportDelimiter } = tableRef.current.props.options;
        const delimiter = exportDelimiter ? exportDelimiter : ',';
        const BOM = '\uFEFF'; //한글 깨지는 현상 수정
        let csvContent = [headerRows, ...data]
          .map((e) => e.join(delimiter))
          .join('\n');

          csvContent = BOM + csvContent;
          const csvFileName = tableRef.current.props.title;
          downloadCsv(csvContent, csvFileName);
    },
  }}
/>
```

## nested object 사용 시, sorting 안되는 문제
customSort 설정
```js
{
  title: 'Test',
  field: 'test',
  customSort: (a,b) => a.test.getTime() - b.test.getTime()
}
```
