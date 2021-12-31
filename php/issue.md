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