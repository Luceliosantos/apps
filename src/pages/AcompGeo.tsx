import { useState } from "react";
import { Search, Trash2, AlertTriangle, List, FileSpreadsheet } from "lucide-react";
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
  handleLogout: () => void;
};

type LinhaResumo = {
  nota: string;
  tipo: string;
  base_cr: number;
  m609: string;
  m614: string;
  m625: string;
  obs: string;
};

type ResultadoBusca = {
  id: string;
  regional: string;
  nota: string;
  modalidade: string;
  base_cr: number;
  medida: string;
  linha_med: string;
  tipo: string;
  status_med: string;
  obs: string;
  resp_geral: string;
};

export default function AcompGeo({
  usuario,
  permissoes,
  setPagina,
  handleLogout,
}: Props) {
  const [lista, setLista] = useState<LinhaResumo[]>([]);
  const [buscaNota, setBuscaNota] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState<ResultadoBusca[]>([]);
  const [regionalAtiva, setRegionalAtiva] = useState("");

  const regionais = ["NE/MC", "NE/PR", "CE/SL"];

  async function carregarRegional(regional: string) {
    setRegionalAtiva(regional);

    const { data, error } = await supabase
      .from("db_acomp_geo")
      .select("nota,base_cr,medida,status_med,obs,tipo")
      .eq("regional", regional);

    if (error || !data) return;

    const mapa: Record<string, LinhaResumo> = {};

    data.forEach((r) => {
      if (!mapa[r.nota]) {
        mapa[r.nota] = {
          nota: r.nota,
          tipo: "",
          base_cr: Number(r.base_cr) || 0,
          m609: "",
          m614: "",
          m625: "",
          obs: "",
        };
      }

      if (r.medida === "0609") {
        mapa[r.nota].m609 = r.status_med || "";
        mapa[r.nota].tipo = r.tipo || "";
      }

      if (r.medida === "0614") {
        if (r.tipo === "MDCO") {
          mapa[r.nota].m614 = r.status_med ? `*${r.status_med}*` : "****";
        } else {
          mapa[r.nota].m614 = r.status_med || "";
        }
        mapa[r.nota].tipo = r.tipo || "";
      }

      if (r.medida === "0625") {
        mapa[r.nota].m625 = r.status_med || "";
        mapa[r.nota].tipo = r.tipo || "";
      }

      if (r.obs && !mapa[r.nota].obs) {
        mapa[r.nota].obs = r.obs;
      }
    });

    const top15 = Object.values(mapa)
      .sort((a, b) => b.base_cr - a.base_cr)
      .slice(0, 15);

    setLista(top15);
  }

  function limparTabela() {
    setLista([]);
    setResultadoBusca([]);
    setBuscaNota("");
    setRegionalAtiva("");
  }

  async function buscarNota() {
    if (!buscaNota) return;

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("nota", buscaNota);

    setResultadoBusca((data as ResultadoBusca[]) || []);
  }

  async function buscarDivergencias() {
    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .is("resp_geral", null)
      .neq("status_med", "CONC");

    setResultadoBusca((data as ResultadoBusca[]) || []);
  }

  async function buscarListaCompleta() {
    const { data } = await supabase.from("db_acomp_geo").select("*");

    setResultadoBusca((data as ResultadoBusca[]) || []);
  }

  function exportarExcel() {
    if (resultadoBusca.length === 0) return;

    let tabela =
      "<table border='1'>" +
      "<tr>" +
      "<th>REG.</th>" +
      "<th>NOTA</th>" +
      "<th>MOD.</th>" +
      "<th>BASE_CR</th>" +
      "<th>MED</th>" +
      "<th>LN</th>" +
      "<th>TIPO</th>" +
      "<th>STATUS</th>" +
      "<th>OBS</th>" +
      "<th>RESPONSAVEL</th>" +
      "</tr>";

    resultadoBusca.forEach((r) => {
      const statusFormatado =
        r.tipo === "MDCO" && r.medida === "0614" && r.status_med
          ? `*${r.status_med}*`
          : r.status_med || "";

      tabela +=
        "<tr>" +
        "<td>" + (r.regional || "") + "</td>" +
        "<td>" + (r.nota || "") + "</td>" +
        "<td>" + (r.modalidade || "") + "</td>" +
        "<td>" + (r.base_cr || "") + "</td>" +
        "<td>" + (r.medida || "") + "</td>" +
        "<td>" + (r.linha_med || "") + "</td>" +
        "<td>" + (r.tipo || "") + "</td>" +
        "<td>" + statusFormatado + "</td>" +
        "<td>" + (r.obs || "") + "</td>" +
        "<td>" +
        (r.tipo === "MDCO" && r.medida === "0614"
          ? "****"
          : r.resp_geral || "") +
        "</td>" +
        "</tr>";
    });

    tabela += "</table>";

    const blob = new Blob([tabela], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "acomp_geo.xls";
    link.click();
  }

  return (
    <Layout
      usuario={usuario}
      permissoes={permissoes}
      pagina="geo"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Acompanhamento GEO"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <Card>
          <div className="flex flex-wrap gap-3">
            {/* Regional Buttons */}
            <div className="flex gap-2">
              {regionais.map((reg) => (
                <Button
                  key={reg}
                  variant={regionalAtiva === reg ? "primary" : "secondary"}
                  onClick={() => carregarRegional(reg)}
                >
                  {reg}
                </Button>
              ))}
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Search */}
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Numero da nota"
                value={buscaNota}
                onChange={(e) => setBuscaNota(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") buscarNota();
                }}
              />
              <Button onClick={buscarNota} icon={<Search size={18} />}>
                Buscar
              </Button>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                onClick={buscarDivergencias}
                icon={<AlertTriangle size={18} />}
              >
                Divergencias
              </Button>
              <Button
                variant="secondary"
                onClick={buscarListaCompleta}
                icon={<List size={18} />}
              >
                Lista Completa
              </Button>
              <Button
                variant="secondary"
                onClick={exportarExcel}
                disabled={resultadoBusca.length === 0}
                icon={<FileSpreadsheet size={18} />}
              >
                Exportar
              </Button>
              <Button
                variant="ghost"
                onClick={limparTabela}
                icon={<Trash2 size={18} />}
              >
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Regional Summary Table */}
        {lista.length > 0 && (
          <Card padding="sm">
            <CardHeader className="px-2">
              <CardTitle>Top 15 - {regionalAtiva}</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Nota</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Base CR</TableHead>
                  <TableHead>609</TableHead>
                  <TableHead>614</TableHead>
                  <TableHead>625</TableHead>
                  <TableHead>Obs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono">{l.nota}</TableCell>
                    <TableCell>{l.tipo}</TableCell>
                    <TableCell className="font-mono">
                      {l.base_cr.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell>{l.m609}</TableCell>
                    <TableCell>{l.m614}</TableCell>
                    <TableCell>{l.m625}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {l.obs}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Full Results Table */}
        {resultadoBusca.length > 0 && (
          <Card padding="sm">
            <CardHeader className="px-2">
              <CardTitle>
                Resultados ({resultadoBusca.length} registros)
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Reg.</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Mod.</TableHead>
                  <TableHead>Base CR</TableHead>
                  <TableHead>Med</TableHead>
                  <TableHead>Ln</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Obs</TableHead>
                  <TableHead>Responsavel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultadoBusca.map((r) => {
                  const statusFormatado =
                    r.tipo === "MDCO" && r.medida === "0614" && r.status_med
                      ? `*${r.status_med}*`
                      : r.status_med;

                  return (
                    <TableRow key={r.id}>
                      <TableCell>{r.regional}</TableCell>
                      <TableCell className="font-mono">{r.nota}</TableCell>
                      <TableCell>{r.modalidade}</TableCell>
                      <TableCell className="font-mono">
                        {Number(r.base_cr).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>{r.medida}</TableCell>
                      <TableCell>{r.linha_med}</TableCell>
                      <TableCell>{r.tipo}</TableCell>
                      <TableCell>{statusFormatado}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {r.obs}
                      </TableCell>
                      <TableCell>
                        {r.tipo === "MDCO" && r.medida === "0614"
                          ? "****"
                          : r.resp_geral}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {lista.length === 0 && resultadoBusca.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Selecione uma regional ou utilize a busca para visualizar os dados
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
