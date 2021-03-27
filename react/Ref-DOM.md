## Ref
creatRef()를 만들어 주고 필요한 요소에 ref로 연결한다(form, input, select ...)  
React Hook은 useRef() 사용

- Class
```javascript
class HabitAddForm extends Component {
  inputRef = React.createRef();

  onSubmit = event => {
    event.preventDefault();
    console.log(this.inputRef.current.value);
  }
  render() {
    return (
      <form className="add-form" onSubmit={this.onSubmit}>
        <input ref={this.inputRef} type="text" className="add-input" placeholder="Habit"></input>
        <button className="add-button">Add</button>
      </form>
    );
  }
}
```

- Hook
```javascript
const CardAddForm = ({onAdd}) => {
  const formRef = useRef();
  const nameRef = useRef();
  const companyRef = useRef();
  const themeRef = useRef();

  const onSubmit = event => {
    event.preventDefault();
    const card = {
      id: Date.now(),//uuid
      name: nameRef.current.value || '',
      company: companyRef.current.value || '',
      theme: themeRef.current.value,
    }
    formRef.current.reset();
    onAdd(card)
  }
  return (
    <form ref={formRef}>
      <input ref={nameRef} type="text" name="name" placeholder="Name">
      <input ref={companyRef} type="text" name="company" placeholder="Company">
      <select ref={themeRef} className={styles.select} name="theme">
				<option selected value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="colorful">Colorful</option>
      </select>
      <Button name="Add" onClick={onSubmit}></Button>
    </form>
  )
}
```

### 참고
- [Refs and the DOM](https://reactjs.org/docs/refs-and-the-dom.html)
- [Hook API 참고서](https://ko.reactjs.org/docs/hooks-reference.html)
