# Design Guide

B2B SaaS·iPaaS 콘솔 화면을 위한 **saas-interface-kit** 디자인 방향성과 반복 패턴 정리 문서입니다.
토큰의 단일 출처는 `packages/tailwind-config/shared-styles.css`이며, 컴포넌트 구현은 `@repo/ui` 패키지를 따릅니다.

상세한 라이브 예시·Do/Don't는 docs 앱(`http://localhost:3000`)과 Storybook(`http://localhost:6006`)을 함께 참고하세요.

| 문서                    | 경로                  |
| ----------------------- | --------------------- |
| 파운데이션(토큰 스와치) | `/docs/foundations`   |
| 디자인 시스템 원칙      | `/docs/design-system` |
| 조합 패턴 레시피        | `/docs/patterns`      |
| 컴포넌트 레퍼런스       | `/docs/components`    |

---

## 1. 디자인 방향성

### 목표

- **B2B SaaS 대시보드** — 데이터 밀도가 높은 관리 화면, 설정, 알림, 감사 로그
- **iPaaS 콘솔** — 통합(Connector), 워크플로 편집, 실행(Run) 모니터링
- **다크 우선(dark-first)** — 기본 테마는 어두운 분석·운영 콘솔 톤; 라이트 모드는 opt-in
- **토큰 기반 일관성** — 페이지마다 임의 색·간격을 쓰지 않고 시맨틱 토큰과 `@repo/ui` variant로 의미를 표현

### 핵심 원칙

1. `className`은 **레이아웃 확장** 용도로만 사용한다. 토큰(색·테두리·그림자)을 페이지에서 재정의하지 않는다.
2. **`variant` = 의미(역할)**, **`size` = 밀도(시각적 계층)**.
3. disabled, role, aria 등 **접근성 기본값은 컴포넌트 내부**에서 보장한다.
4. 새 컴포넌트는 **Storybook + docs**를 동시에 업데이트한다.

### 스타일링 아키텍처

```text
packages/tailwind-config/shared-styles.css   ← @theme 토큰 (단일 출처)
        ↓
packages/ui/src/styles.css                   ← Tailwind + prefix(ui)
        ↓
apps/web, apps/storybook                     ← @repo/ui/styles.css import
```

| 레이어              | Tailwind 접두사 | 용도                                     |
| ------------------- | --------------- | ---------------------------------------- |
| `@repo/ui` 컴포넌트 | `ui:`           | 시맨틱 토큰 (`ui:bg-surface-raised` 등)  |
| 앱 페이지 크롬      | 접두사 없음     | `max-w-5xl`, `mx-auto`, 마케팅 히어로 등 |

`cn()` (`packages/ui/src/cn.ts`)은 `clsx` + `tailwind-merge`로 클래스 병합에 사용합니다.

---

## 2. 컬러 시스템

### 2.1 시맨틱 피드백

| 토큰               | 값 (다크) | 용도                            |
| ------------------ | --------- | ------------------------------- |
| `semantic-brand`   | `#2a8af6` | 주요 CTA, 포커스 링, 활성 탭    |
| `semantic-info`    | `#2a8af6` | 정보 알림 (brand와 동일)        |
| `semantic-success` | `#22c55e` | 성공, 온라인, 상승 추세         |
| `semantic-warning` | `#a853ba` | 경고, 진행 중, 성능 저하        |
| `semantic-danger`  | `#e92a67` | 오류, 삭제, 오프라인, 하락 추세 |

피드백 박스 틴트 패턴 (Alert, AlertBanner 등):

```text
ui:border-semantic-{variant}/30 ui:bg-semantic-{variant}/10 ui:text-semantic-{variant}
```

### 2.2 서피스 (다크 기본)

| 토큰              | 값        | 용도                   |
| ----------------- | --------- | ---------------------- |
| `surface-canvas`  | `#030712` | 페이지 배경, AppShell  |
| `surface-raised`  | `#171717` | 카드, 패널, 입력 필드  |
| `surface-muted`   | `#262626` | 호버, 비활성, 스켈레톤 |
| `surface-overlay` | `#404040` | 아바타 배경 등         |

### 2.3 텍스트

| 토큰             | 값 (다크) | 용도                         |
| ---------------- | --------- | ---------------------------- |
| `text-primary`   | `#fafafa` | 제목, 본문 강조              |
| `text-secondary` | `#a3a3a3` | 설명, 테이블 헤더            |
| `text-muted`     | `#737373` | 메타, 그룹 라벨, placeholder |
| `text-on-brand`  | `#ffffff` | 브랜드/위험 버튼 위 텍스트   |

