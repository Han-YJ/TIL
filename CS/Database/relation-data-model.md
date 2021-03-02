## Relation Data Model (관계 데이터 모델)
데이터를 행과 열로 구성된 테이블 형태로 구성된 데이터 모델  
  
### 구성
- Relation : Row와 Column으로 구성된 테이블
- Tuple : Relation의 행(row)
- Attribute : Relation의 열(Column)
- Cardinality : Tuple의 수
- Degree : Attribute의 수
- Schema : Relation이 어떻게 구성되는지, 어떤 정보를 담고 있는지에 대한 기본적인 구조
- Instance : 정의된 스키마에 따라 생성된 테이블에 실제 저장된 데이터의 집합

## 관계 데이터 언어
### 관계 대수
관계 데이터베이스에서 원하는 정보와 그 정보를 어떻게 유도하는가를 기술하는 절차적 정형언어
- 종류
  - 일반 집합 연산자
    - Union(합집합) : R ∪ S
    - Intersection(교집합) : R ∩ S
    - Difference(차집합) : R － S
    - Cartesian Product : R × S 모든 튜플을 연결해 만들어진 새로운 튜플로 구성 
      - 결과 relation의 D는 차수의 합, C는 카디널리티의 곱
  - 순수 관계 연산자
    - Select : 조건을 만족하는 튜플 반환
    - Project : 주어진 속성들의 값으로 구성
    - Join : 공통속성을 이용
    - Division : R ÷ S  S의 모든 튜플과 관련있는 R의 튜플 반환

### 관계 해석
- 프레디킷 해석(Predicate Calculus)에 기반한 언어, 비절차적 언어
- 무엇을 얻을 것인가(What)만 선언