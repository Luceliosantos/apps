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
  obs:string;
};

export default function ControleGeo({ setPagina }: Props){

  const [dados,setDados] =
    useState<LinhaControle[]>([]);

  const [origem,setOrigem] =
  useState("META");

  const [status,setStatus] =
    useState("");

  const [
    responsavelSelecionado,
    setResponsavelSelecionado
  ] = useState("");

  const [ordenacao,setOrdenacao] =
    useState({
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
  status:(r.status_med || "")
    .replace(/^\d+\s*-\s*/,""),
        prazo:r.prazo_acao || "",
        data_email:r.data_email || "",
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
  status:(r.status_med || "")
    .replace(/^\d+\s*-\s*/,""),
        prazo:r.prazo_acao || "",
        data_email:r.data_email || "",
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
        obs:r.des_acao || ""
      });

    });

    setDados(lista);

  }

  useEffect(()=>{

    carregarDados();

  },[]);

  const dadosOrigem = useMemo(()=>{

    if(!origem) return dados;

    return dados.filter(
      x => x.origem === origem
    );

  },[
    dados,
    origem
  ]);

const ranking = useMemo(()=>{

  if(
    origem === "PRODUTIVIDADE"
  ){
    return [];
  }

  let base = dadosOrigem;

  if(status){

    base = base.filter(
      x => x.status === status
    );

  }

  const mapa:Record<string,number> = {};

  base.forEach(r=>{

    if(!r.responsavel) return;

    mapa[r.responsavel] =
      (mapa[r.responsavel] || 0) + 1;

  });

  return Object
    .entries(mapa)
    .sort((a,b)=>b[1]-a[1]);

},[
  dadosOrigem,
  origem,
  status
]);

    

  const statusLista = useMemo(()=>{

    let base = dadosOrigem;

    if(responsavelSelecionado){

      base = base.filter(
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

    return Object
      .entries(mapa)
      .sort((a,b)=>b[1]-a[1]);

  },[
    dadosOrigem,
    responsavelSelecionado
  ]);

  const dadosFiltrados = useMemo(()=>{

    let lista = [...dadosOrigem];

    if(responsavelSelecionado){

      lista = lista.filter(
        x =>
          x.responsavel ===
          responsavelSelecionado
      );

    }

    if(status){

      lista = lista.filter(
        x =>
          x.status === status
      );

    }

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
    dadosOrigem,
    responsavelSelecionado,
    status,
    ordenacao
  ]);

  const totalMeta =
    dados.filter(
      x=>x.origem==="META"
    ).length;

  const totalFree =
    dados.filter(
      x=>x.origem==="FREE"
    ).length;

  const totalProd =
    dados.filter(
      x=>x.origem==="PRODUTIVIDADE"
    ).length;

  const totalResponsaveis =
    new Set(
      dados
        .map(x=>x.responsavel)
        .filter(Boolean)
    ).size;

  function ordenar(
    campo:string
  ){

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
              style={{
                ...styles.button,
                ...(origem==="META"
                  ? styles.botaoSelecionado
                  : {})
              }}
              onClick={()=>{
                setOrigem("META");
                setStatus("");
                setResponsavelSelecionado("");
              }}
            >
              META
            </button>

            <button
              style={{
                ...styles.button,
                ...(origem==="FREE"
                  ? styles.botaoSelecionado
                  : {})
              }}
              onClick={()=>{
                setOrigem("FREE");
                setStatus("");
                setResponsavelSelecionado("");
              }}
            >
              FREE
            </button>

            <button
              style={{
                ...styles.button,
                ...(origem==="PRODUTIVIDADE"
                  ? styles.botaoSelecionado
                  : {})
              }}
              onClick={()=>{
                setOrigem("PRODUTIVIDADE");
                setStatus("");
                setResponsavelSelecionado("");
              }}
            >
              PRODUTIVIDADE
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
            <div>RESPONSÁVEIS</div>
            <h2>{totalResponsaveis}</h2>
          </div>

        </div>

        {origem !== "PRODUTIVIDADE" && (

<div style={styles.statusContainer}>

          {statusLista.map(s=>(

            <button
              key={s[0]}
              style={{
                ...styles.button,
                ...(status===s[0]
                  ? styles.botaoSelecionado
                  : {})
              }}
              onClick={()=>
                setStatus(s[0])
              }
            >
              {s[0]} ({s[1]})
            </button>

          ))}

        </div>
)}
        <div style={styles.corpo}>

          {origem !== "PRODUTIVIDADE" && (

            <div style={styles.ranking}>

              <h3>Responsáveis</h3>

              {ranking.map(r => (

                <button
                  key={r[0]}
                  style={{
                    ...styles.rankButton,
                    ...(responsavelSelecionado===r[0]
                      ? styles.botaoSelecionado
                      : {})
                  }}
                  onClick={()=>{
                    setResponsavelSelecionado(
                      r[0]
                    );
                    setStatus("");
                  }}
                >
                  {r[0]} ({r[1]})
                </button>

              ))}

            </div>

          )}

          <div style={styles.tabelaCard}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th
                    onClick={()=>
                      ordenar("regional")
                    }
                  >
                    REGIONAL
                  </th>

                  <th
                    onClick={()=>
                      ordenar("nota")
                    }
                  >
                    NOTA
                  </th>

                  <th
                    onClick={()=>
                      ordenar("medida")
                    }
                  >
                    MEDIDA
                  </th>

                  <th
                    onClick={()=>
                      ordenar("responsavel")
                    }
                  >
                    RESPONSÁVEL
                  </th>

                  <th
                    onClick={()=>
                      ordenar("status")
                    }
                  >
                    STATUS
                  </th>

                  <th
                    onClick={()=>
                      ordenar("prazo")
                    }
                  >
                    PRAZO
                  </th>

                  <th>
                    OBS
                  </th>

                </tr>

              </thead>

              <tbody>

                {dadosFiltrados.map((r,i)=>(

                  <tr key={i}>

                    <td>{r.regional}</td>

                    <td>{r.nota}</td>

                    <td>{r.medida}</td>

                    <td>{r.responsavel}</td>

                    <td>{r.status}</td>

                    <td>{r.prazo}</td>

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

const styles:{
  [key:string]:
  React.CSSProperties
}={

  container:{
    minHeight:"100vh",
    backgroundImage:
      "url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",
    backgroundSize:"cover",
    backgroundPosition:"center"
  },

  overlay:{
    minHeight:"100vh",
    background:"rgba(0,0,0,0.70)",
    padding:"20px",
    color:"white"
  },

  topo:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    gap:"10px",
    marginBottom:"20px",
    flexWrap:"wrap"
  },

  grupo:{
    display:"flex",
    gap:"8px",
    flexWrap:"wrap"
  },

  button:{
    padding:"10px 14px",
    borderRadius:"8px",
    border:"none",
    cursor:"pointer",
    fontWeight:600
  },

  botaoSelecionado:{
    background:"#f39c12",
    color:"#fff",
    fontWeight:"bold"
  },

  cards:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap:"12px",
    marginBottom:"20px"
  },

  card:{
    background:
      "rgba(255,255,255,0.12)",
    padding:"15px",
    borderRadius:"10px",
    textAlign:"center",
    backdropFilter:"blur(4px)"
  },

  statusContainer:{
    display:"flex",
    flexWrap:"wrap",
    gap:"8px",
    marginBottom:"15px"
  },

  corpo:{
    display:"flex",
    gap:"15px",
    alignItems:"flex-start"
  },

  ranking:{
    width:"260px",
    minWidth:"260px",
    maxHeight:"75vh",
    overflowY:"auto",
    background:
      "rgba(255,255,255,0.10)",
    padding:"12px",
    borderRadius:"10px"
  },

  rankButton:{
    width:"100%",
    textAlign:"left",
    padding:"8px",
    marginBottom:"6px",
    borderRadius:"6px",
    border:"none",
    cursor:"pointer"
  },

  tabelaCard:{
    flex:1,
    overflow:"auto",
    background:
      "rgba(255,255,255,0.10)",
    padding:"10px",
    borderRadius:"10px",
    minHeight:"600px"
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    background:"white",
    color:"black"
  }

};


