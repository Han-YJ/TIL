# flex

## flex-wrap
flex-item 요소들이 강제로 한줄에 배치되게 할 것인지, 또는 가능한 영역 내에서 벗어나지 않고 여러행으로 나누어 표현 할 것인지 결정하는 속성

- nowrap  
기본 설정값으로, flex-container 부모요소 영역을 벗어나더라도 flex-item 요소들을 한 줄에 배치합니다. 시작점은 flex-direction 에 의해 결정된 방향으로 적용
- wrap  
flex-item 요소들이 내부 로직에 의해 분할되어 여러 행에 걸쳐서 배치됩니다. nowrap 속성과 마찬가지로 요소가 배치되는 시작점은 flex-direction 에 의해 결정. 일반적으로 위에서 아래로 쌓이는 순서
- wrap-reverse  
wrap 속성값과 동일하지만, 요소가 나열되는 시작점과 끝점의 기준이 반대로 배치

## flex (flex-grow, flex-shrink, flex-basis)  
lex-grow, flex-shrink, flex-basis를 한 번에 쓸 수 있는 축약형 속성 
- flex-basis  
Flex 아이템의 기본 크기를 설정(flex-direction이 row일 때는 너비, column일 때는 높이)  
- flex-grow  
아이템이 flex-basis의 값보다 커질 수 있는지를 결정하는 속성. 기본은 0(item이 늘어나지 않는다)
- flex-shrink  
flex-grow와 쌍을 이루는 속성으로, 아이템이 flex-basis의 값보다 작아질 수 있는지를 결정. 기본은 1(따로 세팅하지 않아도 아이템이 flex-basis보다 작아질 수 있다)  

```
flex: 1 1 50%;
//width가 100%일 때 2개까지 들어가는 2단컬럼
flex: 1 1 30%;
//3개까지 들어가는 3단 컬럼
```