## Strategy예제

### 1. 전략을 생성 (선로를 따라 이동하는 버스가 개발 된 상황에서 유연한 시스템을 위한 전략패턴)
```java
public interface MovableStrategy {
    public void move();
}
//두 전략 클래스를 캡슈화하기 위한 interface
```
```java
public class RailLoadStrategy implements MovableStrategy{
    public void move(){
        System.out.println("선로를 통해 이동");
    }
}
```
```java
public class LoadStrategy implements MovableStrategy{
    public void move() {
        System.out.println("도로를 통해 이동");
    }
}
```

### 2. 운송수단에 대한 클래스
```java
public class Moving {
    private MovableStrategy movableStrategy;

    public void move(){
        movableStrategy.move();
    }

    public void setMovableStrategy(MovableStrategy movableStrategy){
        this.movableStrategy = movableStrategy;
    }
}
```
```
public class Bus extends Moving{

}
```
```
public class Train extends Moving{

}
```

### 3. Client 구현
```java
public class Client {
    public static void main(String args[]){
        Moving train = new Train();
        Moving bus = new Bus();

        /*
            기존의 기차와 버스의 이동 방식
            1) 기차 - 선로
            2) 버스 - 도로
         */
        train.setMovableStrategy(new RailLoadStrategy());
        bus.setMovableStrategy(new LoadStrategy());

        train.move();
        bus.move();

        /*
            선로를 따라 움직이는 버스가 개발
         */
        bus.setMovableStrategy(new RailLoadStrategy());
        bus.move();
    }
}
```