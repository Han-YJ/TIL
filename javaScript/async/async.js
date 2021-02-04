// async & await
// clear style of using promise :)

// async와 await은 promise를 좀 더 간결하고 동기적으로 실행되는 것처럼 보이게 만들어준다
// async와 await처럼 기존에 존재하는 것 위에 써주거나 감싸서 사용하는 것을 syntactic sugar라고 한다(ex)class)
// 무조건 사용해야하는것은 아니다. promise를 써야 할때도 있음


/* function fetchUser() {
  // do network reqeust in 10 secs.... 백엔드에서 10초정도 걸려서 data를 받아오는 함수가 있다고 가정
  return 'ellie';
} */
//이런식으로 써주면 JS는 동기적(한줄이 끝나야 다음줄을 실행)으로 코드를 실행하기 때문에 10초를 기다려서 
//다음 코드를 실행하게 된다. 오래걸리는 코드들은 비동기적으로 처리해줘야함

//promise를 사용하면
/* function fetchUser(){
  return new Promise((resolve, reject) => {
    // do network reqeust in 10 secs.... 
    resolve('ellie');
  });
} */

//더 간편하게 async를 사용할 수 있다. async를 붙여주면 자동으로 promise로 바뀐다 => syntactic sugar
// 1. async
async function fetchUser() {
  // do network reqeust in 10 secs.... 백엔드에서 10초정도 걸려서 data를 받아오는 함수가 있다고 가정
  return 'ellie';
}

const user = fetchUser();
user.then(console.log);
console.log(user);



// 2. await ✨
// async가 붙은 함수 안에서만 사용가능
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getApple() {
  await delay(2000); 
  return '🍎';
}//delay가 끝날때까지 기다렸다가 사과를 return

async function getBanana() {
  await delay(1000);
  return '🍌';
}

/* function pickFruits2() {
  return getApple()
  .then(apple => {
    return getBanana()
    .then(banana => `${apple} + ${banana}`)
  })
} 
//promise도 너무 중첩되면 콜백지옥처럼 만들어진다 => await이용
*/

async function pickFruits() {
  const applePromise = getApple();
  const bananaPromise = getBanana(); 
  //이렇게 사과와 바나나 프로미스를 만들게 되면 바로 실행이 되기 때문에 병렬로 실행가능
  const apple = await applePromise;
  const banana = await bananaPromise;
  return `${apple} + ${banana}`;
}
//error처리는 try catch문으로

pickFruits().then(console.log);

//동시다발적으로 필요한 경우 위처럼 지저분하게 쓰지않고 아래처럼 All이라는 API사용
// 3. useful APIs ✨
function pickAllFruits() {
  return Promise.all([getApple(), getBanana()]).then(fruits =>
    fruits.join(' + ')
  );
}
pickAllFruits().then(console.log);
//all이라는 api를 사용해서 프로미스들을 배열로 전달하게 되면 모든 promise들이 병렬적으로 
//모두 받아질때까지 기다린다

function pickOnlyOne() {
  return Promise.race([getApple(), getBanana()]);
}

pickOnlyOne().then(console.log);
//race: 배열의 promise 중 가장 빠른게 전달된것만 return

class UserStorage {
  async loginUser(id, password) {
    await delay(1000);
      if (
        (id === 'ellie' && password === 'dream') ||
        (id === 'coder' && password === 'academy')
      ) {
        return id;
      } else {
        return new Error('not found');
      }
    };
  
  async getRoles(user) {
    await delay(1000);
      if (user === 'ellie') {
        return { name: 'ellie', role: 'admin' };
      } else {
        return new Error('no access');
      }
   };    
 }

const userStorage = new UserStorage();
const id = prompt('enter your id');
const password = prompt('enter your passrod');

async function loginCheck(){
  const loginUserInfo = await userStorage.loginUser(id, password);
  const userRole = await userStorage.getRoles(loginUserInfo);
  return `Hello ${loginUserInfo}, you have a ${userRole.role} role`;
};

loginCheck().then(console.log);
