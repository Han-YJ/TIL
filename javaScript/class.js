'use strict';

//class 안에는 fields와 method.
//class안에 fileds만 있고 method가 없는경우는 data class라고 부른다.
//캡슐화 다형성 상속

//class : class자체에는 data가 없고 틀만 있다. 이런이런 타입의 데이터들이 있다~(붕어빵틀. template)
//이런 class에 data를 넣으면 object가 된다.(피자붕어빵)

//javascript에 class가 도입된것은 ES6부터. 기존에 존재하던 prototype-based ingeritance

// 1. Class declarations
class Person {
  // constructor
  constructor(name, age) {
    // fields
    this.name = name;
    this.age = age;
  }

  // methods
  speak() {
    console.log(`${this.name}: hello!`);
  }
}

const ellie = new Person('ellie', 20);
console.log(ellie.name);
console.log(ellie.age);
ellie.speak();



// 2. Getter and setters
class User {
  constructor(firstName, lastName, age) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
  }

  get age() {
    return this._age; //_age 이런식으로 써도 가능
  }

  set age(value) {
    // if (value < 0) {
    //   throw Error('age can not be negative');
    // }
    this._age = value < 0 ? 0 : value;
  }
}

const user1 = new User('Steve', 'Job', -1); 
//사용자가 잘못사용(age를 -1로 입력하는등)하더라도 조금 방어적으로 만들 수 있게 해주는것이 getter와 setter
console.log(user1.age);


// 3. Fields (public, private)
// Too soon! 많이 최근에 추가된 것
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields
class Experiment {
  publicField = 2; //생성자를 쓰지않고 이렇게 정의할 수 있는데 그냥 쓰면 public
  #privateField = 0; //#기호를쓰면 private filed로 정의된다. 클래스 외부에서는 값을 읽을수도 변경할수도 x
}
const experiment = new Experiment();
console.log(experiment.publicField);
console.log(experiment.privateField);

//firefox에서도 지원이 안되기 때문에 쓰기엔 이르다. (2020.4 기준)


// 4. Static properties and methods
// Too soon! 이것도 쓰기에는 무리가 있음
class Article {
  static publisher = 'Dream Coding';
  constructor(articleNumber) {
    this.articleNumber = articleNumber;
  }

  static printPublisher() {
    console.log(Article.publisher);
  }
}

const article1 = new Article(1);
const article2 = new Article(2);
console.log(article1.publisher);
//static을 사용했다면 Dream Coding이 출력됨 하지만 안나옴. 
//static을 사용하면 object마다 할당되는것이 아니라 class자체에 할당
console.log(Article.publisher);
Article.printPublisher();
//=>이렇게 class자체를 사용하면 된다

//object에 상관없이 공통적으로 쓸 수 있는거라면 이렇게 쓰는것이 성능면에서 좋다.


// 5. Inheritance 상속
// a way for one class to extend another class.
class Shape {
  constructor(width, height, color) {
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    console.log(`drawing ${this.color} color!`);
  }

  getArea() {
    return this.width * this.height;
  }
}

class Rectangle extends Shape {}
class Triangle extends Shape {
  draw() {
    super.draw(); //상속받은것도 호출할 수 있다.
    console.log('🔺'); // overiding
  }
  getArea() {
    return (this.width * this.height) / 2; //다형성. 필요한 함수들만 overiding해서 작성하는것.
  }

  toString() {
    return `Triangle: color: ${this.color}`;
  }
}

const rectangle = new Rectangle(20, 20, 'blue');
rectangle.draw();
console.log(rectangle.getArea());

const triangle = new Triangle(20, 20, 'red');
triangle.draw();
console.log(triangle.getArea());


// 6. Class checking: instanceOf  //왼쪽의 object가 오른쪽 class를 이용해서 만들어진건지 아닌지 확
console.log(rectangle instanceof Rectangle); //t
console.log(triangle instanceof Rectangle); //f
console.log(triangle instanceof Triangle); //t
console.log(triangle instanceof Shape);  //t
console.log(triangle instanceof Object); //t. 모든 object는 javascript의 object를 상속받은것.
console.log(triangle.toString());

let obj = { value: 5 };
function change(value) {
  value.value = 7;
}
change(obj);
console.log(obj);



//JavaScript MDN