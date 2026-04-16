import { useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type LinhaResumo = {
  nota:string
  tipo:string
  base_cr:number
  m609:string
  m614:string
  m625:string
  obs:string
};

export default function AcompGeo({ setPagina }: Props){

  const [lista,setLista] = useState<LinhaResumo[]>([]);
  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<any[]>([]);
const [regionalSelecionada,setRegionalSelecionada] = useState<string>("");
const [tipoListaAtiva,setTipoListaAtiva] = useState<string>("");
  async function carregarRegional(regional:string){

    async function carregarRegional(regional:string){

  setRegionalSelecionada(regional);
  setTipoListaAtiva("regional");

  const { data,error } = await supabase

    .from("db_acomp_geo")
    .select("nota,base_cr,medida,status_med,obs,tipo")
    .eq("regional",regional)
    .order("base_cr",{ascending:false}); // garante vir ordenado pela maior base

  if(error || !data) return;

  const mapa:Record<string,LinhaResumo> = {};

  data.forEach((r:any)=>{

    const valorBase = Number(r.base_cr) || 0;

    // cria registro único por nota
    if(!mapa[r.nota]){

      mapa[r.nota] = {
        nota:r.nota,
        tipo:r.tipo || "",
        base_cr:valorBase,
        m609:"",
        m614:"",
        m625:"",
        obs:r.obs || ""
      };

    }else{

      // garante manter o MAIOR base_cr da nota
      if(valorBase > mapa[r.nota].base_cr){
        mapa[r.nota].base_cr = valorBase;
      }

      // mantém obs se ainda não existir
      if(r.obs && !mapa[r.nota].obs){
        mapa[r.nota].obs = r.obs;
      }

      // mantém tipo se ainda não existir
      if(r.tipo && !mapa[r.nota].tipo){
        mapa[r.nota].tipo = r.tipo;
      }

    }


    // preenche medidas
    if(r.medida==="0609"){
      mapa[r.nota].m609 = r.status_med || "";
    }

    if(r.medida==="0614"){

      if(r.tipo==="MDCO"){

        mapa[r.nota].m614 =
          r.status_med
            ? `*${r.status_med}*`
            : "****";

      }else{

        mapa[r.nota].m614 = r.status_med || "";

      }

    }

    if(r.medida==="0625"){
      mapa[r.nota].m625 = r.status_med || "";
    }

  });


  // gera TOP 15 por base_cr
  const top15 =
    Object.values(mapa)
      .sort((a,b)=>b.base_cr-a.base_cr)
      .slice(0,25);


  setLista(top15);

}


function limparTabela(){

  setLista([]);
  setResultadoBusca([]);
  setBuscaNota("");
  setRegionalSelecionada("");
  setTipoListaAtiva("");

}


  async function buscarNota(){

    if(!buscaNota) return;

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("nota",buscaNota);

    setResultadoBusca(data || []);

  }


  async function buscarDivergencias(){

  setRegionalSelecionada("");
  setTipoListaAtiva("divergencias");

  const { data } = await supabase

     .from("db_acomp_geo")
      .select("*")
      .is("resp_geral",null)
      .neq("status_med","CONC");

    setResultadoBusca(data || []);

  }


async function buscarListaCompleta(){

  setRegionalSelecionada("");
  setTipoListaAtiva("listaCompleta");

  const { data } = await supabase
      .from("db_acomp_geo")
      .select("*");

    setResultadoBusca(data || []);

  }


  function exportarExcel(){

    if(resultadoBusca.length===0) return;

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

    resultadoBusca.forEach(r=>{

      const statusFormatado =
        (r.tipo==="MDCO" && r.medida==="0614" && r.status_med)
          ? `*${r.status_med}*`
          : (r.status_med||"");

      tabela +=
        "<tr>" +
        "<td>"+(r.regional||"")+"</td>"+
        "<td>"+(r.nota||"")+"</td>"+
        "<td>"+(r.modalidade||"")+"</td>"+
        "<td>"+(r.base_cr||"")+"</td>"+
        "<td>"+(r.medida||"")+"</td>"+
        "<td>"+(r.linha_med||"")+"</td>"+
        "<td>"+(r.tipo||"")+"</td>"+
        "<td>"+statusFormatado+"</td>"+
        "<td>"+(r.obs||"")+"</td>"+
        "<td>"+((r.tipo==="MDCO" && r.medida==="0614") ? "****" : (r.resp_geral||""))+"</td>"+
        "</tr>";

    });

    tabela += "</table>";

    const blob = new Blob([tabela],{type:"application/vnd.ms-excel"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "acomp_geo.xls";

    link.click();

  }



  return(

    <div style={styles.container}>

      <div style={styles.overlay}>


        <div style={styles.linhaTopo}>

          <div style={styles.grupoEsquerda}>

  <button
    style={
      regionalSelecionada==="NE/MC"
        ? styles.buttonSelecionado
        : styles.button
    }
    onClick={()=>carregarRegional("NE/MC")}
  >
    NE/MC
  </button>

  <button
    style={
      regionalSelecionada==="NE/PR"
        ? styles.buttonSelecionado
        : styles.button
    }
    onClick={()=>carregarRegional("NE/PR")}
  >
    NE/PR
  </button>

  <button
    style={
      regionalSelecionada==="CE/SL"
        ? styles.buttonSelecionado
        : styles.button
    }
    onClick={()=>carregarRegional("CE/SL")}
  >
    CE/SL
  </button>


  <button style={styles.buttonLimpar} onClick={limparTabela}>
    Limpar
  </button>


  <input
    style={styles.input}
    placeholder="NUMERO DA NOTA"
    value={buscaNota}
    onChange={(e)=>setBuscaNota(e.target.value)}
  />


  <button style={styles.button} onClick={buscarNota}>
    Buscar
  </button>


  <button
    style={
      tipoListaAtiva==="divergencias"
        ? styles.buttonSelecionado
        : styles.button
    }
    onClick={buscarDivergencias}
  >
    Divergencias
  </button>


  <button
    style={
      tipoListaAtiva==="listaCompleta"
        ? styles.buttonSelecionado
        : styles.button
    }
    onClick={buscarListaCompleta}
  >
    Lista Completa
  </button>


  <button style={styles.button} onClick={exportarExcel}>
    Exportar Excel
  </button>

</div>


          <button
            style={styles.button}
            onClick={()=>setPagina("menu")}
          >
            Voltar
          </button>

        </div>



        <div style={styles.areaTabela}>

          {lista.length>0 && (

            <div style={styles.card}>

              <table style={styles.tableRegional}>

                <thead style={styles.thead}>

                  <tr>

                    <th>NOTA</th>
                    <th>TIPO</th>
                    <th>BASE_CR</th>
                    <th>609</th>
                    <th>614</th>
                    <th>625</th>
                    <th>OBS</th>

                  </tr>

                </thead>


                <tbody>

                  {lista.map((l,i)=>(

                    <tr key={i}>

                      <td style={styles.tdNota}>{l.nota}</td>

                      <td style={styles.tdMed}>{l.tipo}</td>

                      <td style={styles.td}>
                        {l.base_cr.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
                      </td>

                      <td style={styles.tdMed}>{l.m609}</td>
                      <td style={styles.tdMed}>{l.m614}</td>
                      <td style={styles.tdMed}>{l.m625}</td>

                      <td style={styles.td}>{l.obs}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>



        {resultadoBusca.length>0 && (

          <div style={styles.cardTabelaInferior}>

            <table style={styles.tableFull}>

              <thead style={styles.thead}>

                <tr>

                  <th>REG.</th>
                  <th>NOTA</th>
                  <th>MOD.</th>
                  <th>BASE_CR</th>
                  <th>MED</th>
                  <th>LN</th>
                  <th>TIPO</th>
                  <th>STATUS</th>
                  <th>OBS</th>
                  <th>RESPONSAVEL</th>

                </tr>

              </thead>


              <tbody>

                {resultadoBusca.map(r=>{

                  const statusFormatado =
                    (r.tipo==="MDCO" && r.medida==="0614" && r.status_med)
                      ? `*${r.status_med}*`
                      : r.status_med;

                  return(

                  <tr key={r.id}>

                    <td style={styles.td}>{r.regional}</td>
                    <td style={styles.td}>{r.nota}</td>
                    <td style={styles.td}>{r.modalidade}</td>

                    <td style={styles.td}>
                      {Number(r.base_cr).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
                    </td>

                    <td style={styles.td}>{r.medida}</td>
                    <td style={styles.td}>{r.linha_med}</td>
                    <td style={styles.td}>{r.tipo}</td>

                    <td style={styles.td}>{statusFormatado}</td>

                    <td style={styles.td}>{r.obs}</td>

                    <td style={styles.td}>
                      {(r.tipo==="MDCO" && r.medida==="0614") ? "****" : r.resp_geral}
                    </td>

                  </tr>

                )})}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

}
const styles:{[key:string]:React.CSSProperties}={

  container:{
    minHeight:"100vh",
    backgroundImage:"url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",
    backgroundSize:"cover",
    backgroundPosition:"center"
  },

  overlay:{
    background:"rgba(0,0,0,0.65)",
    minHeight:"100vh",
    padding:"20px",
    color:"white"
  },

  linhaTopo:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-start",
    marginBottom:20,
    flexWrap:"wrap",
    gap:10
  },

  grupoEsquerda:{
    display:"flex",
    gap:8,
    alignItems:"center",
    flexWrap:"wrap"
  },

areaTabela:{
  display:"block",
  width:"100%",
  overflowX:"auto",
  marginBottom:25
},

card:{
  background:"rgba(255,255,255,0.08)",
  padding:14,
  borderRadius:10,
  border:"1px solid rgba(255,255,255,0.25)",
  backdropFilter:"blur(6px)",
  display:"inline-block",   // faz card ter largura da tabela
  overflowX:"auto"
},

buttonSelecionado:{
  padding:"8px 14px",
  borderRadius:8,
  border:"1px solid #4da3ff",
  backgroundColor:"#4da3ff",
  color:"white",
  cursor:"pointer",
  whiteSpace:"nowrap",
  fontWeight:"bold",
  boxShadow:"0 0 6px rgba(77,163,255,0.6)"
},
          
  cardTabelaInferior:{
    background:"rgba(255,255,255,0.08)",
    padding:14,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backdropFilter:"blur(6px)",
    width:"100%",
    overflowX:"auto"
  },

  tableRegional:{
    borderCollapse:"collapse",
    fontSize:13,
    background:"white",
    color:"black",
    minWidth:650
  },

  tableFull:{
    borderCollapse:"collapse",
    fontSize:13,
    background:"white",
    color:"black",
    width:"100%",
    minWidth:900
  },

  thead:{
    background:"#cfe8ff",
    color:"#000",
    border:"1px solid #7fb3ff"
  },

  td:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    background:"white",
    color:"black",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  tdNota:{
    border:"1px solid #ccc",
    padding:"6px 10px",
    background:"white",
    color:"black",
    textAlign:"center",
    whiteSpace:"nowrap"
  },

  tdMed:{
    border:"1px solid #ccc",
    padding:"6px 6px",
    textAlign:"center",
    background:"white",
    color:"black",
    whiteSpace:"nowrap"
  },

  input:{
    padding:"8px 10px",
    borderRadius:6,
    border:"1px solid #ccc",
    minWidth:140
  },

  button:{
    padding:"8px 14px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(255,255,255,0.15)",
    color:"white",
    cursor:"pointer",
    whiteSpace:"nowrap"
  },

  buttonLimpar:{
    padding:"8px 14px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(192,57,43,0.5)",
    color:"white",
    cursor:"pointer",
    whiteSpace:"nowrap"
  }

};
