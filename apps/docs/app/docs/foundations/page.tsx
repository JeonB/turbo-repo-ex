import { Badge } from "@repo/ui/badge";
import Link from "next/link";

export default function FoundationsPage() {
  return (
    <>
      <Badge className="mb-4" variant="default">
        파운데이션
      </Badge>
      <h1 className="text-3xl font-bold text-white">디자인 파운데이션</h1>
      <p className="mt-2 text-neutral-400">
        <code className="rounded bg-neutral-800 px-1 py-0.5">@repo/ui</code>를 지탱하는 토큰과 명명 규칙입니다.
        컴포넌트는 시맨틱 역할을 소비해 제품 화면의 일관성을 유지합니다.
      </p>

      <section className="mt-10 space-y-4 rounded-lg border border-brand-600/40 bg-brand-900/20 p-5">
        <h2 className="text-xl font-semibold text-white">확정 코어 토큰</h2>
        <p className="text-sm text-neutral-300">
          리브랜딩 시 아래 <strong className="text-white">색 3개</strong>와{" "}
          <strong className="text-white">간격 5단계</strong>만 바꾸면 시맨틱·컴포넌트가 따라옵니다.
          정의 위치:{" "}
          <code className="rounded bg-neutral-900 px-1">shared-styles.css</code> 상단{" "}
          <code className="rounded bg-neutral-900 px-1">core-*</code> 블록.
        </p>

        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">색 3개</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              name: "core-primary",
              maps: "semantic-brand",
              hex: "#7c3aed",
              color: "var(--color-core-primary)",
              use: "CTA, 포커스, 활성 탭",
            },
            {
              name: "core-muted",
              maps: "text-muted",
              hex: "다크 #6b6780",
              color: "var(--color-core-muted)",
              use: "보조 텍스트, placeholder, 메타",
            },
            {
              name: "core-destructive",
              maps: "semantic-danger",
              hex: "#ef4444",
              color: "var(--color-core-destructive)",
              use: "오류, 삭제, 위험 알림",
            },
          ].map((token) => (
            <div
              key={token.name}
              className="flex flex-col gap-3 rounded-lg border border-neutral-700 bg-neutral-900/60 p-4"
            >
              <div className="h-14 w-full rounded-md border border-neutral-600" style={{ backgroundColor: token.color }} />
              <div>
                <code className="text-xs text-white">{token.name}</code>
                <p className="mt-1 text-[10px] text-neutral-500">
                  → <code>{token.maps}</code>
                </p>
                <p className="mt-1 text-xs text-neutral-400">{token.use}</p>
                <p className="mt-1 font-mono text-[10px] text-neutral-500">{token.hex}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">간격 (4px 그리드)</h3>
        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-700 text-xs text-neutral-500">
                <th className="pb-2 pr-4 font-medium">코어</th>
                <th className="pb-2 pr-4 font-medium">px</th>
                <th className="pb-2 pr-4 font-medium">ui 스케일</th>
                <th className="pb-2 font-medium">용도</th>
              </tr>
            </thead>
            <tbody className="text-neutral-300">
              {[
                { core: "spacing-core-xs", px: 4, ui: "spacing-ui-1", use: "아이콘·라벨 간격" },
                { core: "spacing-core-sm", px: 8, ui: "spacing-ui-2", use: "칩, 툴바 gap" },
                { core: "spacing-core-md", px: 12, ui: "spacing-ui-3", use: "필드 라벨–입력" },
                { core: "spacing-core-lg", px: 16, ui: "spacing-ui-4 / stack", use: "세로 스택 기본" },
                { core: "spacing-core-xl", px: 24, ui: "spacing-ui-6", use: "카드 블록 패딩" },
              ].map((row) => (
                <tr key={row.core} className="border-b border-neutral-800/80 last:border-0">
                  <td className="py-2.5 pr-4">
                    <code className="text-xs text-neutral-400">{row.core}</code>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 shrink-0 rounded-sm bg-semantic-brand/70"
                        style={{ width: `${row.px}px` }}
                      />
                      <span className="text-xs text-neutral-500">{row.px}px</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <code className="text-xs text-neutral-500">{row.ui}</code>
                  </td>
                  <td className="py-2.5 text-xs text-neutral-400">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-neutral-500">
            섹션 간 여백은 <code className="rounded bg-neutral-800 px-1">spacing-ui-section</code> (40px)을
            사용합니다.
          </p>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">토큰이 있는 위치</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-neutral-300">
          <li>
            <code className="rounded bg-neutral-900 px-1">packages/tailwind-config/shared-styles.css</code> —{" "}
            <code className="rounded bg-neutral-900 px-1">@theme</code> 정의(색, 반경, 간격, 타이포).
          </li>
          <li>
            <code className="rounded bg-neutral-900 px-1">packages/ui/src/styles.css</code> — 컴포넌트 라이브러리용{" "}
            <code className="rounded bg-neutral-900 px-1">ui:</code> 접두사로 Tailwind를 가져옵니다.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">시맨틱 토큰</h2>
        <p className="text-sm text-neutral-300">
          <code className="rounded bg-neutral-900 px-1">@repo/ui</code>는{" "}
          <code className="rounded bg-neutral-900 px-1">ui:</code> 접두사를 사용합니다. 유틸리티는{" "}
          <code className="rounded bg-neutral-900 px-1">@theme</code> 변수에 매핑됩니다. 예:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-neutral-400">
          <li>
            <strong className="text-neutral-300">피드백:</strong>{" "}
            <code className="rounded bg-neutral-900 px-1">semantic-brand</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">semantic-success</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">semantic-warning</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">semantic-danger</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">semantic-info</code>
          </li>
          <li>
            <strong className="text-neutral-300">서피스:</strong>{" "}
            <code className="rounded bg-neutral-900 px-1">surface-canvas</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">surface-raised</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">surface-muted</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">surface-overlay</code>
          </li>
          <li>
            <strong className="text-neutral-300">텍스트:</strong>{" "}
            <code className="rounded bg-neutral-900 px-1">text-primary</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">text-secondary</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">text-muted</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">text-on-brand</code>
          </li>
          <li>
            <strong className="text-neutral-300">테두리 / 반경 / 그림자:</strong>{" "}
            <code className="rounded bg-neutral-900 px-1">border-default</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">rounded-ui-md</code>,{" "}
            <code className="rounded bg-neutral-900 px-1">shadow-ui-sm</code>
          </li>
        </ul>
        <p className="mt-2 text-sm text-neutral-400">
          레거시 팔레트 키(<code className="rounded bg-neutral-900 px-1">blue-1000</code> 등)는 UI 패키지 밖 앱 수준 스타일링을 위해 테마에 남아 있습니다.
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          <strong className="text-neutral-300">라이트 모드(선택):</strong> 루트 조상에{" "}
          <code className="rounded bg-neutral-900 px-1">class=&quot;light&quot;</code> 또는{" "}
          <code className="rounded bg-neutral-900 px-1">data-theme=&quot;light&quot;</code>를 두면
          시맨틱 서피스·텍스트 토큰이 바뀝니다. 기본값은 다크 분석 대시보드에 맞춰져 있습니다.
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          <strong className="text-neutral-300">확장 토큰:</strong> 폰트(<code className="rounded bg-neutral-900 px-1">font-ui-sans</code>,{" "}
          <code className="rounded bg-neutral-900 px-1">font-ui-mono</code>), 타이포(<code className="rounded bg-neutral-900 px-1">text-ui-*</code>,{" "}
          <code className="rounded bg-neutral-900 px-1">leading-ui-*</code>, <code className="rounded bg-neutral-900 px-1">font-weight-ui-*</code>), 간격 스케일(<code className="rounded bg-neutral-900 px-1">spacing-ui-*</code>),
          모션(<code className="rounded bg-neutral-900 px-1">duration-ui-*</code>, <code className="rounded bg-neutral-900 px-1">ease-ui-*</code>),
          z-index(<code className="rounded bg-neutral-900 px-1">z-index-ui-*</code>), 포커스 링 참조(
          <code className="rounded bg-neutral-900 px-1">ring-*-ui</code>)는 시맨틱 색과 함께 정의됩니다.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">색 토큰</h2>
        <p className="text-sm text-neutral-400">
          <code className="rounded bg-neutral-900 px-1">@repo/ui</code> 전반에서 쓰는 시맨틱 색입니다.
          각각 <code className="rounded bg-neutral-900 px-1">@theme</code>의 CSS 변수에 매핑됩니다.
        </p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">피드백</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "semantic-brand", color: "var(--color-semantic-brand)" },
            { name: "semantic-success", color: "var(--color-semantic-success)" },
            { name: "semantic-warning", color: "var(--color-semantic-warning)" },
            { name: "semantic-danger", color: "var(--color-semantic-danger)" },
            { name: "semantic-info", color: "var(--color-semantic-info)" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg border border-neutral-700" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">서피스</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "surface-canvas", color: "var(--color-surface-canvas)" },
            { name: "surface-raised", color: "var(--color-surface-raised)" },
            { name: "surface-muted", color: "var(--color-surface-muted)" },
            { name: "surface-overlay", color: "var(--color-surface-overlay)" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg border border-neutral-700" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">텍스트</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "text-primary", color: "var(--color-text-primary)" },
            { name: "text-secondary", color: "var(--color-text-secondary)" },
            { name: "text-muted", color: "var(--color-text-muted)" },
            { name: "text-on-brand", color: "var(--color-text-on-brand)" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg border border-neutral-700" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">테두리</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "border-default", color: "var(--color-border-default)" },
            { name: "border-subtle", color: "var(--color-border-subtle)" },
            { name: "border-strong", color: "var(--color-border-strong)" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-lg border border-neutral-700" style={{ backgroundColor: t.color }} />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">간격 스케일</h2>
        <p className="text-sm text-neutral-400">
          <code className="rounded bg-neutral-900 px-1">spacing-ui-0</code>부터{" "}
          <code className="rounded bg-neutral-900 px-1">spacing-ui-16</code>까지 4px 기준 스케일입니다.
        </p>
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <code className="w-20 text-right text-xs text-neutral-400">ui-{n}</code>
              <div className="h-3 rounded-sm bg-semantic-brand/60" style={{ width: `${n * 4}px` }} />
              <span className="text-xs text-neutral-500">{n * 4}px</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">타이포그래피</h2>
        <p className="text-sm text-neutral-400">
          기본 본문 폰트는 Pretendard Variable입니다.{" "}
          <code className="rounded bg-neutral-900 px-1">font-ui-sans</code> /{" "}
          <code className="rounded bg-neutral-900 px-1">font-ui-mono</code>와 크기·굵기·행간 토큰을 조합해
          UI 전반의 타이포 리듬을 맞춥니다.
        </p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">폰트 패밀리</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              name: "font-ui-sans",
              alias: "font-sans (앱)",
              sample: "Aa 가나다 123",
              family: "var(--font-ui-sans)",
            },
            {
              name: "font-ui-mono",
              alias: "font-mono (앱)",
              sample: "const runId = 'wf_01';",
              family: "var(--font-ui-mono)",
            },
          ].map((font) => (
            <div
              key={font.name}
              className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4"
            >
              <p className="text-2xl text-white" style={{ fontFamily: font.family }}>
                {font.sample}
              </p>
              <p className="mt-3 text-xs text-neutral-500" style={{ fontFamily: font.family }}>
                다람쥐 헌 쳇바퀴에 타고파 · The quick brown fox
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">
                  {font.name}
                </code>
                <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
                  {font.alias}
                </code>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">글자 크기</h3>
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          {[
            { name: "text-ui-xs", size: "var(--text-ui-xs)" },
            { name: "text-ui-sm", size: "var(--text-ui-sm)" },
            { name: "text-ui-base", size: "var(--text-ui-base)" },
            { name: "text-ui-lg", size: "var(--text-ui-lg)" },
            { name: "text-ui-xl", size: "var(--text-ui-xl)" },
            { name: "text-ui-2xl", size: "var(--text-ui-2xl)" },
          ].map((token) => (
            <div key={token.name} className="flex items-baseline gap-4 border-b border-neutral-800/80 pb-3 last:border-0 last:pb-0">
              <code className="w-28 shrink-0 text-right text-xs text-neutral-400">{token.name}</code>
              <span className="font-sans text-white" style={{ fontSize: token.size }}>
                다람쥐 헌 쳇바퀴에 타고파
              </span>
              <span className="text-xs text-neutral-500">{token.size}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">굵기</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "font-weight-ui-normal", weight: "var(--font-weight-ui-normal)", label: "400" },
            { name: "font-weight-ui-medium", weight: "var(--font-weight-ui-medium)", label: "500" },
            { name: "font-weight-ui-semibold", weight: "var(--font-weight-ui-semibold)", label: "600" },
            { name: "font-weight-ui-bold", weight: "var(--font-weight-ui-bold)", label: "700" },
          ].map((token) => (
            <div
              key={token.name}
              className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-3"
            >
              <span className="font-sans text-base text-white" style={{ fontWeight: token.weight }}>
                Northline Dashboard
              </span>
              <div className="flex flex-col items-end gap-0.5">
                <code className="text-[10px] text-neutral-400">{token.name}</code>
                <span className="text-[10px] text-neutral-500">{token.label}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">행간</h3>
        <div className="flex flex-col gap-3">
          {[
            { name: "leading-ui-tight", leading: "var(--leading-ui-tight)", value: "1.25" },
            { name: "leading-ui-normal", leading: "var(--leading-ui-normal)", value: "1.5" },
            { name: "leading-ui-relaxed", leading: "var(--leading-ui-relaxed)", value: "1.625" },
          ].map((token) => (
            <div
              key={token.name}
              className="rounded-lg border border-neutral-700 bg-neutral-900/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <code className="text-[10px] text-neutral-400">{token.name}</code>
                <span className="text-[10px] text-neutral-500">{token.value}</span>
              </div>
              <p
                className="max-w-md font-sans text-sm text-neutral-200"
                style={{ lineHeight: token.leading }}
              >
                워크플로 실행 로그와 커넥터 상태를 한 화면에서 확인합니다. 행간 토큰은 본문·설명·테이블 셀의
                가독성을 맞출 때 사용합니다.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">반경 및 그림자</h2>
        <div className="flex flex-wrap gap-6">
          {[
            { name: "rounded-ui-sm", radius: "var(--radius-ui-sm)", shadow: "" },
            { name: "rounded-ui-md", radius: "var(--radius-ui-md)", shadow: "" },
            { name: "rounded-ui-lg", radius: "var(--radius-ui-lg)", shadow: "" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border border-neutral-600 bg-neutral-800"
                style={{ borderRadius: t.radius, boxShadow: t.shadow }}
              />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
          {[
            { name: "shadow-ui-sm", shadow: "var(--shadow-ui-sm)" },
            { name: "shadow-ui-md", shadow: "var(--shadow-ui-md)" },
          ].map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 rounded-lg border border-neutral-600 bg-neutral-800"
                style={{ boxShadow: t.shadow }}
              />
              <span className="text-[10px] text-neutral-400">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">다음 단계</h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm text-neutral-300">
          <li>
            <Link href="/docs/design-system" className="text-blue-300 underline-offset-2 hover:underline">
              디자인 시스템
            </Link>{" "}
            — variant와 size에 대한 API 계약.
          </li>
          <li>
            <Link href="/docs/components" className="text-blue-300 underline-offset-2 hover:underline">
              컴포넌트 참고
            </Link>{" "}
            — 사용법과 예시.
          </li>
          <li>
            <Link href="/docs/quality-gates" className="text-blue-300 underline-offset-2 hover:underline">
              품질 게이트
            </Link>{" "}
            — 변경 검증 방법.
          </li>
        </ol>
      </section>
    </>
  );
}
