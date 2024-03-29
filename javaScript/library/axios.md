# Axios

## DELETE method body payload 사용하기

- 주는 쪽
```js
const deleteOption = (id, option) => {
  return httpClient
    .delete(`${baseUrl}?id=${id}`, { data: { option } })
    .then((res) => res.data);
};
```

- 받는 쪽 (php)
```php
$params = json_decode(file_get_contents('php://input'), true);
$option = $params['option'];
```

---

### error
Axios.get returns plain html intead of JSON return data
아직 해결 x => baseURL 설정으로 해결!
- nested된 경로에서는 상대경로로 설정하면 axios url이 이상하게 잡혀서 html을 return
- http:~~~/api 로 baseURL 설정해서 해결

### 인스턴스 생성
```js
const instance = axios.create({
  baseURL: 'https://some-domain.com/api/',
  headers: { 'X-Custom-Header': 'foobar' },
  timeout: 1000,
});
```

### 참고
- https://stackoverflow.com/questions/59404698/axios-get-returns-plain-html-intead-of-json-return-data
- https://stackoverflow.com/questions/62410685/axios-response-data-return-html-instead-of-an-object
- https://stackoverflow.com/questions/65908969/shorten-axios-text-html-response
- https://xn--xy1bk56a.run/axios/guide/api.html