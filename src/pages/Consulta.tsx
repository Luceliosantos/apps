import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Pagina } from "../App";

type Props = {
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };
  permissoes:any[];
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type Registro = {
  [key: string]: any;
};

export default function Consulta({
  usuario,
  permissoes,
  setPagina
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
      ["leitura","gravacao","comissionador","cad_ch"]
    )
  ){

    setPagina("home");

    return null;

  }

  const [tipoBusca, setTipoBusca] = useState("");
  const [valorBusca, setValorBusca] = useState("");
  const [dados, setDados] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [qtdDisponiveis, setQtdDisponiveis] = useState(0);
  
  useEffect(() => {

  async function carregarDisponiveis(){

    const { count } =
      await supabase
        .from("db_chaves")
        .select("*", { count: "exact", head: true })
        .is("ns", null);

    setQtdDisponiveis(count || 0);

  }

  carregarDisponiveis();

},[]);

const [usuarios, setUsuarios] = useState<any[]>([]);

useEffect(() => {

  async function carregarUsuarios(){

    const { data } =
      await supabase
        .from("db_usuarios_apps")
        .select("matricula,nome");

    if(data){

      setUsuarios(data);

    }

  }

  carregarUsuarios();

},[]);
  
  const botaoHabilitado =
    tipoBusca !== "" && valorBusca !== "";

  const efeitoHover = {
    backgroundColor:"rgba(255,255,255,0.25)"
  };

  const efeitoClick = {
    transform:"translateY(2px)",
    boxShadow:"none"
  };

  function aplicarHover(e:any){
    Object.assign(e.currentTarget.style, efeitoHover);
  }

  function removerHover(e:any){
    e.currentTarget.style.backgroundColor="rgba(255,255,255,0.15)";
  }

  function aplicarClick(e:any){
    Object.assign(e.currentTarget.style, efeitoClick);
  }

  function removerClick(e:any){
    e.currentTarget.style.transform="translateY(0px)";
  }

  async function consultar(){

    setLoading(true);

    let query =
      supabase
        .from("db_chaves")
        .select("*");

    if(tipoBusca === "ns"){

      query =
        query.eq(
          "ns",
          Number(valorBusca)
        );

    }
    else if(tipoBusca === "numero"){

      query =
        query.eq(
          "numero",
          Number(valorBusca)
        );

    }
else if(tipoBusca === "dt_ass_db"){

  const inicio =
    `${valorBusca} 00:00:00`;

  const fim =
    `${valorBusca} 23:59:59`;

  query =
    query
      .gte("dt_ass_db", inicio)
      .lte("dt_ass_db", fim);

}
    else{

      query =
        query.ilike(
          tipoBusca,
          `%${valorBusca}%`
        );

    }

    const { data, error } =
      await query;

    if(!error && data){

      setDados(data);

    }

    setLoading(false);

  }

  async function chavesEmpenhadas(){

    const { data } =
      await supabase
        .from("db_chaves")
        .select("*")
        .not("ns","is",null);

    if(data) setDados(data);

  }

  async function chavesDisponiveis(){

    const { data } =
      await supabase
        .from("db_chaves")
        .select("*")
        .is("ns",null);

    if(data) setDados(data);

  }

function formatarData(valor:any){

  if(!valor) return "-";

  return new Date(valor)
    .toLocaleDateString("pt-BR",{
      day:"2-digit",
      month:"2-digit",
      year:"numeric"
    });

}

  function prepararDadosExportacao(){

    return dados.map(linha => {

      const novo:any = {};

      Object.entries(linha)
        .filter(([col]) =>
          col !== "id" &&
          col !== "dt_disp"
        )
        .forEach(([col,val]) => {

          if(col === "dt_ass_db"){

            novo[col.toUpperCase()] =
              formatarData(val);

          }
          else{

            novo[col.toUpperCase()] =
              val == null || val === ""
                ? "-"
                : val;

          }

        });

      return novo;

    });

  }

  function gerarExcel(){

    const dadosFormatados =
      prepararDadosExportacao();

    const worksheet =
      XLSX.utils.json_to_sheet(
        dadosFormatados
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Consulta"
    );

    XLSX.writeFile(
      workbook,
      "consulta.xlsx"
    );

  }

  function gerarPDF(){

    if(dados.length === 0) return;

    const dadosFormatados =
      prepararDadosExportacao();

    const doc =
      new jsPDF();

    autoTable(doc,{

      head:[
        Object.keys(
          dadosFormatados[0]
        )
      ],

      body:
        dadosFormatados.map(
          Object.values
        ),

    });

    doc.save("consulta.pdf");

  }

  function limpar(){

    setDados([]);

    setTipoBusca("");

    setValorBusca("");

  }

  function propsBotao(){

    return {

      onMouseEnter:aplicarHover,
      onMouseLeave:removerHover,
      onMouseDown:aplicarClick,
      onMouseUp:removerClick,
      onMouseOut:removerClick

    };

  }

function obterNomeUsuario(matricula:any){

  if(!matricula) return "-";

  const u =
    usuarios.find(
      x => x.matricula == matricula
    );

  return u?.nome || matricula;

}
  
  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <div>

  <strong>
    {usuario.nome}
  </strong>

  {" | "}

  {usuario.matricula}

  <div>
    Chaves disponíveis: {qtdDisponiveis}
  </div>

