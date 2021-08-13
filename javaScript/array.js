'use strict';

// Array
// array의 point는 index! 삽입과 삭제가 편하다.
const numbers = [1, 2];
numbers.unshift(3, 4);
console.log(numbers);

// 1. Declaration 선언
const arr1 = new Array();
const arr2 = [1, 2]; //이 방법이 더 흔하게 쓰인다. []대괄호를 이용하는 방법.

// 2. Index position
const fruits = ['🍎', '🍌'];
console.log(fruits);
console.log(fruits.length);
console.log(fruits[0]);
console.log(fruits[1]);
console.log(fruits[2]); //undefined
console.log(fruits[fruits.length - 1]); //array의 마지막 item을 찾을 때 사용 arr[arr.length-1]
//console.clear();

// 3. Looping over an array
// print all fruits
// a. for
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}

// b. for of
for (let fruit of fruits) {
  console.log(fruit);
}

// c. forEach
fruits.forEach((fruit) => console.log(fruit));
//forEach는 callback함수를 수행한다. value, index, array 세가지를 받아올 수 있다(보통은 array는 받아오지x)

// 4. Addtion, deletion, copy
// push: add an item to the end //가장 뒤에 삽입
fruits.push('🍓', '🍑');
console.log(fruits);

// pop: remove an item from the end //가장 뒤의 것 삭제
const poped = fruits.pop();
fruits.pop();
console.log(fruits);

// unshift: add an item to the benigging //앞에서부터 데이터 삽입
fruits.unshift('🍓', '🍋');
console.log(fruits);

// shift: remove an item from the benigging //앞에서부터 데이터 삭제
fruits.shift();
fruits.shift();
console.log(fruits);

// note!! shift, unshift are slower than pop, push
//pop과 push보다 shift, unshift는 매우 느리다 <= 기존 data의 index change

// splice: remove an item by index position
//지정된 position에서 삭제. start number, deleteCount 설정
//deleteCount를 설정하지 않으면 start number부터 끝까지 삭제
fruits.push('🍓', '🍑', '🍋');
console.log(fruits);
fruits.splice(1, 1);
console.log(fruits);
fruits.splice(1, 0, '🍏', '🍉'); //splice를 한 뒤에 그 자리에 data삽입이 가능
console.log(fruits);

// combine two arrays
//두 가지의 배열을 묶기도 가능 concat()
const fruits2 = ['🍐', '🥥'];
const newFruits = fruits.concat(fruits2);
console.log(newFruits);

// 5. Searching
// indexOf: find the index
// 몇 번째 index에 있는지 알고싶을 때 indexOf()
//console.clear();
console.log(fruits);
console.log(fruits.indexOf('🍎'));
console.log(fruits.indexOf('🍉'));
console.log(fruits.indexOf('🥥'));

// includes
// 있는지 없는지 확인 includes() 없으면 -1 출력
console.log(fruits.includes('🍉'));
console.log(fruits.includes('🥥'));

// lastIndexOf
// 가장 마지막에 해당하는 값의 index 출력
//console.clear();
fruits.push('🍎');
console.log(fruits);
console.log(fruits.indexOf('🍎'));
console.log(fruits.lastIndexOf('🥥'));

//sort
//그냥 sort하면 원본도 바뀜
const origin = [1, 2, 3, 4, 5];
const sorted = origin.sort(b - a);
console.log(origin); //5,4,3,2,1
//원본을 유지하고 싶다면
const origin2 = [1, 2, 3, 4, 5];
const copySorted = [...origin2].sort(b - a);
console.log(origin2); //1,2,3,4,5
