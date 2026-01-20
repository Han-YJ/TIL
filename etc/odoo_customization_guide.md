# Odoo 커스터마이징 가이드

Odoo 개발 시 알아야 할 핵심 개념과 패턴을 정리한 문서입니다.

## 📚 목차

1. [Odoo 뷰 상속 시스템](#odoo-뷰-상속-시스템)
2. [XPath와 Position](#xpath와-position)
3. [모델 상속 방법](#모델-상속-방법)
4. [필드 타입](#필드-타입)
5. [보안과 접근 권한](#보안과-접근-권한)
6. [모듈 구조](#모듈-구조)
7. [자주 하는 실수](#자주-하는-실수)

---

## Odoo 뷰 상속 시스템

### 핵심 개념

Odoo는 기존 뷰를 **직접 수정하지 않고 상속해서 확장**합니다.

```
기본 뷰 (예: base.view_partner_form)
    ↓ inherit_id로 연결
커스텀 뷰 (확장/수정)
    ↓ XPath로 위치 지정
    ↓ position으로 동작 지정
최종 렌더링된 뷰
```

### 뷰 상속 예시

```xml
<record id="view_partner_form_inherit_custom" model="ir.ui.view">
    <field name="name">res.partner.form.inherit.custom</field>
    <field name="model">res.partner</field>
    <field name="inherit_id" ref="base.view_partner_form" />
    <field name="arch" type="xml">
        <!-- 여기에 수정 사항 작성 -->
        <xpath expr="//div[@name='button_box']" position="attributes">
            <attribute name="invisible">is_company</attribute>
        </xpath>
    </field>
</record>
```

### XML vs XPath vs Odoo

| 기술 | 타입 | 설명 |
|------|------|------|
| **XML** | 표준 | 데이터를 표현하는 마크업 언어 |
| **XPath** | 표준 | XML 문서에서 노드를 찾는 쿼리 언어 |
| **Odoo 뷰 상속** | Odoo 전용 | XPath + position + 특수 태그로 뷰 확장 |

---

## XPath와 Position

### XPath 기본 문법

```xml
<!-- name 속성이 'button_box'인 div 찾기 -->
<xpath expr="//div[@name='button_box']" position="...">

<!-- 'website' 필드 찾기 -->
<xpath expr="//field[@name='website']" position="...">

<!-- 'internal_notes' name을 가진 page 찾기 -->
<xpath expr="//page[@name='internal_notes']" position="...">

<!-- class가 'd-flex'를 포함하는 div 찾기 -->
<xpath expr="//div[hasclass('d-flex')]" position="...">
```

### Position 종류

| position | 설명 | 예시 |
|----------|------|------|
| `attributes` | 속성 추가/변경 | `invisible` 속성 추가 |
| `inside` | 자식 노드로 추가 (끝에) | `<notebook>` 안에 새 탭 추가 |
| `after` | 다음 형제로 추가 | 필드 뒤에 새 필드 추가 |
| `before` | 이전 형제로 추가 | 필드 앞에 새 필드 추가 |
| `replace` | 완전히 교체 | 기존 내용 삭제하고 새로 작성 |

### Position 예시

#### 1. attributes - 속성 변경

```xml
<!-- 원본 -->
<field name="phone" />

<!-- 상속 -->
<xpath expr="//field[@name='phone']" position="attributes">
    <attribute name="required">1</attribute>
    <attribute name="placeholder">전화번호를 입력하세요</attribute>
</xpath>

<!-- 결과 -->
<field name="phone" required="1" placeholder="전화번호를 입력하세요" />
```

#### 2. inside - 자식 추가

```xml
<!-- 원본 -->
<notebook>
    <page string="기존탭">...</page>
</notebook>

<!-- 상속 -->
<xpath expr="//notebook" position="inside">
    <page string="새탭">
        <field name="custom_field" />
    </page>
</xpath>

<!-- 결과 -->
<notebook>
    <page string="기존탭">...</page>
    <page string="새탭">
        <field name="custom_field" />
    </page>
</notebook>
```

#### 3. after - 다음에 추가

```xml
<!-- 원본 -->
<field name="phone" />
<field name="email" />

<!-- 상속 -->
<xpath expr="//field[@name='phone']" position="after">
    <field name="mobile" />
</xpath>

<!-- 결과 -->
<field name="phone" />
<field name="mobile" />
<field name="email" />
```

#### 4. before - 이전에 추가

```xml
<!-- 원본 -->
<field name="phone" />
<field name="email" />

<!-- 상속 -->
<xpath expr="//field[@name='email']" position="before">
    <field name="mobile" />
</xpath>

<!-- 결과 -->
<field name="phone" />
<field name="mobile" />
<field name="email" />
```

#### 5. replace - 완전 교체

```xml
<!-- 원본 -->
<field name="phone" />

<!-- 상속 -->
<xpath expr="//field[@name='phone']" position="replace">
    <field name="phone" string="연락처" required="1" />
</xpath>

<!-- 결과 -->
<field name="phone" string="연락처" required="1" />
```

### Odoo 전용 태그

#### `<attribute>` 태그

**용도**: 속성 추가/변경 (position="attributes"와 함께 사용)

```xml
<xpath expr="..." position="attributes">
    <attribute name="invisible">is_company</attribute>
    <attribute name="required">1</attribute>
    <attribute name="readonly">1</attribute>
</xpath>
```

**속성 제거**: 빈 값으로 설정

```xml
<attribute name="required"></attribute>
```

---

## 모델 상속 방법

Odoo에서는 3가지 모델 상속 방법이 있습니다.

### 1. Classical Inheritance (클래식 상속)

**설명**: 기존 모델에 필드/메서드를 추가 (가장 많이 사용)

```python
from odoo import models, fields

class ResPartner(models.Model):
    _inherit = 'res.partner'  # 상속할 모델
    
    # 새 필드 추가
    custom_field = fields.Char(string='커스텀 필드')
    
    # 메서드 오버라이드
    def write(self, vals):
        # 커스텀 로직
        return super().write(vals)
```

**특징**:
- 원본 테이블에 필드 추가
- 기존 메서드 오버라이드 가능
- 가장 일반적인 방법

### 2. Extension (확장)

**설명**: 새 모델 생성 + 기존 모델 상속

```python
class CustomModel(models.Model):
    _name = 'custom.model'        # 새 모델명
    _inherit = 'res.partner'       # 상속할 모델
    
    extra_field = fields.Char('추가 필드')
```

**특징**:
- 새로운 테이블 생성
- 거의 사용하지 않음

### 3. Delegation Inheritance (위임 상속)

**설명**: 다른 모델의 필드를 자동으로 포함

```python
class ResUsers(models.Model):
    _name = 'res.users'
    _inherits = {
        'res.partner': 'partner_id'  # res.partner의 모든 필드 사용
    }
    
    partner_id = fields.Many2one('res.partner', required=True)
    login = fields.Char(required=True)
```

**특징**:
- 별도 테이블 유지
- 부모 모델의 필드를 자동으로 접근
- 예: `res.users`가 `res.partner`를 상속

---

## 필드 타입

### 기본 필드

```python
from odoo import models, fields

class CustomModel(models.Model):
    _name = 'custom.model'
    
    # 문자열
    name = fields.Char(string='이름', required=True)
    
    # 텍스트 (여러 줄)
    description = fields.Text(string='설명')
    
    # 정수
    quantity = fields.Integer(string='수량', default=0)
    
    # 실수
    price = fields.Float(string='가격', digits=(16, 2))
    
    # 불린
    is_active = fields.Boolean(string='활성', default=True)
    
    # 날짜
    date = fields.Date(string='날짜')
    
    # 날짜+시간
    datetime = fields.Datetime(string='일시')
    
    # 선택 (드롭다운)
    state = fields.Selection([
        ('draft', '초안'),
        ('done', '완료'),
    ], string='상태', default='draft')
    
    # HTML
    notes = fields.Html(string='노트')
```

### 관계 필드

```python
class CustomModel(models.Model):
    _name = 'custom.model'
    
    # Many2one (다대일)
    partner_id = fields.Many2one(
        'res.partner',
        string='파트너',
        required=True,
        ondelete='cascade'  # 부모 삭제 시 같이 삭제
    )
    
    # One2many (일대다)
    line_ids = fields.One2many(
        'custom.model.line',  # 연결 모델
        'parent_id',           # 연결 모델의 Many2one 필드명
        string='라인'
    )
    
    # Many2many (다대다)
    tag_ids = fields.Many2many(
        'custom.tag',
        string='태그'
    )
```

### Computed 필드

```python
from odoo import api

class CustomModel(models.Model):
    _name = 'custom.model'
    
    price = fields.Float('가격')
    quantity = fields.Integer('수량')
    
    # 계산 필드
    total = fields.Float(
        string='합계',
        compute='_compute_total',
        store=True  # DB에 저장 (선택)
    )
    
    @api.depends('price', 'quantity')  # 의존 필드
    def _compute_total(self):
        for record in self:
            record.total = record.price * record.quantity
```

### Related 필드

```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'
    
    partner_id = fields.Many2one('res.partner')
    
    # partner_id의 phone 필드를 직접 접근
    partner_phone = fields.Char(
        related='partner_id.phone',
        string='파트너 연락처',
        readonly=True,
        store=True  # 검색/정렬하려면 True
    )
```

---

## 보안과 접근 권한

### ir.model.access.csv

**위치**: `security/ir.model.access.csv`

**형식**:
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_custom_model_user,custom.model.user,model_custom_model,base.group_user,1,1,1,1
access_custom_model_public,custom.model.public,model_custom_model,,1,0,0,0
```

**컬럼 설명**:
- `id`: 고유 ID
- `name`: 설명
- `model_id:id`: 모델 ID (model_모델명)
- `group_id:id`: 그룹 (비어있으면 공개)
- `perm_read`: 읽기 권한 (1=허용, 0=거부)
- `perm_write`: 쓰기 권한
- `perm_create`: 생성 권한
- `perm_unlink`: 삭제 권한

### 주요 그룹

```python
base.group_user           # 일반 사용자
base.group_system         # 시스템 관리자
base.group_public         # 공개 (로그인 안 함)
sales_team.group_sale_salesman  # 영업 사용자
account.group_account_invoice   # 회계 사용자
```

### XML에서 그룹 사용

```xml
<!-- 버튼에 그룹 적용 -->
<button name="action_confirm" groups="sales_team.group_sale_salesman">
    확인
</button>

<!-- 필드에 그룹 적용 -->
<field name="internal_note" groups="base.group_system" />

<!-- 페이지 전체에 그룹 적용 -->
<page string="관리" groups="base.group_system">
    ...
</page>
```

---

## 모듈 구조

### 기본 디렉토리 구조

```
my_module/
├── __init__.py              # Python 패키지 초기화
├── __manifest__.py          # 모듈 선언 파일
├── models/
│   ├── __init__.py
│   └── my_model.py          # 모델 정의
├── views/
│   ├── my_model_views.xml   # 뷰 정의
│   └── menus.xml            # 메뉴/액션
├── security/
│   └── ir.model.access.csv  # 접근 권한
├── data/
│   └── initial_data.xml     # 초기 데이터
├── static/
│   ├── src/
│   │   ├── css/
│   │   ├── js/
│   │   └── xml/
│   └── description/
│       └── icon.png         # 모듈 아이콘
└── README.md (또는 DOCS.md)
```

### __manifest__.py

```python
{
    'name': '모듈 이름',
    'version': '1.0',
    'category': 'Customizations',
    'author': '작성자',
    'license': 'LGPL-3',
    'summary': '간단한 설명',
    'description': """
        자세한 설명
    """,
    'depends': [
        'base',           # 필수
        'contacts',       # 의존 모듈
        'sale',
    ],
    'data': [
        # 순서 중요! 보안 파일 먼저
        'security/ir.model.access.csv',
        'views/my_model_views.xml',
        'views/menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'my_module/static/src/css/custom.css',
            'my_module/static/src/js/custom.js',
        ],
    },
    'installable': True,
    'application': False,  # True면 별도 앱으로 표시
    'auto_install': False,
}
```

### models/__init__.py

```python
from . import my_model
from . import another_model
```

### __init__.py (루트)

```python
from . import models
```

---

## 자주 하는 실수

### 1. README.md 경고

**문제**: README.md에 백틱(`)을 쓰면 docutils 경고 발생

**원인**: Odoo가 Markdown을 reStructuredText 파서로 읽음

**해결**:
```bash
# 파일명을 변경하면 Odoo가 무시함
mv README.md DOCS.md
```

그리고 `__manifest__.py`에 `description` 추가:
```python
{
    'description': """
    모듈 설명을 여기에
    """,
}
```

### 2. 모듈 업그레이드 안 됨

**문제**: Python 코드 변경 후 반영 안 됨

**해결**:
```bash
# 모듈 업그레이드
docker exec -it odoo-web-1 odoo -u module_name -d odoo --stop-after-init

# 또는 서버 재시작
docker-compose restart web
```

### 3. 접근 권한 오류

**문제**: "레코드에 접근할 수 없습니다" 오류

**원인**: `security/ir.model.access.csv` 없음

**해결**: 접근 권한 파일 추가하고 `__manifest__.py`에 등록

### 4. XPath 찾지 못함

**문제**: `xpath` 표현식이 작동 안 함

**해결**:
```xml
<!-- 나쁜 예: 클래스로 찾기 -->
<xpath expr="//div[@class='d-flex']" position="...">

<!-- 좋은 예: hasclass 함수 사용 -->
<xpath expr="//div[hasclass('d-flex')]" position="...">

<!-- 더 좋은 예: name 속성 사용 -->
<xpath expr="//div[@name='button_box']" position="...">
```

### 5. !important 남용

**문제**: CSS에서 `!important` 과도 사용

**해결**: 구체적인 선택자 사용
```css
/* 나쁜 예 */
.my-class {
    color: red !important;
}

/* 좋은 예 */
div.o_form_view .my-class {
    color: red;
}
```

### 6. 불필요한 메서드 작성

**문제**: Odoo 기본 기능을 모르고 재작성

**해결**: 커스텀 작업 전에 항상 확인
```bash
# Odoo 기본 기능 검색
grep -r "메서드명" odoo/addons/
```

### 7. 잘못된 depends

**문제**: 필드가 변경되어도 computed 필드가 재계산 안 됨

**해결**: `@api.depends` 데코레이터 정확히 사용
```python
# 나쁜 예
@api.depends('partner_id')
def _compute_total(self):
    # partner_id.phone 사용
    
# 좋은 예
@api.depends('partner_id.phone')  # 관계 필드의 하위 필드도 명시
def _compute_total(self):
    # partner_id.phone 사용
```

---

## 유용한 팁

### 1. 개발자 모드 활성화

URL에 `?debug=1` 추가 또는 설정에서 활성화

**장점**:
- 필드명/모델명 확인 가능
- 뷰 편집 버튼 표시
- 기술 메뉴 접근

### 2. 로그 확인

```bash
# 실시간 로그
docker logs -f odoo-web-1

# 특정 레벨만
docker logs odoo-web-1 | grep WARNING
```

### 3. 데이터베이스 초기화

```bash
# 주의: 모든 데이터 삭제됨!
docker-compose down -v
docker-compose up -d
```

### 4. Python 디버깅

```python
import logging
_logger = logging.getLogger(__name__)

def my_method(self):
    _logger.info("여기 실행됨: %s", self.name)
    _logger.warning("경고 메시지")
    _logger.error("에러 발생")
```

### 5. XML ID 찾기

```bash
# 모델명으로 검색
grep -r "model_res_partner" odoo/addons/

# 액션명으로 검색
grep -r "action_partner" odoo/addons/
```

---

## 참고 자료

- [Odoo 공식 문서](https://www.odoo.com/documentation/19.0/)
- [Odoo GitHub](https://github.com/odoo/odoo)
- XPath 튜토리얼: [w3schools](https://www.w3schools.com/xml/xpath_intro.asp)

---

**작성일**: 2026-01-19  
**Odoo 버전**: 19.0
