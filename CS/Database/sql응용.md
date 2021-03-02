# SQL 문법

## 분류
- DDL : 정의어. 테이블이나 관계의 구조를 생서하는 데 사용 (CREATE, ALTER, DROP)
- DML : 조작어. 테이블에 데이터를 검색, 삽입, 수정, 삭제 하는데 사용(SELECT, INSERT, DELETE, UPDATE)
  - SELECT문은 Query라고 부름
- DCL : 제어어. 데이터의 사용권한을 관리 (GRANT, REVOKE)

### WHERE 조건
비교, 범위, 집합, 패턴, NULL, 복합 조건
- 비교 : =, <>, <, >, <=, >=
- 범위 : BETWEEN
- 집합 : IN , NOT IN
- 패턴 : LIKE 
  - '+' : 문자열 연결
  - % : 0개 이상의 문자열과 일치. NAME LIKE '김%' (NAME이 김으로 시작되는 문자열)
  - [] : 1개의 문자와 일치
  - [ ^ ] : 1개의 문자와 불일치. '[^0-8]%' (0-8사이 숫자로 시작하지 않는 문자열)
  - '_' : 특정 위치의 1개의 문자와 일치. '_김%' (두 번째 위치에 '김'이 들어가는 문자열)
- NULL : INS NULL, IS NOT NULL
- 복합조건 : AND, OR, NOT

### SQL HINT
- 실행하려는 SQL 문에 사전 정보를 줘서 SQL실행에 빠른 결과를 가져오는 효과
- 주석에 '+' 기호를 쓰면 힌트로 인식