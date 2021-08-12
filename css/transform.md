# Transform

## translate
- 창의 왼쪽위가 (0,0)
- 오른쪽으로 갈수록 x 값 증가, 아래쪽으로 갈수록 y 값 증가 (y가 -value이면 위쪽으로 이동)
```
transform: translateX(100px);
transform: translateY(20px)
transform: translate(100px, -20px);
```

## scale
- 크기 조정
```
transform: scale(1.2); //1.2배 커짐
```

## rotate
- 회전
```
transform: rotate(45deg);
```
## 한번에 묶어서 쓰기
```
transform: translate(100px, 100px) scale(2) rotate(46deg);
```

## border blur issue
- 작은것을 크게 키웠을때 border가 블러같이 보이는 문제
- 크기보다 작게 transform 지정한 후 hover등에 scale(1)로 지정

### 참고
- [MDN transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)