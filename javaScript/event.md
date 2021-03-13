## 이벤트 등록
- 웹 애플리케이션에서 사용자의 입력을 받기 위해 필요한 기능

## 이벤트 버블링
특정 요소에서 이벤트가 발생했을 때 해당 이벤트의 상위요소들로 전달되는 특성

## 이벤트 캡쳐
이벤트 버블링과 반대 방향으로 진행되는 이벤트 전파 방식

## event.stopPropagation()
해당 이벤트가 전파되는 것을 막는 웹 api

## 이벤트 위임 - Event Delegation
하위 요소에 각각 이벤트를 붙이지 않고 상위 요소에서 하위요소의 이벤트들을 제어하는 방식
```HTML
<h1>오늘의 할 일</h1>
<ul class="itemList">
	<li>
		<input type="checkbox" id="item1">
		<label for="item1">이벤트 버블링 학습</label>
	</li>
	<li>
		<input type="checkbox" id="item2">
		<label for="item2">이벤트 캡쳐 학습</label>
	</li>
</ul>
```
```JS
// 새 리스트 아이템을 추가하는 코드
var itemList = document.querySelector('.itemList');

var li = document.createElement('li');
var input = document.createElement('input');
var label = document.createElement('label');
var labelText = document.createTextNode('이벤트 위임 학습');

input.setAttribute('type', 'checkbox');
input.setAttribute('id', 'item3');
label.setAttribute('for', 'item3');
label.appendChild(labelText);
li.appendChild(input);
li.appendChild(label);
itemList.appendChild(li);

// var inputs = document.querySelectorAll('input');
// inputs.forEach(function(input) {
// 	input.addEventListener('click', function() {
// 		alert('clicked');
// 	});
// }); 새로 추가되는 input에 대해서는 이벤트 x

var itemList = document.querySelector('.itemList');
itemList.addEventListener('click', function(event) {
	alert('clicked');
});
//input에 eventListener를 추가하는 대신 상위요소인 ul에 이벤트리스너를 달아놓고
//하위에서 발생한 클릭 이벤트를 감지
```

## 참조
- [이벤트 버블링, 이벤트 캡처 그리고 이벤트 위임까지](https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/#%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EC%9C%84%EC%9E%84---event-delegation)