import { Alert } from "@repo/ui/alert";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";

export default function ComponentsPage() {
  return (
    <main className="min-h-screen p-24 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Component Docs</h1>
      <p className="text-neutral-400 mb-12">
        Usage and examples for @repo/ui components.
      </p>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Button</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Actions and form submit. Variants: default, primary, danger.
        </p>
        <pre className="bg-neutral-900 rounded-lg p-4 text-sm mb-4 overflow-x-auto">
          {`import { Button } from "@repo/ui/button";`}
        </pre>
        <div className="flex gap-2 mb-4">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Badge</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Labels and status indicators. Variants: default, success, warning,
          danger.
        </p>
        <pre className="bg-neutral-900 rounded-lg p-4 text-sm mb-4 overflow-x-auto">
          {`import { Badge } from "@repo/ui/badge";`}
        </pre>
        <div className="flex gap-2 flex-wrap mb-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Avatar</h2>
        <p className="text-sm text-neutral-400 mb-4">
          User or entity image with optional fallback. Sizes: sm, md, lg.
        </p>
        <pre className="bg-neutral-900 rounded-lg p-4 text-sm mb-4 overflow-x-auto">
          {`import { Avatar } from "@repo/ui/avatar";`}
        </pre>
        <div className="flex gap-2 items-center mb-4">
          <Avatar fallback="AB" size="sm" />
          <Avatar fallback="CD" size="md" />
          <Avatar fallback="EF" size="lg" />
          <Avatar src="https://github.com/vercel.png" alt="Vercel" size="md" />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Card</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Link card with title and description.
        </p>
        <pre className="bg-neutral-900 rounded-lg p-4 text-sm mb-4 overflow-x-auto">
          {`import { Card } from "@repo/ui/card";`}
        </pre>
        <div className="max-w-[280px] mb-4">
          <Card href="https://turborepo.com/docs" title="Documentation">
            Find in-depth information about Turborepo.
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Alert</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Message or notification box. Variants: info, success, warning, error.
        </p>
        <pre className="bg-neutral-900 rounded-lg p-4 text-sm mb-4 overflow-x-auto">
          {`import { Alert } from "@repo/ui/alert";`}
        </pre>
        <div className="space-y-2 max-w-md mb-4">
          <Alert variant="info" title="Info">
            General information message.
          </Alert>
          <Alert variant="success">Operation completed.</Alert>
          <Alert variant="warning" title="Warning">
            Please review before continuing.
          </Alert>
          <Alert variant="error">An error occurred.</Alert>
        </div>
      </section>
    </main>
  );
}