#### 타이포 계층 예시

- 페이지 제목: `ui:text-2xl ui:font-bold ui:tracking-tight ui:text-text-primary`
- 카드 제목: `ui:text-lg ui:font-semibold ui:leading-ui-tight`
- 설명: `ui:text-sm ui:text-text-secondary`
- KPI·테이블 라벨: `ui:text-xs ui:font-semibold ui:uppercase ui:tracking-wide ui:text-text-secondary`

### 2.4 테두리

| 토큰             | 값 (다크) |
| ---------------- | --------- |
| `border-subtle`  | `#262626` |
| `border-default` | `#404040` |
| `border-strong`  | `#525252` |

카드·패널 기본: `ui:border ui:border-border-subtle`

### 2.5 라이트 모드

`<html class="light">` 또는 `data-theme="light"` 시 `shared-styles.css`에서 서피스·텍스트·테두리·그림자를 오버라이드합니다.

| 토큰             | 값 (라이트) |
| ---------------- | ----------- |
| `surface-canvas` | `#f8fafc`   |
| `surface-raised` | `#ffffff`   |
| `text-primary`   | `#0f172a`   |
| `border-default` | `#e2e8f0`   |

토글: `apps/web/components/theme-toggle.tsx` (localStorage 키: `saas-interface-kit-theme`)

### 2.6 레거시 팔레트

`blue-1000`, `purple-1000`, `red-1000` — 앱 레벨 마케팅·docs용. **신규 `@repo/ui` 컴포넌트에서는 사용하지 않습니다.**

---

## 3. 타이포그래피

