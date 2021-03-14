# Spread Operator
- array에 있는 요소들을 새로운 배열로 복사
- Sallow-cloning : object안에 object가 있다면 shallow cloning을 하기 때문에 가장 상위의 배열 껍데기만 새로운 껍데기로 바꿔주고 내용물의 참조값은 그대로 복사

```
const array1 = [
  {id: '1', count: 0},
  {id: '2', count: 0}
]

const array2 = array1;
const array3 = [...array];

// => array2는 array1의 참조값과 같기때문에 동일한 object를 가리킴
// array3는 array1을 shallow cloning으로 복사하기 때문에 다른 참조값을 가짐
// but, 그 안의 배열은 같은 참조값을 가지므로 array1의 id가 1인 count를 업데이트하면 array3의 id가 1인 count에서도 동일한 업데이트 확인 가능
```