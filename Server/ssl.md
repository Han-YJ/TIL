# Apache 2.4 + CentOs 7 VirtualHost SSL 설정하기 (Letsencrypt, certbot webroot)

1. SSL 발급
2. httpd-ssl.conf
3. httpd.conf
4. 기타설정

## 1. SSL 발급 (webroot 방식)
```
#서브도메인 발금
# letsencrypt certonly --webroot --webroot-path=/usr/local/apache24/htdocs/test -d test.test1.com

// webroot-path : 웹 파일이 있는 곳
// -d test.test1.com : 인증서 받을 사이트 

#결과
Starting new HTTPS connection (1): acme-v02.api.letsencrypt.org
Requesting a certificate for test.test1.com
Performing the following challenges:
http-01 challenge for test.test1.com
Using the webroot path /usr/local/apache24/htdocs/test for all unmatched domains.
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/test.test1.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/test.test1.com/privkey.pem
   Your certificate will expire on 2022-10-27. To obtain a new or
   tweaked version of this certificate in the future, simply run
   certbot again. To non-interactively renew *all* of your
   certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt':   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le

[root@gcloud-seoul-~~내용~~]# /bin/certbot certificates
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  ~~내용~~
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- 받은 인증서는 /etc/letsencrypt/live/ 에 폴더별로 저장된다. 여기 있는 파일 경로를 httpd-ssl.conf 에 쓰게된다

- 90일마다 갱신 해줘야 하는데 # certbot renew --dry-run 으로 확인해 볼 수 있다. 자동갱신은 crontab에 등록 (4.기타설정 확인)
```

## 2. httpd-ssl.conf
- 아래같은 형식으로 도메인마다 추가
- 기본적으로 써져있는 것들은 건드리지 않았지만 i 설정이 오류나서 None 으로 수정 ([참고-phpschool](https://www.phpschool.com/gnuboard4/bbs/board.php?bo_table=qna_install&wr_id=74662))


```
# vi /usr/local/apache24/conf/extra/httpd-ssl.conf

#httpd-vhosts에 가상호스팅이 되어있다는 가정 하에 ssl 설정

<VirtualHost *:443>
    DocumentRoot "/usr/local/apache24/htdocs/test"
    ServerName test.test1.com
    ErrorLog "logs/main/main-error_log"
    CustomLog "logs/main/main-access_log" common

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/test.test1.com/cert.pem
    SSLCertificateChainFile /etc/letsencrypt/live/test.test1.com/chain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/test.test1.com/privkey.pem

</VirtualHost>

```

## 3. httpd.conf
```
LoadModule ssl_module modules/mod_ssl.so 주석제거
Include conf/extra/httpd-ssl.conf 아래쪽에 있는 include 주석 제거
```

## 4. 발급 내역 확인
```
/bin/certbot certificates
```

## 5. 기타설정
- 443 포트 설정 (iptables)
```
# iptables -A INPUT -p tcp -m tcp --sport 80 -j ACCEPT
# iptables -A OUTPUT -p tcp -m tcp --dport 80 -j ACCEPT 

# systemctl restart iptables
# systemctl restart httpd

// listen중인 포트 표시
# netstat -nap | grep LISTEN

```

- crontab 자동 갱신
certbot renew --dry-run 으로 renew 잘 되는지 확인 후 crontab에 등록
```
편집
# crontab -e

0 6 1 * * usr/bin/certbot renew --renew-hook="sudo systemctl restart httpd"
=> 매월 1일 6시에 renew and restart httpd
:wq 으로 저장 후 종료 

확인
# crontab -l
```

- https로 redirect
Directory 설정한 httpd.conf 에서 rewrite 추가

```
<Directory "/usr/local/apache24/htdocs/test">
AllowOverride None
Require all granted

#Rewrite 설정
RewriteEngine On

#https로 redirect
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

#react route 관련
RewriteCon %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
</Directory>
```

- 인증서 발급 삭제
```
- 인증서 목록을 선택하여 삭제하는 방식
certbot delete 

```


### 참고
- certbot docs https://eff-certbot.readthedocs.io/en/stable/using.html#apache
- certbot webroot 예제 https://hoing.io/archives/1073
- iptables https://jiniweb.tistory.com/86
- httpd.conf, ssl.conf 예제 https://satmeet.tistory.com/entry/%EC%BD%94%EB%AA%A8%EB%8F%84-SSL-%EB%A9%80%ED%8B%B0-%EB%8F%84%EB%A9%94%EC%9D%B8%EC%9D%84-%EB%B0%9C%EA%B8%89%ED%9B%84-sslconf-%EC%84%A4%EC%A0%95

### issue 💥
- https 로 들어갈때 다른 서브도메인으로 연결됨
  - 시간 약간 지나니까 제대로 연결됨

- mod_ssl install 
 - 처음에 구조를 잘 모르고 설치해야된다는 것만 보고 설치했다가 아파치 설정이 다 바뀌어서 고생만 잔뜩했다. 찾아보니 source로 설치했을때 이미 module을 설치했었다. yum으로 설치했던거 다시 지워서 해결

- Error creating new order :: too many failed authorizations recently: see https://letsencrypt.org/docs/failed-validation-limit/
 유효하지 않은 요청을 여러번 했을 경우 뜨는 오류. 약 한시간 뒤에 재시도 하면 된다. 
 테스트가 필요한 경우 뒤에 --dry-run 을 붙여 발급이 유효한지 테스트 먼저 할 것!



<!-- 도메인 변경, ssl 적용 -->
1. serverName 바꾸기
vi httpd-vhosts.conf 
vi httpd-ssl.conf

systemctl restart httpd

이 상태로도 http로는 접근가능

2. 도메인 추가x 재발급o - 인증서 path 바뀜

3. httpd-ssl.conf certifications 경로 수정해야함






