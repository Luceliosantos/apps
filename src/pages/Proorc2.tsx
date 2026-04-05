import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>
}

export default function Proorc2({ setPagina }:Props){

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

  function formatarData(data?:string){

    if(!data) return ""

    return new Date(data)
      .toLocaleString("pt-BR")

  }

  const podeSalvar =
    notaValida &&
    codigo &&
    quantidade &&
    aplicacao

  const efeitoHover = {
    backgroundColor:"rgba(255,255,255,0.25)"
  }

  const efeitoClick = {
    transform:"translateY(2px)",
    boxShadow:"none"
  }

  function aplicarHover(e:any){
    Object.assign(e.currentTarget.style, efeitoHover)
  }

  function removerHover(e:any){
    e.currentTarget.style.backgroundColor="rgba(255,255,255,0.15)"
  }

  function aplicarClick(e:any){
    Object.assign(e.currentTarget.style, efeitoClick)
  }

  function removerClick(e:any){
    e.currentTarget.style.transform="translateY(0px)"
  }

  function propsBotao(){

    return {

      onMouseEnter:aplicarHover,
      onMouseLeave:removerHover,
      onMouseDown:aplicarClick,
      onMouseUp:removerClick,
      onMouseOut:removerClick

    }

  }

  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <h2>PROORC 2.0</h2>

          <button
            {...propsBotao()}
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
              {...propsBotao()}
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

          {material && (

            <div style={styles.infoMaterial}>

              {material.descricao} ({material.tipo})

            </div>

          )}

        </div>

        {estrutura.length>0 &&(

        <div style={styles.tableContainer}>

          <strong>estrutura do kit</strong>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>codigo</th>
                <th style={styles.th}>descricao</th>
                <th style={styles.th}>qtd</th>

              </tr>

            </thead>

            <tbody>

              {estrutura.map(i=>(

                <tr key={i.codigo_item}>

                  <td style={styles.td}>{i.codigo_item}</td>
                  <td style={styles.td}>{i.item}</td>
                  <td style={styles.td}>{i.quantidade}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        )}

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>codigo</th>
                <th style={styles.th}>descricao</th>
                <th style={styles.th}>qtd</th>
                <th style={styles.th}>apl</th>
                <th style={styles.th}>data criação</th>
                <th style={styles.th}>data edição</th>
                <th style={styles.th}></th>

              </tr>

            </thead>

            <tbody>

              {cadastro.map(x=>(

                <tr key={x.id}>

                  <td style={styles.td}>{x.codigo}</td>
                  <td style={styles.td}>{x.descricao}</td>
                  <td style={styles.td}>{x.quantidade}</td>
                  <td style={styles.td}>{x.aplicacao}</td>

                  <td style={styles.td}>
                    {formatarData(x.created_at)}
                  </td>

                  <td style={styles.td}>
                    {formatarData(x.updated_at)}
                  </td>

                  <td style={styles.td}>

                    <button
                      {...propsBotao()}
                      style={styles.button}
                      onClick={()=>editar(x)}
                    >
                      editar
                    </button>

                    <button
                      {...propsBotao()}
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

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>codigo</th>
                <th style={styles.th}>descricao</th>
                <th style={styles.th}>total</th>

              </tr>

            </thead>

            <tbody>

              {explodido.map(x=>(

                <tr key={x.codigo}>

                  <td style={styles.td}>{x.codigo}</td>
                  <td style={styles.td}>{x.descricao}</td>
                  <td style={styles.td}>{x.quantidade}</td>

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

panel:{
background:"rgba(255,255,255,0.1)",
padding:15,
borderRadius:10,
marginBottom:20
},

gridCadastro:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
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
marginBottom:20,
overflowX:"auto"
},

table:{
width:"100%",
borderCollapse:"collapse"
},

th:{
border:"1px solid #ccc",
background:"#f2f2f2",
padding:6
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

infoMaterial:{
color:"white",
marginTop:6
},

erro:{
color:"#ffb3b3",
marginTop:6,
fontSize:13
}

}
