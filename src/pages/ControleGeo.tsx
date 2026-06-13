import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type LinhaControle = {
  origem:string;
  regional:string;
  nota:string;
  medida:string;
  responsavel:string;
  status:string;
  prazo:string;
  data_email:string;
  basecr:number;
  obs:string;
};

export default function ControleGeo({ setPagina }: Props){

  const [dados,setDados] = useState<LinhaControle[]>([]);


  const [origem,setOrigem] = useState("");
  const [status,setStatus] = useState("");
const [responsavelSelecionado,setResponsavelSelecionado] =
  useState("");

  const [ordenacao,setOrdenacao] =
    useState<{
      campo:string;
      asc:boolean;
    }>({
      campo:"nota",
      asc:true
    });

  async function carregarDados(){

    const [
      metaResp,
      freeResp,
      prodResp
    ] = await Promise.all([

      supabase
        .from("db_program_geo_meta")
        .select("*"),

      supabase
        .from("db_program_geo_free")
        .select("*"),

      supabase
        .from("db_program_geo_produtividade")
        .select("*")

    ]);

    const lista: LinhaControle[] = [];

    (metaResp.data || []).forEach((r:any)=>{

      lista.push({
        origem:"META",
        regional:r.regional || "",
        nota:r.nota || "",
        medida:r.medida || "",
        responsavel:r.resp_meta || "",
        status:r.status_med || "",
        prazo:r.prazo_acao || "",
        data_email:r.data_email || "",
        basecr:Number(r.basecr || 0),
        obs:r.obs_acao || ""
      });

    });

    (freeResp.data || []).forEach((r:any)=>{

      lista.push({
        origem:"FREE",
        regional:r.regional || "",
        nota:r.nota || "",
        medida:r.medida || "",
        responsavel:r.resp_free || "",
        status:r.status_med || "",
        prazo:r.prazo_acao || "",
        data_email:r.data_email || "",
        basecr:Number(r.basecr || 0),
        obs:r.obs_acao || ""
      });

    });

    (prodResp.data || []).forEach((r:any)=>{

      lista.push({
        origem:"PRODUTIVIDADE",
        regional:"",
        nota:r.num_nota || "",
        medida:r.cod_medida || "",
        responsavel:r.tecnico || "",
        status:r.autorizado || "",
        prazo:r.treal_acao || "",
        data_email:"",
        basecr:0,
        obs:r.des_acao || ""
      });

    });

    setDados(lista);

  }

  useEffect(()=>{

    carregarDados();

  },[]);

  const responsaveis = useMemo(()=>{

    return [...new Set(
      dados
        .map(x=>x.responsavel)
        .filter(Boolean)
    )]
    .sort();

  },[dados]);

  const statusLista = useMemo(()=>{

  let base = dados;

  if(responsavelSelecionado){

    base = dados.filter(
      x =>
        x.responsavel ===
        responsavelSelecionado
    );

  }

  const mapa:Record<string,number> = {};

  base.forEach(x=>{

    if(!x.status) return;

    mapa[x.status] =
      (mapa[x.status] || 0) + 1;

  });

  return Object.entries(mapa)
    .sort((a,b)=>b[1]-a[1]);

},[
  dados,
  responsavelSelecionado
]);

  const ranking = useMemo(()=>{

    const mapa:Record<string,number> = {};

    dados.forEach(r=>{

      if(!r.responsavel) return;

      mapa[r.responsavel] =
        (mapa[r.responsavel] || 0) + 1;

    });

    return Object.entries(mapa)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,30);

  },[dados]);

  const dadosFiltrados = useMemo(()=>{

let lista = dados.filter(r=>{

  if(origem && r.origem !== origem)
    return false;

  if(
    responsavelSelecionado &&
    r.responsavel !==
    responsavelSelecionado
  )
    return false;

  if(status && r.status !== status)
    return false;

  return true;

});

    lista.sort((a:any,b:any)=>{

      const campo =
        ordenacao.campo as keyof LinhaControle;

      const va:any = a[campo];
      const vb:any = b[campo];

      if(va < vb)
        return ordenacao.asc ? -1 : 1;

      if(va > vb)
        return ordenacao.asc ? 1 : -1;

      return 0;

    });

    return lista;

  },[
  dados,
  origem,
  responsavelSelecionado,
  status,
  ordenacao
]);

  const totalMeta =
    dados.filter(x=>x.origem==="META").length;

  const totalFree =
    dados.filter(x=>x.origem==="FREE").length;

  const totalProd =
    dados.filter(
      x=>x.origem==="PRODUTIVIDADE"
    ).length;

  const totalBaseCr =
    dados.reduce(
      (a,b)=>a+b.basecr,
      0
    );

  const totalResponsaveis =
    new Set(
      dados.map(x=>x.responsavel)
    ).size;

  function ordenar(campo:string){

    setOrdenacao(prev=>({

      campo,

      asc:
        prev.campo===campo
          ? !prev.asc
          : true

    }));

  }

  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.topo}>

          <div style={styles.grupo}>

            <button
              style={styles.button}
              onClick={()=>setOrigem("META")}
            >
              META
            </button>

            <button
              style={styles.button}
              onClick={()=>setOrigem("FREE")}
            >
              FREE
            </button>

            <button
              style={styles.button}
              onClick={()=>setOrigem("PRODUTIVIDADE")}
            >
              PRODUTIVIDADE
            </button>

            <button
              style={styles.buttonLimpar}
              onClick={limpar}
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

        <div style={styles.cards}>

          <div style={styles.card}>
            <div>META</div>
            <h2>{totalMeta}</h2>
          </div>

          <div style={styles.card}>
            <div>FREE</div>
            <h2>{totalFree}</h2>
          </div>

          <div style={styles.card}>
            <div>PRODUTIVIDADE</div>
            <h2>{totalProd}</h2>
          </div>

          <div style={styles.card}>
            <div>BASE CR</div>
            <h2>
              {totalBaseCr.toLocaleString("pt-BR")}
            </h2>
          </div>

          <div style={styles.card}>
            <div>RESPONSÁVEIS</div>
            <h2>{totalResponsaveis}</h2>
          </div>

        </div>

        <div style={styles.corpo}>

          <div style={styles.ranking}>

            <h3>Responsáveis</h3>

            {ranking.map(r=>(

              <button
                key={r[0]}
                style={styles.rankButton}
                onClick={()=>{
  setResponsavelSelecionado(r[0]);
  setStatus("");
}}
              >
                {r[0]} ({r[1]})
              </button>

            ))}

          </div>

          <div style={styles.tabelaCard}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th onClick={()=>ordenar("origem")}>
                    ORIGEM
                  </th>

                  <th onClick={()=>ordenar("regional")}>
                    REGIONAL
                  </th>

                  <th onClick={()=>ordenar("nota")}>
                    NOTA
                  </th>

                  <th onClick={()=>ordenar("medida")}>
                    MEDIDA
                  </th>

                  <th onClick={()=>ordenar("responsavel")}>
                    RESPONSÁVEL
                  </th>

                  <th onClick={()=>ordenar("status")}>
                    STATUS
                  </th>

                  <th onClick={()=>ordenar("prazo")}>
                    PRAZO
                  </th>

                  <th onClick={()=>ordenar("basecr")}>
                    BASE CR
                  </th>

                  <th>
                    OBS
                  </th>

                </tr>

              </thead>

              <tbody>

                {dadosFiltrados.map((r,i)=>(

                  <tr key={i}>

                    <td>{r.origem}</td>
                    <td>{r.regional}</td>
                    <td>{r.nota}</td>
                    <td>{r.medida}</td>
                    <td>{r.responsavel}</td>
                    <td>{r.status}</td>
                    <td>{r.prazo}</td>

                    <td>
                      {r.basecr.toLocaleString("pt-BR")}
                    </td>

                    <td>{r.obs}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

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

  topo:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:20,
    flexWrap:"wrap"
  },

  grupo:{
    display:"flex",
    gap:8,
    flexWrap:"wrap"
  },

  cards:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
    gap:12,
    marginBottom:20
  },

  card:{
    background:"rgba(255,255,255,0.12)",
    padding:14,
    borderRadius:10,
    textAlign:"center"
  },

  filtros:{
    display:"flex",
    gap:10,
    flexWrap:"wrap",
    marginBottom:20
  },

  corpo:{
    display:"flex",
    gap:20
  },

  ranking:{
    width:250,
    background:"rgba(255,255,255,0.1)",
    padding:10,
    borderRadius:10
  },

  rankButton:{
    width:"100%",
    marginBottom:5,
    padding:8,
    cursor:"pointer"
  },

  tabelaCard:{
    flex:1,
    overflowX:"auto",
    background:"rgba(255,255,255,0.1)",
    padding:10,
    borderRadius:10
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    background:"white",
    color:"black"
  },

  input:{
    padding:8,
    borderRadius:6
  },

  button:{
    padding:"8px 12px",
    borderRadius:8,
    cursor:"pointer"
  },

  buttonLimpar:{
    padding:"8px 12px",
    borderRadius:8,
    background:"#c0392b",
    color:"white",
    cursor:"pointer"
  }

};

