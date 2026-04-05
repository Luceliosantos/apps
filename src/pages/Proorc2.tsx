import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"

type Props = {
  usuario:{
    nome:string
  }
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>
}

export default function Proorc2({ usuario,setPagina }:Props){

  const [nota,setNota] = useState("")
  const [notaValida,setNotaValida] = useState(false)
  const [erroNota,setErroNota] = useState("mínimo 10 dígitos numéricos")

  const [codigo,setCodigo] = useState("")
  const [materiaisSug,setMateriaisSug] = useState<any[]>([])

  const [material,setMaterial] = useState<any>(null)
  const [estrutura,setEstrutura] = useState<any[]>([])

  const [quantidade,setQuantidade] = useState("")
  const [aplicacao,setAplicacao] = useState("N")

  const [cadastro,setCadastro] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])

  const [editando,setEditando] = useState<string | null>(null)

  function saudacao(){

    const hora = new Date().getHours()

    if(hora < 12) return "Bom dia"
    if(hora < 18) return "Boa tarde"

    return "Boa noite"

  }

  function validarNota(valor:string){

    setNota(valor)

    if(valor.length < 10){

      setNotaValida(false)
      setErroNota("mínimo 10 dígitos numéricos")
      return

    }

    const primeiros10 = valor.substring(0,10)

    if(!/^\d{10}$/.test(primeiros10)){

      setNotaValida(false)
      setErroNota("os 10 primeiros caracteres devem ser numéricos")
      return

    }

    setErroNota("")
    setNotaValida(true)

  }

  useEffect(()=>{

    if(!notaValida) return

    carregarNota()

  },[notaValida])

  useEffect(()=>{

    if(codigo.length < 2){

      setMaterial(null)
      setEstrutura([])
      setMateriaisSug([])

      return

    }

    buscarMateriais()

  },[codigo])

  async function buscarMateriais(){

    const { data } = await supabase
      .from("db_proorc_materiais")
      .select("codigo, descricao, tipo")
      .ilike("codigo",`${codigo}%`)
      .order("codigo")
      .limit(20)

    setMateriaisSug(data || [])

  }

  async function confirmarCodigoDigitado(){

    if(!codigo) return

    const { data } = await supabase
      .from("vw_proorc_materiais")
      .select("*")
      .ilike("codigo",`${codigo}%`)
      .order("codigo")
      .limit(1)
      .maybeSingle()

    if(data){

      selecionarMaterial(data.codigo)

    }

  }

  async function selecionarMaterial(cod:string){

    setCodigo(cod)
    setMateriaisSug([])

    const { data } = await supabase
      .from("vw_proorc_materiais")
      .select("*")
      .eq("codigo", cod)
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

    if(!material){

      await confirmarCodigoDigitado()

    }

    if(!material) return

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
    setMaterial(null)

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
    notaValida &&
    codigo &&
    quantidade &&
    aplicacao

  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <div style={styles.boasVindas}>
            {saudacao()}, {usuario.nome}
          </div>

          <button
            style={styles.buttonDanger}
            onClick={()=>setPagina("menu")}
          >
            Voltar
          </button>

        </div>

        <div style={styles.panel}>

          <input
            placeholder="nota"
            style={styles.input}
            value={nota}
            onChange={(e)=>validarNota(e.target.value)}
          />

          {erroNota && !notaValida &&(

            <div style={styles.erro}>
              {erroNota}
            </div>

          )}

        </div>

        {notaValida && (

        <>

        <div style={styles.panel}>

          <div style={styles.gridCadastro}>

            <input
              placeholder="material ou kit"
              style={styles.input}
              value={codigo}

              onChange={(e)=>setCodigo(e.target.value.toUpperCase())}

              onKeyDown={async (e)=>{

                if(e.key === "Enter" || e.key === "Tab"){

                  await confirmarCodigoDigitado()
                  setMateriaisSug([])

                }

              }}

              onBlur={async ()=>{

                if(!material && codigo){

                  await confirmarCodigoDigitado()
                  setMateriaisSug([])

                }

              }}
            />

            <input
              placeholder="qtd"
              type="number"
              style={styles.input}
              value={quantidade}
              onChange={(e)=>setQuantidade(e.target.value)}
            />

            <button
              style={styles.button}
              disabled={!podeSalvar}
              onClick={salvar}
            >
              {editando ? "Alterar" : "Gravar"}
            </button>

          </div>

          {materiaisSug.length>0 &&(

            <div style={styles.sugestoesFixas}>

              {materiaisSug.map(m=>(

                <div
                  key={m.codigo}
                  style={styles.itemSug}
                  onClick={()=>selecionarMaterial(m.codigo)}
                >
                  {m.codigo} - {m.descricao}
                </div>

              ))}

            </div>

          )}

        </div>

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.thBlue}>CODIGO</th>
                <th style={styles.thBlue}>DESCRIÇÃO</th>
                <th style={styles.thBlue}>QTD</th>
                <th style={styles.thBlue}></th>

              </tr>

            </thead>

            <tbody>

              {cadastro.map(x=>(

                <tr key={x.id}>

                  <td style={styles.td}>{x.codigo}</td>
                  <td style={styles.td}>{x.descricao}</td>
                  <td style={styles.td}>{x.quantidade}</td>

                  <td style={styles.td}>

                    <button
                      style={styles.button}
                      onClick={()=>editar(x)}
                    >
                      alterar
                    </button>

                    <button
                      style={styles.buttonDanger}
                      onClick={()=>excluir(x.id)}
                    >
                      excluir
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        </>

        )}

      </div>

    </div>

  )

}

const styles:any={

container:{
minHeight:"100vh",
backgroundImage:"url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",
backgroundSize:"cover",
backgroundPosition:"center"
},

overlay:{
minHeight:"100vh",
backgroundColor:"rgba(0,0,0,0.55)",
padding:20
},

header:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
color:"white",
marginBottom:25
},

boasVindas:{
fontSize:18,
fontWeight:"bold"
},

panel:{
background:"rgba(255,255,255,0.1)",
padding:15,
borderRadius:10,
marginBottom:20
},

gridCadastro:{
display:"grid",
gridTemplateColumns:"1fr 120px 120px",
gap:10
},

input:{
padding:"8px 10px",
borderRadius:8,
border:"1px solid #ccc"
},

button:{
padding:"8px 12px",
borderRadius:8,
border:"1px solid rgba(255,255,255,0.35)",
backgroundColor:"rgba(255,255,255,0.15)",
color:"white",
cursor:"pointer"
},

buttonDanger:{
padding:"8px 12px",
borderRadius:8,
backgroundColor:"rgba(192,57,43,0.7)",
color:"white",
border:"none"
},

tableContainer:{
background:"white",
borderRadius:10,
padding:10,
marginBottom:20
},

table:{
width:"100%",
borderCollapse:"collapse"
},

thBlue:{
background:"#cfe2ff",
padding:6,
border:"1px solid #9ec5fe"
},

td:{
border:"1px solid #ccc",
padding:6,
textAlign:"center"
},

sugestoesFixas:{
position:"absolute",
background:"white",
border:"1px solid #ccc",
borderRadius:8,
zIndex:1000,
maxHeight:200,
overflowY:"auto"
},

itemSug:{
padding:6,
borderBottom:"1px solid #eee",
cursor:"pointer"
},

erro:{
color:"#ffb3b3",
marginTop:6,
fontSize:13
}

}
