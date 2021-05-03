## array 초기화
```php
$array = array();
$array = [];
```

## value array => key, value json
```
$result = array('key' => $value);

// {key : value}
```

### mssql to json 예제
```js
if(!$stmt || mssql_num_rows($stmt)<=0){
    echo 'empty result';
} else {
    while( $row = mssql_fetch_array($stmt) ) {
		$temp_arr = array(
            'date' => $row[0] . "-" . $row[1] . "-" . $row[2],
            'sal_count' => (int)$row[3],
            'sal_sum' => (int)$row[4],
            'sal_per' => (int)$row[5],
        );
        $result[] = $temp_arr;
        unset($temp_arr);
	}

    $final_result[] = $result;
	unset($temp_arr);
    unset($result);
}

mssql_free_result($stmt);
mssql_close();

echo json_encode($final_result);
```

## date형식의 loop문 만들기
```php
while(strtotime($start) <= strtotime($end)) {
    //DO SOMETHING...

    $start = date ("Y-m-d", strtotime("+1 day", strtotime($start)));
}
```

