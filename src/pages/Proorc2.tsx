import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"

type Props = {

  setPagina: React.Dispatch<React.SetStateAction<Pagina>>

}

export default function Proorc2({ setPagina }:Props){

  const [nota,setNota] = useState("")

  const [codigo,setCodigo] = useState("")
  const [material,setMaterial] = useState<any>(null)

  const [estrutura,setEstrutura] = useState<any[]>([])

  const [quantidade,setQuantidade] = useState("")
  const [aplicacao,setAplicacao] = useState("N")

  const [cadastro,setCadastro] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])


  useEffect(()=>{

    if(!nota) return

    carregarNota()

  },[nota])


  useEffect(()=>{

    if(codigo.length < 2){

      setMaterial(null)
      setEstrutura([])

      return

    }

    buscarMaterial()

  },[codigo])


  async function buscarMaterial(){

    const { data } = await supabase

      .from("vw_proorc_materiais")

      .select("*")

      .eq("codigo", codigo.toUpperCase())

      .maybeSingle()

    setMaterial(data)


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


  async function carregarNota(){

  if(!nota) return


  const { data:cad } = await supabase

    .from("vw_proorc_cadastro")

    .select("*")

    .eq("nota",nota)

    .order("created_at",{ascending:true})

  setCadastro(cad || [])


  const { data:exp } = await supabase

    .from("vw_proorc_cadastro_itens")

    .select("*")

    .eq("nota",nota)

    .order("codigo")

  setExplodido(exp || [])

}


  async function adicionar(){

    await supabase.rpc(

      "fn_proorc_cadastrar",

      {

        p_nota: nota,
        p_codigo: material.codigo,
        p_quantidade: Number(quantidade),
        p_aplicacao: aplicacao

      }

    )

    setCodigo("")
    setQuantidade("")

    carregarNota()

  }


  async function excluir(id:string){

    await supabase

      .from("db_proorc_cadastro")

      .delete()

      .eq("id",id)

    carregarNota()

  }


  const podeSalvar =

    nota &&
    material &&
    quantidade &&
    aplicacao


  return(

    <div style={styles.container}>

      <h2>PROORC 2.0</h2>


      <div style={styles.card}>

        nota

        <input

          style={styles.inputNota}

          value={nota}

          onChange={(e)=>setNota(e.target.value)}

        />

      </div>


      <div style={styles.linhaCadastro}>

        <input

          style={styles.material}

          placeholder="material"

          value={codigo}

          onChange={(e)=>setCodigo(e.target.value)}

        />


        <input

          style={styles.qtd}

          type="number"

          placeholder="qtd"

          value={quantidade}

          onChange={(e)=>setQuantidade(e.target.value)}

        />


        <select

          style={styles.aplicacao}

          value={aplicacao}

          onChange={(e)=>setAplicacao(e.target.value)}

        >

          <option value="N">N</option>
          <option value="U">U</option>
          <option value="S">S</option>

        </select>


        <button

          style={styles.salvar}

          disabled={!podeSalvar}

          onClick={adicionar}

        >

          salvar

        </button>

      </div>


      {material && (

        <div style={styles.materialInfo}>

          {material.descricao}

          {" ("}

          {material.tipo}

          {")"}

        </div>

      )}


      {estrutura.length > 0 && (

        <div style={styles.card}>

          itens do kit:

          {estrutura.map(i => (

            <div key={i.codigo_item}>

              {i.codigo_item}

              {" - "}

              {i.item}

              {" ("}

              {i.quantidade}

              {")"}

            </div>

          ))}

        </div>

      )}


      <div style={styles.card}>

        registros cadastrados

        {cadastro.map(x => (

          <div key={x.id} style={styles.row}>

            {x.codigo}

            {" - "}

            {x.descricao}

            {" | "}

            {x.quantidade}

            {" | "}

            {x.aplicacao}

            <button onClick={()=>excluir(x.id)}>

              excluir

            </button>

          </div>

        ))}

      </div>


      <div style={styles.card}>

        itens consolidados

        {explodido.map(x => (

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
    maxWidth:1100,
    margin:"0 auto"

  },

  card:{

    border:"1px solid #ddd",
    borderRadius:8,
    padding:10,
    marginBottom:10

  },

  inputNota:{

    width:200,
    padding:6

  },

  linhaCadastro:{

    display:"flex",
    gap:8,
    marginBottom:10

  },

  material:{

    width:"20%"

  },

  qtd:{

    width:"10%"

  },

  aplicacao:{

    width:"10%"

  },

  salvar:{

    width:"10%",
    background:"#1e3c72",
    color:"white",
    border:"none",
    borderRadius:6

  },

  materialInfo:{

    marginBottom:10

  },

  row:{

    display:"flex",
    justifyContent:"space-between",
    padding:4

  }

}
