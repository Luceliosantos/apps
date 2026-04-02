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

  const [editando,setEditando] = useState<string | null>(null)


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

    const { data } = await supabase

      .from("vw_proorc_cadastro")

      .select("*")

      .eq("nota",nota)

      .order("created_at")

    setCadastro(data || [])


    const { data:exp } = await supabase

      .from("vw_proorc_cadastro_itens")

      .select("*")

      .eq("nota",nota)

      .order("codigo")

    setExplodido(exp || [])

  }


  async function salvar(){

    if(editando){

      await supabase

        .from("db_proorc_cadastro")

        .update({

          quantidade:Number(quantidade),
          aplicacao

        })

        .eq("id",editando)

      setEditando(null)

    }

    else{

      await supabase.rpc(

        "fn_proorc_cadastrar",

        {

          p_nota: nota,
          p_codigo: material.codigo,
          p_quantidade: Number(quantidade),
          p_aplicacao: aplicacao

        }

      )

    }

    setCodigo("")
    setQuantidade("")
    setAplicacao("N")

    carregarNota()

  }


  async function excluir(id:string){

    await supabase

      .from("db_proorc_cadastro")

      .delete()

      .eq("id",id)

    carregarNota()

  }


  function editar(linha:any){

    setCodigo(linha.codigo)
    setQuantidade(linha.quantidade)
    setAplicacao(linha.aplicacao)

    setEditando(linha.id)

  }


  const podeSalvar =

    nota &&
    codigo &&
    quantidade &&
    aplicacao


  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <h2>

            PROORC 2.0

          </h2>

          <button

            style={styles.voltar}

            onClick={()=>setPagina("menu")}

          >

            voltar

          </button>

        </div>


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

            onClick={salvar}

          >

            {editando ? "alterar" : "gravar"}

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

            <strong>

              estrutura do kit

            </strong>

            <table style={styles.tabela}>

              <thead>

                <tr>

                  <th>codigo</th>
                  <th>descricao</th>
                  <th>qtd</th>

                </tr>

              </thead>

              <tbody>

                {estrutura.map(i => (

                  <tr key={i.codigo_item}>

                    <td>{i.codigo_item}</td>

                    <td>{i.item}</td>

                    <td>{i.quantidade}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}


        <div style={styles.card}>

          <strong>

            registros cadastrados

          </strong>

          <table style={styles.tabela}>

            <thead>

              <tr>

                <th>codigo</th>
                <th>descricao</th>
                <th>qtd</th>
                <th>apl</th>
                <th></th>

              </tr>

            </thead>

            <tbody>

              {cadastro.map(x => (

                <tr key={x.id}>

                  <td>{x.codigo}</td>

                  <td>{x.descricao}</td>

                  <td>{x.quantidade}</td>

                  <td>{x.aplicacao}</td>

                  <td>

                    <button onClick={()=>editar(x)}>

                      editar

                    </button>

                    <button onClick={()=>excluir(x.id)}>

                      excluir

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        <div style={styles.card}>

          <strong>

            itens consolidados

          </strong>

          <table style={styles.tabela}>

            <thead>

              <tr>

                <th>codigo</th>
                <th>descricao</th>
                <th>total</th>

              </tr>

            </thead>

            <tbody>

              {explodido.map(x => (

                <tr key={x.codigo}>

                  <td>{x.codigo}</td>

                  <td>{x.descricao}</td>

                  <td>{x.quantidade}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


      </div>

    </div>

  )

}


const styles:any = {

  container:{

    minHeight:"100vh",

    backgroundImage:"url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",

    backgroundSize:"cover",

    backgroundPosition:"center"

  },

  overlay:{

    minHeight:"100vh",

    background:"rgba(0,0,0,0.75)",

    padding:20,

    color:"white"

  },

  header:{

    display:"flex",

    justifyContent:"space-between",

    alignItems:"center",

    marginBottom:20

  },

  voltar:{

    padding:"8px 14px",

    background:"#c0392b",

    border:"none",

    borderRadius:6,

    color:"white",

    cursor:"pointer"

  },

  card:{

    background:"white",

    color:"black",

    padding:10,

    borderRadius:8,

    marginBottom:12

  },

  linhaCadastro:{

    display:"flex",

    gap:6,

    marginBottom:10

  },

  inputNota:{

    width:200,

    padding:6

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

    marginBottom:8

  },

  tabela:{

    width:"100%",

    borderCollapse:"collapse",

    fontSize:13

  }

}
