## Ref
creatRef()를 만들어 주고 필요한 요소에 ref로 연결한다
```
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

### 참고
[Refs and the DOM](https://reactjs.org/docs/refs-and-the-dom.html)