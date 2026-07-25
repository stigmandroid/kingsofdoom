import Image from "next/image";
import Link from "next/link";

const navigationItems = [
  { label: "Painel", href: "/" },
  { label: "Guerra", href: "/war" },
  { label: "CWL", href: "/cwl" },
  { label: "Membros", href: "/members" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Ir para a página inicial"
        >
          <Image
            src="/kod-logo.png"
            alt="Logotipo do clã K.O.D."
            width={64}
            height={64}
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />

          <div translate="no" className="notranslate flex flex-col">
            <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
              K.O.D.
            </span>

            <span className="text-xs text-slate-400 sm:text-sm">
              Kings of Doom
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-amber-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/war"
          className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition duration-200 hover:border-amber-300 hover:bg-amber-400/20"
        >
          <span className="hidden sm:inline">Sala de Guerra</span>
          <span className="sm:hidden">Guerra</span>
        </Link>
      </div>
    </header>
  );
}
