import { DocsSidebar } from "../../components/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar />
      <div className="flex-1 overflow-auto">
        <article
          id="main-content"
          className="mx-auto max-w-3xl px-6 py-10 lg:px-8"
          tabIndex={-1}
        >
          {children}
        </article>
      </div>
    </div>
  );
}
