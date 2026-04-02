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

  const [quantidade,setQuantidade] = useState("")

  const [aplicacao,setAplicacao] = useState("N")

  const [lista,setLista] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])

  useEffect(()=>{

    if(!nota) return

    carregar()

  },[nota])

  async function buscar(){

    const { data } = await supabase

      .from("vw_proorc_materiais")

      .select("*")

      .eq("codigo", busca.toUpperCase())

      .single()

    setMaterial(data)

  }

  async function adicionar(){

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

    limpar()

    carregar()

  }

  async function excluir(id:string){

    await supabase

      .from("db_proorc_nota_materiais")

      .delete()

      .eq("id", id)

    carregar()

  }

  function limpar(){

    setBusca("")
    setMaterial(null)

    setQuantidade("")

    setAplicacao("N")

  }

  async function carregar(){

    const { data } = await supabase

      .from("vw_proorc_nota")

      .select("*")

      .eq("nota",nota)

    setLista(data || [])

    const { data:exp } = await supabase

      .from("vw_proorc_nota_itens")

      .select("*")

      .eq("nota",nota)

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

          value={nota}

          onChange={(e)=>setNota(e.target.value)}

        />

      </div>

      <div style={styles.card}>

        <label>material</label>

        <div style={{display:"flex",gap:8}}>

          <input

            value={busca}

            onChange={(e)=>setBusca(e.target.value)}

          />

          <button onClick={buscar}>

            buscar

          </button>

        </div>

        {material && (

          <div>

            {material.codigo}

            {" - "}

            {material.descricao}

            {" ("}

            {material.tipo}

            {")"}

          </div>

        )}

      </div>

      <div style={styles.card}>

        <label>quantidade</label>

        <input

          type="number"

          value={quantidade}

          onChange={(e)=>setQuantidade(e.target.value)}

        />

        <label>aplicação</label>

        <select

          value={aplicacao}

          onChange={(e)=>setAplicacao(e.target.value)}

        >

          <option value="N">N</option>

          <option value="U">U</option>

          <option value="S">S</option>

        </select>

        <button

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

            {x.codigo}

            {" - "}

            {x.descricao}

            {" | qtd:"}

            {x.quantidade}

            {" | "}

            {x.aplicacao}

            <button

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

            {x.codigo}

            {" - "}

            {x.descricao}

            {" | total:"}

            {x.quantidade}

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

  row:{

    display:"flex",

    justifyContent:"space-between",

    padding:4,

    borderBottom:"1px solid #eee"

  },

  voltar:{

    padding:10,

    borderRadius:6,

    background:"#1e3c72",

    color:"white"

  }

}
