import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "../supabase";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";

type Registro = {
  numero: string;
  data: string;
  erro?: string;
};

type Props = {
  usuario: {
    matricula: string;
    nome: string;
  };
  permissoes: { sistema: string; tipo: string }[];
  chavesDisponiveis: number;
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  atualizarContagem: () => Promise<void>;
};

export default function Cadastro({
  usuario,
  permissoes,
  chavesDisponiveis,
  setPagina,
  handleLogout,
  atualizarContagem,
}: Props) {
  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
    return tipos.includes(p.tipo);
  }

  if (!temPermissao("chaves", ["cad_ch"])) {
    setPagina("home");
    return null;
  }

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [erroImportacao, setErroImportacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function dataHojeBR() {
    return new Date().toLocaleDateString("pt-BR");
  }

  function processFile(file: File) {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      const novos: Registro[] = [];

      for (let i = 0; i < json.length; i++) {
        const numero = String((json[i] as unknown[])[0] ?? "").trim();
        let erro = "";

        if (!/^[1-9]\d{5}$/.test(numero)) {
          erro = "Numero deve ter 6 digitos e nao pode iniciar com 0";
        }

        novos.push({
          numero,
          data: dataHojeBR(),
          erro: erro || undefined,
        });
      }

      setRegistros(novos);
      setErroImportacao("");
    };

    reader.readAsBinaryString(file);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleCadastrar() {
    setErroImportacao("");
    const registrosAtualizados = [...registros];
    let possuiErro = false;

    for (let i = 0; i < registrosAtualizados.length; i++) {
      const r = registrosAtualizados[i];
      const { data } = await supabase
        .from("db_chaves")
        .select("id")
        .eq("numero", r.numero)
        .maybeSingle();

      if (data) {
        registrosAtualizados[i].erro = "Chave ja existente no banco";
        possuiErro = true;
      }
    }

    setRegistros(registrosAtualizados);

    if (possuiErro) {
      setErroImportacao(
        "Existem registros invalidos ou duplicados. Corrija antes de cadastrar."
      );
      return;
    }

    setLoading(true);

    for (const r of registrosAtualizados) {
      await supabase.from("db_chaves").insert([
        {
          numero: r.numero,
          dt_disp: new Date().toISOString(),
          usu_cad_db: usuario.matricula,
          dt_ass_db: null,
          usu_ass: null,
          ns: null,
          flh: null,
          poste: null,
          coord: null,
        },
      ]);
    }

    alert("Chaves cadastradas com sucesso!");
    setRegistros([]);
    atualizarContagem();
    setLoading(false);
  }

  const validCount = registros.filter((r) => !r.erro).length;
  const errorCount = registros.filter((r) => r.erro).length;

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="cadastro"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Cadastrar Chaves"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>Chaves disponiveis: {chavesDisponiveis}</span>
        </div>

        {/* Upload Area */}
        <Card padding="none">
          <label
            htmlFor="file-upload"
            className={`
              flex flex-col items-center justify-center p-12 cursor-pointer
              border-2 border-dashed rounded-xl transition-all duration-200
              ${
                dragOver
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-border-hover hover:bg-bg-card-hover"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFile}
              className="hidden"
              id="file-upload"
            />
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-4">
              <Upload size={32} />
            </div>
            <p className="text-lg font-medium text-text-primary mb-1">
              Selecionar Arquivo Excel
            </p>
            <p className="text-sm text-text-secondary">
              Arraste ou clique para importar (.xls, .xlsx)
            </p>
          </label>
        </Card>

        {/* Error Alert */}
        {erroImportacao && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
            <XCircle className="text-error flex-shrink-0" size={20} />
            <span className="text-sm text-error">{erroImportacao}</span>
          </div>
        )}

        {/* Results */}
        {registros.length > 0 && (
          <>
            {/* Stats Card */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="text-accent" size={20} />
                    <span className="text-2xl font-bold text-text-primary">
                      {registros.length}
                    </span>
                    <span className="text-text-secondary">
                      registros importados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{validCount} validos</Badge>
                    {errorCount > 0 && (
                      <Badge variant="error">{errorCount} com erro</Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCadastrar}
                  loading={loading}
                  disabled={validCount === 0}
                >
                  Cadastrar {validCount} Chaves
                </Button>
              </div>
            </Card>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Numero</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((r, index) => (
                  <TableRow
                    key={index}
                    className={r.erro ? "bg-error/5" : ""}
                  >
                    <TableCell className="font-mono">{r.numero}</TableCell>
                    <TableCell>{r.data}</TableCell>
                    <TableCell>
                      {r.erro ? (
                        <div className="flex items-center gap-2 text-error">
                          <XCircle size={16} />
                          <span className="text-sm">{r.erro}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle size={16} />
                          <span className="text-sm">OK</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </Layout>
  );
}
