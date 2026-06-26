import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";

/** Apply stored theme before paint to avoid flash; must match web ThemeToggle STORAGE_KEY and values. */
const THEME_BOOTSTRAP = `(function(){try{var k="saas-interface-kit-theme",lk="northline-theme",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){var o=localStorage.getItem(lk);if(o==="light"||o==="dark"){localStorage.setItem(k,o);localStorage.removeItem(lk);t=o;}}t=t||"dark";var r=document.documentElement;if(t==="light"){r.classList.add("light");r.setAttribute("data-theme","light");}else{r.classList.remove("light");r.removeAttribute("data-theme");}}catch(e){}})();`;

export const metadata: Metadata = {
  title: "문서 — Turbo Repo",
  description: "Turbo Repo 모노레포 문서입니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-1000"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
