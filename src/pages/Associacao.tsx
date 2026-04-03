import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
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
  atualizarContagem: () => Promise<void>;
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
};

type Registro = {
  numero: number;
  flh: string;
  poste: string;
  coord: string;
  dt_ass_db: string;
};

export default function Associacao({
  usuario,
  permissoes,
  atualizarContagem,
  setPagina,
  handleLogout,
}: Props) {
  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  if (!temPermissao("chaves", ["gravacao", "comissionador"])) {
    setPagina("home");
    return null;
  }

  const [nota, setNota] = useState("");
  const [folha, setFolha] = useState("");
  const [poste, setPoste] = useState("");
  const [coordenada, setCoordenada] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);
  const [lista, setLista] = useState<Registro[]>([]);
  const [destacarUltima, setDestacarUltima] = useState(false);
  const [qtdDisponiveis, setQtdDisponiveis] = useState(0);

  useEffect(() => {
    async function carregarDisponiveis() {
      const { count } = await supabase
        .from("db_chaves")
        .select("*", { count: "exact", head: true })
        .is("ns", null);
      setQtdDisponiveis(count || 0);
    }
    carregarDisponiveis();
  }, []);

  const notaValida = /^[1-9][0-9]{9}$/.test(nota);
  const folhaValida = /^[0-9]+$/.test(folha);
  const posteValido = /^[0-9]+$/.test(poste);
  const coordenadaValida = /^[0-9]{6}:[0-9]{7}$/.test(coordenada);
  const formValido = notaValida && folhaValida && posteValido && coordenadaValida;

  async function buscarLista(n: string) {
    const { data } = await supabase
      .from("db_chaves")
      .select("numero, flh, poste, coord, dt_ass_db")
      .eq("ns", Number(n))
      .order("dt_ass_db", { ascending: false });
    if (data) setLista(data);
  }

  async function handleAssociar() {
    if (!formValido) return;

    setLoading(true);
    setMensagem("");

    const { data: coordExiste } = await supabase
      .from("db_chaves")
      .select("numero")
      .eq("coord", coordenada)
      .not("ns", "is", null)
      .maybeSingle();

    if (coordExiste) {
      setMensagem("Ja existe chave nesta coordenada.");
      setMensagemTipo("error");
      setLoading(false);
      return;
    }

    const { data: conjuntoExiste } = await supabase
      .from("db_chaves")
      .select("numero")
      .match({ ns: Number(nota), flh: folha, poste: poste })
      .maybeSingle();

    if (conjuntoExiste) {
      setMensagem("Ja existe chave com esta Nota, Folha e Poste.");
      setMensagemTipo("error");
      setLoading(false);
      return;
    }

    const { data: chave } = await supabase
      .from("db_chaves")
      .select("numero")
      .is("ns", null)
      .order("numero", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!chave) {
      setMensagem("Nao existem chaves disponiveis.");
      setMensagemTipo("error");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("db_chaves")
      .update({
        ns: Number(nota),
        flh: folha,
        poste: poste,
        coord: coordenada,
        usu_ass: usuario.matricula,
        dt_ass_db: new Date(),
      })
      .eq("numero", Number(chave.numero))
      .is("ns", null);

    if (error) {
      setMensagem(error.message);
      setMensagemTipo("error");
      setLoading(false);
      return;
    }

    setMensagem("Chave associada com sucesso!");
    setMensagemTipo("success");

    await atualizarContagem();

    const { count } = await supabase
      .from("db_chaves")
      .select("*", { count: "exact", head: true })
      .is("ns", null);
    setQtdDisponiveis(count || 0);

    await buscarLista(nota);

    setDestacarUltima(true);
    setFolha("");
    setPoste("");
    setCoordenada("");

    document.getElementById("campoFolha")?.focus();
    setLoading(false);
  }

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="associacao"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Associar Chave"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Card */}
        <Card className="w-full lg:w-96 lg:flex-shrink-0">
          <CardHeader>
            <CardTitle>Associar Chave</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              Chaves disponiveis: {qtdDisponiveis}
            </p>
          </CardHeader>

          <div className="space-y-4">
            <Input
              label="Nota"
              placeholder="10 digitos"
              value={nota}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "");
                setNota(valor);
                setDestacarUltima(false);
                if (/^[1-9][0-9]{9}$/.test(valor)) {
                  buscarLista(valor);
                } else {
                  setLista([]);
                }
              }}
              error={nota && !notaValida ? "Nota deve ter 10 digitos" : undefined}
            />

            <Input
              id="campoFolha"
              label="Folha"
              placeholder="Numero da folha"
              value={folha}
              onChange={(e) => setFolha(e.target.value.replace(/\D/g, ""))}
            />

            <Input
              label="Poste"
              placeholder="Numero do poste"
              value={poste}
              onChange={(e) => setPoste(e.target.value.replace(/\D/g, ""))}
            />

            <Input
              label="Coordenada"
              placeholder="111111:2222222"
              value={coordenada}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 13);
                if (v.length > 6) {
                  v = v.slice(0, 6) + ":" + v.slice(6);
                }
                setCoordenada(v);
              }}
              error={
                coordenada && !coordenadaValida
                  ? "Formato: 111111:2222222"
                  : undefined
              }
            />

            <Button
              onClick={handleAssociar}
              loading={loading}
              disabled={!formValido}
              className="w-full"
            >
              Associar
            </Button>

            {mensagem && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  mensagemTipo === "success"
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {mensagemTipo === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span className="text-sm">{mensagem}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Table Card */}
        {lista.length > 0 && (
          <Card className="flex-1 min-w-0" padding="sm">
            <CardHeader className="px-2">
              <CardTitle>Chaves da Nota {nota}</CardTitle>
            </CardHeader>

            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Numero</TableHead>
                  <TableHead>Folha</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Coordenada</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((r, i) => (
                  <TableRow
                    key={i}
                    className={
                      destacarUltima && i === 0 ? "bg-success/10" : ""
                    }
                  >
                    <TableCell className="font-mono">{r.numero}</TableCell>
                    <TableCell>{r.flh}</TableCell>
                    <TableCell>{r.poste}</TableCell>
                    <TableCell className="font-mono">{r.coord}</TableCell>
                    <TableCell>
                      {new Date(r.dt_ass_db).toLocaleString("pt-BR")}
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
