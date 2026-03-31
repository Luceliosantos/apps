import { useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type LinhaResumo = {
  nota:string
  base_cr:number
  m609:string
  m614:string
  m625:string
  tipo609:string
  tipo614:string
  tipo625:string
  obs:string
};

export default function AcompGeo({ setPagina }: Props){

  const [lista,setLista] = useState<LinhaResumo[]>([]);
  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<any[]>([]);


  async function carregarRegional(regional:string){

    const { data,error } = await supabase
      .from("db_acomp_geo")
      .select("nota,base_cr,medida,status_med,obs,tipo")
      .eq("regional",regional);

    if(error || !data) return;

    const mapa:Record<string,LinhaResumo> = {};

    data.forEach((r:any)=>{

      if(!mapa[r.nota]){

        mapa[r.nota] = {
          nota:r.nota,
          base_cr:Number(r.base_cr) || 0,
          m609:"",
          m614:"",
          m625:"",
          tipo609:"",
          tipo614:"",
          tipo625:"",
          obs:""
        };

      }

      if(r.medida==="0609"){
        mapa[r.nota].m609=r.status_med || "";
        mapa[r.nota].tipo609=r.tipo || "";
      }

      if(r.medida==="0614"){
        mapa[r.nota].m614=r.status_med || "";
        mapa[r.nota].tipo614=r.tipo || "";
      }

      if(r.medida==="0625"){
        mapa[r.nota].m625=r.status_med || "";
        mapa[r.nota].tipo625=r.tipo || "";
      }

      if(r.obs && !mapa[r.nota].obs){
        mapa[r.nota].obs=r.obs;
      }

    });

    const top15 =
      Object.values(mapa)
        .sort((a,b)=>b.base_cr-a.base_cr)
        .slice(0,15);

    setLista(top15);

  }


  function limparTabela(){

    setLista([]);
    setResultadoBusca([]);
    setBuscaNota("");

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

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .is("resp_geral",null)
      .neq("status_med","CONC");

    setResultadoBusca(data || []);

  }


  async function buscarListaCompleta(){

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

      tabela +=
        "<tr>" +
        "<td>"+(r.regional||"")+"</td>"+
        "<td>"+(r.nota||"")+"</td>"+
        "<td>"+(r.modalidade||"")+"</td>"+
        "<td>"+(r.base_cr||"")+"</td>"+
        "<td>"+(r.medida||"")+"</td>"+
        "<td>"+(r.linha_med||"")+"</td>"+
        "<td>"+(r.tipo||"")+"</td>"+
        "<td>"+(r.status_med||"")+"</td>"+
        "<td>"+(r.obs||"")+"</td>"+
        "<td>"+(r.resp_geral||"")+"</td>"+
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

            <button style={styles.button} onClick={()=>carregarRegional("NE/MC")}>
              NE/MC
            </button>

            <button style={styles.button} onClick={()=>carregarRegional("NE/PR")}>
              NE/PR
            </button>

            <button style={styles.button} onClick={()=>carregarRegional("CE/SL")}>
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


            <button style={styles.button} onClick={buscarDivergencias}>
              Divergencias
            </button>


            <button style={styles.button} onClick={buscarListaCompleta}>
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
                    <th>BASE_CR</th>
                    <th>609</th>
                    <th>TIPO</th>
                    <th>614</th>
                    <th>TIPO</th>
                    <th>625</th>
                    <th>TIPO</th>
                    <th>OBS</th>

                  </tr>

                </thead>


                <tbody>

                  {lista.map((l,i)=>(

                    <tr key={i}>

                      <td style={styles.tdNota}>{l.nota}</td>

                      <td style={styles.td}>
                        {l.base_cr.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
                      </td>

                      <td style={styles.tdMed}>{l.m609}</td>
                      <td style={styles.tdMed}>{l.tipo609}</td>

                      <td style={styles.tdMed}>{l.m614}</td>
                      <td style={styles.tdMed}>{l.tipo614}</td>

                      <td style={styles.tdMed}>{l.m625}</td>
                      <td style={styles.tdMed}>{l.tipo625}</td>

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

                {resultadoBusca.map(r=>(

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
                    <td style={styles.td}>{r.status_med}</td>
                    <td style={styles.td}>{r.obs}</td>
                    <td style={styles.td}>{r.resp_geral}</td>

                  </tr>

                ))}

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
    padding:40,
    color:"white"
  },

  linhaTopo:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:25
  },

  grupoEsquerda:{
    display:"flex",
    gap:10,
    alignItems:"center",
    flexWrap:"wrap"
  },

  areaTabela:{
    display:"flex",
    justifyContent:"flex-start",
    marginBottom:30
  },

  card:{
    background:"rgba(255,255,255,0.08)",
    padding:18,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backdropFilter:"blur(6px)"
  },

  cardTabelaInferior:{
    background:"rgba(255,255,255,0.08)",
    padding:18,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backdropFilter:"blur(6px)",
    width:"100%"
  },

  tableRegional:{
    borderCollapse:"collapse",
    fontSize:13,
    background:"white",
    color:"black"
  },

  tableFull:{
    borderCollapse:"collapse",
    fontSize:13,
    background:"white",
    color:"black",
    width:"100%"
  },

  thead:{
    background:"#cfe8ff",
    color:"#000",
    border:"1px solid #7fb3ff"
  },

  td:{
    border:"1px solid #ccc",
    padding:"6px 10px",
    background:"white",
    color:"black",
    textAlign:"center"
  },

  tdNota:{
    border:"1px solid #ccc",
    padding:"6px 14px",
    background:"white",
    color:"black",
    textAlign:"center"
  },

  tdMed:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    textAlign:"center",
    background:"white",
    color:"black"
  },

  input:{
    padding:8,
    borderRadius:6,
    border:"1px solid #ccc"
  },

  button:{
    padding:"10px 18px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(255,255,255,0.15)",
    color:"white",
    cursor:"pointer"
  },

  buttonLimpar:{
    padding:"10px 18px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(192,57,43,0.5)",
    color:"white",
    cursor:"pointer"
  }

};
