import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
};

export function AppShell({ children, eyebrow = "JLPT N5 / N4", title, description }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-6 rounded-lg border border-white/80 bg-white/75 p-4 shadow-card backdrop-blur sm:p-6">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-ink/70">
          <Link className="rounded-full bg-paper px-3 py-2 transition hover:bg-sakura/25" href="/">
            Home
          </Link>
          <Link className="rounded-full bg-paper px-3 py-2 transition hover:bg-sakura/25" href="/vocabulary">
            Vocabulary
          </Link>
          <Link className="rounded-full bg-paper px-3 py-2 transition hover:bg-sakura/25" href="/grammar">
            Grammar
          </Link>
          <Link className="rounded-full bg-paper px-3 py-2 transition hover:bg-sakura/25" href="/exam">
            Exam
          </Link>
          <Link className="rounded-full bg-paper px-3 py-2 transition hover:bg-sakura/25" href="/grammar-exam">
            Grammar Exam
          </Link>
        </nav>
        <div className="inline-flex items-center rounded-full bg-matcha/10 px-3 py-1 text-xs font-bold text-matcha">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-normal text-ink sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{description}</p> : null}
      </header>
      {children}
    </main>
  );
}
