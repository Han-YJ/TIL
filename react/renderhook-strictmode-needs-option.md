# StrictMode 재마운트 버그는 `renderHook` 의 `reactStrictMode` 옵션으로 재현한다

dev 에서만 나는 버그였다. 훅이 언마운트 정리(cleanup)에서 서버 자원을 지우는데, StrictMode 의 mount → cleanup → mount 때문에 방금 만든 자원이 지워졌다.

- `wrapper` 로 `<StrictMode>` 를 감싼 `renderHook` 으로는 재현되지 않았다.
- `renderHook(cb, { reactStrictMode: true })` 로 바꾸니 재현됐다.
- 자원을 만드는 호출은 테스트 본문이 아니라 훅 안의 `useEffect` 에서 해야 한다. 그래야 그 effect 가 실행된 뒤 cleanup 이 이어지는 순서가 실제와 같아진다.

수정은 cleanup 의 삭제를 `setTimeout(0)` 로 미루고, 다시 마운트되면 `clearTimeout` 으로 취소하는 것이었다. 실제 언마운트에서는 그대로 지워진다.

prod 빌드는 effect 를 두 번 실행하지 않는다. 그래서 이 수정은 dev 동작만 바꾼다. 배포 환경에서도 같은 증상이 나면 원인이 따로 있다.

확인 환경: React 19.2 · @testing-library/react 16.3
