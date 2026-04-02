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

  const [quantidade,setQuantidade] = useState("")
  const [aplicacao,setAplicacao] = useState("N")

  const [cadastro,setCadastro] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])

  const [infoNota,setInfoNota] = useState<any>(null)

  const [editando,setEditando] = useState<string | null>(null)


  useEffect(()=>{

    if(!nota) return

    carregarNota()

  },[nota])


  useEffect(()=>{

    if(codigo.length < 2){

      setMaterial(null)
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


    const { data:info } = await supabase

      .from("vw_proorc_nota_info")

      .select("*")

      .eq("nota",nota)

      .maybeSingle()

    setInfoNota(info)

  }


  async function salvar(){

    const user = await supabase.auth.getUser()

    if(editando){

      await supabase

        .from("db_proorc_cadastro")

        .update({

          quantidade:Number(quantidade),

          aplicacao,

          updated_by:user.data.user?.id,

          updated_at:new Date()

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
          p_aplicacao: aplicacao,
          p_user:user.data.user?.id

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


  function formatarData(d:any){

    if(!d) return ""

    return new Date(d).toLocaleString()

  }


  const podeSalvar =

    nota &&
    codigo &&
    quantidade &&
    aplicacao


  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.topo}>

          <div>

            nota

            <input

              style={styles.inputNota}

              value={nota}

              onChange={(e)=>setNota(e.target.value)}

            />

          </div>


          <button

            style={styles.voltar}

            onClick={()=>setPagina("menu")}

          >

            voltar

          </button>

        </div>


        {infoNota && (

          <div style={styles.info}>

            criado por:

            {" "}

            {infoNota.criado_por}

            {" | "}

            {formatarData(infoNota.criado_em)}

            <br/>

            ultima alteração:

            {" "}

            {infoNota.atualizado_por}

            {" | "}

            {formatarData(infoNota.atualizado_em)}

          </div>

        )}


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


        <div style={styles.descricaoMaterial}>

          {material?.descricao}

        </div>


        <h3 style={styles.titulo}>

          registros cadastrados

        </h3>


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

                  <button

                    style={styles.botaoEditar}

                    onClick={()=>editar(x)}

                  >

                    editar

                  </button>


                  <button

                    style={styles.botaoExcluir}

                    onClick={()=>excluir(x.id)}

                  >

                    excluir

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        <h3 style={styles.titulo}>

          itens consolidados

        </h3>


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

  )

}


const styles:any = {

container:{

minHeight:"100vh",

backgroundImage:"url('/fundo.jpg')",

backgroundSize:"cover",

backgroundPosition:"center"

},

overlay:{

background:"rgba(0,0,0,0.75)",

minHeight:"100vh",

padding:20,

color:"white"

},

topo:{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

marginBottom:10

},

inputNota:{

width:180,

padding:5

},

voltar:{

background:"#c0392b",

border:"none",

padding:"6px 12px",

borderRadius:6,

color:"white",

cursor:"pointer"

},

info:{

fontSize:12,

marginBottom:10,

opacity:0.9

},

linhaCadastro:{

display:"flex",

gap:6,

marginBottom:6

},

material:{

width:220,

padding:4

},

qtd:{

width:80,

padding:4

},

aplicacao:{

width:80,

padding:4

},

salvar:{

width:90,

background:"#1e3c72",

color:"white",

border:"none",

borderRadius:6,

cursor:"pointer"

},

descricaoMaterial:{

fontSize:12,

marginBottom:10,

opacity:0.9

},

titulo:{

marginTop:16,

marginBottom:4

},

tabela:{

width:"auto",

background:"white",

color:"black",

borderCollapse:"collapse",

fontSize:12

},

th:{

padding:"3px 6px",

borderBottom:"1px solid #ccc",

background:"#f1f1f1"

},

td:{

padding:"2px 6px",

borderBottom:"1px solid #eee"

},

botaoEditar:{

marginRight:4,

fontSize:11

},

botaoExcluir:{

fontSize:11

}

}
