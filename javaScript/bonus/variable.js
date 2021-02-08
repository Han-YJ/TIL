//1. 변수 : 데이터를 담는 것
//number, string, boolean, null, undefined

let number = 2;
let number2 = number;
//변수를 선언하면 무조건 변수를 위한 공간이 생긴다(memory에 할당)
//number와 number2 모두 2

let number2 = 3; // (number에는 영향 x)

console.log(number); //2
console.log(number2); //3 

//object
let obj = {
  name: 'ellie',
  age: 5,
};
console.log(obj.name); //ellie

let obj2 = obj; //reference(주소)가 복사되어 들어간다
console.log(obj2.name); //ellie

obj.name = 'james';
console.log(obj.name); //james
console.log(obj2.name); //james

//object는 data가 들어가는 것이 아니라 reference가 들어간다.

//const로 obj를 지정하면 reference는 고정되지만 그 reference가 가리키고 있는 obj는 변경이 가능하다.
