// 1. String concatenation
console.log('my' + ' cat');
console.log(`string literals: 1 + 2 = ${1+2}`);

//2.Numeric operators
console.log(5&2);

//3. Increment and decrement operators
let counter = 2;
const preIncrement = ++counter;
console.log(`preIncrement : ${preIncrement}, counter: ${counter}`);
//템플릿 리터럴은 '가 아니고 `를 써야함!!!

const postIncrement = counter++;
console.log(`postIncrement : ${postIncrement}, counter: ${counter}`);

//decrement도 마찬가지

//4. Assignment operators
let x = 3;
let y = 6;

x += y; // x = x + y;

//5. Comparison operators 비교하는 operators
console.log(10 < 6); // less than

//6. Logical operators: || (or), && (and), ! (not)
const value1 = true;
const value2 = 4 < 2;

//or 연산자
console.log(`or: ${value1 || value2 || check()}`);
//or연산자는 하나라도 true가 나오면 거기서 멈춤. 앞에서 true가 나오면 뒷부분 코드가 아예 불려오지 않는다.
//=> 무거운 함수일수록 뒤로 보내는게 훨씬 효율적!!! 그러므로 check가 뒤에 있는게 효율적임

//and 연산자
console.log(`and: ${value2 && value1 && check()}`);
//and 연산자는 하나라도 false가 나오면 거기서 멈추고 뒤에는 안봄.
//and는 null check할때도 많이 쓴다.
/* if (nullableObject != null) {
  nullableObject.something;
} */
//이런식으로 쓸 수 있음.

function check() {
  for(let i = 0; i < 10; i++) {
    console.log('haha');
  }
  return true;
};


//7. Equality
const stringFive = '5';
const numberFive = 5;

//loose equality, with type conversion
console.log(stringFive == numberFive); //true
console.log(stringFive != numberFive); //false

//strict equality, no type conversion
console.log(stringFive === numberFive); //false
console.log(stringFive !== numberFive); //true

//object equality by reference
const ellie1 = {name: 'ellie'};
const ellie2 = {name: 'ellie'};
const ellie3 = ellie1;
console.log(ellie1 == ellie2); //false object는 참조값을 가지는데 참조값이 다르므로 false
console.log(ellie1 === ellie2); //false
console.log(ellie1 === ellie3); //true ellie1과 ellie3는 같은 참조값(reference)을 가진다.


// equeality - puzzler
console.log(0 == false); //t
console.log(0 === false); //f
console.log('' == false); //t
console.log('' === false); //f
console.log(null == undefined); //t
console.log(null === undefined); //f


//8. Conditional operators: if
//if, else if, else
const name = 'coder';
if (name === 'ellie') {
  console.log('Welcome, Ellie!');
} else if (name === 'coder') {
  console.log('You are amazing coder');
} else {
  console.log('unknown');
}

//9. Ternary operator: ?
//condition ? value1 : value2;
console.log(name === 'ellie' ? 'yes' : 'no');
//간단한 경우에는 이렇게 쓰지만 여러가지 쓸 경우엔 if else나 switch를 쓰는게 가독성에 좋음


//10. Switch statement
//use for multiple if chesckx
//use for enum-like value check
//use for multiple type checks in TS
const browser = 'IE';
switch (browser) {
  case 'IE':
    console.log('go away!');
    break;
  case 'Chrome':
    console.log('love you');
    break;
  case 'Firefox':
    console.log('love you');
    break;
  default:
    console.log('same all!');
    break;
}

//switch문에서 중복된것을 출력하는 case가 있다면 같이 쓰는것도 가능하다.
//case 'Chrom':
//case 'Firefox':
//  console.log('love you');
//  break;

//11. Loops 반복문
//while loop, while the condition is truthy,
//body code is executed.
let i =3;
while (i > 0) {
  console.log(`while: ${i}`);
  i--;
}

//do while loop
//body code is executed first, the check the condition. 일단 실행하고 조건본다.
do {
  console.log(`do while: ${i}`);
  i--;
} while (i > 0);

// do while: 0  만 출력. 이미 i가 위에서 0임.


//for loop, for(begin; condition; step)
for (i = 3; i > 0; i--) {
  console.log(`for: ${i}`);
}

for (let i = 3; i > 0; i = i- 2) {
  //inline variable declaration
  console.log(`inline variable for: ${i}`);
}

//nested loops
for ( let  i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    console.log(`i: ${i}, j: ${j}`);
  }
}
  //이런식으로 nested해서 쓸 수 있지만 cpu에 좋지는 않음.



//break, continue
//Q1. iterate from 0 to 10 and print only even numbers(use continue)
for(let i = 0; i < 11; i++) {
  if(i % 2 !== 0) {
    continue;
  }
  console.log(`q1. ${i}`);
}

//Q2. iterate from 0 to 10 and print numbers until reaching 8
for(let i = 0; i < 11; i++) {
  if(i > 8) {
    break;
  }
  console.log(`q2. ${i}`);  
}

//lable도 있지만 현업에서는 쓰지않음.