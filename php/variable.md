## integer
- 범위 : -2,147,483,648 to 2,147,483,647

### 2,147,483,647 이상 못받아오는 현상
toLocaleString을 쓰기위해 int로 받았는데 범위 넘어가는 값이 모두 2,147,483,647으로 표시
-> String으로 받아서 넘겨준다음 front에서 *1