- **폰트**: web 앱은 [Geist](https://vercel.com/font) (`apps/web/app/layout.tsx`의 `next/font/google`)
- **UI 키트**: 별도 폰트 토큰 없음 — 앱 폰트 상속

### 스케일 (`@theme`)

| 토큰           | 크기            |
| -------------- | --------------- |
| `text-ui-xs`   | 0.75rem (12px)  |
| `text-ui-sm`   | 0.875rem (14px) |
| `text-ui-base` | 1rem            |
| `text-ui-lg`   | 1.125rem        |
| `text-ui-xl`   | 1.25rem         |
| `text-ui-2xl`  | 1.5rem          |

실제 컴포넌트에서는 `ui:text-xs` ~ `ui:text-3xl` Tailwind 유틸을 주로 사용합니다.

### 행간·굵기

| 토큰                 | 값    |
| -------------------- | ----- |
| `leading-ui-tight`   | 1.25  |
| `leading-ui-normal`  | 1.5   |
| `leading-ui-relaxed` | 1.625 |

| 용도      | 클래스                                           |
| --------- | ------------------------------------------------ |
| 라벨      | `ui:font-medium`                                 |
| 버튼·배지 | `ui:font-semibold`                               |
| 섹션 라벨 | `ui:font-semibold ui:uppercase ui:tracking-wide` |
| KPI 수치  | `ui:text-2xl ui:font-semibold ui:tabular-nums`   |

---

## 4. 간격·크기

### 4px 그리드

`spacing-ui-0` ~ `spacing-ui-16` (0 → 4rem). 조합 토큰:

- `spacing-ui-stack` = 1rem — 세로 스택
- `spacing-ui-section` = 2.5rem — 섹션 간격

### 컨트롤 높이 (`ComponentSize`)

| size | 높이      | 대상                  |
| ---- | --------- | --------------------- |
| `sm` | `ui:h-8`  | Button, Input, Select |
| `md` | `ui:h-10` | 기본                  |
| `lg` | `ui:h-11` | 강조 CTA              |

### 반복 간격 패턴

| 패턴           | 클래스                                   |
| -------------- | ---------------------------------------- |
| 카드 헤더 패딩 | `ui:px-5 ui:pt-5`                        |
| 카드 본문·푸터 | `ui:px-5 ui:py-4`                        |
| 필드 스택      | `ui:flex ui:flex-col ui:gap-1.5`         |
| 툴바·칩        | `ui:gap-2` / `ui:gap-3`                  |
| 사이드바       | `ui:p-3`, 항목 `ui:px-2 ui:py-2`         |
| 콘솔 페이지    | `ui:px-4 ui:py-10 sm:ui:px-6 lg:ui:px-8` |

### 페이지 최대 너비 (web)

| 너비             | 용도                         |
| ---------------- | ---------------------------- |
| `max-w-5xl`      | 대부분 콘솔 페이지, 대시보드 |
| `max-w-6xl`      | Run 상세                     |
| `max-w-[1400px]` | 워크플로 편집기              |
| `max-w-3xl`      | 설정                         |

---

## 5. 모서리·그림자·모션

### Radius

| 토큰           | 값   | 용도                      |
| -------------- | ---- | ------------------------- |
| `radius-ui-sm` | 6px  | 체크박스                  |
| `radius-ui-md` | 8px  | 버튼, 카드, 입력          |
| `radius-ui-lg` | 12px | 다이얼로그, 플로우 캔버스 |
| `rounded-full` | —    | Badge, Chip, Avatar       |

### Shadow

| 토큰           | 용도           |
| -------------- | -------------- |
| `shadow-ui-sm` | Card, StatCard |
| `shadow-ui-md` | Dialog         |

### 포커스 링 (공통)

```text
focus-visible:ui:outline-none
focus-visible:ui:ring-2
focus-visible:ui:ring-semantic-brand/40
```

입력 필드는 추가로 `focus-visible:ui:border-semantic-brand`.

### 모션·z-index

| 토큰                  | 값    |
| --------------------- | ----- |
| `duration-ui-fast`    | 100ms |
| `duration-ui-normal`  | 200ms |
| `duration-ui-slow`    | 300ms |
| `z-index-ui-dropdown` | 50    |
| `z-index-ui-modal`    | 100   |
| `z-index-ui-toast`    | 200   |
| `z-index-ui-tooltip`  | 300   |

인터랙티브 요소: `ui:transition-colors`. 로딩: `ui:animate-pulse` (Skeleton).

---

## 6. 컴포넌트 API 계약

`packages/ui/src/contracts.ts`:

```ts
type ComponentSize = "sm" | "md" | "lg";
type ComponentVariant = "default" | "primary" | "danger";
type FeedbackVariant = "info" | "success" | "warning" | "error";
```

### Button

| variant          | 스타일                                           |
| ---------------- | ------------------------------------------------ |
| `primary`        | `ui:bg-semantic-brand ui:text-text-on-brand`     |
| `danger`         | `ui:bg-semantic-danger ui:text-text-on-brand`    |
| `default`        | `ui:bg-surface-raised hover:ui:bg-surface-muted` |
| disabled/loading | `ui:bg-surface-muted ui:text-text-muted`         |

`leftIcon` / `rightIcon`, `loading`(Spinner), `asChild`(Radix Slot) 지원.

### Card (복합 컴포넌트)

셸: `ui:rounded-ui-md ui:border ui:border-border-subtle ui:bg-surface-raised ui:shadow-ui-sm`

- `CardHeader` → `CardTitle` + `CardDescription`
- `CardBody`
- `CardFooter` (`ui:border-t ui:border-border-subtle`)

### Badge

`ui:rounded-full ui:font-semibold`. variant: `default` | `success` | `warning` | `danger`.
선택 `showDot`: `ui:h-1.5 ui:w-1.5 ui:rounded-full ui:bg-current`

### DataTable

- 헤더: `ui:text-xs ui:font-semibold ui:uppercase ui:tracking-wide ui:text-text-secondary`
- 행: `ui:border-b ui:border-border-subtle/80`
- 셀: `ui:px-3 ui:py-2`

### EmptyState

```text
ui:rounded-ui-md ui:border ui:border-dashed ui:border-border-default
ui:bg-surface-muted/20 ui:px-6 ui:py-10 ui:text-center
```

### FilterBar + FilterChip

- Bar: `ui:rounded-ui-md ui:border ui:border-border-subtle ui:bg-surface-raised ui:p-3`
- Chip 활성: `ui:border-semantic-brand ui:bg-semantic-brand/15`
- Chip 비활성: `ui:border-border-default ui:bg-surface-muted ui:text-text-secondary`

### StatusIndicator

| 상태          | 색               |
| ------------- | ---------------- |
| `online`      | semantic-success |
| `degraded`    | semantic-warning |
| `offline`     | semantic-danger  |
| `maintenance` | text-muted       |

### KPI·트렌드

`StatCard`, `MetricCard`, `KPIGrid` — 카드 셸 공유.
델타 색: `up` → success, `down` → danger, `neutral` → text-secondary (`internal/trend-class.ts`).

---

## 7. 레이아웃 패턴

### AppShell

```text
ui:grid ui:min-h-screen ui:lg:grid-cols-[minmax(0,240px)_1fr] ui:bg-surface-canvas
```

| 슬롯              | 역할                                    |
| ----------------- | --------------------------------------- |
| `AppShellSidebar` | 좌측 내비 (240px)                       |
| `AppShellHeader`  | 상단 제품 헤더                          |
| `AppShellContent` | 스크롤 본문 (`ui:p-4`; 콘솔은 `ui:p-0`) |

콘솔 레이아웃: `apps/web/app/console/layout.tsx`

### Sidebar

- 그룹 라벨: `ui:text-xs ui:font-semibold ui:uppercase ui:tracking-wide ui:text-text-muted`
- 활성 항목: `ui:bg-surface-muted ui:font-medium ui:text-text-primary`
- 비활성: `ui:text-text-secondary hover:ui:bg-surface-muted/60`

### 페이지 헤더 (콘솔)

```tsx
<h1 className="ui:text-2xl ui:font-bold ui:tracking-tight">제목</h1>
<p className="ui:mt-2 ui:text-sm ui:text-text-secondary">설명</p>
```

### NavTabs

```text
ui:flex ui:flex-wrap ui:gap-4 ui:border-b ui:border-border-subtle
```

활성: `ui:border-b-2 ui:border-semantic-brand ui:text-text-primary`

### 반응형 그리드

| 용도      | 클래스                                                 |
| --------- | ------------------------------------------------------ |
| KPI       | `ui:grid ui:gap-4 sm:ui:grid-cols-2 lg:ui:grid-cols-4` |
| 통합 카드 | `grid gap-4 md:grid-cols-2 lg:grid-cols-3`             |
| Run 상세  | `ui:grid ui:gap-6 lg:ui:grid-cols-2`                   |

### 콘솔 페이지 템플릿

```tsx
<div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:py-10 sm:ui:px-6 lg:ui:px-8">
  {/* 페이지 헤더 */}
  {/* FilterBar / 도구 모음 */}
  {/* 본문 (카드 그리드, DataTable 등) */}
</div>
```

---

## 8. 폼 패턴

1. 모든 컨트롤을 **`Field`**로 감싼다 — `id`, `aria-describedby`, `aria-invalid` 자동 연결.
2. 검증 메시지는 `Field`의 `error` prop.
3. **모든 폼 요소에 `name` 필수**.
4. `<form>` 안: `Button type="submit"`. 밖: `type="button"`.

입력 공통 베이스:

```text
ui:w-full ui:border ui:border-border-default ui:bg-surface-raised
ui:text-text-primary ui:placeholder:text-text-muted
focus-visible:ui:ring-2 focus-visible:ui:ring-semantic-brand/40
```

오류 텍스트: `ui:text-xs ui:text-semantic-danger`
힌트: `ui:text-xs ui:text-text-secondary`

---

## 9. 상태·도메인 시맨틱

| 컨텍스트           | 매핑                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `RunStatusBadge`   | queued/cancelled→default, running→warning, succeeded→success, failed→danger |
| `ConnectorCard`    | connected→online, disconnected→offline, error→degraded                      |
| Step log level     | info→muted, warning→semantic-warning, error→semantic-danger                 |
| Workflow 노드 실행 | running→info ring, done→success, error→danger                               |

---

## 10. iPaaS / 콘솔 UI

### 도메인 컴포넌트 (`@repo/ui`)

| 컴포넌트         | 역할                                         |
| ---------------- | -------------------------------------------- |
| `ConnectorCard`  | 통합 연결 상태 + 연결/테스트 액션            |
| `RunStatusBadge` | 워크플로 실행 라이프사이클                   |
| `StepLogPanel`   | 실행 단계 타임라인 + 로그 레벨               |
| `FlowCanvas`     | React Flow 래퍼 (읽기 전용/편집, 높이 360px) |
| `WorkflowEditor` | 노드 팔레트 + 드래그 앤 드롭 자동화 편집기   |

### 콘솔 라우트 패턴

| 경로                      | UI 구성                                                |
| ------------------------- | ------------------------------------------------------ |
| `/console`                | 대시보드: StatCard 그리드, Alert, EmptyState, LinkCard |
| `/console/integrations`   | 검색 Field + FilterBar + ConnectorCard 그리드          |
| `/console/workflows`      | bordered 패널 내 DataTable                             |
| `/console/workflows/[id]` | `WorkflowEditor` (`max-w-[1400px]`)                    |
| `/console/runs/[id]`      | 2열: FlowCanvas + StepLogPanel                         |
| `/console/audit`          | URL 필터 + DataTable + Pagination                      |

### 워크플로 시각 언어

- 캔버스: `ui:h-[360px] ui:rounded-ui-lg ui:border ui:border-border-subtle`
- 노드: `ui:min-w-[180px]`, accent 헤더 바
- 실행 하이라이트: semantic-info / success / danger 2px ring

### 콘솔 횡단 관심사

- **PermissionGate** + `Alert variant="info"` (RBAC 폴백)
- **URL search params** 기반 필터 (debounced navigate)
- **ApiStatusBanner** / **AlertBanner** (API 장애)
- **Command palette** (`Cmd+K` / `Ctrl+K`)
- **Suspense** + `Skeleton` 로딩

---

## 11. 아이콘

- **라이브러리**: `lucide-react` (peer, `^0.544.0`)
- **크기** (`icon-size.ts`): sm 14px, md 16px, lg 20px
- 버튼 아이콘: `ui:inline-flex ui:shrink-0`
- Alert: `Info`, `CheckCircle2`, `AlertTriangle`, `AlertCircle` (md)

---

## 12. 자주 쓰는 클래스 조합

| 조합                                                                                      | 용도                  |
| ----------------------------------------------------------------------------------------- | --------------------- |
| `ui:rounded-ui-md ui:border ui:border-border-subtle ui:bg-surface-raised ui:shadow-ui-sm` | 카드·타일 셸          |
| `ui:text-sm ui:text-text-secondary`                                                       | 설명·부제             |
| `ui:text-xs ui:font-semibold ui:uppercase ui:tracking-wide ui:text-text-secondary`        | KPI·테이블 라벨       |
| `ui:flex ui:flex-wrap ui:items-center ui:gap-2`                                           | 툴바·카드 푸터        |
| `ui:min-w-0 ui:flex-1`                                                                    | flex 자식 말줄임 안전 |
| `ui:inline-flex ui:items-center ui:gap-2`                                                 | 상태 행·버튼 내용     |

---

## 13. 문서·개발 워크플로

새 UI 추가 시:

1. `packages/ui/src/<component>.tsx` + `index.ts` export
2. `apps/storybook/stories/<Name>.stories.tsx` (`tags: ["autodocs"]`, Do/Don't)
3. `apps/docs/app/docs/components/page.tsx` 업데이트
4. `pnpm lint` · `pnpm check-types` · `pnpm test`

Storybook 카테고리 예: `UI/Button`, `Layout/AppShell`, `Integration/ConnectorCard`

---

## 14. 비권장 (안티 패턴)

| 하지 말 것                                      | 대신                          |
| ----------------------------------------------- | ----------------------------- |
| 컴포넌트 `className`으로 색·border 토큰 재정의  | `variant` / `size` prop       |
| `@repo/ui` 안에서 `neutral-*`, `blue-1000` 사용 | `ui:` 시맨틱 토큰             |
| 폼 필드에 `name` 누락                           | 항상 `name` 지정              |
| 페이지마다 AppShell 중첩                        | 콘솔 `layout.tsx` 한 곳에서만 |
| 임의 hex / inline style                         | `@theme` 토큰 확장            |

---

## 15. 알려진 불일치 (마이그레이션 메모)

1. **이중 스타일 레이어**: `@repo/ui`는 `ui:` 토큰; 일부 앱 페이지·docs는 `neutral-*`, unprefixed 유틸 혼용.
2. **`warning` 색**: `#a853ba`(보라) — 일반적인 노란 경고와 다름. 레거시 `purple-1000`과 동일.
3. **라이트 모드**: opt-in; docs 사이트는 하드코딩 다크(`text-white`, `neutral-*`)가 많음.
4. **`text-ui-*` 토큰**: theme에 정의되어 있으나 컴포넌트는 `ui:text-sm` 등 Tailwind 기본 스케일을 주로 사용.

신규 작업은 **시맨틱 토큰 + `@repo/ui` variant**를 우선하고, 레거시 유틸은 점진적으로 제거합니다.
