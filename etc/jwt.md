## JWT
- JSON Web Token
- 정보를 json데이터 구조로 표현한 토큰
- header, payload, signature 세 파트로 나뉜다
- 회원 인증, 정보 교류에 사용


### encoded, decoded
- encoded
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

- decoded
HEADER: ALGORITHM & TOKEN TYPE
```
{
  "alg": "HS256",
  "typ": "JWT"
}
```

PAYLOAD: DATA
```
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

VERIFY SIGNATURE
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  your-256-bit-secret
) 
```



### 참고
- [jwt 공식](https://jwt.io/)
- 