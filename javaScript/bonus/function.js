const num = 1;
const num2 = 2;
const result = num + num2;
//이런식으로 반복되는 것들을 함수로 만든다 => 함수는 재사용이 가능

function add(a, b) {
  return a + b;
}

function print(name, age) { //parameter에 의미있는 이름을 넣으면 함수를 파악하기 쉬워진다
  console.log('print');
}

print(8, 33); 

function divide(num1, num2) {
  return num1 / num2;
}

function surprise(operator) {
  const result = operator(2, 3);
  console.log(result);
}

surprise(add); //5  add(2, 3)과 동일하다
surprise(divide);

const sum = add(3, 4);
console.log(sum); //7

//add라는 함수의 이름은 함수가 정의되어 있는 reference를 담고있다

const doSomething = add; //doSomething도 add와 똑같은 함수를 가리키고 있다

const result = doSomething(2, 3);
console.log(result); //5



