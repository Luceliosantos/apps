import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"

type Props = {
  usuario?:{
    nome?:string
  }
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>
}

export default function Proorc2({ usuario,setPagina }:Props){

  const [nota,setNota] = useState("")
  const [notaValida,setNotaValida] = useState(false)
  const [erroNota,setErroNota] = useState("")

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
            {saudacao()}, {usuario?.nome || ""}
          </div>

          <button
            style={styles.voltar}
            onClick={()=>setPagina("menu")}
          >
            voltar
          </button>

        </div>

        <div style={styles.grupoNota}>

  <span style={styles.labelNota}>
    NOTA
  </span>

  <input
    style={styles.inputConsulta}
    value={nota}
    onChange={(e)=>validarNota(e.target.value)}
  />

  {erroNota && !notaValida &&(

    <div style={styles.erroNota}>
      {erroNota}
    </div>

  )}

</div>

        {notaValida && (

        <>

        <div style={styles.boxCadastro}>

          <div style={styles.linhaCadastro}>

            <input
              style={styles.material}
              placeholder="material ou kit"
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

          {estrutura.length > 0 && (

            <div style={styles.subBox}>

              <strong>estrutura do kit</strong>

              <table style={styles.tabelaPadrao}>
                <thead>
                  <tr>
                    <th style={styles.thPadrao}>codigo</th>
                    <th style={styles.thPadrao}>descricao</th>
                    <th style={styles.thPadrao}>qtd</th>
                  </tr>
                </thead>

                <tbody>
                  {estrutura.map(i => (
                    <tr key={i.codigo_item}>
                      <td style={styles.tdPadrao}>{i.codigo_item}</td>
                      <td style={styles.tdPadrao}>{i.item}</td>
                      <td style={styles.tdPadrao}>{i.quantidade}</td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          )}

          <div style={styles.subBox}>

            <strong>registros cadastrados</strong>

            <table style={styles.tabelaPadrao}>

              <thead>

                <tr>

                  <th style={styles.thBlue}>CODIGO</th>
                  <th style={styles.thBlue}>DESCRIÇÃO</th>
                  <th style={styles.thBlue}>QTD</th>
                  <th style={styles.thBlue}></th>

                </tr>

              </thead>

              <tbody>

                {cadastro.map(x => (

                  <tr key={x.id}>

                    <td style={styles.tdPadrao}>{x.codigo}</td>
                    <td style={styles.tdPadrao}>{x.descricao}</td>
                    <td style={styles.tdPadrao}>{x.quantidade}</td>

                    <td style={styles.tdPadrao}>

                      <button
                        style={styles.btnGrid}
                        onClick={()=>editar(x)}
                      >
                        alterar
                      </button>

                      <button
                        style={styles.btnExcluir}
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

        </div>

        <div style={styles.card}>

          <strong>itens consolidados</strong>

          <table style={styles.tabelaPadrao}>

            <thead>

              <tr>

                <th style={styles.thPadrao}>codigo</th>
                <th style={styles.thPadrao}>descricao</th>
                <th style={styles.thPadrao}>total</th>

              </tr>

            </thead>

            <tbody>

              {explodido.map(x => (

                <tr key={x.codigo}>

                  <td style={styles.tdPadrao}>{x.codigo}</td>
                  <td style={styles.tdPadrao}>{x.descricao}</td>
                  <td style={styles.tdPadrao}>{x.quantidade}</td>

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
boasVindas:{
fontSize:18,
fontWeight:"bold"
},
grupoNota:{
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  gap:10,
  backgroundColor:"white",
  padding:"6px 10px",
  borderRadius:8,
  marginBottom:12,
  width:"220px"
},

labelNota:{
fontWeight:"bold",
fontSize:14
},

inputConsulta:{
padding:"6px 8px",
borderRadius:6,
border:"1px solid #ccc",
fontSize:14,
width:180,
textAlign:"center"
},

erroNota:{
fontSize:12,
color:"#c0392b",
marginLeft:8
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
padding:12,
borderRadius:8,
marginBottom:12
},
boxCadastro:{
background:"white",
color:"black",
padding:14,
borderRadius:14,
marginBottom:14,
boxShadow:"0 4px 14px rgba(0,0,0,0.25)"
},
subBox:{
marginTop:10,
paddingTop:10,
borderTop:"1px solid #eee"
},
linhaCadastro:{
display:"flex",
gap:6,
marginBottom:10,
alignItems:"center",
position:"relative"
},
inputNota:{
width:200,
padding:6
},
material:{ width:"25%" },
qtd:{ width:"8%" },
aplicacao:{ width:"8%" },
salvar:{
padding:"6px 10px",
background:"#1e3c72",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer"
},
sugestoesFixas:{
position:"absolute",
top:"36px",
width:"40vw",
maxHeight:"190px",
overflowY:"auto",
background:"white",
border:"1px solid #ccc",
borderRadius:8,
zIndex:1000
},
itemSug:{
padding:"6px 10px",
borderBottom:"1px solid #eee",
cursor:"pointer",
fontSize:13
},
tabelaPadrao:{
width:"100%",
borderCollapse:"collapse",
fontSize:13,
marginTop:6
},
thPadrao:{
border:"1px solid #bcd4f6",
background:"#e8f1ff",
padding:"6px",
fontWeight:"bold",
textAlign:"center"
},
thBlue:{
border:"1px solid #9ec5fe",
background:"#cfe2ff",
padding:"6px",
fontWeight:"bold",
textAlign:"center"
},
tdPadrao:{
border:"1px solid #d6e4ff",
padding:"6px",
textAlign:"center"
},
btnGrid:{
background:"#34495e",
color:"white",
border:"none",
padding:"4px 8px",
borderRadius:4,
marginRight:4,
cursor:"pointer"
},
btnExcluir:{
background:"#c0392b",
color:"white",
border:"none",
padding:"4px 8px",
borderRadius:4,
cursor:"pointer"
},
erro:{
color:"#ffb3b3",
marginTop:6,
fontSize:13
}
}
