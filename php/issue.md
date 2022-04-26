## 한글 return null
```php
header("Content-Type: text/html; charset=UTF-8");
ini_set('mssql.charset', 'UTF-8');
```
위 두가지 다 했는데도 mssql varchar select하면 한글만 null로 return되는 현상

  

```php
'name' => iconv("EUC-KR","UTF-8",$row[1]);

```
- iconv로 다시 인코딩해서 해결!
- [php_iconv](https://www.php.net/manual/en/function.iconv.php)


## move_uploaded_file failed to open stream: Invalid argument in
- 파일명에 한글 있을 경우 나타나는 오류
### 해결
```
$file_path = iconv("UTF-8","EUC-KR//IGNORE", $full_path);
```