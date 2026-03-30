import { useEffect, useState } from "react";
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
  obs:string
};

export default function AcompGeo({ setPagina }: Props){

  const [listaMC,setListaMC] = useState<LinhaResumo[]>([]);
  const [listaPR,setListaPR] = useState<LinhaResumo[]>([]);
  const [listaSL,setListaSL] = useState<LinhaResumo[]>([]);

  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<any[]>([]);


  async function carregarListas(){

  setListaMC(await carregarRegional("NE/MC"));
  setListaPR(await carregarRegional("NE/PR"));
  setListaSL(await carregarRegional("CE/SL"));

}



  async function carregarListas(){

    setListaMC(await carregarRegional("NE/MC"));
    setListaPR(await carregarRegional("NE/PR"));
    setListaSL(await carregarRegional("CE/SL"));

  }



  async function buscarNota(){

    if(!buscaNota) return;

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("nota",buscaNota);

    setResultadoBusca(data || []);

  }



  useEffect(()=>{

    carregarListas();

  },[]);




  function tabela(lista:LinhaResumo[],titulo:string){

    return(

      <div style={styles.card}>

        <div style={styles.cardTitle}>
          {titulo}
        </div>

        <table style={styles.table}>

          <thead>

            <tr>

              <th>NOTA</th>
              <th>609</th>
              <th>614</th>
              <th>625</th>
              <th>OBSERVAÇÃO</th>

            </tr>

          </thead>

          <tbody>

            {lista.map((l,i)=>(

              <tr key={i}>

                <td style={styles.td}>{l.nota}</td>
                <td style={styles.td}>{l.m609}</td>
                <td style={styles.td}>{l.m614}</td>
                <td style={styles.td}>{l.m625}</td>
                <td style={styles.td}>{l.obs}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    );

  }



  return(

    <div style={styles.container}>

      <div style={styles.overlay}>



        <div style={styles.header}>

          <h1>
            Acompanhamento GEO
          </h1>

          <button
            style={styles.button}
            onClick={()=>setPagina("menu")}
          >
            Voltar
          </button>

        </div>



        <div style={styles.grid}>

          {tabela(listaMC,"NE/MC")}
          {tabela(listaPR,"NE/PR")}
          {tabela(listaSL,"CE/SL")}

        </div>



        <div style={styles.buscaArea}>

          <input
            style={styles.input}
            placeholder="NUMERO DA NOTA"
            value={buscaNota}
            onChange={(e)=>setBuscaNota(e.target.value)}
          />

          <button
            style={styles.button}
            onClick={buscarNota}
          >
            Buscar
          </button>

        </div>



        <div style={styles.card}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th>REGIONAL</th>
                <th>NOTA</th>
                <th>MOD.</th>
                <th>BASE_CR</th>
                <th>MEDIDA</th>
                <th>LINHA</th>
                <th>STATUS_MED</th>
                <th>OBS</th>
                <th>RESP_GERAL</th>
                <th>DATA_EMAIL</th>

              </tr>

            </thead>

            <tbody>

              {resultadoBusca.map(r=>(

                <tr key={r.id}>

                  <td style={styles.td}>{r.regional}</td>
                  <td style={styles.td}>{r.nota}</td>
                  <td style={styles.td}>{r.modalidade}</td>
                  <td style={styles.td}>

                    {Number(r.base_cr).toLocaleString(
                      "pt-BR",
                      {style:"currency",currency:"BRL"}
                    )}

                  </td>
                  <td style={styles.td}>{r.medida}</td>
                  <td style={styles.td}>{r.linha_med}</td>
                  <td style={styles.td}>{r.status_med}</td>
                  <td style={styles.td}>{r.obs}</td>
                  <td style={styles.td}>{r.resp_geral}</td>
                  <td style={styles.td}>{r.data_email}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>



      </div>

    </div>

  );

}



const styles:{[key:string]:React.CSSProperties}={

  container:{
    minHeight:"100vh",
    backgroundImage:
      "url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",
    backgroundSize:"cover",
    backgroundPosition:"center"
  },

  overlay:{
    background:"rgba(0,0,0,0.65)",
    minHeight:"100vh",
    padding:40,
    color:"white"
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:30
  },

  grid:{
    display:"flex",
    justifyContent:"center",
    gap:30,
    marginBottom:40,
    flexWrap:"wrap"
  },

  card:{
    background:"rgba(255,255,255,0.08)",
    padding:20,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backdropFilter:"blur(6px)",
    minWidth:320
  },

  cardTitle:{
    textAlign:"center",
    marginBottom:12,
    fontWeight:600,
    fontSize:14
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    fontSize:13
  },

  td:{
    border:"1px solid rgba(255,255,255,0.25)",
    padding:"6px 10px",
    whiteSpace:"nowrap"
  },

  buscaArea:{
    display:"flex",
    justifyContent:"center",
    gap:10,
    marginBottom:30
  },

  input:{
    padding:8,
    borderRadius:6,
    border:"1px solid #ccc"
  },

  button:{
    padding:"10px 22px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(255,255,255,0.15)",
    color:"white",
    cursor:"pointer"
  }

};
