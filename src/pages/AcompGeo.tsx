import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type Registro = {
  id:number;
  regional:string;
  nota:string;
  modalidade:string;
  empreiteira:string;
  base_cr:number;
  medida:string;
  linha_med:string;
  status_med:string;
  obs:string;
  resp_meta:string;
  resp_free:string;
  resp_geral:string;
  data_email:string;
};

export default function AcompGeo({ setPagina }: Props){

  const [lista1,setLista1] = useState<any[]>([]);
  const [lista2,setLista2] = useState<any[]>([]);
  const [lista3,setLista3] = useState<any[]>([]);

  const [buscaNota,setBuscaNota] = useState("");
  const [resultadoBusca,setResultadoBusca] = useState<Registro[]>([]);


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

    setLista1(await carregarRegional("NE/MC"));
    setLista2(await carregarRegional("NE/PR"));
    setLista3(await carregarRegional("CE/SL"));

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



  function tabela(lista:any[]){

    return(

      <table style={styles.table}>

        <thead>

          <tr>

            <th>nota</th>
            <th>609</th>
            <th>614</th>
            <th>625</th>
            <th>obs</th>

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

    );

  }



  return(

    <div style={styles.container}>

      <div style={styles.header}>

        <h2>Acompanhamento GEO</h2>

        <button
          style={styles.button}
          onClick={()=>setPagina("menu")}
        >

          Voltar

        </button>

      </div>



      <div style={styles.grid}>

        {tabela(lista1)}
        {tabela(lista2)}
        {tabela(lista3)}

      </div>



      <div style={styles.buscaLinha}>

        <input
          style={styles.input}
          placeholder="numero da nota"
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



      <table style={styles.table}>

        <thead>

          <tr>

            <th>regional</th>
            <th>nota</th>
            <th>modalidade</th>
            <th>empreiteira</th>
            <th>base_cr</th>
            <th>medida</th>
            <th>linha_med</th>
            <th>status_med</th>
            <th>obs</th>
            <th>resp_meta</th>
            <th>resp_free</th>
            <th>resp_geral</th>
            <th>data_email</th>

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

  );

}



const styles:{[key:string]:React.CSSProperties}={

  container:{
    padding:40
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:30
  },

  button:{
    background:"black",
    color:"white",
    border:"none",
    padding:"10px 18px",
    borderRadius:8,
    cursor:"pointer"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr 1fr",
    gap:30,
    marginBottom:40
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    marginBottom:30
  },

  input:{
    padding:8,
    width:200,
    marginRight:10
  },

  buscaLinha:{
    marginBottom:20
  }

};
