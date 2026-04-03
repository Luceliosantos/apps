import { useState, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { supabase } from "../supabase";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";

type Props = {
  usuario: {
    matricula: string;
    nome: string;
  };
  permissoes: { sistema: string; tipo: string }[];
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  atualizarContagem: () => Promise<void>;
  handleLogout: () => void;
};

type ChaveRecord = {
  id: number;
  numero: number;
  ns: number | null;
  poste: string | null;
  flh: string | null;
  coord: string | null;
  usu_ass: string | null;
  dt_ass_db: string | null;
};

export default function CorrigirCadastro({
  usuario,
  permissoes,
  setPagina,
  atualizarContagem,
  handleLogout,
}: Props) {
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<ChaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState(0);

  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  const acessoPermitido =
    temPermissao("global", ["admin"]) ||
    (temPermissao("global", ["usuario"]) &&
      temPermissao("chaves", ["comissionador"]));

  useEffect(() => {
    carregarQuantidadeDisponivel();
  }, []);

  async function carregarQuantidadeDisponivel() {
    const r = await supabase
      .from("db_chaves")
      .select("*", { count: "exact", head: true })
      .is("ns", null);
    setQuantidadeDisponivel(r.count || 0);
  }

  async function pesquisar() {
    if (!busca) return;

    setLoading(true);
    const valor = Number(busca);

    if (isNaN(valor)) {
      setLista([]);
      setLoading(false);
      return;
    }

    const rNota = await supabase.from("db_chaves").select("*").eq("ns", valor);

    if (rNota.data && rNota.data.length > 0) {
      setLista(rNota.data);
      setLoading(false);
      return;
    }

    const rNumero = await supabase
      .from("db_chaves")
      .select("*")
      .eq("numero", valor);

    setLista(rNumero.data || []);
    setLoading(false);
  }

  async function removerAssociacao(id: number) {
    const confirmar = confirm("Deseja remover a associacao desta chave?");
    if (!confirmar) return;

    await supabase
      .from("db_chaves")
      .update({
        ns: null,
        poste: null,
        flh: null,
        coord: null,
        usu_ass: null,
        dt_ass_db: null,
      })
      .eq("id", id);

    pesquisar();
    carregarQuantidadeDisponivel();
  }

  if (!acessoPermitido) {
    return (
      <Layout
        usuario={usuario}
        permissoes={permissoes}
        pagina="corrigirCadastro"
        setPagina={setPagina}
        handleLogout={handleLogout}
        title="Corrigir Cadastro"
      >
        <Card>
          <p className="text-center text-text-secondary py-8">
            Voce nao tem permissao para acessar esta pagina.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="corrigirCadastro"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Corrigir Cadastro"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="text-sm text-text-secondary">
          {quantidadeDisponivel} chaves disponiveis
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar</CardTitle>
          </CardHeader>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Digite numero da chave ou nota"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") pesquisar();
                }}
              />
            </div>
            <Button onClick={pesquisar} loading={loading} icon={<Search size={18} />}>
              Pesquisar
            </Button>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <p className="text-text-secondary">Buscando...</p>
        ) : lista.length === 0 ? (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Nenhum registro encontrado
            </p>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead>Chave</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Folha</TableHead>
                <TableHead>Coordenada</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Data Associacao</TableHead>
                <TableHead>Acao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.numero}</TableCell>
                  <TableCell>{item.ns || "-"}</TableCell>
                  <TableCell>{item.poste || "-"}</TableCell>
                  <TableCell>{item.flh || "-"}</TableCell>
                  <TableCell className="font-mono">
                    {item.coord || "-"}
                  </TableCell>
                  <TableCell>{item.usu_ass || "-"}</TableCell>
                  <TableCell>
                    {item.dt_ass_db
                      ? new Date(item.dt_ass_db).toLocaleString("pt-BR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.ns && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removerAssociacao(item.id)}
                        icon={<Trash2 size={14} />}
                      >
                        Remover
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}
