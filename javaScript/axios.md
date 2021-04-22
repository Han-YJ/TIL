## Axios
### error
Axios.get returns plain html intead of JSON return data
아직 해결 x => baseURL 설정으로 해결!
- nested된 경로에서는 상대경로로 설정하면 axios url이 이상하게 잡혀서 html을 return
- http:~~~/api 로 baseURL 설정해서 해결

### 참고
- https://stackoverflow.com/questions/59404698/axios-get-returns-plain-html-intead-of-json-return-data
- https://stackoverflow.com/questions/62410685/axios-response-data-return-html-instead-of-an-object
- https://stackoverflow.com/questions/65908969/shorten-axios-text-html-response