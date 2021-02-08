class Counter {
  constructor(renEveryFiveTimes) {
    this.counter = 0;
    this.callback = renEveryFiveTimes; 
  }

  increase() {
    this.counter++;
    console.log(this.counter);
    if(this.counter % 5 ===0) {
      this.callback && this.callback(this.counter);
    }
  }
}

function printSomething(num) {
  console.log(`yo! ${num}`);
}

const coolCounter = new Counter(printSomething); //원하는 함수를 넣어주면 그 함수가 실행
// const coolCounter = new Counter(); 이렇게 실행하면 callback이 undefined이 되어 typeerror 오류

coolCounter.increase();
coolCounter.increase();
coolCounter.increase();
coolCounter.increase();
coolCounter.increase();