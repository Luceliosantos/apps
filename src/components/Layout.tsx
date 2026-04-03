import { useState } from "react";
import {
  Home,
  Key,
  FilePlus,
  Link2,
  Search,
  Edit3,
  MapPin,
  DollarSign,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import type { Pagina } from "../App";

type NavItem = {
  id: Pagina;
  label: string;
  icon: React.ReactNode;
  sistema?: string;
  tipos?: string[];
};

type LayoutProps = {
  children: React.ReactNode;
  usuario: { nome: string; matricula: string };
  permissoes: { sistema: string; tipo: string }[];
  pagina: Pagina;
  setPagina: (p: Pagina) => void;
  handleLogout: () => void;
  title?: string;
};

const navItems: NavItem[] = [
  { id: "menu", label: "Inicio", icon: <Home size={20} /> },
  {
    id: "home",
    label: "Chaves",
    icon: <Key size={20} />,
    sistema: "chaves",
    tipos: ["leitura", "gravacao", "comissionador", "cad_ch"],
  },
  {
    id: "cadastro",
    label: "Cadastrar",
    icon: <FilePlus size={20} />,
    sistema: "chaves",
    tipos: ["cad_ch"],
  },
  {
    id: "associacao",
    label: "Associar",
    icon: <Link2 size={20} />,
    sistema: "chaves",
    tipos: ["gravacao", "comissionador"],
  },
  {
    id: "consulta",
    label: "Consulta",
    icon: <Search size={20} />,
    sistema: "chaves",
    tipos: ["leitura", "gravacao", "comissionador", "cad_ch"],
  },
  {
    id: "corrigirCadastro",
    label: "Corrigir",
    icon: <Edit3 size={20} />,
    sistema: "chaves",
    tipos: ["cad_ch"],
  },
  {
    id: "geo",
    label: "Geo",
    icon: <MapPin size={20} />,
    sistema: "acomp_geo",
    tipos: ["leitura"],
  },
  {
    id: "proorc",
    label: "Proorc",
    icon: <DollarSign size={20} />,
    sistema: "proorc",
    tipos: ["leitura", "gravacao"],
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: <Users size={20} />,
    sistema: "global",
    tipos: ["admin"],
  },
];

export default function Layout({
  children,
  usuario,
  permissoes,
  pagina,
  setPagina,
  handleLogout,
  title,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function temPermissao(sistema?: string, tipos?: string[]) {
    if (!sistema || !tipos) return true;
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  const visibleItems = navItems.filter((item) =>
    temPermissao(item.sistema, item.tipos)
  );

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-bg-secondary border-r border-border
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <span className="text-lg font-semibold text-text-primary truncate">
              Apps Integrados
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = pagina === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setPagina(item.id);
                      setMobileOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-accent/10 text-accent border-l-2 border-accent"
                          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                      }
                      ${collapsed ? "justify-center px-2" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="truncate text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium text-text-primary truncate">
                {usuario.nome}
              </p>
              <p className="text-xs text-text-muted truncate">
                {usuario.matricula}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-text-secondary hover:bg-error/10 hover:text-error
              transition-all duration-200
              ${collapsed ? "justify-center px-2" : ""}
            `}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center h-16 px-4 lg:px-6 border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 -ml-2 mr-2 rounded-lg hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {title}
            </h1>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
