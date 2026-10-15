# onScroll 로 「사용자가 스크롤했다」 를 판정하면 프로그램 스크롤에도 닫힌다

드롭다운 목록 옆에 하위 패널을 띄우는 메뉴가 있었다. 패널은 목록 바깥에 절대 위치로 붙어 있어서, 목록이 스크롤되면 위치가 어긋난다. 그래서 목록의 `onScroll` 에서 패널을 닫았다.

동시에 키보드·포인터로 활성 행이 바뀌면 그 행을 목록 안으로 맞추는 효과도 있었다.

```ts
useEffect(() => {
  document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
}, [activeId]);
```

## 증상

행 오른쪽의 하위 패널 열기 화살표(›)를 누르면 하위 패널이 섰다가 바로 사라졌다. dev 서버에서는 통과하고 프로덕션 빌드에서만 매번 실패했다.

## 좁힌 방법

프로덕션 빌드 페이지에 이벤트 리스너와 `MutationObserver` 를 붙여 순서를 찍었다 (Chromium).

```
pointerdown → click → 패널 노드 추가 → scroll (목록, scrollTop 0) → 패널 노드 제거
```

- 목록은 맨 위(`scrollTop` 0)였고 첫 행을 눌렀다. 화면상 아무것도 움직이지 않았다.
- 그런데도 목록에서 `scroll` 이벤트가 한 번 났고, `onScroll` 이 막 열린 패널을 닫았다.
- 이 시점에 목록을 스크롤시키는 코드는 활성 행의 `scrollIntoView` 하나뿐이었다.

dev 에서 통과한 건 렌더 타이밍 차이로 보인다. 이벤트가 패널이 열리기 전에 처리되면 닫을 패널이 없다.

## 교훈

`scroll` 이벤트는 「사용자가 스크롤했다」 는 뜻이 아니다. 위치가 실제로 바뀌지 않아도, 프로그램이 스크롤을 일으켜도 온다.

사용자의 스크롤 의도에 반응해야 하는 동작(팝오버 닫기, 자동 따라가기 해제 등)은 의도를 직접 내는 이벤트로 받는다.

```tsx
<ul
  onWheel={() => closePanel()}
  onTouchMove={() => closePanel()}
>
```

프로그램 스크롤 때문에 위치를 다시 잡아야 한다면, 닫지 말고 스크롤을 먼저 한 뒤 좌표를 잰다.

```ts
row.scrollIntoView({ block: 'nearest' });
openPanelAt(row.getBoundingClientRect());
```

키보드 스크롤(PageDown 등)까지 사용자 의도로 받아야 하는 목록이면 `keydown` 도 같은 자리에 둔다.

## 테스트

jsdom 에는 레이아웃이 없어 이 타이밍은 재현되지 않는다. 대신 「`scroll` 이벤트만으로는 닫히지 않고 `wheel` 로는 닫힌다」 를 단위 테스트로 고정했다. 수정 전 코드에서 실패하는 것을 확인했다.
