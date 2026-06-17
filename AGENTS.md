# AGENTS.md

## Cursor Cloud 전용 안내

### 프로젝트 개요

공유 React UI 라이브러리(`@repo/ui`)와 세 개의 소비 앱(`web` — Next.js, 포트 3001 / `docs` — Next.js, 포트 3000 / `storybook` — Storybook, 포트 6006)으로 구성된 Turborepo 모노레포(pnpm workspaces)입니다. 프론트엔드 전용이며 데이터베이스, 백엔드 API, Docker 서비스는 없습니다.

최근 모듈 초점: iPaaS 친화 UI 프리미티브와 페이지(`/console/integrations`, `/console/workflows`, `/console/runs`, `/console/runs/[id]`)가 mock 데이터 또는 선택적 API 연동을 기반으로 한 프론트엔드 데모로 제공됩니다.

### 디자인 가이드

UI 토큰, 레이아웃 레시피, iPaaS 콘솔 패턴은 저장소 루트의 [design.md](design.md)에 정리되어 있습니다. `@repo/ui`나 콘솔 페이지를 수정하기 전에 디자인 일관성을 위해 여기서부터 확인하세요. 라이브 예시와 권장/비권장은 docs 앱(`/docs/foundations`, `/docs/design-system`, `/docs/patterns`, `/docs/components`)과 Storybook(포트 6006)에서 확인할 수 있습니다.

### 주요 명령

표준 명령은 루트 `package.json`에 정의되어 있으며 `README.md`에도 문서화되어 있습니다.

- `pnpm install` — 워크스페이스 의존성 설치
- `pnpm build` — 패키지·앱 빌드(Turborepo 오케스트레이션, `@repo/ui`가 먼저 빌드됨)
- `pnpm dev` — 모든 개발 서버 동시 실행
- `pnpm lint` / `pnpm check-types` / `pnpm test` — 품질 게이트
- `pnpm test:coverage` — 테스트 대상 패키지(`@repo/ui`, `@repo/api-client`)의 Vitest 커버리지 실행

### 주의할 점

- **네이티브 빌드 스크립트**: pnpm 10은 기본적으로 postinstall 스크립트를 차단합니다. 루트 `package.json`의 `pnpm.onlyBuiltDependencies`에 `@parcel/watcher`, `esbuild`, `sharp`가 허용되어 있습니다. 설치 후 "Ignored build scripts" 경고가 보이면 `pnpm install --force`를 한 번 실행하세요.
- **앱 실행 전 `@repo/ui` 빌드 필수**: `web`, `docs`, `storybook` 앱은 `@repo/ui`의 `dist/` 디렉터리에서 import합니다. `dist/`가 없으면(예: 새 클론) dev 서버 시작 전에 `pnpm build` 또는 `pnpm --filter @repo/ui build`를 실행하세요. 루트 `pnpm check-types`가 `@repo/ui` 모듈 누락으로 실패할 때도 동일합니다.
- **Turbo TUI 모드**: `turbo.json`이 `"ui": "tui"`를 사용해 대화형 터미널 UI를 렌더링합니다. CI나 비대화형 환경에서 `pnpm dev`를 실행해도 동작하지만 로그가 섞일 수 있습니다. 앱별 dev 명령(`pnpm --filter web dev`)은 이를 피할 수 있습니다.
- **Docs 리다이렉트**: docs 앱 루트(`localhost:3000`)는 `/docs`로 307 리다이렉트합니다. Next.js의 정상 동작입니다.
- **환경 변수**: `NEXT_PUBLIC_DOCS_URL`(docs 링크 대상), `SESSION_SECRET`(데모 세션 쿠키 서명), `NEXT_PUBLIC_API_URL`(`@repo/api-client`용 선택 API 베이스 URL). 프로덕션에서는 `SESSION_SECRET`을 강한 랜덤 값으로 설정하세요. 누락되었거나 개발용 placeholder인 경우 `apps/web/instrumentation.ts`가 서버 시작 시 예외를 던집니다. `.env.example`을 참고하세요.
- **`web` liveness**: `web`의 `GET /api/health`는 프로브용으로 `{"status":"ok"}`와 `Cache-Control: no-store`를 반환합니다. `@repo/api-client`가 사용하는 선택적 백엔드 `GET {NEXT_PUBLIC_API_URL}/health`와는 별개입니다.
- **API 클라이언트 패키지**: `@repo/api-client`는 타임아웃/재시도/요청 ID 동작이 있는 타입 안전 API 호출(`/health`, `/v1/*`)을 제공합니다. `NEXT_PUBLIC_API_URL`이 설정되지 않으면 web 콘솔은 mock 데이터로 폴백합니다.
- **커버리지 범위**: 커버리지 임계값은 `@repo/ui`에 적용됩니다. `@repo/api-client` 커버리지는 이 프론트엔드 템플릿에서 신호를 집중·안정적으로 유지하기 위해 현재 스키마 검증 경로를 대상으로 합니다.
