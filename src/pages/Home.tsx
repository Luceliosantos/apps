import { Key, MapPin, DollarSign, Users } from "lucide-react";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  permissoes: { sistema: string; tipo: string }[];
  usuario: {
    id?: string;
    matricula: string;
    nome: string;
  };
};

type ModuleCard = {
  id: Pagina;
  title: string;
  description: string;
  icon: React.ReactNode;
  sistema: string;
  tipos: string[];
};

const modules: ModuleCard[] = [
  {
    id: "home",
    title: "Cadastro de Chaves",
    description: "Gerencie o cadastro, associacao e consulta de chaves",
    icon: <Key size={32} />,
    sistema: "chaves",
    tipos: ["leitura", "gravacao", "comissionador", "cad_ch"],
  },
  {
    id: "geo",
    title: "Acompanhamento GEO",
    description: "Monitore os indicadores geograficos por regional",
    icon: <MapPin size={32} />,
    sistema: "acomp_geo",
    tipos: ["leitura"],
  },
  {
    id: "proorc",
    title: "Proorc 2.0",
    description: "Gerencie o programa orcamentario",
    icon: <DollarSign size={32} />,
    sistema: "proorc",
    tipos: ["leitura", "gravacao"],
  },
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Administre usuarios e permissoes do sistema",
    icon: <Users size={32} />,
    sistema: "global",
    tipos: ["admin"],
  },
];

export default function Home({
  setPagina,
  handleLogout,
  usuario,
  permissoes,
}: Props) {
  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes?.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  const visibleModules = modules.filter((m) =>
    temPermissao(m.sistema, m.tipos)
  );

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="menu"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Sistemas"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Bem-vindo, {usuario.nome}
          </h2>
          <p className="text-text-secondary">
            Selecione um dos sistemas abaixo para comecar
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {visibleModules.map((module) => (
            <Card
              key={module.id}
              hoverable
              onClick={() => setPagina(module.id)}
              className="group"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                  {module.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {module.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {visibleModules.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Voce nao tem permissao para acessar nenhum sistema.
              <br />
              Entre em contato com o administrador.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
