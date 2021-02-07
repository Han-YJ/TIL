/* 
* 변수를 선언하는 방법
 var를 사용할때는 한번에 선언했지만 요즘은 변수선언이 한눈에 보이도록 한 줄에 하나씩 작성.

* String template
 +사용하지 말고 `` backtic 을 사용하기 

* Array
 - 배열을 만들고 다른 배열을 재할당 할 것이 아니라면 let보다는 const사용.
 
 - 배열을 만들고 다시 그 배열에 data를 넣지말고 만들면서 바로 넣으면 된다
 const array = [
   new Clothes("t", "small", "pink", "female"),
   new Clothes("s", "small", "yellow", "female")
 ]
 이런식으로 바로 넣으면 가독성 up

* 중복된 code 없애기! (DRY : Dont Repeat Yourself)
 - 함수에 더 의미를 줄 수 있음
 - 가독성 up 

* Early Exit 
 if (!target) {
   return;
 }
 //해당하는게 없으면 바로 return 해주기


* Consistency
 querySelector 썼으면 id, class 모두 써주기
 변수이름도 일관성이 있게

* Function naming
 기능과 같은 이름을 붙여야 한다. 

* UI를 담당하는 부분과 기능을 담당하는 부분을 나누어서 작성하는것이 중요! 

*/