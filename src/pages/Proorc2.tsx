import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"

type Props = {

  setPagina: React.Dispatch<React.SetStateAction<Pagina>>

}

export default function Proorc2({ setPagina }:Props){

  const [nota,setNota] = useState("")

  const [busca,setBusca] = useState("")
  const [material,setMaterial] = useState<any>(null)

  const [estrutura,setEstrutura] = useState<any[]>([])

  const [quantidade,setQuantidade] = useState("")

  const [aplicacao,setAplicacao] = useState("N")

  const [lista,setLista] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])


  useEffect(()=>{

    if(!nota) return

    carregar()

  },[nota])


  useEffect(()=>{

    if(busca.length < 2){

      setMaterial(null)
      setEstrutura([])

      return

    }

    buscarMaterial()

  },[busca])


  async function buscarMaterial(){

    const { data } = await supabase

      .from("vw_proorc_materiais")

      .select("*")

      .eq("codigo", busca.toUpperCase())

      .maybeSingle()

    setMaterial(data || null)


    if(data?.tipo === "KIT"){

      const { data:itens } = await supabase

        .from("vw_proorc_estrutura")

        .select("*")

        .eq("codigo_kit", data.codigo)

      setEstrutura(itens || [])

    }

    else{

      setEstrutura([])

    }

  }


  async function adicionar(){

    if(!material) return

    await supabase.rpc(

      "fn_add_material_nota",

      {

        p_nota: nota,
        p_codigo: material.codigo,
        p_quantidade: Number(quantidade),
        p_tipo: material.tipo,
        p_aplicacao: aplicacao

      }

    )

    setBusca("")
    setMaterial(null)
    setQuantidade("")

    carregar()

  }


  async function excluir(id:string){

    await supabase

      .from("db_proorc_nota_materiais")

      .delete()

      .eq("id", id)

    carregar()

  }


  async function carregar(){

    const { data } = await supabase

      .from("vw_proorc_nota")

      .select("*")

      .eq("nota",nota)

      .order("created_at",{ascending:false})

    setLista(data || [])


    const { data:exp } = await supabase

      .from("vw_proorc_nota_itens")

      .select("*")

      .eq("nota",nota)

      .order("codigo")

    setExplodido(exp || [])

  }


  const podeGravar =

    nota &&
    material &&
    quantidade &&
    aplicacao


  return(

    <div style={styles.container}>

      <h2>PROORC 2.0</h2>


      <div style={styles.card}>

        <label>nota</label>

        <input

          style={styles.input}

          value={nota}

          onChange={(e)=>setNota(e.target.value)}

        />

      </div>


      <div style={styles.card}>

        <label>material / kit</label>

        <input

          style={styles.input}

          placeholder="digite o código"

          value={busca}

          onChange={(e)=>setBusca(e.target.value)}

        />


        {material && (

          <div style={styles.resultado}>

            <strong>

              {material.codigo}

            </strong>

            {" - "}

            {material.descricao}

            {" ("}

            {material.tipo}

            {")"}

          </div>

        )}

      </div>


      {estrutura.length > 0 && (

        <div style={styles.card}>

          <strong>

            itens do kit

          </strong>

          {estrutura.map(i => (

            <div key={i.codigo_item} style={styles.row}>

              {i.codigo_item}

              {" - "}

              {i.item}

              {" | qtd:"}

              {i.quantidade}

            </div>

          ))}

        </div>

      )}


      <div style={styles.card}>

        <label>quantidade</label>

        <input

          style={styles.input}

          type="number"

          value={quantidade}

          onChange={(e)=>setQuantidade(e.target.value)}

        />


        <label>aplicação</label>

        <select

          style={styles.input}

          value={aplicacao}

          onChange={(e)=>setAplicacao(e.target.value)}

        >

          <option value="N">N</option>

          <option value="U">U</option>

          <option value="S">S</option>

        </select>


        <button

          style={{

            ...styles.botao,

            opacity: podeGravar ? 1 : 0.5

          }}

          disabled={!podeGravar}

          onClick={adicionar}

        >

          adicionar

        </button>

      </div>


      <div style={styles.card}>

        <h3>registros cadastrados</h3>

        {lista.map(x=>(

          <div key={x.id} style={styles.row}>

            <div>

              {x.codigo}

              {" - "}

              {x.descricao}

            </div>

            <div>

              qtd: {x.quantidade}

              {" | "}

              {x.aplicacao}

            </div>

            <button

              style={styles.excluir}

              onClick={()=>excluir(x.id)}

            >

              excluir

            </button>

          </div>

        ))}

      </div>


      <div style={styles.card}>

        <h3>itens consolidados</h3>

        {explodido.map(x=>(

          <div key={x.codigo} style={styles.row}>

            <div>

              {x.codigo}

              {" - "}

              {x.descricao}

            </div>

            <strong>

              {x.quantidade}

            </strong>

          </div>

        ))}

      </div>


      <button

        style={styles.voltar}

        onClick={()=>setPagina("menu")}

      >

        voltar

      </button>

    </div>

  )

}


const styles:any = {

  container:{

    padding:20,

    maxWidth:900,

    margin:"0 auto"

  },

  card:{

    border:"1px solid #ddd",

    borderRadius:8,

    padding:12,

    marginBottom:12,

    background:"#fff"

  },

  input:{

    width:"100%",

    padding:8,

    marginTop:4,

    marginBottom:10,

    borderRadius:6,

    border:"1px solid #ccc"

  },

  resultado:{

    padding:6,

    background:"#f5f5f5",

    borderRadius:6

  },

  row:{

    display:"flex",

    justifyContent:"space-between",

    padding:6,

    borderBottom:"1px solid #eee",

    fontSize:14

  },

  botao:{

    padding:10,

    borderRadius:6,

    border:"none",

    background:"#1e3c72",

    color:"white",

    cursor:"pointer",

    width:"100%"

  },

  excluir:{

    border:"none",

    background:"#c0392b",

    color:"white",

    padding:"4px 8px",

    borderRadius:4,

    cursor:"pointer"

  },

  voltar:{

    padding:10,

    borderRadius:6,

    background:"#555",

    color:"white",

    border:"none",

    cursor:"pointer"

  }

}
