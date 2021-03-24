# JPA
- Java Persistence API
- JAVA ORM 기술에 대한 표준 명세로 JAVA에서 제공하는 api (not Spring)
- JAVA Class와 DB의 TAble을 mapping

## JPA 동작 과정
Java application -> JPA -> JDBC API(jpa가 실행) -> DB -> 결과반환

## ORM
- Object Relation Mapping
- DB 테이블을 자바 객체와 매핑 => SQL을 자동으로 생성 => Object와 RDB 간의 패러다임 불일치 해결
- JPA, Hibernate

---

## 영속성 (Persistence)
- 데이터를 생성한 프로그램이 종료되어도 사라지지 않는 데이터의 특성
- 파일이나 DB에 영구 저장함으로써 데이터에 영속성을 부여한다
- 데이터 접근 계층(Data access layer) : 영속계층이라고도 한다(Persistence layer)

## JPA에서의 영속성
- 엔티티가 영속성 컨텍스트에 포함되어 있는지에 따라 갈린다
  - 엔티티 매니저가 활성화된 상태로 트랜잭션 안에서 DB에서 데이터를 가져오면 이 데이터는 영속성 컨텍스트가 유지된 상태
  - 이 상태에서 해당 데이터 값을 변경하면 트랜잭션이 끝나는 시점에 해당 테이블에 변경 내용을 반영하게 된다
  - 따라서 엔티티 객체의 필드 값만 변경해주면 별도로 UPDATE QUERY를 날릴 필요가 없게 된다(더티체킹)
- 영속 컨텍스트
  - 엔티티를 담고 있는 집합
  - JPA는 영속 컨텍스트에 속한 엔티티를 DB에 반영한다
  - 엔티티를 검색, 삭제, 추가 하게 되면 영속 컨텍스트의 내용이 DB에 반영된다
  - 영속 컨텍스트는 직접 접근이 불가능하고 Entity Manager를 통해서만 접근이 가능하다

### 참고
- [JPA는 도대체 뭘까?](https://velog.io/@adam2/JPA%EB%8A%94-%EB%8F%84%EB%8D%B0%EC%B2%B4-%EB%AD%98%EA%B9%8C-orm-%EC%98%81%EC%86%8D%EC%84%B1-hibernate-spring-data-jpa)
- [Spring Data JPA와 QueryDSL의 이해](https://ict-nroo.tistory.com/117)



