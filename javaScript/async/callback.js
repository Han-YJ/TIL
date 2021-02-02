'use strict';

// JavaScript is synchronous. //js는 동기적인 아이다 (in order)
// Execute the code block by orger after hoisting.
// hoisting: var, function declaration 함수나 var가 제일 위로 올라가는 것
console.log('1');
setTimeout(() => console.log('2'), 1000); 
//Asynchronous : 비동기적으로 언제 코드가 실행될지 예측할 수 없는 것
console.log('3');

//callback은 Synchronous callback과 Asynchronous callback 두가지

// Synchronous callback
function printImmediately(print) {//print라는 콜백함수를 전달받음
  print();
}// 이 선언은 hoisting되어 가장 위로
printImmediately(() => console.log('hello'));

// Asynchronous callback 비동기 callback
function printWithDelay(print, timeout) {
  setTimeout(print, timeout);
}
printWithDelay(() => console.log('async callback'), 2000);

//여기까지 실행하면 1 -> 3 -> hello -> 2 -> async callback 이렇게 출력된다

//callback함수들을 nesting하면서 콜백지옥이 열린다!
// Callback Hell example
class UserStorage {
  loginUser(id, password, onSuccess, onError) {
    setTimeout(() => {
      if (
        (id === 'ellie' && password === 'dream') ||
        (id === 'coder' && password === 'academy')
      ) {
        onSuccess(id);
      } else {
        onError(new Error('not found'));
      }
    }, 2000); //loginUser를 불러오면 2초뒤에 이 코드들이 실행된다
  }

  getRoles(user, onSuccess, onError) {
    setTimeout(() => {
      if (user === 'ellie') {
        onSuccess({ name: 'ellie', role: 'admin' });
      } else {
        onError(new Error('no access'));
      }
    }, 1000);
  }
}

const userStorage = new UserStorage();
const id = prompt('enter your id');
const password = prompt('enter your passrod');
userStorage.loginUser(
  id,
  password,
  user => {
    userStorage.getRoles(
      user,
      userWithRole => {
        alert(
          `Hello ${userWithRole.name}, you have a ${userWithRole.role} role`
        );
      },
      error => {
        console.log(error);
      }
    );
  },
  error => {
    console.log(error);
  }
);
//이런식으로 콜백 안에 콜백을 불러오면 가독성 떨어짐, 유지보수가 어렵고 디버깅하기 어려움
// => promise와 asyan await로 비동기코드를 깔끔하게 작성가능