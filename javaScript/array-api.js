'use strict'

// Q1. make a string out of an array //join : array를 string으로
{
  const fruits = ['apple', 'banana', 'orange'];
  const result = fruits.join();
  console.log(result); //apple,banana,orange

  const result2 = fruits.join(' and ');
  console.log(result2); //apple and banana and orange
}

// Q2. make an array out of a string //split 구분자와 limit을 전달받는다. limit을 2로하면 사과와 키위만 전달
{
  const fruits = '🍎, 🥝, 🍌, 🍒';
  const result = fruits.split(',');
  console.log(result);
}

// Q3. make this array look like this: [5, 4, 3, 2, 1] //reverse()  배열안의 요소를 거꾸로 만들어준다.
{
  const array = [1, 2, 3, 4, 5];
  const result = array.reverse(); 
  console.log(result); //[5,4,3,2,1]
  console.log(result); //[5,4,3,2,1]
  // reverse는 원래의 배열도 거꾸로 만들어주므로 주의해서 사용.
}

// Q4. make new array without the first two elements 
{
  const array = [1, 2, 3, 4, 5];
  const result = array.slice(2,5); //마지막 index는 제외되므로 4로하면 안됨
  console.log(result);
  console.log(array); //원본 그대로


  //splice는 배열의 특정 부분을 삭제시킨다. 원 배열 자체에서 삭제되고 삭제된 것을 return.
  //slice는 원배열은 그대로 두고 특정배열을 복사해온다.
}

class Student {
  constructor(name, age, enrolled, score) {
    this.name = name;
    this.age = age;
    this.enrolled = enrolled;
    this.score = score;
  }
}
const students = [
  new Student('A', 29, true, 45),
  new Student('B', 28, false, 80),
  new Student('C', 30, true, 90),
  new Student('D', 40, false, 66),
  new Student('E', 18, true, 88),
];

// Q5. find a student with the score 90 //find함수는 callback함수(boolean type)를 전달하고 조건에 맞는 요소가 있으면 즉시 함수를 멈추고 return
{
  /* const result = students.find(function(student, index){
    console.log(student, index); //5명 모두 호출
    return student.score === 90;
  })
 */
  //위에꺼를 아래처럼 바꾸기 함수가 한줄일 경우

  const result = students.find((student) => student.score === 90); //arrow function!!
  console.log(result);
  
}

// Q6. make an array of enrolled students //true인 학생만 찾기 //filter사용
{
  const result = students.filter((student) => student.enrolled === true);
  console.log(result);
}

// Q7. make an array containing only the students' scores //map : 배열안에 있는 요소 한가지 한가지를 다른 요소로 변환
// result should be: [45, 80, 90, 66, 88]
{
  const result = students.map((student) => student.score); //학생들을 받아서 학생들의 점수로 대체
  console.log(result);
  const result2 = students.map((student) => student.score * 2); //점수를 두배로 하고싶을때는 이렇게
}

// Q8. check if there is a student with the score lower than 50 //some() 있는지 없는지 확인
{
  const result = students.some((student) => student.score < 50);
  console.log(result); //true

  const result2 = students.every((student) => student.score < 50); //every() 모든 요소가 조건에 맞는지
  console.log(result2); //false
}

// Q9. compute students' average score  //reduce() callback함수 or initial value를 전달하고 accumulated result를 return
//reduce는 return값을 정해줘야 undefined가 나오지 않는다
{
  const result = students.reduce((prev, curr) => {
    console.log('-------');
    console.log(prev);
    console.log(curr);
    return curr; //return하는 값들이 순차적으로 prev에 전달
  });
  //console.log(result);

  const result2 = students.reduce((prev, curr) => {
    console.log(prev);
    console.log(curr);
    return prev + curr.score; //이 값이 다름prev가 된다
  }, 0); //initial value를 0으로 놓고 다음값을 score로 설정. 마지막값이 전체 합산이 됨

  //이걸 다시 써보면
  const result3 = students.reduce((prev, curr) => prev+curr.score, 0);
  console.log(result3 / students.length);

  //reduceRight은 뒤에서부터 거꾸로 수행
}

// Q10. make a string containing all the scores
// result should be: '45, 80, 90, 66, 88'
{
  const result = students.map((student) => student.score)
  .filter(score => score >=50) //이런식으로 묶어서 작성 가능
  .join();
  console.log(result);
}

// Bonus! do Q10 sorted in ascending order
// result should be: '45, 66, 80, 88, 90'
{
  const result = students.map((student) => student.score)
  .sort((a, b) => a - b) //오름차순
  .join();
  console.log(result);

  const result2 = students.map((student) => student.score)
  .sort((a, b) => b - a) //내림차순
  .join();
  console.log(result2);
}