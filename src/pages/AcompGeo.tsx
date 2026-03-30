import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

export default function AcompGeo({ setPagina }: Props){

  const [lista1,setLista1] = useState<any[]>([]);
  const [lista2,setLista2] = useState<any[]>([]);
  const [lista3,setLista3] = useState<any[]>([]);
  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<any[]>([]);

  async function carregarRegional(regional:string){

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("regional",regional)
      .order("base_cr",{ascending:false});

    if(!data) return [];

    const agrupado:any = {};

    data.forEach(r=>{

      if(!agrupado[r.nota]){

        agrupado[r.nota] = {
          nota:r.nota,
          base_cr:r.base_cr,
          m609:"",
          m614:"",
          m625:"",
          obs:""
        };

      }

      if(r.medida==="0609") agrupado[r.nota].m609=r.status_med;
      if(r.medida==="0614") agrupado[r.nota].m614=r.status_med;
      if(r.medida==="0625") agrupado[r.nota].m625=r.status_med;

      if(
        (r.medida==="0609" || r.medida==="0614" || r.medida==="0625")
        &&
        r.status_med?.includes("PEND")
      ){
        agrupado[r.nota].obs=r.obs;
      }

    });

    return Object.values(agrupado)
      .sort((a:any,b:any)=>b.base_cr-a.base_cr)
      .slice(0,10);

  }

  async function carregarListas(){

    setLista1(await carregarRegional("NORTE"));
    setLista2(await carregarRegional("SUL"));
    setLista3(await carregarRegional("LESTE"));

  }

  async function buscarNota(){

    const { data } = await supabase
      .from("db_acomp_geo")
      .select("*")
      .eq("nota",buscaNota);

    setResultadoBusca(data || []);

  }

  useEffect(()=>{
    carregarListas();
  },[]);



  function tabela(lista:any[], titulo:string){

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

                <td>{l.nota}</td>
                <td>{l.m609}</td>
                <td>{l.m614}</td>
                <td>{l.m625}</td>
                <td>{l.obs}</td>

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

          {tabela(lista1,"NORTE")}
          {tabela(lista2,"SUL")}
          {tabela(lista3,"LESTE")}

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
                <th>MODALIDADE</th>
                <th>EMPREITEIRA</th>
                <th>BASE_CR</th>
                <th>MEDIDA</th>
                <th>LINHA_MED</th>
                <th>STATUS_MED</th>
                <th>OBS</th>
                <th>RESP_META</th>
                <th>RESP_FREE</th>
                <th>RESP_GERAL</th>
                <th>DATA_EMAIL</th>

              </tr>

            </thead>

            <tbody>

              {resultadoBusca.map(r=>(

                <tr key={r.id}>

                  <td>{r.regional}</td>
                  <td>{r.nota}</td>
                  <td>{r.modalidade}</td>
                  <td>{r.empreiteira}</td>
                  <td>{r.base_cr}</td>
                  <td>{r.medida}</td>
                  <td>{r.linha_med}</td>
                  <td>{r.status_med}</td>
                  <td>{r.obs}</td>
                  <td>{r.resp_meta}</td>
                  <td>{r.resp_free}</td>
                  <td>{r.resp_geral}</td>
                  <td>{r.data_email}</td>

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

  button:{
    padding:"10px 22px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    backgroundColor:"rgba(255,255,255,0.15)",
    color:"white",
    cursor:"pointer"
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
    backdropFilter:"blur(6px)"
  },

  cardTitle:{
    textAlign:"center",
    marginBottom:10,
    fontWeight:600
  },

  table:{
    fontSize:13,
    borderCollapse:"collapse",
    width:"100%"
  },

  buscaArea:{
    marginBottom:30,
    display:"flex",
    gap:10,
    justifyContent:"center"
  },

  input:{
    padding:8,
    borderRadius:6,
    border:"1px solid #ccc"
  }

};