</div>

          <div style={styles.headerButtons}>

            <button
              {...propsBotao()}
              onClick={gerarPDF}
              disabled={dados.length === 0}
              style={styles.button}
            >
              Gerar pdf
            </button>

            <button
              {...propsBotao()}
              onClick={gerarExcel}
              disabled={dados.length === 0}
              style={styles.button}
            >
              Gerar xls
            </button>

            <button
              {...propsBotao()}
              onClick={limpar}
              style={styles.button}
            >
              Limpar
            </button>

            <button
              {...propsBotao()}
              style={{
                ...styles.button,
                ...styles.logoutButton
              }}
              onClick={() =>
                setPagina("home")
              }
            >
              Voltar
            </button>

          </div>

        </div>

        <div style={styles.titleArea}>

          <h1 style={styles.title}>
            Consulta de Chaves
          </h1>

          <p style={styles.subtitle}>
            Pesquisa e geração de relatórios
          </p>

        </div>

        <div style={styles.panel}>

          <div style={styles.grupoBusca}>

            <select
              value={tipoBusca}
              onChange={(e)=>
                setTipoBusca(e.target.value)
              }
              style={styles.input}
            >

              <option value="">
                Selecione
              </option>

              <option value="ns">
                Nota
              </option>

              <option value="numero">
                Chave
              </option>

              <option value="coordenada">
                Coordenada
              </option>

              <option value="usu_ass">
  Matricula Usuario Associação
</option>

<option value="dt_ass_db">
  Data Associação
</option>

            </select>

            <input
              type={
                tipoBusca === "dt_ass_db"
                  ? "date"
                  : "text"
              }
              value={valorBusca}
              onChange={(e)=>
                setValorBusca(e.target.value)
              }
              style={styles.input}
            />

            <button
              {...propsBotao()}
              disabled={!botaoHabilitado}
              onClick={consultar}
              style={styles.button}
            >
              Consultar
            </button>

            <button
              {...propsBotao()}
              onClick={chavesDisponiveis}
              style={styles.button}
            >
              Chaves disponíveis
            </button>

            <button
              {...propsBotao()}
              onClick={chavesEmpenhadas}
              style={styles.button}
            >
              Chaves empenhadas
            </button>

          </div>

        </div>

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>
  <tr>
    {dados[0] &&
      Object
        .keys(dados[0])
        .filter(col =>
          col !== "id" &&
          col !== "dt_disp"
        )
        .map(coluna => {

          const nomesColunas:any = {

            numero:"NUMERO",
            dt_cad_db:"DATA CADASTRO",
            usu_cad_db:"USUARIO CADASTRO",
            ns:"NOTA",
            flh:"FOLHA",
            poste:"POSTE",
            coordenada:"COORDENADA",
            usu_ass:"USUARIO ASSOCIAÇÃO",
            dt_ass_db:"DATA ASSOCIAÇÃO"

          };

          return (

            <th
              key={coluna}
              style={styles.th}
            >
              {nomesColunas[coluna] || coluna.toUpperCase()}
            </th>

          );

        })
    }
  </tr>
</thead>

            <tbody>

              {dados.map(
                (linha, index) => (

                  <tr key={index}>

                    {Object
                      .entries(linha)
                      .filter(([col]) =>
                        col !== "id" &&
                        col !== "dt_disp"
                      )
                      .map(
                        ([col,valor], i) => (

<td
  key={i}
  style={styles.td}
>
{
  col === "usu_cad_db"
  ? obterNomeUsuario(valor)
:
col === "usu_ass"
  ? obterNomeUsuario(valor)
:
col === "dt_ass_db" || col === "dt_cad_db"
  ? formatarData(valor)
:
valor == null || valor === ""
  ? "-"
  : String(valor)
}
</td>

                        )
                      )}

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {loading && (

          <p style={{ color: "white" }}>
            Consultando...
          </p>

        )}

      </div>

    </div>

  );

}

const styles:{[key:string]:React.CSSProperties} = {

  container:{
    minHeight:"100vh",
    backgroundImage:"url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg/377c7a2b-edfd-dd1e-c8a6-91d79dc31a39?version=1.0&t=1726774318701')",
    backgroundSize:"cover",
    backgroundPosition:"center"
  },

  overlay:{
    minHeight:"100vh",
    backgroundColor:"rgba(0,0,0,0.55)",
    padding:"20px"
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-start",
    color:"white",
    marginBottom:25,
    flexWrap:"wrap",
    gap:10
  },

  headerButtons:{
    display:"flex",
    gap:8,
    flexWrap:"wrap"
  },

  titleArea:{
    textAlign:"center",
    color:"white",
    marginBottom:25
  },

  title:{
    fontSize:28,
    margin:0
  },

  subtitle:{
    marginTop:6,
    opacity:0.85
  },

  panel:{
    maxWidth:1100,
    margin:"0 auto 25px auto",
    display:"flex",
    flexDirection:"column",
    gap:15
  },

  grupoBusca:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
    gap:10
  },

  input:{
    padding:"8px 10px",
    borderRadius:8,
    border:"1px solid #ccc",
    fontSize:14
  },

  button:{
    padding:"8px 12px",
    minHeight:"36px",
    fontSize:14,
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.35)",
    backgroundColor:"rgba(255,255,255,0.15)",
    color:"white",
    cursor:"pointer",
    boxShadow:"0 2px 4px rgba(0,0,0,0.3)",
    whiteSpace:"nowrap"
  },

  logoutButton:{
    backgroundColor:"rgba(192,57,43,0.7)"
  },

  tableContainer:{
    backgroundColor:"white",
    borderRadius:10,
    padding:10,
    overflowX:"auto"
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    textAlign:"center",
    minWidth:700
  },

  th:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    backgroundColor:"#f2f2f2",
    whiteSpace:"nowrap"
  },

  td:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    whiteSpace:"nowrap"
  }

};
