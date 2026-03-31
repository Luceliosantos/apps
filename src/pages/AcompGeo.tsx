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
          tipo:"",
          base_cr:Number(r.base_cr) || 0,
          m609:"",
          m614:"",
          m625:"",
          obs:""
        };

      }

      if(r.medida==="0609"){
        mapa[r.nota].m609=r.status_med || "";
        mapa[r.nota].tipo=r.tipo || "";
      }

      if(r.medida==="0614"){

        if(r.tipo==="MDCO" && r.status_med){
          mapa[r.nota].m614=`*${r.status_med}*`;
        }else{
          mapa[r.nota].m614=r.status_med || "";
        }

        mapa[r.nota].tipo=r.tipo || "";
      }

      if(r.medida==="0625"){
        mapa[r.nota].m625=r.status_med || "";
        mapa[r.nota].tipo=r.tipo || "";
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
        "<td>"+((r.tipo==="MDCO" && r.medida==="0614") ? "****" : (r.obs||""))+"</td>"+
        "<td>"+((r.tipo==="MDCO" && r.medida==="0614") ? "-" : (r.resp_geral||""))+"</td>"+
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

                    <td style={styles.td}>
                      {(r.tipo==="MDCO" && r.medida==="0614") ? "****" : r.obs}
                    </td>

                    <td style={styles.td}>
                      {(r.tipo==="MDCO" && r.medida==="0614") ? "-" : r.resp_geral}
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
