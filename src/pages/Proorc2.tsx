import { useEffect, useState, useRef } from "react";
import { Save, Edit2, Trash2 } from "lucide-react";
import { supabase } from "../supabase";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
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
  handleLogout: () => void;
};

type NotaSugestao = { nota: string };
type MaterialSugestao = { codigo: string; descricao: string; tipo: string };
type EstruturaItem = { codigo_item: string; item: string; quantidade: number };
type CadastroItem = {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  aplicacao: string;
  criado_por: string;
  created_at: string;
  editado_por: string;
  updated_at: string;
};
type ExplodidoItem = { codigo: string; descricao: string; quantidade: number };

export default function Proorc2({
  usuario,
  permissoes,
  setPagina,
  handleLogout,
}: Props) {
  const [nota, setNota] = useState("");
  const [notasSug, setNotasSug] = useState<NotaSugestao[]>([]);
  const [showNotasSug, setShowNotasSug] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [materiaisSug, setMateriaisSug] = useState<MaterialSugestao[]>([]);
  const [showMateriaisSug, setShowMateriaisSug] = useState(false);

  const [material, setMaterial] = useState<MaterialSugestao | null>(null);
  const [estrutura, setEstrutura] = useState<EstruturaItem[]>([]);

  const [quantidade, setQuantidade] = useState("");
  const [aplicacao, setAplicacao] = useState("N");

  const [cadastro, setCadastro] = useState<CadastroItem[]>([]);
  const [explodido, setExplodido] = useState<ExplodidoItem[]>([]);

  const [editando, setEditando] = useState<string | null>(null);

  const notaRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nota.length < 2) {
      setNotasSug([]);
      return;
    }
    buscarNotas();
  }, [nota]);

  useEffect(() => {
    if (!nota) return;
    carregarNota();
  }, [nota]);

  useEffect(() => {
    if (codigo.length < 2) {
      setMaterial(null);
      setEstrutura([]);
      setMateriaisSug([]);
      return;
    }
    buscarMateriais();
  }, [codigo]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notaRef.current && !notaRef.current.contains(e.target as Node)) {
        setShowNotasSug(false);
      }
      if (materialRef.current && !materialRef.current.contains(e.target as Node)) {
        setShowMateriaisSug(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function buscarNotas() {
    const { data } = await supabase
      .from("vw_proorc_notas")
      .select("nota")
      .ilike("nota", `${nota}%`)
      .limit(10);
    setNotasSug(data || []);
    setShowNotasSug(true);
  }

  async function buscarMateriais() {
    const { data } = await supabase
      .from("vw_proorc_materiais")
      .select("*")
      .ilike("codigo", `${codigo}%`)
      .limit(10);
    setMateriaisSug(data || []);
    setShowMateriaisSug(true);
  }

  async function selecionarMaterial(cod: string) {
    setCodigo(cod);
    setMateriaisSug([]);
    setShowMateriaisSug(false);

    const { data } = await supabase
      .from("vw_proorc_materiais")
      .select("*")
      .eq("codigo", cod)
      .maybeSingle();

    setMaterial(data);

    if (data?.tipo === "KIT") {
      const { data: itens } = await supabase
        .from("vw_proorc_estrutura")
        .select("*")
        .eq("codigo_kit", data.codigo);
      setEstrutura(itens || []);
    } else {
      setEstrutura([]);
    }
  }

  async function carregarNota() {
    const { data } = await supabase
      .from("vw_proorc_cadastro")
      .select("*")
      .eq("nota", nota)
      .order("created_at");
    setCadastro(data || []);

    const { data: exp } = await supabase
      .from("vw_proorc_cadastro_itens")
      .select("*")
      .eq("nota", nota)
      .order("codigo");
    setExplodido(exp || []);
  }

  async function salvar() {
    if (editando) {
      await supabase
        .from("db_proorc_cadastro")
        .update({
          quantidade: Number(quantidade),
          aplicacao,
        })
        .eq("id", editando);
      setEditando(null);
    } else {
      await supabase.rpc("fn_proorc_cadastrar", {
        p_nota: nota,
        p_codigo: material?.codigo,
        p_quantidade: Number(quantidade),
        p_aplicacao: aplicacao,
      });
    }

    setCodigo("");
    setQuantidade("");
    setAplicacao("N");
    setMaterial(null);
    setEstrutura([]);
    carregarNota();
  }

  async function excluir(id: string) {
    if (!confirm("Confirma exclusao do registro?")) return;
    await supabase.from("db_proorc_cadastro").delete().eq("id", id);
    carregarNota();
  }

  function editar(linha: CadastroItem) {
    setCodigo(linha.codigo);
    setQuantidade(String(linha.quantidade));
    setAplicacao(linha.aplicacao);
    setEditando(linha.id);
  }

  function formatarData(data?: string) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  }

  const podeSalvar = nota && codigo && quantidade && aplicacao;

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="proorc"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="PROORC 2.0"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Note Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Nota de Servico</CardTitle>
            <CardDescription>
              Digite o numero da nota para carregar ou cadastrar materiais
            </CardDescription>
          </CardHeader>

          <div ref={notaRef} className="relative max-w-xs">
            <Input
              placeholder="Digite a nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              onFocus={() => notasSug.length > 0 && setShowNotasSug(true)}
            />
            {showNotasSug && notasSug.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                {notasSug.map((n) => (
                  <button
                    key={n.nota}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-card transition-colors"
                    onClick={() => {
                      setNota(n.nota);
                      setNotasSug([]);
                      setShowNotasSug(false);
                    }}
                  >
                    {n.nota}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Material Registration */}
        {nota && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editando ? "Editar Material" : "Cadastrar Material"}
              </CardTitle>
            </CardHeader>

            <div className="flex flex-wrap gap-4 items-end">
              <div ref={materialRef} className="relative flex-1 min-w-[200px]">
                <Input
                  label="Material ou Kit"
                  placeholder="Digite o codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onFocus={() =>
                    materiaisSug.length > 0 && setShowMateriaisSug(true)
                  }
                />
                {showMateriaisSug && materiaisSug.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                    {materiaisSug.map((m) => (
                      <button
                        key={m.codigo}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-card transition-colors"
                        onClick={() => selecionarMaterial(m.codigo)}
                      >
                        <span className="font-mono">{m.codigo}</span>
                        <span className="text-text-secondary ml-2">
                          - {m.descricao}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-24">
                <Input
                  label="Qtd"
                  type="number"
                  placeholder="0"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              <div className="w-24">
                <Select
                  label="Apl"
                  value={aplicacao}
                  onChange={(e) => setAplicacao(e.target.value)}
                  options={[
                    { value: "N", label: "N" },
                    { value: "U", label: "U" },
                    { value: "S", label: "S" },
                  ]}
                />
              </div>

              <Button
                onClick={salvar}
                disabled={!podeSalvar}
                icon={<Save size={18} />}
              >
                {editando ? "Alterar" : "Gravar"}
              </Button>
            </div>

            {material && (
              <p className="mt-3 text-sm text-text-secondary">
                {material.descricao} ({material.tipo})
              </p>
            )}
          </Card>
        )}

        {/* Kit Structure */}
        {estrutura.length > 0 && (
          <Card padding="sm">
            <CardHeader className="px-2">
              <CardTitle>Estrutura do Kit</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estrutura.map((i) => (
                  <TableRow key={i.codigo_item}>
                    <TableCell className="font-mono">{i.codigo_item}</TableCell>
                    <TableCell>{i.item}</TableCell>
                    <TableCell>{i.quantidade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Registered Items */}
        {cadastro.length > 0 && (
          <Card padding="sm">
            <CardHeader className="px-2">
              <CardTitle>Registros Cadastrados</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Apl</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Data Criacao</TableHead>
                  <TableHead>Editado por</TableHead>
                  <TableHead>Data Edicao</TableHead>
                  <TableHead>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cadastro.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="font-mono">{x.codigo}</TableCell>
                    <TableCell>{x.descricao}</TableCell>
                    <TableCell>{x.quantidade}</TableCell>
                    <TableCell>{x.aplicacao}</TableCell>
                    <TableCell>{x.criado_por}</TableCell>
                    <TableCell>{formatarData(x.created_at)}</TableCell>
                    <TableCell>{x.editado_por || "-"}</TableCell>
                    <TableCell>{formatarData(x.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => editar(x)}
                          icon={<Edit2 size={14} />}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => excluir(x.id)}
                          icon={<Trash2 size={14} />}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Consolidated Items */}
        {explodido.length > 0 && (
          <Card padding="sm">
            <CardHeader className="px-2">
              <CardTitle>Itens Consolidados</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {explodido.map((x) => (
                  <TableRow key={x.codigo}>
                    <TableCell className="font-mono">{x.codigo}</TableCell>
                    <TableCell>{x.descricao}</TableCell>
                    <TableCell className="font-semibold">
                      {x.quantidade}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}
