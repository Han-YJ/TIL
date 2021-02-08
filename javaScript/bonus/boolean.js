//false: 0, -0, '', null, undefined
//true: -1, 'hello', 'false'
let num; //선언만 하고 값을 할당하지 않으면 undefined이기 때문에 false

let obj; //undefined
if(obj) {
  console.log(obj.name);
}
//위 아래 모두 동일하게 수행
obj && console.log(obj.name); //한 줄에 간단하게 쓸 수 있기 때문에 이렇게 많이 쓴다
//&& 연산자는 앞에것이 false면 뒤에꺼 수행 x
//=> obj에 아무것도 없기때문에 obj 에서 끝나고(obj가 false인 상태) && 뒤의 console.log(obj.name)이 수행되지x
//obj 는 undefined상태