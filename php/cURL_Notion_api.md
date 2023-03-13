# PHP에서 Notion api 사용하기 (Page create)
```php
$notionURL = 'https://api.notion.com/v1/pages/';
$notionApiKey = "database에 연결한 api key";
$databaseId = "사용할 database_id";

//Custom headers
$headers = array(
	"Content-Type: application/json",
    "Authorization: Bearer $notionApiKey",
	"Notion-Version: 2022-06-28",
);

//Post properties
$properties = 
array(
    "DateColumn" => array(
        "type" => "date",
        "date" => array(
            "start" => "2023-03-07"
        )
    ),
    "PhoneColumn" => array(
        "type" => "phone_number",
        "phone_number" => "01000000000"
    ),
    "SelectColumn" => array(
        "select" => array(
            "name" => "Done"
        )
    )
);

$postFields = array(
    'parent' => array('database_id' => $databaseId),
    'properties' => $properties
);

try {

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $notionURL);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));

$response = curl_exec($ch);

curl_close($ch);
} catch(Exception $e) {
    print_r($e);
}

echo json_encode($response);
```
💡 database id 와 api key, property가 잘 맞는지 확인하기 위해 Postman에서 test를 선행하면 더 편리하게 사용할 수 있다.

---
### 참고
- [Notion API docs - properties](https://developers.notion.com/reference/property-object)
- [PHP cURL 예제](https://gist.github.com/brandonkramer/c5f872bfb6dedbacfeaab3f1bd2699b4)
- [CURL 함수 설명](https://sevendollars.tistory.com/168)