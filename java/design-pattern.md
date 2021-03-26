# Design Pattern
좋은 코드를 설계하기 위한 일종의 설계 디자인 방법론

## 좋은 코드란?
- 객체지향적 관점에서 객체 간 응집도는 크게, 결합도는 낮게
- 유지보수가 쉽게

## 종류
- 생성패턴 (Singleton, Factory Methods, Abstract Factory Methods, Builder, Prototype)
- 구조패턴 (Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy)
- 행동패턴 (Strategy, Template Methods, Observer, State, Visitor, Command, Interpreter, Iterator, Mediator, Memento, Chain of Responsibility)

## Singleton
- 하나의 인스턴스를 만들어서 사용하는 패턴
- 어떤 클래스가 최초 한번만 메로리를 할당(Static)하고, 그 메모리에 객체를 만들어 사용
- getInstance() 를 사용해 해당 인스턴스를 얻을 수 있다
```java
public class ExampleClass {
    //Instance
    private static ExampleClass instance = new ExampleClass();

    //private construct
    private ExampleClass() {}

    public static ExampleClass getInstance() {
        return instance;
    }
}
```
- 한 번의 객체 생성으로 재상용해 메모리 낭비 방지
- 전역성으로 다른 객체와 공유 용이
- 단점
  - 해당 싱글톤 객체를 사용하는 다른 객체간의 결함도가 높아진다
  - 수정할 경우 싱글톤 객체를 사용하는 곳에서 사이드 이팩트 발생 확률
  - 멀티 쓰레드 환경에서 동기화 처리 문제


## Strategy 
- 클라이언트가 전략을 생성해 전략을 실행할 콘텐스트에 주입하는 패턴
- 객체들이 할 수 있는 행위 각각에 대해 전략 클래스를 생성하고, 유사한 행뒤들을 캡슐화하는 인터페이스를 정의하여,  
객체의 행위를 동적으로 바꾸고 싶은 경우 직접 행위를 수정하지 않고 전략을 교체하기만 해서 행위를 유연하게 확장하는 방법
- 즉, 객체가 할 수 있는 행위를 각각 전략으로 만들어놓고, 동적으로 행위의 수정이 필요한 경우 전략을 바꾸는 것만으로 행위를 수정
- [Strategy예제](strategy.md)

## Decorator
- 메서드 호출의 반환 값에 변화를 주기 위해 중간 장식자를 추가하는 패턴
- 객체에 추가적인 요건을 동적으로 첨가. 서브클래스를 만들어 기능을 유연하게 확장할 수 있는 방법
- [Decorator예제](decorator.md)

## Proxy
- 어떤 객체에 대한 접근을 제어하기 위한 용도로 대리인에 해당하는 객체를 제공
- 데코레이터 패턴과 구현방법이 유사한데, 프록시 패턴은 실제 객체에 대한 접근을 제어하는것에 초점이 맞춰져있는 반면,  
데코레이터 패턴은 기존 객체의 기능을 확장하는데 초점을 맞춘다

## Template method
> 상속을 통해 슈퍼클래스의 기능을 확장할 때 사용하는 가장 대표적인 방법
> 변하지 않는 기능은 슈퍼클래스에 만들어두고 자주 변경되며 확장할 기능은 서브클래스에서 만들도록 한다(토비의 스프링3.1)
- [Template-Method예제](template-method.md)

## Template Callback
- 전략패턴과 유사한데, 전략 패턴의 기본 구현 방법에 콜백(익명 클래스)를 사용하는 방식
- DI에서 사용하는 패턴

  
### 참조
- [디자인패턴-8가지 패턴](https://brunch.co.kr/@springboot/31)
- [다양한 싱글톤의 구현](https://elfinlas.github.io/2019/09/23/java-singleton/)
- [전략 패턴(Strategy Pattern)](https://victorydntmd.tistory.com/292)
- [데코레이터 패턴](https://johngrib.github.io/wiki/decorator-pattern/)
- [템플릿 메소드 패턴](https://yaboong.github.io/design-pattern/2018/09/27/template-method-pattern/)