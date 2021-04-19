## react - php axios data transfer
data를 받는 php쪽에서 

```php
$year = $_POST['year'];
$month = $_POST['month'];
$affiliate_id = $_POST['affiliate_id'];
```
대신 아래처럼 바꿔줘야 함
```php
$Jdata = json_decode(file_get_contents('php://input'), true);

$year = $Jdata['year'];
$month = $Jdata['month'];
$affiliate_id = $Jdata['affiliate_id'];

```
