## Lifecycle
### Lifecycle Method
```
  componentDidMount() {
    console.log(`habit: ${this.props.habit.name} mounted`);
  }
  //habit: Leaning mounted
  //추가후에 호출

  componentWillUnmount(){
    console.log(`habit: ${this.props.habit.name} will unmount`);
  }
  //habit: Leaning will unmount
  //삭제 되기 전에 호출

  //loading img나 timer등 사용가능
```