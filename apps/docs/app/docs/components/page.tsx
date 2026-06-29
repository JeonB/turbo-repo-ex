import { Alert } from "@repo/ui/alert";
import { AlertBanner } from "@repo/ui/alert-banner";
import { Avatar } from "@repo/ui/avatar";
import { AvatarGroup } from "@repo/ui/avatar-group";
import { Badge } from "@repo/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "@repo/ui/breadcrumb";
import { Button } from "@repo/ui/button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { ConnectorCard } from "@repo/ui/connector-card";
import { EmptyState } from "@repo/ui/empty-state";
import { Field } from "@repo/ui/field";
import { FilterBar, FilterChip } from "@repo/ui/filter-bar";
import { FlowCanvas } from "@repo/ui/flow-canvas";
import { Input } from "@repo/ui/input";
import { LinkCard } from "@repo/ui/link-card";
import { NavTabs, NavTabsItem } from "@repo/ui/nav-tabs";
import { RunStatusBadge } from "@repo/ui/run-status-badge";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";
import { Spinner } from "@repo/ui/spinner";
import { StatCard } from "@repo/ui/stat-card";
import { StepLogPanel } from "@repo/ui/step-log-panel";
import { StatusIndicator } from "@repo/ui/status-indicator";
import { Textarea } from "@repo/ui/textarea";

