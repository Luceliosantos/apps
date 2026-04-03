import { useState } from "react";
import type { Pagina } from "../App";
import {
  Home,
  Key,
  FileText,
  Link,
  Search,
  Edit3,
  MapPin,
  DollarSign,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  usuario: {
    id?: string;
    matricula: string;
    nome: string;
  };
  permissoes: { sistema: string; tipo: string }[];
  pagina: string;
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  title?: string;
};

type NavItem = {
  id: Pagina;
  label: string;
  icon: React.ReactNode;
  sistema: string;
  tipos: string[];
  parent?: string;
};

const navItems: NavItem[] = [
  {
    id: "menu",
    label: "Inicio",
    icon: <Home size={20} />,
    sistema: "global",
    tipos: ["user", "admin"],
  },
  {
    id: "home",
    label: "Controle de Chaves",
    icon: <Key size={20} />,
    sistema: "chaves",
    tipos: ["leitura", "gravacao", "comissionador", "cad_ch"],
  },
  {
    id: "cadastro",
    label: "Cadastrar",
    icon: <FileText size={20} />,
    sistema: "chaves",
    tipos: ["cad_ch"],
    parent: "chaves",
  },
  {
    id: "associacao",
    label: "Associar",
    icon: <Link size={20} />,
    sistema: "chaves",
    tipos: ["gravacao", "comissionador"],
    parent: "chaves",
  },
  {
    id: "consulta",
    label: "Consultar",
    icon: <Search size={20} />,
    sistema: "chaves",
    tipos: ["leitura", "gravacao", "comissionador", "cad_ch"],
    parent: "chaves",
  },
  {
    id: "corrigirCadastro",
    label: "Corrigir",
    icon: <Edit3 size={20} />,
    sistema: "chaves",
    tipos: ["cad_ch"],
    parent: "chaves",
  },
  {
    id: "geo",
    label: "Acomp. GEO",
    icon: <MapPin size={20} />,
    sistema: "acomp_geo",
    tipos: ["leitura"],
  },
  {
    id: "proorc",
    label: "Proorc 2.0",
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
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function temPermissao(sistema: string, tipos: string[]) {
    if (sistema === "global" && tipos.includes("user")) return true;
    const p = permissoes?.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  const visibleItems = navItems.filter((item) =>
    temPermissao(item.sistema, item.tipos)
  );

  const currentPage = navItems.find((item) => item.id === pagina);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-bg-sidebar text-text-sidebar
          flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[4.5rem]" : "w-64"}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">Apps Integrados</h1>
              <p className="text-xs text-text-sidebar-muted truncate">
                {usuario.nome}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-bg-sidebar-hover rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive = item.id === pagina;
            const isSubItem = !!item.parent;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setPagina(item.id);
                  setSidebarOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-150
                  ${isSubItem && !collapsed ? "ml-4" : ""}
                  ${
                    isActive
                      ? "bg-white/20 text-white font-medium"
                      : "text-text-sidebar-muted hover:bg-bg-sidebar-hover hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Collapse button - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 text-text-sidebar-muted hover:bg-bg-sidebar-hover hover:text-white rounded-lg transition-colors"
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm">Recolher</span>}
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-red-300 hover:bg-red-500/20 hover:text-red-200
              transition-colors
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-bg-secondary border-b border-border px-4 lg:px-6 h-16 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-bg-card-hover rounded-lg text-text-secondary"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-text-primary">
              {title || currentPage?.label || "Apps Integrados"}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-medium">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
            <span className="hidden md:inline">{usuario.nome}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
