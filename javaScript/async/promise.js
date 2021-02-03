'use strict';

// Promise is a JavaScript object for asynchronous operation.
// 비동기를 간편하게 처리해주는 object. callback대신 사용 가능
// 정해진 장시간의 기능을 수행하고 나서 정상적으로 수행했으면 성공메시지와 결과 데이터, 아니면 에러메시지 표시.
// State: pending -> fulfilled or rejected
// 상태: 수행중인지 수행이 완료되었다면 성공했는지 실패했는지
// Producer vs Consumer
// 생산자 vs 소비자

// 1. Producer
// when new Promise is created, the executor runs automatically.
// promise가 만들어지는 순간 execute함수가 바로 실행
const promise = new Promise((resolve, reject) => { 
  // resolve: 기능을 정상적으로 수행해서 최종 data를 전달하는 callback함수
  // reject: 문제가 생기면 callback할 함수
  // doing some heavy work (network, read files) 
  // heavy한 일들(시간이 걸리는일들)은 promise를 만들어서 비동기적으로 처리하는것이 좋다
  console.log('doing something...');
  setTimeout(() => {
    resolve('ellie');
    //reject(new Error('no network')); //Error도 JS에서 제공하는 object
  }, 2000);
});

// 2. Consumers: then, catch, finally //이 세가지를 이용해서 값을 받아올 수 있다
promise //
  .then(value => { //then: success라면
    console.log(value);
  })
  .catch(error => {//이렇게 해주면 error가 발생하지않고 console log에 error표시
    console.log(error); 
  })
  .finally(() => {// 성공하든 실패하든 마지막에 무조건 호출된다
    console.log('finally');
  });

// 3. Promise chaining
const fetchNumber = new Promise((resolve, reject) => {
  setTimeout(() => resolve(1), 1000); //1초 있다가 숫자 1을 전달
});

fetchNumber
  .then(num => num * 2) //2
  .then(num => num * 3) //6
  .then(num => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(num - 1), 1000); //5
    });
  })
  .then(num => console.log(num)); //5

//then은 값을 전달해도 되고, 다른 promise를 전달할수도 있다.


// 4. Error Handling
const getHen = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve('🐓'), 1000);
  });
const getEgg = hen =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`${hen} => 🥚`), 1000));
  });
const cook = egg =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(`${egg} => 🍳`), 1000);
  });
/* 
getHen()
.then(hen => getEgg(hen))
.then(egg => cook(egg))
.then(meal => console.log(meal));
 */
//callback함수에서 받아오는 value를 다른함수로 바로 호출하는 경우에는 위를 아래처럼 생략 가능 

getHen() //
  .then(getEgg)
  .then(cook)
  .then(console.log);

//실패하는 경우에는? 위처럼 그대로 쓰면 빨간 error

getHen() //
  .then(getEgg)
  .then(cook)
  .then(console.log)
  .catch(console.log); //이렇게 쓰면 console에 error출력.

//만약 중간에 오류가 나면 다른것으로 대체하고 싶다하면?

getHen() //
  .then(getEgg)
  .catch(error => {
    return '🍞';
  }) //이렇게 error처리해주면 promise가 완성된다. 이렇게 순서에 맞게 error를 catch해줄 수 있다
  .then(cook)
  .then(console.log)
  .catch(console.log);