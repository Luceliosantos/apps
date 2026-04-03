import { useState, useEffect } from "react";
import { FileSpreadsheet, FileText, Trash2, Search, Package, PackageOpen } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../supabase";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
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

type Registro = Record<string, unknown>;

type UsuarioInfo = {
  matricula: string;
  nome: string;
};

export default function Consulta({
  usuario,
  permissoes,
  setPagina,
  handleLogout,
}: Props) {
  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  if (
    !temPermissao("chaves", ["leitura", "gravacao", "comissionador", "cad_ch"])
  ) {
    setPagina("home");
    return null;
  }

  const [tipoBusca, setTipoBusca] = useState("");
  const [valorBusca, setValorBusca] = useState("");
  const [dados, setDados] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [qtdDisponiveis, setQtdDisponiveis] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);

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

  useEffect(() => {
    async function carregarUsuarios() {
      const { data } = await supabase
        .from("db_usuarios_apps")
        .select("matricula,nome");
      if (data) setUsuarios(data);
    }
    carregarUsuarios();
  }, []);

  const botaoHabilitado = tipoBusca !== "" && valorBusca !== "";

  async function consultar() {
    setLoading(true);

    let query = supabase.from("db_chaves").select("*");

    if (tipoBusca === "ns") {
      query = query.eq("ns", Number(valorBusca));
    } else if (tipoBusca === "numero") {
      query = query.eq("numero", Number(valorBusca));
    } else if (tipoBusca === "dt_ass_db") {
      const inicio = `${valorBusca} 00:00:00`;
      const fim = `${valorBusca} 23:59:59`;
      query = query.gte("dt_ass_db", inicio).lte("dt_ass_db", fim);
    } else {
      query = query.ilike(tipoBusca, `%${valorBusca}%`);
    }

    const { data, error } = await query;
    if (!error && data) setDados(data);
    setLoading(false);
  }

  async function chavesEmpenhadas() {
    const { data } = await supabase
      .from("db_chaves")
      .select("*")
      .not("ns", "is", null);
    if (data) setDados(data);
  }

  async function chavesDisponiveis() {
    const { data } = await supabase
      .from("db_chaves")
      .select("*")
      .is("ns", null);
    if (data) setDados(data);
  }

  function formatarData(valor: unknown) {
    if (!valor) return "-";
    return new Date(valor as string)
      .toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", " -");
  }

  function obterNomeUsuario(matricula: unknown) {
    if (!matricula) return "-";
    const u = usuarios.find((x) => x.matricula == matricula);
    return u?.nome || String(matricula);
  }

  function prepararDadosExportacao() {
    return dados.map((linha) => {
      const novo: Record<string, string> = {};
      Object.entries(linha)
        .filter(([col]) => col !== "id" && col !== "dt_disp")
        .forEach(([col, val]) => {
          if (col === "dt_ass_db") {
            novo[col.toUpperCase()] = formatarData(val);
          } else {
            novo[col.toUpperCase()] = val == null || val === "" ? "-" : String(val);
          }
        });
      return novo;
    });
  }

  function gerarExcel() {
    const dadosFormatados = prepararDadosExportacao();
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consulta");
    XLSX.writeFile(workbook, "consulta.xlsx");
  }

  function gerarPDF() {
    if (dados.length === 0) return;
    const dadosFormatados = prepararDadosExportacao();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [Object.keys(dadosFormatados[0])],
      body: dadosFormatados.map(Object.values),
    });
    doc.save("consulta.pdf");
  }

  function limpar() {
    setDados([]);
    setTipoBusca("");
    setValorBusca("");
  }

  const nomesColunas: Record<string, string> = {
    numero: "NUMERO",
    dt_cad_db: "DATA CADASTRO",
    usu_cad_db: "USUARIO CADASTRO",
    ns: "NOTA",
    flh: "FOLHA",
    poste: "POSTE",
    coordenada: "COORDENADA",
    coord: "COORDENADA",
    usu_ass: "USUARIO ASSOCIACAO",
    dt_ass_db: "DATA ASSOCIACAO",
  };

  const tiposBusca = [
    { value: "", label: "Selecione" },
    { value: "ns", label: "Nota" },
    { value: "numero", label: "Chave" },
    { value: "coordenada", label: "Coordenada" },
    { value: "usu_ass", label: "Matricula Usuario" },
    { value: "dt_ass_db", label: "Data Associacao" },
  ];

  const colunas = dados[0]
    ? Object.keys(dados[0]).filter(
        (col) => col !== "id" && col !== "dt_disp"
      )
    : [];

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="consulta"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Consulta de Chaves"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="text-sm text-text-secondary">
          Chaves disponiveis: {qtdDisponiveis}
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar</CardTitle>
          </CardHeader>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-48">
              <Select
                value={tipoBusca}
                onChange={(e) => setTipoBusca(e.target.value)}
                options={tiposBusca}
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <Input
                type={tipoBusca === "dt_ass_db" ? "date" : "text"}
                value={valorBusca}
                onChange={(e) => setValorBusca(e.target.value)}
                placeholder="Digite o valor"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && botaoHabilitado) consultar();
                }}
              />
            </div>

            <Button
              onClick={consultar}
              disabled={!botaoHabilitado}
              loading={loading}
              icon={<Search size={18} />}
            >
              Consultar
            </Button>

            <Button
              variant="secondary"
              onClick={chavesDisponiveis}
              icon={<PackageOpen size={18} />}
            >
              Disponiveis
            </Button>

            <Button
              variant="secondary"
              onClick={chavesEmpenhadas}
              icon={<Package size={18} />}
            >
              Empenhadas
            </Button>
          </div>
        </Card>

        {/* Results */}
        {dados.length > 0 && (
          <>
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={gerarPDF}
                icon={<FileText size={18} />}
              >
                Gerar PDF
              </Button>
              <Button
                variant="secondary"
                onClick={gerarExcel}
                icon={<FileSpreadsheet size={18} />}
              >
                Gerar Excel
              </Button>
              <Button
                variant="ghost"
                onClick={limpar}
                icon={<Trash2 size={18} />}
              >
                Limpar
              </Button>
              <span className="flex items-center text-sm text-text-secondary ml-auto">
                {dados.length} registros encontrados
              </span>
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  {colunas.map((col) => (
                    <TableHead key={col}>
                      {nomesColunas[col] || col.toUpperCase()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((linha, index) => (
                  <TableRow key={index}>
                    {colunas.map((col) => (
                      <TableCell key={col} className="font-mono text-sm">
                        {col === "usu_cad_db" || col === "usu_ass"
                          ? obterNomeUsuario(linha[col])
                          : col === "dt_ass_db"
                          ? formatarData(linha[col])
                          : linha[col] == null || linha[col] === ""
                          ? "-"
                          : String(linha[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {dados.length === 0 && !loading && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Utilize os filtros acima para pesquisar chaves
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
