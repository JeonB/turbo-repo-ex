# 추가 개편 제안 (Improvements)

현재 구현된 Web / Docs / Storybook 개편을 기준으로, 적용하면 좋은 개선 사항을 정리했습니다.

**구현 완료 (implemented):** 아래 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1 반영됨.

---

## 1. 버그 수정

### 1.1 Card 컴포넌트 href 오타

**위치:** [packages/ui/src/card.tsx](packages/ui/src/card.tsx)

**문제:** 16번 줄 `href` 템플릿 리터럴 끝에 따옴표가 하나 더 들어가 있음.

```ts
// 현재 (오타)
href={`${href}?utm_source=...&utm_campaign=create-turbo"`}

// 수정
href={`${href}?utm_source=...&utm_campaign=create-turbo`}
```

**추가 제안:** UTM 파라미터는 외부 링크에만 붙이고, `href`가 `http`로 시작할 때만 `target="_blank"` + `rel="noopener noreferrer"`를 적용하면 내부/외부 구분이 명확해집니다.

---

## 2. 타입 안전성

### 2.1 Web Next.js — `ignoreBuildErrors` 제거

**위치:** [apps/web/next.config.ts](apps/web/next.config.ts)

**문제:** `typescript.ignoreBuildErrors: true`로 두면 타입 오류가 있어도 빌드가 통과합니다.

**제안:** `ignoreBuildErrors`를 제거(또는 `false`)하고, 발생하는 타입 오류를 수정한 뒤 빌드/배포 파이프라인에서 타입 검사를 활용하는 것이 좋습니다.

---

## 3. UX / 접근성

### 3.1 Docs 사이드바 — 현재 페이지 강조

**위치:** [apps/docs/components/DocsSidebar.tsx](apps/docs/components/DocsSidebar.tsx)

**제안:** 현재 경로와 일치하는 링크에 `aria-current="page"`와 시각적 강조(배경/글자색)를 주면 탐색이 쉬워집니다. `usePathname()`을 쓰려면 클라이언트 컴포넌트(`"use client"`)로 두거나, 레이아웃에서 pathname을 prop으로 넘기는 방식으로 구현할 수 있습니다.

### 3.2 스킵 링크 (Skip to content)

**위치:** [apps/web/app/layout.tsx](apps/web/app/layout.tsx), [apps/docs/app/layout.tsx](apps/docs/app/layout.tsx)

**제안:** 키보드 사용자를 위해 본문으로 바로 이동하는 “Skip to main content” 링크를 추가합니다. 보통 `<body>` 직후, 헤더 앞에 두고 포커스 시에만 보이게 스타일링합니다.

---

## 4. 패키지 구조 / 재사용

### 4.1 @repo/ui — 선택적 `className` 지원

**위치:** [packages/ui/src](packages/ui/src) (Button, Badge, Alert, Card 등)

**문제:** `className`을 받지 않아 상위에서 여백·정렬만 조정하려면 불필요한 wrapper div가 필요합니다.

**제안:** 각 컴포넌트 props에 `className?: string`을 추가하고, `clsx`/`cn` 등으로 기존 클래스와 병합해 적용합니다. 스타일 일관성을 위해 `className`은 “추가” 용도로만 쓰고, 기본 레이아웃/색상은 컴포넌트 내부 클래스로 유지하는 규칙을 두면 좋습니다.

### 4.2 @repo/ui — Barrel export (선택)

**위치:** [packages/ui/package.json](packages/ui/package.json)

**현재:** `import { Button } from "@repo/ui/button"` 처럼 컴포넌트별로 import.

**제안:** `"./": "./dist/index.js"` 같은 진입점을 두고, `index.ts`에서 Alert, Avatar, Badge, Button, Card, Gradient, TurborepoLogo 등을 re-export하면 `import { Button, Card } from "@repo/ui"` 형태로 쓸 수 있습니다. 트리 쉐이킹을 위해 “한 진입점만” 쓰는 정책을 두는 것이 좋습니다.

---

## 5. 문서화

### 5.1 루트 README 정리

**위치:** [README.md](README.md)

**제안:** 현재 구조에 맞게 아래를 반영합니다.

- **앱 역할:** web(메인 앱), docs(문서), storybook(UI 스토리)
- **실행 방법:** 루트에서 `pnpm dev` 또는 앱별 `pnpm dev` (web 3001, docs 3000, storybook 6006)
- **Docs 앱:** `/docs`로 리다이렉트, 사이드바로 Getting started / Monorepo / Packages UI / Component reference / Apps 안내
- **Web → Docs 링크:** `NEXT_PUBLIC_DOCS_URL`(기본 `http://localhost:3000`) 설명 및 배포 시 같은 호스트/서브도메인 설정 방법

### 5.2 .env.example

**위치:** 루트 또는 [apps/web](apps/web)

**제안:** `NEXT_PUBLIC_DOCS_URL` 등 환경 변수 예시를 `.env.example`에 두고, README에서 참조하도록 하면 온보딩이 쉬워집니다.

---

## 6. Storybook

### 6.1 Alias 일괄 등록

**위치:** [apps/storybook/.storybook/main.ts](apps/storybook/.storybook/main.ts)

**현재:** 컴포넌트마다 alias를 수동으로 추가.

**제안:** `packages/ui/src/*.tsx`를 순회해서 `@repo/ui/<name>` alias를 자동 생성하면, 새 컴포넌트 추가 시 main.ts 수정을 줄일 수 있습니다. (turborepo-logo처럼 kebab-case 파일명은 그대로 두거나, export 이름과 매핑 규칙을 한 번 정해 두면 됩니다.)

---

## 7. 우선순위 요약

| 우선순위 | 항목                                             | 비고           |
| -------- | ------------------------------------------------ | -------------- |
| 높음     | Card href 오타 수정                              | 즉시 적용 권장 |
| 높음     | ignoreBuildErrors 제거 후 타입 오류 수정         | 타입 안전성    |
| 중간     | Docs 사이드바 현재 페이지 강조                   | UX             |
| 중간     | README / .env.example 정리                       | 문서화         |
| 중간     | @repo/ui className 지원                          | 재사용성       |
| 낮음     | Barrel export, 스킵 링크, Storybook alias 자동화 | 선택 적용      |

원하시면 위 항목 중 특정 것만 골라서 구체적인 패치/코드 수준으로 이어서 제안하겠습니다.
