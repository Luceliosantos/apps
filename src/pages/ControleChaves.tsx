import { FilePlus, Link2, Search, Edit3, Home } from "lucide-react";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";

type Props = {
  usuario: {
    matricula: string;
    nome: string;
  };
  permissoes: { sistema: string; tipo: string }[];
  chavesDisponiveis: number;
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
};

type ActionCard = {
  id: Pagina;
  title: string;
  description: string;
  icon: React.ReactNode;
  check: () => boolean;
};

export default function ControleChaves({
  usuario,
  permissoes,
  chavesDisponiveis,
  setPagina,
  handleLogout,
}: Props) {
  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  const acessoModulo = temPermissao("chaves", [
    "leitura",
    "gravacao",
    "comissionador",
    "cad_ch",
  ]);

  if (!acessoModulo) {
    setPagina("menu");
    return null;
  }

  const actions: ActionCard[] = [
    {
      id: "cadastro",
      title: "Cadastrar",
      description: "Importar novas chaves via planilha Excel",
      icon: <FilePlus size={28} />,
      check: () => temPermissao("chaves", ["cad_ch"]),
    },
    {
      id: "associacao",
      title: "Associar",
      description: "Vincular chaves a notas, postes e coordenadas",
      icon: <Link2 size={28} />,
      check: () => temPermissao("chaves", ["gravacao", "comissionador"]),
    },
    {
      id: "consulta",
      title: "Consulta",
      description: "Pesquisar e exportar dados das chaves",
      icon: <Search size={28} />,
      check: () =>
        temPermissao("chaves", [
          "leitura",
          "gravacao",
          "comissionador",
          "cad_ch",
        ]),
    },
    {
      id: "corrigirCadastro",
      title: "Corrigir",
      description: "Remover associacoes de chaves cadastradas",
      icon: <Edit3 size={28} />,
      check: () =>
        temPermissao("global", ["admin"]) ||
        (temPermissao("global", ["usuario"]) &&
          temPermissao("chaves", ["comissionador"])),
    },
    {
      id: "menu",
      title: "Home",
      description: "Voltar ao menu principal",
      icon: <Home size={28} />,
      check: () => true,
    },
  ];

  const visibleActions = actions.filter((a) => a.check());

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="home"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Controle de Chaves"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Sistema de Gestao de Chaves
          </h2>
          <p className="text-text-secondary">
            <span className="text-accent font-semibold">{chavesDisponiveis}</span> chaves disponiveis para associacao
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleActions.map((action) => (
            <Card
              key={action.id}
              hoverable
              onClick={() => setPagina(action.id)}
              className="group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors mb-4">
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {action.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
