import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { NavigationWithActiveLink } from "@/components/navigation-with-active-link";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

import { title } from "process";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";


export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Bna Gestion",
  description: "La plateforme de gestion de vos audits",
};


const navigation = {
  pagePrincipales: {
    title: "Services Opérationelles",
    items: [
      { title: "Accueil", href: "/protected/dashboard" },
      { title: "Audits enregistrés", href: "/protected/audits" },
      { title: "Cotations", href: "/protected/cotations" },
      { title: "Factures", href: "/protected/factures" },
      { title: "Autorisation de missions", href: "/protected/fiche-autorisations" },
      { title: "Ordre de missions", href: "/protected/ordre-missions",items: [{title:"Revue de certification",href:"/protected/ordre-missions/revue-certification"}] },
    ],
  },

  ControleGestion: {
    title: "Controle de gestion",
    items: [
      {
        title: "Rentabilité", href: "/protected/rentabilite",
        items: [
          { title: "Vue globale", href: "/protected/rentabilite" },
          { title: "Categories", href: "/protected/rentabilite/categories" },
          { title: "Paiement Honoraire", href: "/protected/rentabilite/paiement-honoraire" },
          { title: "Frais d'enregistrement", href: "/protected/rentabilite/paiement-frais-enregistrement" },
        ]
      },
      { title: "Bilan", href: "/protected/bilan" },
    ],
  },

  autres: {
    title: "Autres",
    items: [
      { title: "Clients enregistrés", href: "/protected/clients" },
      { title: "Auditeurs enregistrés", href: "/protected/auditeurs" }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <main className="flex-1 p-4">
                <nav className="flex justify-between items-center border-b border-b-foreground/10 h-16 px-4">
                  <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <HeaderAuth />
                  </div>
                </nav>
                {children}
                <footer className="border-t mx-auto text-center text-xs py-8">
                  <p>
                    developpe par {" "}
                    <a
                      href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                      target="_blank"
                      className="font-bold hover:underline"
                      rel="noreferrer"
                    >
                    </a>
                  </p>
                </footer>
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}