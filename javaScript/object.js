'use strict';
// Objects
// one of the JavaScript's data types.
// a collection of related data and/or functionality.
// Nearly all objects in JavaScript are instances of Object
// object = { key : value }; javaScript에서 object는 key와 value의 집합체이다


// 1. Literals and properties

//두가지 방법으로 만들 수 있다
const obj1 = {}; // 'object literal' syntax. class가 없어도 괄호를 이용해 생성할 수 있다
const obj2 = new Object(); // 'object constructor' syntax

function print(person) {
  console.log(person.name);
  console.log(person.age);
}

const ellie = { name: 'ellie', age: 4 }; //이런식으로 object로 관리하면 확장 변경이 용이
print(ellie); //전달에도 용이

// with JavaScript magic (dynamically typed language) - runtime일때 property 추가 가능
// can add properties later 추가
ellie.hasJob = true;
console.log(ellie.hasJob);

// can delete properties later 삭제
delete ellie.hasJob;
console.log(ellie.hasJob);

//동적으로 추가, 삭제가 가능하지만 이렇게 하면 유지보수가 힘듦


// 2. Computed properties 계산된 properties라는 말
// key should be always string
console.log(ellie.name);
console.log(ellie['name']); //둘다 ellie출력. *property는 string type이기 때문에 항상 string으로 지정해서 써야함
ellie['hasJob'] = true;
console.log(ellie.hasJob);
//.(dot)은 쓰는 순간 값을 받아올 수 있을때 쓰고, [] property는 어떤 key가 필요할지 모를때, runtime에서 결정될 때 사용

function printValue(obj, key) {
  console.log(obj[key]);
}
//이런식으로 어떤 key일지 모를때 사용. (console.log(obj.key)이렇게쓰면 undefined)
printValue(ellie, 'name');
printValue(ellie, 'age');


// 3. Property value shorthand
const person1 = { name: 'bob', age: 2 };
const person2 = { name: 'steve', age: 3 };
const person3 = { name: 'dave', age: 4 };

function makePerson(name, age) {
  return {
    name,
    age,
  }
}//값만 전달해주면 object를 만들어주는 함수(key와 value의 이름이 동일하다면 위처럼 생략 가능 in JS)
const person4 = makePerson('elile', 30);

const person5 = new Person('elile', 30); //template처럼 다른 기능을 하지않고 object만 생성해준다면 Constructor로 작성
console.log(person4);

// 4. Constructor Function
function Person(name, age) {
  // this = {};
  this.name = name;
  this.age = age;
  // return this;
}


// 5. in operator: property existence check (key in obj) : 해당하는 object안에 key가 있는지 없는지 확인
console.log('name' in ellie);
console.log('age' in ellie);
console.log('random' in ellie);


// 6. for..in vs for..of
// project하다보면 굉장히 유용

// for (key in obj)
// obj안의 key
console.clear();
for (let key in ellie) {
  console.log(key);
}

// for (value of iterable)
// 배열같이 iterable한 것의 value를 순차적으로 순회
const array = [1, 2, 4, 5];
for (let value of array) {
  console.log(value);
}


// 7. Fun cloning
// Object.assign(dest, [obj1, obj2, obj3...])
const user = { name: 'ellie', age: '20' };
const user2 = user;
user2.name = 'luce';
console.log(user); //luce 같은 ref을 가지고 있기 때문에 바뀜

//그럼 이렇게 하지않고 복제 할 수 있는 방법은?

// old way
const user3 = {};
for (let key in user) {
  user3[key] = user[key];
}
console.clear();
console.log(user3);

//assign을 사용하는 방법
const user4 = Object.assign({}, user);
console.log(user4);

//assign - another example
const fruit1 = { color: 'red' };
const fruit2 = { color: 'blue', size: 'big' };
const mixed = Object.assign({}, fruit1, fruit2);
console.log(mixed.color); //blue (뒤에 나온것일수록 앞의것을 덮어쓴다)
console.log(mixed.size); //big