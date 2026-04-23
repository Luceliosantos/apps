import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import { Pagina } from "../App";

type Registro = {
  numero: string;
  data: string;
  erro?: string;
};

type Props = {
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };

  permissoes:any[];

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

  atualizarContagem,

}: Props) {

  function temPermissao(
    sistema:string,
    tipos:string[]
  ){

    const p =
      permissoes.find(
        x => x.sistema === sistema
      );

    if(!p) return false;

    if(p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }

  if(
    !temPermissao(
      "chaves",
      ["cad_ch"]
    )
  ){

    setPagina("home");

    return null;

  }

  const [registros, setRegistros] = useState<Registro[]>([]);

  const [erroImportacao, setErroImportacao] = useState("");

  const [loading, setLoading] = useState(false);

  function dataHojeBR(){

    return new Date().toLocaleDateString("pt-BR");

  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {

      const data = evt.target?.result;

      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      const novos: Registro[] = [];

      for (let i = 0; i < json.length; i++) {

        const numero = String(json[i][0] ?? "").trim();

        let erro = "";

        if (!/^[1-9]\d{5}$/.test(numero)) {
        
          erro = "Número deve ter 6 dígitos e não pode iniciar com 0";
        
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

        registrosAtualizados[i].erro = "Chave já existente no banco";

        possuiErro = true;

      }

    }

    setRegistros(registrosAtualizados);

    if (possuiErro) {

      setErroImportacao(
        "Existem registros inválidos ou duplicados. Corrija antes de cadastrar."
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
    coord: null

  },
]);

    }

    alert("Chaves cadastradas com sucesso!");

    setRegistros([]);

    atualizarContagem();

    setLoading(false);

  }

  return (

    <div style={styles.container}>

      <div style={styles.electricParticles}></div>

      <div style={styles.overlay}>

        <div style={styles.topBar}>

          <div style={styles.headerUsuario}>

            <div>
            
              <strong>
                {usuario.nome?.toUpperCase()}
              </strong>
            
              {" | "}
            
              {usuario.matricula?.toUpperCase()}
            
              <div>
                Chaves disponíveis: {chavesDisponiveis}
              </div>
            
            </div>

          </div>

          <div style={styles.acoesUsuario}>

            <button
              style={styles.button}
              onClick={() => setPagina("home")}
            >
              Voltar
            </button>

          </div>

        </div>

        <div style={styles.mainContent}>

          <div style={styles.cardPrincipal}>

            <div style={styles.uploadArea}>

              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFile}
                style={styles.inputFile}
                id="file-upload"
              />

              <label htmlFor="file-upload" style={styles.labelUpload}>

                <div style={styles.uploadIcon}>📁</div>

                <div>

                  <strong>Selecionar Arquivo Excel</strong>

                  <p>Arraste ou clique para importar (.xls, .xlsx)</p>

                </div>

              </label>

            </div>

            {erroImportacao && (

              <div style={styles.alertaErro}>

                <span>⚠️ {erroImportacao}</span>

              </div>

            )}

            {registros.length > 0 && (

              <>

                <div style={styles.caixaQuantidade}>

                  <div style={styles.statsContent}>

                    <div style={styles.statItem}>

                      <strong style={styles.statNumber}>

                        {registros.length}

                      </strong>

                      <span> registros importados</span>

                    </div>

                    <div style={styles.validosInvalidos}>

                      <span style={styles.validos}>
                        {
                          registros.filter(
                            r => !r.erro
                          ).length
                        } válidos
                      </span>

                      <span style={styles.separador}>|</span>

                      <span style={styles.invalidos}>
                        {
                          registros.filter(
                            r => r.erro
                          ).length
                        } com erro
                      </span>

                    </div>

                  </div>

                  <div style={styles.botaoContainer}>

                    <button

                      style={{

                        ...styles.button,

                        opacity:

                          loading ||

                          registros.filter(
                            r => !r.erro
                          ).length === 0

                            ? 0.5
                            : 1,

                      }}

                      onClick={handleCadastrar}

                      disabled={

                        loading ||

                        registros.filter(
                          r => !r.erro
                        ).length === 0

                      }

                    >

                      {

                        loading
                          ? "Cadastrando..."
                          : `Cadastrar ${
                              registros.filter(
                                r => !r.erro
                              ).length
                            } Chaves`

                      }

                    </button>

                  </div>

                </div>

                <div style={styles.tabelaContainer}>

                  <table style={styles.tabela}>

                    <thead style={styles.thead}>

                      <tr>

                        <th style={styles.thNumero}>Número</th>

                        <th style={styles.thData}>Data</th>

                        <th style={styles.thStatus}>Status</th>

                      </tr>

                    </thead>

                    <tbody>

                      {registros.map((r, index) => (

                        <tr
                          key={index}
                          style={
                            r.erro
                              ? styles.linhaErro
                              : styles.linhaOk
                          }
                        >

                          <td style={styles.tdNumero}>{r.numero}</td>

                          <td style={styles.tdData}>{r.data}</td>

                          <td style={styles.tdStatus}>

                            {

                              r.erro

                                ? (
                                  <span style={styles.statusErro}>
                                    {r.erro}
                                  </span>
                                )

                                : (
                                  <span style={styles.statusOk}>
                                    OK
                                  </span>
                                )

                            }

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

const styles: { [key: string]: React.CSSProperties } = {

  container: {
    minHeight: "100vh",
    backgroundImage: `
      linear-gradient(rgba(10,31,68,0.55), rgba(10,31,68,0.75)),
      url("https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg")
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    overflow: "hidden",
  },

  electricParticles: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  overlay: {
    minHeight: "100vh",
    padding: "20px",
    color: "white",
    position: "relative",
    zIndex: 2,
  },

  topBar: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems:"flex-start",
    flexWrap:"wrap",
    gap:10
  },

  linhaUsuario: {
    fontSize: 16,
    fontWeight: 400,
  },

  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  cardPrincipal: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "20px",
  },

  inputFile: { display: "none" },

  labelUpload: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "25px",
    border: "2px dashed rgba(255,255,255,0.4)",
    borderRadius: "16px",
    cursor: "pointer",
    textAlign:"center"
  },

  uploadIcon: {
    fontSize: 40,
  },

  caixaQuantidade: {
    marginTop: 20,
  },

  statsContent: {
    marginBottom: 15,
  },

  validosInvalidos:{
    display:"flex",
    gap:8,
    alignItems:"center",
    flexWrap:"wrap"
  },

  separador:{
    opacity:0.7
  },

  botaoContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap:"wrap"
  },

  tabelaContainer: {
    overflowX: "auto",
    marginTop: 20,
  },

  tabela: {
    width: "100%",
    tableLayout:"auto",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    borderCollapse:"collapse",
    minWidth:400
  },

  thead: {
    background: "#1e3c72",
    color: "white",
  },

  thNumero: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  thData: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  thStatus: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  tdNumero: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  tdData: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  tdStatus: {
    padding: 8,
    border:"1px solid rgba(255,255,255,0.15)",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  linhaErro: {
    background: "rgba(255,0,0,0.15)",
  },

  statusErro: {
    color: "#ff6b6b",
  },

  statusOk: {
    color: "#00ff88",
  },

  alertaErro: {
    marginTop: 15,
    color: "#ff6b6b",
  },

  statNumber: {
    fontSize: 24,
  },

  validos: { color: "#00ff88" },

  invalidos: { color: "#ff6b6b" },

  button: {
    padding: "10px 16px",
    fontSize: 15,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "white",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    whiteSpace:"nowrap"
  },

};
