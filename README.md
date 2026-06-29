# Turborepo — 공유 UI가 있는 모노레포

이 Turborepo에는 공유 디자인 시스템(`@repo/ui`), 메인 웹 앱, 문서 사이트, 컴포넌트 개발용 Storybook이 포함되어 있습니다. UI 키트는 **B2B SaaS** 화면(대시보드, 설정, 알림 등)을 염두에 두고 구성했습니다.

## 구성 요소

### 앱

| 앱            | 설명                                                                                                              | 개발 포트 |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| **web**       | Next.js 앱. SaaS 스타일 대시보드 데모에 `@repo/ui` 사용.                                                          | 3001     |
| **docs**      | 문서: 소개, 파운데이션, 디자인 시스템, 컴포넌트, 품질 게이트.                                                     | 3000     |
| **storybook** | 프리미티브, 패턴, LinkCard, 레이아웃 셸 등 UI 스토리.                                                             | 6006     |

### 패키지

- **@repo/ui** — 공유 React 컴포넌트와 스타일(Tailwind, `ui:` 접두사). web·docs에서 사용.
- **@repo/ui 워크플로 모듈** — `ConnectorCard`, `RunStatusBadge`, `StepLogPanel`, `FlowCanvas`, `WorkflowEditor`로 통합/워크플로/실행 로그 UI를 조합. 웹 콘솔 `/console/workflows`에서 노드형 자동화 편집(localStorage) 및 테스트 실행을 지원합니다.
- **@repo/api-client** — `createConsoleApiClient` 기반의 타입 안전 API 클라이언트(Zod 스키마 파싱, 타임아웃/재시도/요청 ID 지원).
- **@repo/tailwind-config** — 공유 Tailwind 테마(시맨틱 토큰 + 팔레트).
- **@repo/typescript-config** — 공유 `tsconfig` 프리셋.
- **@repo/eslint-config** — 공유 ESLint 설정.

## 빠른 시작

```sh
pnpm install
pnpm build   # 패키지 빌드 후 앱 빌드
pnpm dev     # 모든 앱을 개발 모드로 실행(또는 아래처럼 앱별 실행)
```

### 앱별 실행

```sh
# Web (메인 앱)
pnpm --filter web dev          # http://localhost:3001

# Docs
pnpm --filter docs dev         # http://localhost:3000

# Storybook
pnpm --filter storybook dev    # http://localhost:6006
```

**web** 앱의 "문서"·"시작하기" 링크는 기본적으로 docs 앱 `http://localhost:3000`을 가리킵니다. 다른 문서 URL(동일 호스트·프로덕션 등)을 쓰려면 web 앱에 환경 변수를 설정하세요.

```sh
# apps/web
NEXT_PUBLIC_DOCS_URL=https://docs.example.com   # 또는 동일 출처 /docs는 ""
```

템플릿은 [.env.example](.env.example)를 참고하세요.

추가 환경 변수:

- `SESSION_SECRET` — `apps/web` 데모 세션 쿠키 서명 키(프로덕션에서는 긴 랜덤 문자열 권장)
- `NEXT_PUBLIC_API_URL` — 선택 항목. 설정 시 `@repo/api-client`를 통해 콘솔 API(예: `/health`, `/v1/*`)를 호출하고, 미설정 시 mock 데이터로 동작

### Mock API 모드

web 앱은 `/api/mock` 아래에 mock API Route Handler를 내장합니다(`/health`, `/v1/integrations`, `/v1/workflows`, `/v1/runs`, `/v1/runs/[id]`, `/v1/audit/events`, `/v1/usage/summary`, `/v1/notifications`, `/v1/members`). 인메모리 분기 대신 **실제 api-client HTTP 경로**(fetch → 타임아웃 → 재시도 → Zod 파싱)를 검증하려면:

```sh
# apps/web
NEXT_PUBLIC_API_URL=http://localhost:3001/api/mock
```

- 응답 데이터는 `apps/web/lib/*-mock.ts`의 fixture와 단일 출처를 공유합니다.
- 콘솔의 개발용 시뮬레이션 패널(지연·503·타임아웃·네트워크 오류)은 `x-api-dev-simulation` 헤더로 mock 핸들러까지 전달되어 HTTP 레벨에서 장애를 재현합니다(프로덕션에서는 무시).
- API가 5xx/타임아웃으로 실패하면 콘솔 데이터는 mock 스냅샷으로 점진적으로 강등되고, `/console`의 API 상태 배너가 장애를 표시합니다.
- 조직 공통 데이터(integrations, workflows, members, usage 등)는 서버에서 60초 캐시(`unstable_cache`, 태그 `console-data`)되어 트래픽 급증 시 origin 호출을 흡수합니다.

## @repo/ui 사용하기

`@repo/ui`에 의존하는 앱에서는:

```ts
import "@repo/ui/styles.css";
import { Button, Card, LinkCard } from "@repo/ui"; // 배럴 import
// 또는
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { LinkCard } from "@repo/ui/link-card";
import { ConnectorCard, RunStatusBadge, StepLogPanel, FlowCanvas, WorkflowEditor } from "@repo/ui";
```

