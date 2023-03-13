# cURL
curl은 command line 용 data transfer tool 이다. download/upload 모두 가능하며 HTTP/HTTPS/FTP/LDAP/SCP/TELNET/SMTP/POP3 등 주요한 프로토콜을 지원하며 Linux/Unix 계열 및 Windows 등 주요한 OS 에서 구동되므로 여러 플랫폼과 OS에서 유용하게 사용할 수 있다. (내 경우에는 CORS error 때문에 서버에서 통신하기 위해 사용했다.)

---

## 사용
- GET
```php
$curlUrl = "https://~~~/endPoint";
$headers = array(
  "Content-Type: application/json",
  "Authorization: Bearer $auth"
);

try {
  $ch = curl_init();                                 //curl 초기화. 사용전에 반드시 초기화
  curl_setopt($ch, CURLOPT_URL, $curlUrl);           //URL 지정하기
  curl_setopt($ch, CURLOPT_HEADER, false);           //response에 header info 출력
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);    //request header 설정
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    //response를 문자열로 반환 
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);      //connection timeout 필요한경우 사용
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);   //원격 서버의 인증서 유효한지 verify

  $response = curl_exec($ch);
  if ($e = curl_error($ch)) 
  {   
    //fail
  } 
  else {
    //success
  }
} catch(Exception $e) {
    print_r($e);
}

curl_close($ch);
 
return $response;
```

- POST
```PHP
//POST
//GET 방식과 유사하지만 POST 설정, 필드 설정 추가 필요
$curlopt_fields = http_build_query($data); //application/x-www-urlencoded
$curlopt_fields = json_encode($data); ////application/json

curl_setopt($ch, CURLOPT_POST, true);                   //POST 여부
curl_setopt($ch, CURLOPT_POSTFIELDS, $curlopt_fields);  //request body 설정
```

---
### 참고
- [PHP cURL로 Notion api 사용하기](cURL_Notion_api.md)
- [curl 설치 및 사용법 - HTTP GET/POST, REST API 연계등](https://www.lesstif.com/software-architect/curl-http-get-post-rest-api-14745703.html)
- [cURL 테스트 코드](https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=vucket&logNo=220934898599)