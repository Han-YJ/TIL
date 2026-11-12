# vitest `isolate: false` 인데도 워커가 계속 새로 뜰 때 — 다음 파일의 환경이 같아야 이어 쓴다

`isolate: false` 는 테스트 파일마다 모듈 캐시와 환경을 새로 만들지 않고, 한 워커가 여러 파일을 이어서 실행하게 하는 옵션이다. 켜고 나서 CI 유닛 스텝이 26분에서 11분으로 줄었는데, 요약 줄을 보니 `environment` 누적이 여전히 컸다. 환경을 한 번만 띄워야 하는데 왜 이렇게 클까?

결론: **vitest 는 큐에서 다음에 실행할 파일의 환경이 지금 워커와 같을 때만 그 워커를 이어 쓴다.** 파일마다 docblock(`// @vitest-environment jsdom`)으로 jsdom 과 node 를 섞어 쓰면, 큐에서 환경이 바뀌는 지점마다 워커가 종료되고 새로 뜬다. 그때마다 jsdom 도, 모듈 캐시도 처음부터 다시 만든다.

(이전 단계: [유닛 테스트가 느릴 때 테스트를 지우기 전에 볼 것](./slow-tests-check-import-and-environment-first.md))

## 1. 소스에서 확인한 재사용 조건 (vitest 4.1)

워커 풀이 파일 하나를 끝낸 뒤 그 워커를 남길지 정하는 부분이다 (`dist/chunks/cli-api.*.js`).

```js
if (!task.isolate && !isMemoryLimitReached && this.queue[0]?.task.isolate === false
    && isEqualRunner(runner, this.queue[0].task)) {
  this.sharedRunners.push(runner);   // 이어 쓴다
  return this.schedule();
}
// 아니면 워커를 멈춘다
```

```js
function isEqualRunner(runner, task) {
  if (runner.worker.name !== task.worker || runner.project !== task.project) return false;
  return isEnvironmentEqual(task.context.environment, runner.environment);
}
```

판단 기준은 「남은 파일 중 같은 환경이 있는가」가 아니라 **바로 다음 파일(`queue[0]`)** 이다. 그리고 큐 순서는 기본 sequencer 가 정한다.

```js
// 1) 프로젝트 이름순  2) isolate 인 것 먼저  3) 이전 실행에서 오래 걸린 순
if (a.project.name !== b.project.name) return a.project.name < b.project.name ? -1 : 1;
...
return bState.duration - aState.duration;
```

한 프로젝트 안에서는 실행 시간 순이라 jsdom 파일과 node 파일이 뒤섞인다. 이 경우는 jsdom 473개 · node 161개였으니, 환경이 바뀌는 지점이 수백 번 생긴다.

## 2. 해결 — 환경별 프로젝트로 나눈다

정렬 1순위가 프로젝트 이름이므로, 환경별로 프로젝트를 나누면 같은 환경 파일이 큐에 연달아 선다. docblock 은 첫 줄에 있으니 config 에서 읽어 나눈다.

```ts
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const INCLUDE = ['src/**/*.test.{ts,tsx}'];
const DOM_TESTS = globSync(INCLUDE, { cwd: ROOT, exclude: ['**/node_modules/**'] }).filter((file) =>
  readFileSync(join(ROOT, file), 'utf8').startsWith('// @vitest-environment jsdom')
);

projects: [
  { extends: true, test: { name: 'dom', include: DOM_TESTS, isolate: false } },
  { extends: true, test: { name: 'node', include: INCLUDE, exclude: DOM_TESTS, isolate: false } },
],
```

로컬 `--maxWorkers=2`, 634파일 기준 **84초 → 69초**. 테스트 코드는 그대로다.

참고로 요약 줄의 `environment` 누적은 이렇게 고쳐도 거의 그대로 나온다. 워커가 환경을 띄운 시간을 그 워커가 실행한 **파일마다** 다시 더하기 때문이다. 그래서 이 숫자로는 워커가 다시 떴는지 판단할 수 없고, 벽시계 시간으로 비교해야 한다.

## 3. 덤 — 모듈 캐시도 일부는 이어 쓴다

`isolate: false` 로 바꾸면 파일 사이 누수를 막으려고 파일이 끝날 때마다 모듈 그래프를 전부 비우게 된다. 그런데 `node_modules`, 사내 디자인 시스템 패키지, 코드젠 스키마처럼 상태가 없는 모듈까지 매번 다시 평가할 필요는 없다. 다음 규칙으로 남겼다.

- 비우는 것: 앱 코드, `mock:` 모듈, 테스트가 `vi.mock` 하는 패키지(`next`, `nuqs` 등)
- 위에 해당하는 모듈을 **import 하는 모듈**도 importer 를 거슬러 올라가며 같이 비운다. 캐시에 남은 모듈이 앞 파일에서 쓴 진짜 구현을 계속 물고 있으면 안 되기 때문이다
- 「테스트가 mock 하는 패키지」 목록은 손으로 관리한다. 목록에 없는 대상을 누가 `vi.mock` 하면 그 파일이 끝날 때 실패시켜 목록에 더하게 한다

결과는 **69초 → 54초**였다. 대신 모듈 수준 상태가 있으면 다음 파일로 샌다. 실제로 툴팁 컴포넌트가 「마지막 입력이 Tab 이었나」를 모듈 변수로 기억하고 있었다. 앞 파일이 Tab 으로 끝나면, 다음 파일에서 모달이 열려 초점이 이동할 때 툴팁까지 같이 열렸다. 그 결과 ESC 가 드로어 대신 툴팁을 닫았고, 다른 파일에서는 툴팁이 `ResizeObserver` 를 찾다가 실패했다. 두 파일 모두 따로 실행하면 통과했다.

이런 누수는 **파일 순서를 섞어 실행해야** 드러난다. 그래서 확인 실행에 `--sequence.shuffle.files` 를 같이 쓴다.

## 정리

- `isolate: false` 인데 기대만큼 안 빨라지면, 한 프로젝트 안에서 docblock 환경이 섞여 있는지부터 본다. 워커는 바로 다음 파일의 환경이 같을 때만 이어 쓰인다.
- 환경별 프로젝트 분리는 테스트를 한 줄도 안 고치고 얻는 이득이다.
- 모듈 캐시를 더 이어 쓰려면 「무엇을 비울지」를 import 그래프로 정하고, 손으로 관리하는 목록은 실패로 지킨다. 결과는 파일 순서를 섞어 실행해서 확인한다.
