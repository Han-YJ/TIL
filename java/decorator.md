## Decorator
음료(component)와 첨가물(decorator) 조합을 decorator 패턴으로
```
// 음료
abstract class Beverage {
    String description = "제목 없음";

    public String getDescription() { return description; }
    public abstract double cost();

    @Override
    public String toString() {
        return getDescription() + ": $" + cost();
    }
}

// 첨가물
abstract class CondimentDecorator extends Beverage {
    public abstract String getDescription();
}
```
베이스가 되는 두가지 음료
```
class Espresso extends Beverage {
    public Espresso() { description = "에스프레소"; }

    @Override
    public double cost() { return 1.99; }
}

class HouseBlend extends Beverage {
    public HouseBlend() { description = "하우스 블렌드 커피"; }

    @Override
    public double cost() { return 0.89; }
}
```
첨가물 - 모카
```
class Mocha extends CondimentDecorator {
    Beverage beverage;

    public Mocha(Beverage beverage) {
        description = "모카";
        this.beverage = beverage;
    }

    @Override
    public double cost() {
        // 중요한 부분
        return 0.20 + beverage.cost();
    }

    @Override
    public String getDescription() {
        // 중요한 부분
        return beverage.getDescription() + ", " + description;
    }
}
```

### 사용
```
Beverage beverage = new Espresso();
System.out.println(beverage);

beverage = new Mocha(beverage);
System.out.println(beverage);

Beverage beverage2 = new HouseBlend();
System.out.println(beverage2);

beverage2 = new Mocha(beverage2);
System.out.println(beverage2);
```
### 결과
```java
//에스프레소: $1.99
//에스프레소, 모카: $2.19
//하우스 블렌드 커피: $0.89
//하우스 블렌드 커피, 모카: $1.09
```


### 참조
- [데코레이터 패턴](https://johngrib.github.io/wiki/decorator-pattern/)