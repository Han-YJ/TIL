# Transition
- anmation을 smooth하게 만들 수 있다
```
transition-property: background-color;
transition-duration: 300ms;
transition-timing-function: linear;

//축약해서
transition: background-color 300ms linear;
```
## timing-function
- linear : 일정한 속도로 변화
- ease-in-out: smooth -> linear -> smooth
- ease-in: 시작만 smooth
- cubic-bezier(p1, p2, p3, p4) : author defined curve

### 참고
- [MDN Transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)
- [MDN Animation-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function)
- [cubic-bezier](https://cubic-bezier.com/#.17,.67,.83,.67)