export default function ComponentReferencePage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">컴포넌트 참고</h1>
      <p className="mt-2 text-neutral-400">
        <code className="rounded bg-neutral-800 px-1">@repo/ui</code>의 사용법, 접근성 메모, 예시입니다(B2B SaaS 지향).
        역할별로 묶었습니다.
      </p>
      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <h2 className="text-sm font-semibold text-white">문서 템플릿</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
          <li>
            <strong>용도:</strong> 일반 HTML·앱 레이아웃 대비 언제 쓸지
          </li>
          <li>
            <strong>접근성:</strong> 역할, 레이블, 키보드, 컴포넌트가 보장하는 것
          </li>
          <li>
            <strong>권장 / 비권장:</strong> API 우선 패턴; 임의 class로 토큰이 흐트러지지 않게
          </li>
        </ul>
      </div>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">폼</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">Button</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 주요 동작, 폼 제출, 파괴적 확인.{" "}
          <strong>접근성:</strong> 네이티브 <code className="rounded bg-neutral-800 px-1">button</code>; 폼에서는 명시적으로{" "}
          <code className="rounded bg-neutral-800 px-1">type=&quot;submit&quot;</code>.{" "}
          <strong>권장:</strong> 의미는 <code className="rounded bg-neutral-800 px-1">variant</code>, 밀도는{" "}
          <code className="rounded bg-neutral-800 px-1">size</code>로 선택.{" "}
          <strong>비권장:</strong> 큰 <code className="rounded bg-neutral-800 px-1">className</code> 패딩으로 간격 덮어쓰기.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button name="demo-default" variant="default">
            기본
          </Button>
          <Button name="demo-primary" variant="primary">
            주요
          </Button>
          <Button name="demo-danger" variant="danger">
            위험
          </Button>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Input 및 Textarea</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 필터, 설정, 레코드 폼.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">Field</code> 또는{" "}
          <code className="rounded bg-neutral-800 px-1">aria-label</code>로 접근 가능한 이름을 항상 제공.{" "}
          <strong>권장:</strong> 모든 필드에 <code className="rounded bg-neutral-800 px-1">name</code> 설정.{" "}
          <strong>비권장:</strong> placeholder만 레이블로 쓰기.
        </p>
        <div className="mt-4 max-w-md space-y-4">
          <Field hint="알림에 사용됩니다." id="docs-project" label="프로젝트 이름">
            <Input name="project" placeholder="Analytics API" />
          </Field>
          <Field id="docs-notes" label="메모">
            <Textarea name="notes" placeholder="선택 맥락…" rows={3} />
          </Field>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Field</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 레이블이 있는 단일 컨트롤, 선택적 힌트·오류.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">htmlFor/id</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">aria-describedby</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">aria-invalid</code> 연결.{" "}
          <strong>권장:</strong> 자식으로 input 하나만.{" "}
          <strong>비권장:</strong> 한 Field 안에 여러 컨트롤 중첩.
        </p>
        <div className="mt-4 max-w-md">
          <Field error="필수 항목입니다." id="docs-error-demo" label="워크스페이스">
            <Input name="workspace" />
          </Field>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Select</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 짧은 옵션 목록용 네이티브 드롭다운.{" "}
          <strong>접근성:</strong> 키보드·스크린 리더 지원 내장.{" "}
          <strong>권장:</strong> <code className="rounded bg-neutral-800 px-1">name</code>과 레이블 항상 제공.{" "}
          <strong>비권장:</strong> 15개 이상 옵션 — Command 팔레트 검토.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Checkbox 및 RadioGroup</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> Checkbox는 다중 선택 토글; RadioGroup은 단일 선택.{" "}
          <strong>접근성:</strong> 네이티브 input과 <code className="rounded bg-neutral-800 px-1">label</code> 연결;
          RadioGroup은 <code className="rounded bg-neutral-800 px-1">role=&quot;radiogroup&quot;</code>.{" "}
          <strong>권장:</strong> 항목마다 고유 <code className="rounded bg-neutral-800 px-1">id</code>.{" "}
          <strong>비권장:</strong> 즉시 켜고 끄는 불리언에는 Checkbox 대신 Switch.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Switch</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 즉시 반영되는 불리언(기능 플래그, 환경설정).{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;switch&quot;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-checked</code>; 포커스 링; 비활성 상태.{" "}
          <strong>권장:</strong> 레이블과 짝지음.{" "}
          <strong>비권장:</strong> Checkbox가 더 맞는 폼 안에 Switch 남용.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">FilterBar 및 FilterChip</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 토글 가능한 칩이 있는 가로 필터 바.{" "}
          <strong>접근성:</strong> 칩은 포커스 링이 있는 버튼.{" "}
          <strong>권장:</strong> 활성 상태는 외부에서 관리.{" "}
          <strong>비권장:</strong> 내비게이션 용도 — NavTabs 사용.
        </p>
        <div className="mt-4">
          <FilterBar>
            <FilterChip active>전체</FilterChip>
            <FilterChip>활성</FilterChip>
            <FilterChip>일시중지</FilterChip>
          </FilterBar>
        </div>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">데이터 표시</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">StatCard 및 MetricCard</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 대시보드 KPI 타일. MetricCard는 차트 슬롯·비교 레이블을 확장.{" "}
          <strong>접근성:</strong> 텍스트 구조; 레이블은 짧게.{" "}
          <strong>권장:</strong> 델타 의미는 <code className="rounded bg-neutral-800 px-1">trend</code>.{" "}
          <strong>비권장:</strong> 차트 과부하 — 상세는 링크로.
        </p>
        <div className="mt-4 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard delta="+4.2%" label="MRR" trend="up" value="$52.1k" />
          <StatCard delta="-0.4pp" label="이탈률" trend="down" value="1.1%" />
          <StatCard delta="—" label="활성 조직" trend="neutral" value="86" />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">DataTable</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> TanStack Table 기반 헤드리스 테이블 셸.{" "}
          <strong>접근성:</strong> 시맨틱 <code className="rounded bg-neutral-800 px-1">&lt;table&gt;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">&lt;th scope=&quot;col&quot;&gt;</code>.{" "}
          <strong>권장:</strong> TanStack ColumnDef로 열 정의.{" "}
          <strong>비권장:</strong> 인라인 정렬만 추가 — TanStack 정렬 모델로 확장.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Badge</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 상태·메타데이터 칩. 시맨틱 색은 디자인 토큰에 매핑.{" "}
          <strong>접근성:</strong> span 텍스트로 노출.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="default">기본</Badge>
          <Badge variant="success">성공</Badge>
          <Badge variant="warning">경고</Badge>
          <Badge variant="danger">위험</Badge>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">StatusIndicator</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 시스템 상태용 색 점 + 레이블.{" "}
          <strong>접근성:</strong> 점은 <code className="rounded bg-neutral-800 px-1">aria-hidden</code>; 의미는 레이블.{" "}
          <strong>권장:</strong> 표준 상태(<code className="rounded bg-neutral-800 px-1">online</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">degraded</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">offline</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">maintenance</code>) 사용.
        </p>
        <div className="mt-4 flex flex-wrap gap-6">
          <StatusIndicator state="online" label="정상" />
          <StatusIndicator state="degraded" label="저하" />
          <StatusIndicator state="offline" label="중단" />
          <StatusIndicator state="maintenance" label="점검" />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Skeleton 및 Spinner</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> Skeleton은 콘텐츠 형태 로딩; Spinner는 무한 로딩.{" "}
          <strong>접근성:</strong> Skeleton은 <code className="rounded bg-neutral-800 px-1">aria-hidden</code>;
          Spinner는 <code className="rounded bg-neutral-800 px-1">role=&quot;status&quot;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-label</code>.{" "}
          Spinner가 바쁜 버튼 안에 있으면 <code className="rounded bg-neutral-800 px-1">decorative</code> 설정.
        </p>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton width="200px" height="14px" />
            <Skeleton width="140px" height="14px" />
          </div>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Timeline</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 연결선·선택 아이콘이 있는 세로 활동 피드.{" "}
          <strong>접근성:</strong> 시맨틱 <code className="rounded bg-neutral-800 px-1">&lt;ul&gt;/&lt;li&gt;</code>.{" "}
          <strong>권장:</strong> 타임스탬프는 <code className="rounded bg-neutral-800 px-1">time</code> prop.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">워크플로 모듈 (ConnectorCard / RunStatusBadge / StepLogPanel / FlowCanvas / WorkflowEditor)</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 통합 연결 상태, 워크플로 실행 상태, 스텝 로그, DAG 캔버스를 조합해 콘솔 화면을 빠르게 구성합니다.
          <strong> WorkflowEditor</strong>는 n8n 스타일 노드 팔레트·커스텀 노드(트리거, DB 조회, HTTP 응답, Transform, Slack, 이메일)로 편집 캔버스를 제공합니다. web 콘솔의{" "}
          <code className="rounded bg-neutral-800 px-1">/console/workflows/[id]</code>에서 localStorage에 정의를 저장하고 테스트 실행할 수 있습니다.
          <strong> 접근성:</strong> 상태 텍스트는 배지로 노출되고, 캔버스는 읽기 전용 <code className="rounded bg-neutral-800 px-1">aria-label</code>을 제공합니다.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ConnectorCard
            description="워크플로 실패/성공 알림을 지정 채널로 전송합니다."
            lastSyncAt="2026-04-28 20:20"
            name="Slack Alerts"
            status="connected"
            vendor="Slack"
          />
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <p className="mb-3 text-sm text-neutral-300">
              마지막 실행 상태 <RunStatusBadge status="running" />
            </p>
            <StepLogPanel
              steps={[
                {
                  id: "step-1",
                  level: "info",
                  message: "입력 payload 파싱 완료",
                  startedAt: "20:20:01",
                  title: "Parse Payload",
                },
                {
                  id: "step-2",
                  level: "warning",
                  message: "중복 레코드를 병합 처리",
                  startedAt: "20:20:03",
                  title: "Upsert Contact",
                },
              ]}
              title="샘플 실행 로그"
            />
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <FlowCanvas
            ariaLabel="문서용 워크플로 그래프"
            edges={[
              { id: "edge-1", source: "trigger", target: "transform" },
              { id: "edge-2", source: "transform", target: "notify" },
            ]}
            nodes={[
              { id: "trigger", position: { x: 0, y: 0 }, data: { label: "Trigger" }, type: "input" },
              { id: "transform", position: { x: 220, y: 0 }, data: { label: "Transform" } },
              { id: "notify", position: { x: 440, y: 0 }, data: { label: "Notify" }, type: "output" },
            ]}
            readOnly
          />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">EmptyState</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 테이블·개요 영역의 제로 상태.{" "}
          <strong>접근성:</strong> 일반 텍스트 제목; 동작은 실제 Button으로.{" "}
          <strong>권장:</strong> 명확한 CTA 하나.
        </p>
        <div className="mt-4 max-w-lg">
          <EmptyState
            action={<Button name="docs-invite" variant="primary">팀원 초대</Button>}
            description="이 워크스페이스에서 협업할 동료를 초대하세요."
            title="아직 멤버가 없습니다"
          />
        </div>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">레이아웃</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">Card(복합)</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 일반 패널·요약.{" "}
          <code className="rounded bg-neutral-800 px-1">CardHeader</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">CardBody</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">CardFooter</code>로 조합.
        </p>
        <div className="mt-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>API 지연</CardTitle>
              <CardDescription>최근 1시간 P95</CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-neutral-300">124 ms — SLO 이내.</p>
            </CardBody>
            <CardFooter>
              <Button name="card-details" variant="primary">
                트레이스 보기
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">AppShell</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> SaaS 대시보드 최상위 레이아웃 셸.{" "}
          <strong>접근성:</strong> 사이드바는 <code className="rounded bg-neutral-800 px-1">&lt;aside&gt;</code>,{" "}
          헤더는 <code className="rounded bg-neutral-800 px-1">&lt;header&gt;</code>,{" "}
          본문은 <code className="rounded bg-neutral-800 px-1">&lt;main&gt;</code>.{" "}
          <strong>권장:</strong> Sidebar·NavTabs와 조합.{" "}
          <strong>비권장:</strong> AppShell 안에 AppShell 중첩.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">KPIGrid</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> KPI 카드용 반응형 그리드(모바일 1열~데스크톱 4열).{" "}
          <strong>권장:</strong> StatCard 또는 MetricCard로 채움.{" "}
          <strong>비권장:</strong> 지표가 아닌 콘텐츠 혼입.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Separator</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 섹션 사이 시각적 구분선.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;separator&quot;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-orientation</code>.
        </p>
        <div className="mt-4 max-w-xs">
          <p className="text-sm text-neutral-300">섹션 A</p>
          <Separator className="my-3" />
          <p className="text-sm text-neutral-300">섹션 B</p>
        </div>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">내비게이션</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">Sidebar</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 그룹 링크가 있는 세로 내비 패널.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">&lt;nav aria-label=&quot;주 메뉴&quot;&gt;</code>.{" "}
          <strong>권장:</strong> 논리 구역은 SidebarGroup.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">NavTabs</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 앵커 기반 가로 내비 탭.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">&lt;nav aria-label=&quot;섹션&quot;&gt;</code>.{" "}
          <strong>권장:</strong> 페이지 수준 라우트 전환.{" "}
          <strong>비권장:</strong> Tabs(제어 탭 패널)와 혼동.
        </p>
        <div className="mt-4">
          <NavTabs>
            <NavTabsItem href="#" active>
              개요
            </NavTabsItem>
            <NavTabsItem href="#">분석</NavTabsItem>
            <NavTabsItem href="#">설정</NavTabsItem>
          </NavTabs>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Tabs</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 페이지 내 콘텐츠 전환용 제어 탭 패널.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;tablist&quot;</code>,{" "}
          <code className="rounded bg-neutral-800 px-1">role=&quot;tab&quot;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-selected</code>; 좌우 화살표 키.{" "}
          <strong>비권장:</strong> NavTabs(라우트 기반)와 혼동.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Breadcrumb</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 계층 내비용 경로.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">&lt;nav aria-label=&quot;경로&quot;&gt;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">&lt;ol&gt;</code>; 구분자는{" "}
          <code className="rounded bg-neutral-800 px-1">aria-hidden</code>.
        </p>
        <div className="mt-4">
          <Breadcrumb>
            <BreadcrumbItem>
              <span className="text-neutral-400">홈</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-neutral-400">프로젝트</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-white">Analytics API</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Pagination</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 이전/다음과 페이지 표시.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">&lt;nav aria-label=&quot;페이지 탐색&quot;&gt;</code>;
          경계에서 버튼 비활성.{" "}
          <strong>권장:</strong> DataTable과 짝.
        </p>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">피드백</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">Alert</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 인라인 메시지, 검증 요약, 시스템 공지.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;alert&quot;</code>.
        </p>
        <div className="mt-4 max-w-md space-y-2">
          <Alert title="안내" variant="info">
            일반 안내입니다.
          </Alert>
          <Alert variant="success">작업이 완료되었습니다.</Alert>
          <Alert title="경고" variant="warning">
            계속하기 전에 확인하세요.
          </Alert>
          <Alert variant="error">오류가 발생했습니다.</Alert>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">AlertBanner</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 시스템 수준 공지용 전폭 배너.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;alert&quot;</code>;
          닫기 버튼 <code className="rounded bg-neutral-800 px-1">aria-label=&quot;배너 닫기&quot;</code>.{" "}
          <strong>권장:</strong> 페이지 상단, AppShell 밖.{" "}
          <strong>비권장:</strong> 배너 여러 개 쌓기.
        </p>
        <div className="mt-4">
          <AlertBanner variant="warning" title="점검">
            일요일 02:00 UTC에 플랫폼이 잠시 중단될 수 있습니다.
          </AlertBanner>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Dialog</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 네이티브 <code className="rounded bg-neutral-800 px-1">&lt;dialog&gt;</code> 모달.{" "}
          <strong>접근성:</strong> DialogTitle의 <code className="rounded bg-neutral-800 px-1">aria-labelledby</code>;
          Escape는 cancel로 닫힘.{" "}
          <strong>권장:</strong> DialogTitle 항상 포함.{" "}
          <strong>비권장:</strong> 다이얼로그 중첩.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Toast</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 컨텍스트 프로바이더로 잠깐 뜨는 알림(약 4.5초 후 자동 닫힘).{" "}
          <strong>접근성:</strong> 영역 <code className="rounded bg-neutral-800 px-1">aria-live=&quot;polite&quot;</code>;
          토스트마다 <code className="rounded bg-neutral-800 px-1">role=&quot;status&quot;</code>.{" "}
          <strong>비권장:</strong> 막는 치명 오류 — Dialog나 Alert 사용.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Tooltip</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> Floating UI 기반 호버/포커스 툴팁.{" "}
          <strong>접근성:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;tooltip&quot;</code>;
          호버(120ms 지연)·포커스 시 표시; Escape로 닫힘.{" "}
          <strong>비권장:</strong> 툴팁 내에 상호작용 요소.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">DropdownMenu</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 클릭으로 열리는 <code className="rounded bg-neutral-800 px-1">role=&quot;menu&quot;</code> 드롭다운.{" "}
          <strong>접근성:</strong> 트리거에 <code className="rounded bg-neutral-800 px-1">aria-expanded</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-haspopup=&quot;menu&quot;</code>;
          항목은 <code className="rounded bg-neutral-800 px-1">role=&quot;menuitem&quot;</code> 버튼.{" "}
          <strong>비권장:</strong> 드롭다운 중첩.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">Command</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 커맨드 팔레트(Dialog + 검색 목록).{" "}
          <strong>접근성:</strong> 입력 <code className="rounded bg-neutral-800 px-1">type=&quot;search&quot;</code>;
          항목은 <code className="rounded bg-neutral-800 px-1">role=&quot;listbox&quot;</code> 안의{" "}
          <code className="rounded bg-neutral-800 px-1">role=&quot;option&quot;</code>.{" "}
          <strong>비권장:</strong> 단순 선택 — Select나 RadioGroup.
        </p>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">아이덴티티</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">Avatar 및 AvatarGroup</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 사용자·조직 표시.{" "}
          <strong>접근성:</strong> 이미지는 <code className="rounded bg-neutral-800 px-1">alt</code>; 폴백은{" "}
          <code className="rounded bg-neutral-800 px-1">role=&quot;img&quot;</code>와{" "}
          <code className="rounded bg-neutral-800 px-1">aria-label</code>.{" "}
          AvatarGroup 넘침 칩은 <code className="rounded bg-neutral-800 px-1">aria-label=&quot;N명 더 있음&quot;</code> 형식.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Avatar fallback="AB" size="sm" />
          <Avatar fallback="CD" size="md" />
          <Avatar fallback="EF" size="lg" />
          <AvatarGroup max={3}>
            <Avatar fallback="A" size="md" />
            <Avatar fallback="B" size="md" />
            <Avatar fallback="C" size="md" />
            <Avatar fallback="D" size="md" />
            <Avatar fallback="E" size="md" />
          </AvatarGroup>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">LinkCard</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 외부 리소스·라우트로 가는 링크 타일.{" "}
          <strong>접근성:</strong> 제목+설명이 하나의 앵커. 외부 URL은 <code className="rounded bg-neutral-800 px-1">rel</code>과 함께 새 탭.
        </p>
        <div className="mt-4 max-w-[280px]">
          <LinkCard href="https://turborepo.com/docs" title="문서">
            Turborepo에 대한 자세한 정보를 확인하세요.
          </LinkCard>
        </div>
      </section>

      <h2 className="mt-14 border-b border-neutral-800 pb-2 text-2xl font-bold text-white">유틸리티</h2>

      <section className="mt-8">
        <h3 className="text-xl font-semibold text-white">VisuallyHidden</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> 시각적으로는 숨기고 스크린 리더에만 노출.{" "}
          <strong>권장:</strong> 건너뛰기 링크, 아이콘 전용 버튼 레이블, 추가 맥락.{" "}
          <strong>비권장:</strong> 장식용 숨김 — <code className="rounded bg-neutral-800 px-1">aria-hidden</code> 사용.
        </p>
      </section>

      <section className="mt-10">
        <h3 className="text-xl font-semibold text-white">CommandBar</h3>
        <p className="mt-2 text-sm text-neutral-400">
          <strong>용도:</strong> <code className="rounded bg-neutral-800 px-1">role=&quot;search&quot;</code> 인라인 검색 바 컨테이너.{" "}
          <strong>권장:</strong> Input·FilterChip과 조합.{" "}
          <strong>비권장:</strong> 폼 대용 — <code className="rounded bg-neutral-800 px-1">&lt;form&gt;</code> 요소 사용.
        </p>
      </section>
    </>
  );
}
