
//1.Function declaration
function printHello() {
  console.log('Hello');
}
printHello();

function log(message) {
  console.log(message);
}
log('Hello@');
log(1234);


//*잠깐 설명!
//typescript에서는 type을 명시해주어야 한다. parameter나 return 타입 둘다.
/* function log(message: string): number {
  console.log(message);
  return 0;
} */
// typescript에서 이렇게 작성하면 string은 parameter type. number는 return type
// 이렇게 해야 협업하거나 api를 제공할 때 조금 더 명확하고 쉽게 만들어준다. 
// 왜냐하면 함수만 보고도 parameter name과 type, return type으로 무슨함수인지 추측할 수 있게 해준다.

// 이걸 javascript에서 쓴다면
function logInJS(message) {
  console.log(message);
  return 0;
}


//2. Parameters
// premitive parameters: passed by value 메모리에 value가 전달되기 때문에 value전달.
// object parameters: passed by reference 메모리에 reference가 저장되기 때문에 reference전달.
function changeName(obj) {
  obj.name = 'coder';
}
const ellie = { name: 'ellie' }; //object이기 때문에 value가 아니라 ellie가 가리키는 reference가 저장. 
changeName(ellie); //ellie 가리키고 있는 곳의 name을 coder로 변경.
console.log(ellie); //{name: "coder"}


//3. Default parameters (added in ES6)
function showMessage(message, from = 'unknown') {
  console.log(`${message} by ${from}`);
}
showMessage('Hi!'); //Hi! by unknown
//message는 전달됐는데 from은 전달되지 않았을경우 from 은 undefined가 된다. 
//예전에는 undefined일 경우를 대비해 if문으로 default값을 설정했지만 es6부터는 from = 'unknown'으로 간단하게 가능.


//4. Rest parameters (added in ES6)
//... 을 쓰면 배열형태로 전달된다.
function printAll(...args) { //...args가 배열형태로 전달.
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]);
  }

  for (const arg of args) { //위에 for문을 이렇게 간단하게도 쓸 수 있다.
    console.log(arg);
  }

  args.forEach((arg) => console.log(arg)); //더 간단하게 foreach 사용가능 
}
printAll('dream', 'coding', 'ellie');


//5. Local scope
let globalMessage = 'global'; // global variable
function printMessage() {
  let message = 'hello';
  console.log(message); // local variable
  console.log(globalMessage);
  function printAnother() {
    console.log(message);
    let childMessage = 'hello';
  }
  // console.log(childMessage); //error
}
printMessage();
//밖에서는 안이 보이지 않고 안에서만 밖을 볼 수 있다!!


//6. Return a value
function sum(a, b) {
  return a + b;
}
const result = sum(1, 2); // 3
console.log(`sum: ${sum(1, 2)}`);
//return type이 없는 함수들은 return undefined가 생략되어 있는것과 같다. 생략가능.



// 7. Early return, early exit //현업에서 쓰이는 tip!
// bad
function upgradeUser(user) {
  if (user.point > 10) {
    // long upgrade logic... 이렇게 block안에 logic을 많이 쓰면 가독성이 떨어진다.
  }
}

// good
function upgradeUser(user) {
  if (user.point <= 10) {
    return;
  }
  // long upgrade logic... 이런식으로 조건이 맞지 않은것을 빨리 return 시키고 나머지에 logic을 길게 쓰는것이 좋다.
}



//Function expression

//* First-class function
// functions are treated like any other variable 
// can be assigned as a value to variable 변수할당 가능
// can be passed as an argument to other functions. parameter로 전달가능
// can be returned by another function 리턴값

//1. Function expression 
// a function declaration can be called earlier than it is defiend. (hoisted)
// a function expression is created when the execution reaches it.
const print = function () {
  // 이런식으로 함수를 선언함과 동시에 print라는 변수에 할당. 
  // anonymous function : 함수에 이름이 없는 것.
  console.log('print');
};
print();
const printAgain = print; //다른변수에도 할당 가능.
printAgain();

//일반적인 함수와 가장 다른점은 function declaration은 hoisting이 가능하다!!
// => 함수가 선언되기 이전에 호출해도 불려온다. JS engine이 선언들을 가장 위로 올려주기때문(hoistion)


//2. Callback function using function expression
//상황에 맞게 함수를 호출
function randomQuiz(answer, printYes, printNo) {
  if (answer === 'love you') {
    printYes();
  } else {
    printNo();
  }
}
// anonymous function
const printYes = function () {
  console.log('yes!');
};

// named function
// better debugging in debugger's stack traces
// recursions : 함수안에서 자기함수를 부르는 것. 피보나치수를 계산하거나 반복해서 평균값을 계산할때 사용.
const printNo = function print() {
  console.log('no!');
};
randomQuiz('wrong', printYes, printNo);
randomQuiz('love you', printYes, printNo);


// *Arrow function : 함수를 간결하게 만들어준다.
// always anonymous 항상 이름이 없는 함수이다.

// const simplePrint = function () {
//   console.log('simplePrint!');
// };
const simplePrint = () => console.log('simplePrint!');

const add = (a, b) => a + b; //parameter있을 때

const simpleMultiply = (a, b) => { //한 줄이 아니라 block이 필요할때는 이렇게 쓴다.
  // do something more
  return a * b; //block을 쓰게 되면 return값을 써줘야 함.
};

// *IIFE: Immediately Invoked Function Expression 선언함과 동시에 호출하는것.
(function hello() {
  console.log('IIFE');
})(); 
//최근에 잘 쓰이지는 않지만 이런 방법도 잇다.


// Fun quiz time❤️
// calculate라는 함수를 만들어서 계산하는 것 만들기. 예외처리도 하기.
// function calculate(command, a, b) 
// command: add, substract, divide, multiply, remainder

function calculate(command, a, b) {
  switch(command) {
    case add:
      return a + b;
    case substract:
      return a - b;
    case divide:
      return a / b;
    case multiply:
      return a * b;
    case remainder:
      return a % b;
    default:
      throw Error('unkown command');
  }
}

console.log(calculate(add, 3, 5));