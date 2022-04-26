# 기본
- MySQL 접속
```
# mysql -u root -p
```

## User
### 유저 확인하기
```shell
MariaDB [none] > use mysql;
MariaDB [mysql] > select user, host from user;

+---------+-----------+
| user    | host      |
+---------+-----------+
| root    | 127.0.0.1 |
| root    | ::1       |
|         | localhost |
| pma     | localhost |
| root    | localhost |
+---------+-----------+
```

### 유저 만들기, 권한 주기
```shell

- 만들기
mysql > CREATE user '유저이름'@locahost identified by '비밀번호';

localhost가 아닌 외부접속 허용하고 싶을 때?
mysql > CREATE user '유저이름'@% identified by '비밀번호';
-> %는 모두 접속 허용

mysql > CREATE user '유저이름'@'192.111.1.%' identified by '비밀번호';
-> 192.111.1.% 번 대에 허용

만든 이후 ? [외부접속](#외부-접속-허용)

- 권한 주기
mysql > GRANT ALL PRIVILEGES ON 'DB이름'.* '유저이름'@localhost indentified by '비밀번호';

--권한 확인
mysql > SHOW GRANT for '유저이름'@localhost;

```

### DB 확인하기
```shell
MariaDB [mysql] > show databases;

+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| phpmyadmin         |
| test               |
+--------------------+

```


### 외부 접속 허용
- user에게 외부 접속 허용하기
```shell
MariaDB [mysql]> grant all privileges on *.* to '유저이름'@'192.~.~.~' identified by '유저패스워드';
MariaDB [mysql]> flush privileges;
MariaDB [mysql]> select user, host from user;

+---------+-------------+
| user    | host        |
+---------+-------------+
| root    | 127.0.0.1   |
| 유저이름 | 192.~.~  .% |
| root    | ::1         |
|         | localhost   |
| pma     | localhost   |
| root    | localhost   |
| 유저이름 | localhost   |
+---------+-------------+

```
### 참고
- https://jiwontip.tistory.com/62


  
---
  
### Workbench로 외부 접속하기
Stanard (TCP/IP) 로 연결이 되지 않을 때 (Unable to connect localhost)
-> Standatd TCP/IP over SSH 로 연결

### 참고
- https://sectumsempra.tistory.com/80

