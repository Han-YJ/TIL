# Material-ui

## Table
```
//<TableContainer>, <Table>, <TableHead>, <TableBody>, <TableRow>, <TableCell> 기본뼈대
//<EnhancedTableHead>, <TableSortLabel> 
```
## css override
### 적용 안되는 문제
- import check
```
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
```
- https://stackoverflow.com/questions/58467608/why-is-themeprovider-material-ui-not-working-for-me-here


## DataGrid
```js
//columns
const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'First name', width: 150 },
  { field: 'lastName', headerName: 'Last name', width: 150 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue(params.id, 'firstName') || ''} ${
        params.getValue(params.id, 'lastName') || ''
      }`,
  },
];

//rows
const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

return(
<DataGrid rows={rows} columns={headers} pageSize={5} />
)
```
  
- valueGetter : binding할 value 
```js
valueGetter: (params) =>
  `${params.getValue(params.id, 'firstName') || ''} ${
    params.getValue(params.id, 'lastName') || ''
  }`,

//type이 option인 것만 이름앞에 <옵션> 붙이기?
const object = [
  {
    menu: {count: 10, price: 4000}
  },
  {
    menu2: {count: 6, price: 8000}
  }
]

//header
{ field: menu, headerName: menu, width: 250, 
valueGetter: params => {
  if(params.value){
    return params.value.count //or params.value.price
  } else {
    return 0
  }  
  }

params.value ? (params.value.count).toLocaleString('en-US') : 0
```
```js
//nested value 에 접근하기
{ field: 'name', headerName: '이름', width: 250, 
valueGetter: params => (params.getValue(params.id, 'type') === 'option' ? `<옵션> ${params.value}` : params.value )}
```
  
- valueFormatter : value format
```js
{ field: 'amount', headerName: '판매총액', width: 150, valueFormatter: params => params.value.toLocaleString('en-US')},
```
- row의 id 필수

## Datepickers ref
datepicker에는 ref가 아닌 inputRef사용하면 값을 가져올 수 있다
```js
<form ref={formRef}>
  <div>
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ko}>
      <DatePicker
        label='StartDate'
        value={startDate}
        onChange={setStartDate}
        animateYearScrolling
        inputRef={startDateRef}
      />
      <DatePicker
        label='EndDate'
        value={endDate}
        onChange={setEndDate}
        animateYearScrolling
        inputRef={endDateRef}
      />
    </MuiPickersUtilsProvider>
  </div>
  <input
    ref={contactRef}
    type='text'
    placeholder='받으실 E-mail 또는 FAX번호를 입력해주세요'
  ></input>
  <Button name='Submit' onClick={onSubmit}>
    제출하기
  </Button>
</form>

const onSubmit = (e) => {
    const taxRequest = {
      startDate: startDateRef.current.value || '',
      endDate: endDateRef.current.value || '',
      contact: contactRef.current.value || '',
    };
    console.log(taxRequest);
    //{"startDate": "6월 1일","endDate": "6월 12일","contact": "sdf"}
  };

```


## Dialog backbutton 처리
- Dialog 켜져 있을 때, 백버튼 누르면 dialog 꺼지게
- 처음엔 history.push를 이용했지만 window.location.hash로 더 간단하게 처리 할 수 있었다

```js
  const [open, setOpen] = React.useState(window.location.hash === "#alert");

  useEffect(() => {
    const onHashChange = () => setOpen(window.location.hash === "#alert");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function handleClickOpen() {
    window.location.hash = "#alert";
  }

  function handleClose() {
    window.history.back();
  }

  return (
   <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <div>contents</div>
  </Dialog>


  )

```

### 참고
- https://codesandbox.io/s/material-demo-7zf07?file=/demo.js



