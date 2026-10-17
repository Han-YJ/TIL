# exceljs 로 엑셀을 "보이는 그대로" 그릴 때의 함정 — `cell.text` 는 표시 문자열이 아니다

브라우저는 xlsx 를 직접 그리지 못해서, 웹에서 엑셀 미리보기를 만들려면 exceljs 같은 라이브러리로 파일을 읽어 표로 다시 그려야 한다. 이때 "셀에 보이는 글자" 를 얻는 방법이 생각보다 까다롭다.

## 1. `cell.text` 는 숫자 서식(numFmt)을 적용하지 않는다

이름만 보면 Excel 화면에 보이는 문자열 같지만, 실제로는 값의 `toString()` 에 가깝다.

| 셀 값 · 서식 | Excel 화면 | `cell.text` |
|---|---|---|
| 1234567 · `#,##0` | `1,234,567` | `1234567` |
| 0.15 · `0%` | `15%` | `0.15` |
| 날짜 · `yyyy-mm-dd` | `2026-10-17` | `Sat Oct 17 2026 09:00:00 GMT+0900 (...)` |

표시 문자열은 서식 엔진으로 따로 만든다. SheetJS 의 서식 엔진 `ssf` 를 단독으로 쓸 수 있다.

```ts
import { format } from 'ssf';

const value = cell.type === ValueType.Formula ? cell.result : cell.value;
if (typeof value === 'number') return format(cell.numFmt ?? 'General', value);
// exceljs 는 날짜를 1900 체계 일련값의 UTC Date 로 준다
if (value instanceof Date) return format(cell.numFmt, value.getTime() / 86_400_000 + 25_569);
return cell.text;
```

함정 하나 더: 내장 날짜 서식(numFmtId 14)은 exceljs 가 `mm-dd-yy` 로 넘긴다. Excel 은 이 서식을 OS 지역 설정대로 보여 준다(한국어판은 `2026-10-17`). 그대로 넘기면 `10-17-26` 이 찍히니, 대상 지역 표기로 바꿔 줘야 한다.

## 2. 저장된 열 너비에는 여백이 이미 들어 있다

`<col width>` 값은 "문자 수" 지만 좌우 여백이 포함된 값이다(UI 의 20 은 파일에 20.7109375 로 저장됨). 흔히 보이는 `width * 7 + 5` 는 여백을 두 번 더해 열마다 5px 씩 넓어진다. 열이 50개면 250px 이 쌓이고, 셀 위에 앵커된 이미지 위치도 같이 밀린다.

```ts
// 기본 글꼴의 최대 숫자 폭 7px 기준
const px = Math.trunc(((256 * width + Math.trunc(128 / 7)) / 256) * 7);
// 20.7109375 → 145px · 기본값 9.140625 → 64px
```

## 3. 읽기만 할 거라면 `getRow`/`getCell` 대신 `findRow`/`findCell`

`getRow(n)`·`getCell(c)` 는 없는 행·셀을 새로 만든다. 사용 범위를 순회하며 읽기만 할 때는 `findRow`/`findCell` 로 메모리 증가를 막는다. 사용 범위도 `rowCount` 를 그대로 믿지 말고, 값·테두리·채우기가 실제로 있는 마지막 행·열로 다시 잡는 편이 낫다. 서식만 걸린 빈 행도 `rowCount` 에 들어간다.