`@repo/ui`는 **`lucide-react`**를 피어 의존성으로 둡니다(`Alert` 등 아이콘). 앱에서 호환 버전을 설치해야 합니다(각 앱 `package.json` 참고).

레이아웃·간격용으로 컴포넌트에 선택적 `className` prop을 지원합니다. UI 패키지는 저장소 루트 또는 `packages/ui`에서 빌드합니다.

```sh
pnpm --filter @repo/ui build
```

## 새 UI 컴포넌트 추가

1. `packages/ui/src/`에 컴포넌트를 추가하고 `packages/ui/src/index.ts`에서 export합니다.
2. `apps/storybook/stories/<Name>.stories.tsx`에 스토리를 추가합니다.
3. `apps/docs/app/docs/components/page.tsx`에 문서를 추가하고 필요 시 디자인 시스템 안내를 갱신합니다.
4. 품질 게이트를 실행합니다.

```sh
pnpm lint
pnpm check-types
pnpm test
```

## 테스트 병렬 에이전트

여러 Cursor 에이전트로 테스트 작업을 나눌 때 스타일 드리프트를 줄이려면 `packages/ui/PARALLEL_AGENTS_TEST_BRIEF.md`의 브리프를 공유하세요. 파일 이름 규칙, Testing Library 규칙, 복사해 쓸 프롬프트 템플릿이 정의되어 있습니다. 에이전트 결과를 머지한 뒤 `pnpm test`를 한 번 실행하세요.

## 커버리지 게이트

`@repo/ui`와 `@repo/api-client`는 Vitest 커버리지 리포트를 생성합니다.

```sh
pnpm test:coverage
```

- 현재 게이트 기준: `@repo/ui` 라인/구문/함수 90%+, 브랜치 85%+
- `@repo/api-client`는 스키마 검증 레이어를 중심으로 커버리지를 집계합니다.

## 콘솔 라우트 요약

- `/console` — 개요 대시보드
- `/console/notifications` — 알림 센터(URL 필터 + 로컬 읽음 상태)
- `/console/integrations` — 통합 목록
- `/console/workflows` — 워크플로 목록
- `/console/runs` — 실행 기록 목록(필터 + 상세 이동)
- `/console/runs/[id]` — 실행 상세(그래프/스텝 로그)
- `/console/members` — 멤버 목록
- `/console/audit` — 감사 로그
- `/console/settings` / `/console/settings/billing` — 조직 설정/청구

## Cursor·Slack·Cloud Agent로 개발하기

**Slack과 Cursor를 연동**해 두면 채널·스레드에 맥락(요구사항, 링크, 스크린샷)을 남기면서 에이전트 기반 개발을 이어가기 좋습니다. 워크스페이스 알림·명령 흐름을 Slack 쪽에서 정리해 두면 원격·비동기 협업 시에도 같은 저장소 규칙(`AGENTS.md`, 품질 게이트)을 반복해서 강조하기 쉽습니다. 연결·권한 설정은 [Cursor 문서](https://cursor.com/docs)에서 **Slack** 연동 항목을 참고하세요.

이 저장소는 **Cursor Cloud Agent**(클라우드에서 돌아가는 에이전트)로 개발하는 경우도 있습니다. 에이전트가 만든 변경은 로컬 작업과 동일하게 `pnpm lint`, `pnpm check-types`, `pnpm test`로 검증한 뒤 PR로 합치면 됩니다. Cloud Agent 전용 안내는 저장소 루트의 [`AGENTS.md`](AGENTS.md)를 함께 두면 에이전트가 프로젝트 맥락(포트, 빌드 순서, 주의사항)을 빠르게 읽을 수 있습니다.

## 디자인 시스템 운영 방식

- **API 계약**: 컴포넌트는 안정적인 `variant`, `size`, `className` 패턴을 노출합니다.
- **문서 우선**: 변경 시 Storybook과 Docs를 함께 갱신합니다.
- **품질 게이트**: 머지 전 타입 검사, 린트, UI 테스트가 필수입니다.

문서 경로:

- `/docs/foundations` — 토큰과 시맨틱 역할
- `/docs/design-system` — 계약과 권장/비권장
- `/docs/quality-gates` — 릴리스 체크리스트

## 빠르게 이해하는 순서

처음 보는 분께 권하는 순서:

1. `README.md` — 저장소 구조와 명령
2. `/docs/foundations` — 토큰 위치와 UI 매핑
3. `/docs/design-system` — 컴포넌트 API 계약
4. `/docs/quality-gates` — 안정성 워크플로
5. `packages/ui/src/button.tsx`와 `apps/storybook/stories/Button.stories.tsx` — 코드와 Storybook으로 보는 계약

## 이렇게 구성한 이유

- **문제**: 앱마다 컴포넌트 스타일이 어긋나고 문서가 구현보다 늦어짐.
- **해결**: Storybook·문서·품질 게이트를 한 경로에 둔 중앙 `@repo/ui` 계약.
- **효과**: 예측 가능한 동작, 리뷰가 명확해지고 공유 UI 변경이 더 안전해짐.

## 기술 스택

- [Turborepo](https://turbo.build/)
- [Next.js](https://nextjs.org/) (web, docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Storybook](https://storybook.js.org/) (React + Vite)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
