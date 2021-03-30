## array to object

배열을 object로 만들어서 성능 향상하기!

```
const [cards, setCards] = useState([
    {
			id: '1',
			name: 'aaa',
			company: 'AAA',
			theme: 'colorful',
			title: 'First',
			email: 'aaa@gmail.com',
			message: 'go for it',
			fileName: 'aaa',
			fileURL: null,
		},
]);

//위의 배열을 아래처럼 object로 바꾸면 key: value로 접근 가능
//map이나 for loop같은 것이 필요x
const [cards, setCards] = useState({
    '1': {
			id: '1',
			name: 'aaa',
			company: 'AAA',
			theme: 'colorful',
			title: 'First',
			email: 'aaa@gmail.com',
			message: 'go for it',
			fileName: 'aaa',
			fileURL: null,
		},
  });
```

- update function

```
const updateCard = (card) => {
    const updated = {...cards};
    updated[card.id] = card;
    setCards(updated);
  }
```

🔹state를 update 할 때 기존의 state가 예전 것일 수도 있다 그렇다면 어떻게?

```javascript
const updateCard = (card) => {
    const updated = {...cards};//이 때의 cards는 이전 것일 수도 있다
    updated[card.id] = card;
    setCards(updated);
  }

//set함수는 이전의 값을 받아서 새로운 값으로 바꾸는 콜백함수로도 이용 가능하다
//SetStateAction<S> = S | ((prevState: S) => S);

//적용해보면

const updateCard = (card) => {
    setCards(cards => {
      const updated = {...cards};
      updated[card.id] = card;); //key를 이용해서 card를 변경
      return updated;
    });
  }
```
