# Computed property name

## 속성 접근
```javascript
const object = {
  foo:"bar",
  age: 42,
  baz: {myProp: 12},
}

//접근
object.foo; //"bar"
object["age"]; //42
object.foo = "baz";
```

## 계산된 속성명(Computed property name)
```javascript
var param = 'size';
var config = {
  [param]: 12,
  ["mobile" + param.charAt(0).toUpperCase() + param.slice(1)]: 4
};

console.log(config); // { size: 12, mobileSize: 4 }
```

## 전개 속성(spread)
Object.assign()보다 짧은 문법으로 얕은 복제나 객체 합침이 가능(prototype제외)
```javascript
let obj1 = { foo: 'bar', x: 42 }
let obj2 = { foo: 'baz', y: 13 }

let clonedObj = { ...obj1 }
// Object { foo: "bar", x: 42 }

let mergedObj = { ...obj1, ...obj2 }
// Object { foo: "baz", x: 42, y: 13 }
```

## 프로토타입 변이
__proto__: value 또는 "__proto__": value 형태의 속성 정의는 이름이 __proto__인 속성을 만들지 않는다. 대신, 제공된 값이 객체 또는 null이면, 생성된 객체의 [[Prototype]]을 그 값으로 변경(값이 객체나 null이 아니면, 객체는 바뀌지 x)
```
var obj1 = {};
assert(Object.getPrototypeOf(obj1) === Object.prototype);

var obj2 = { __proto__: null };
assert(Object.getPrototypeOf(obj2) === null);

var protoObj = {};
var obj3 = { "__proto__": protoObj };
assert(Object.getPrototypeOf(obj3) === protoObj);

var obj4 = { __proto__: "not an object or null" };
assert(Object.getPrototypeOf(obj4) === Object.prototype);
assert(!obj4.hasOwnProperty("__proto__"));
```

### Computed property name을 통한 state변경
```javascript
const onChange = (event) => {
    if(event.currentTarget ==null) {//변하는 것이 없다면 
      return;
    }
    //변하는 것이 있다면
    event.preventDefault();
    updateCard({//기존 card를 복사한 후 event Target의 value 변경
      ...card,
      [event.currentTarget.name]: event.currentTarget.value,
    });
	};
```

