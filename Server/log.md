# 로그 파일 관리
- vhosts or ssl 사용중 일 때(httpd-vhosts.conf or httpd-ssl.conf)
```
<VirtualHost *:443>
    DocumentRoot "/usr/local/apache24/htdocs/test"
    ServerName test.test.com
    #ErrorLog "logs/main/main-error_log"
    ErrorLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-error-log_%Y%m%d 86400"
    CustomLog "|/usr/local/apache24/bin/rotatelogs logs/main/main-access-log_%Y%m%d 86400" common

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/test.test.com/cert.pem
    SSLCertificateChainFile /etc/letsencrypt/live/test.test.com/chain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/test.test.com/privkey.pem

    <Directory "/usr/local/apache24/cgi-bin">
        SSLOptions +StdEnvVars
    </Directory>

</VirtualHost>
```

- rotatelogs : 로그파일 분할관리