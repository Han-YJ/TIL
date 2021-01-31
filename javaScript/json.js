'use strict';

//HTTP(Hypertext Transfer Protocol)
//Hypertext는 링크들만 얘기하는 것이 아니라 문서나 이미지파일등 리소스를 말한다

//AJAX(Asynchronous javaScript And XML) : 웹페이지에서 동적으로 데이터를 주고받는 기술
//대표적으로 XMLHttpRequest라는 object가 있다. 최근에 나온 fetch() API 를 사용할 수도 있다(IE는 지원x)

// JSON
// JavaScript Object Notation
/* 
- simplest data interchange FormData
- lightweight text-based structure
- easy to read
- key-value pairs
- used for serialization and transmission of data between the network the network connection
- independent programming language and platform 
*/


// 1. Object to JSON
// stringfy(obj) //직렬화 : JSON으로 변환. string으로 변환하는 것.
let json = JSON.stringify(true);
console.log(json);

json = JSON.stringify(['apple', 'banana']);
console.log(json); //["apple", "banana"] 배열처럼 보이면서 "" 로 변환(json형식)

const rabbit = {
  name: 'tori',
  color: 'white',
  size: null,
  birthDate: new Date(),
  jump: function () {
    console.log(`${this.name} can jump!`);
  },
};

json = JSON.stringify(rabbit); //rabbit object를 json으로 변환. 함수는 object에 있는 data가 아니므로 jump는 제외
console.log(json); //{"name":"tori","color":"white","size":null,"birthDate":"2021-01-31T08:34:59.139Z"}
//data도 string으로 변환되어 들어간다, symbol같이 js에만 있는 형식도 제외된다

json = JSON.stringify(rabbit, ['name', 'color', 'size']); //원하는 property만 골라서 원하는 json으로 만들수있다.
console.log(json);

json = JSON.stringify(rabbit, (key, value) => { //callback함수로 더 제한할수도 있다
  console.log(`key: ${key}, value: ${value}`); //rabbit object를 감싸는 최상위 것이 가장 먼저 출력(key: , value: [object Object])
  return key === 'name' ? 'ellie' : value; //key가 name이면 value를 ellie로, 아니면 원래 value =>이렇게하면 name만 ellie로 바꿔서 출력할 수 잇따.
});
console.log(json);

// 2. JSON to Object
// parse(json)
console.clear();
json = JSON.stringify(rabbit);
console.log(json);
const obj = JSON.parse(json, (key, value) => {
  console.log(`key: ${key}, value: ${value}`);
  return key === 'birthDate' ? new Date(value) : value; 
  //이렇게 하지 않으면 obj에 data가 string으로 들어가서 getDate()함수 사용x
});
console.log(obj);
rabbit.jump();
// obj.jump(); //json을 json으로 만들때 함수는 전달되지 않기때문에 이 json을 object로 만들면 함수호출x

console.log(rabbit.birthDate.getDate()); //31
console.log(obj.birthDate.getDate()); //31