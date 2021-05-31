# react csv
```js
 /* csvHeaders */
    const csvDateHeaders =
      dates &&
      dates.map((row) => ({
        label: formatDateValue(row),
        key: row,
      }));

    const csvBaseHeaders = [
      {
        label: '메뉴명',
        key: 'name',
      },
    ];
    const csvHeaders = csvBaseHeaders.concat(csvDateHeaders);
//이런식으로 header만들어서 사용

function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridColumnsToolbarButton />
        <CSVLink
          data={final_data}
          headers={csvHeaders}
          filename={'매장별 판매수량.csv'}
        >
          <SaveAlt style={{ color: '#3f51b5' }} />
        </CSVLink>
      </GridToolbarContainer>
    );
  }

  return (
    <TableContainer className={classes.container} component={Paper}>
      <DataGrid
        rows={final_data}
        columns={headers}
        hideFooterSelectedRowCount
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </TableContainer>
```