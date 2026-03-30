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
  obs:string
};

export default function AcompGeo({ setPagina }: Props){

  const [lista,setLista] = useState<LinhaResumo[]>([]);
  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<any[]>([]);


  async function carregarRegional(regional:string){

    const { data,error } = await supabase
      .from("db_acomp_geo")
      .select("nota,base_cr,medida,status_med,obs")
      .eq("regional",regional);

    if(error || !data){

      console.log(error);
      return;

    }

    const mapa:Record<string,LinhaResumo> = {};

    data.forEach((r:any)=>{

      if(!mapa[r.nota]){

        mapa[r.nota] = {

          nota:r.nota,
          base_cr:Number(r.base_cr) || 0,
          m609:"",
          m614:"",
          m625:"",
          obs:""

        };

      }

      if(r.medida==="0609") mapa[r.nota].m609=r.status_med || "";
      if(r.medida==="0614") mapa[r.nota].m614=r.status_med || "";
      if(r.medida==="0625") mapa[r.nota].m625=r.status_med || "";

      if(r.obs && !mapa[r.nota].obs){

        mapa[r.nota].obs=r.obs;

      }

    });

    const top10 =
      Object.values(mapa)
        .sort((a,b)=>b.base_cr-a.base_cr)
        .slice(0,10);

    setLista(top10);

  }


  function limparTabela(){

    setLista([]);

  }


  async function buscarNota(){

    if(!buscaNota) return;

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("nota",buscaNota);

    setResultadoBusca(data || []);

  }



  return(

    <div style={styles.container}>

      <div style={styles.overlay}>



        <div style={styles.header}>



          <div style={styles.botoesRegionais}>

            <button
              style={styles.button}
              onClick={()=>carregarRegional("NE/MC")}
            >
              NE/MC
            </button>


            <button
              style={styles.button}
              onClick={()=>carregarRegional("NE/PR")}
            >
              NE/PR
            </button>


            <button
              style={styles.button}
              onClick={()=>carregarRegional("CE/SL")}
            >
              CE/SL
            </button>


            <button
              style={styles.buttonLimpar}
              onClick={limparTabela}
            >
              Limpar
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

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th>NOTA</th>
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

                      <td style={styles.tdNota}>
                        {l.nota}
                      </td>



                      <td style={styles.td}>

                        {l.base_cr.toLocaleString(
                          "pt-BR",
                          {
                            style:"currency",
                            currency:"BRL"
                          }
                        )}

                      </td>



                      <td style={styles.tdMed}>
                        {l.m609}
                      </td>



                      <td style={styles.tdMed}>
                        {l.m614}
                      </td>



                      <td style={styles.tdMed}>
                        {l.m625}
                      </td>



                      <td style={styles.td}>
                        {l.obs}
                      </td>



                    </tr>

                  ))}

                </tbody>



              </table>

            </div>

          )}



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
                      {
                        style:"currency",
                        currency:"BRL"
                      }
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
    marginBottom:30,
    alignItems:"center"
  },



  botoesRegionais:{
    display:"flex",
    gap:10
  },



  areaTabela:{
    display:"flex",
    justifyContent:"center",
    marginBottom:30
  },



  card:{
    background:"rgba(255,255,255,0.08)",
    padding:18,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backdropFilter:"blur(6px)"
  },



  table:{
    borderCollapse:"collapse",
    fontSize:13
  },



  td:{
    border:"1px solid #ccc",
    padding:"6px 10px",
    background:"white",
    color:"black"
  },



  tdNota:{
    border:"1px solid #ccc",
    padding:"6px 14px",
    background:"white",
    color:"black"
  },



  tdMed:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    textAlign:"center",
    background:"white",
    color:"black"
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
