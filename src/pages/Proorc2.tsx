import { useEffect, useState, useRef } from "react"
import { supabase } from "../supabase"
import { Pagina } from "../App"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Props = {
  usuario?:{
    nome?:string
  }
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>
}

export default function Proorc2({ usuario,setPagina }:Props){

  const [nota,setNota] = useState("")
  const [notaValida,setNotaValida] = useState(false)
  const [notasSug,setNotasSug] = useState<any[]>([])
  const [indiceNotaSug,setIndiceNotaSug] = useState<number>(-1)

  const notaRef = useRef<HTMLInputElement>(null)
  const materialRef = useRef<HTMLInputElement>(null)
  const qtdRef = useRef<HTMLInputElement>(null)

  const [codigo,setCodigo] = useState("")
  const [materiaisSug,setMateriaisSug] = useState<any[]>([])
  const [indiceSug,setIndiceSug] = useState<number>(-1)

  const [material,setMaterial] = useState<any>(null)
  const [estrutura,setEstrutura] = useState<any[]>([])

  const [quantidade,setQuantidade] = useState("")
  const [aplicacao,setAplicacao] = useState("N")

  const [cadastro,setCadastro] = useState<any[]>([])
  const [explodido,setExplodido] = useState<any[]>([])

  const [infoNota,setInfoNota] = useState<{
    criadoPor?:string
    criadoEm?:string
    editadoPor?:string
    editadoEm?:string
  }>({})

  const [editando,setEditando] = useState<string | null>(null)

  function saudacao(){

    const hora = new Date().getHours()

    if(hora < 12) return "Bom dia"
    if(hora < 18) return "Boa tarde"

    return "Boa noite"

  }

  useEffect(()=>{

    if(nota.length < 3){

      setNotasSug([])
      setIndiceNotaSug(-1)
      return

    }

    if(nota.length >= 10){

      setNotasSug([])
      return

    }

    buscarNotas(nota)

  },[nota])

  useEffect(()=>{

    setTimeout(()=>{
      notaRef.current?.focus()
    },100)

  },[])

  function validarNota(valor:string){

    setNota(valor)

    if(valor.length < 10){

      setNotaValida(false)
      return

    }

    const primeiros10 = valor.substring(0,10)

    if(!/^\d{10}$/.test(primeiros10)){

      setNotaValida(false)
      return

    }

    setNotaValida(true)

  }

 useEffect(()=>{

  if(notaValida){

    carregarNota()

    setTimeout(()=>{

      materialRef.current?.focus()

    },50)

  }

},[notaValida])

  useEffect(()=>{

    if(codigo.length < 2){

      setMateriaisSug([])
      setIndiceSug(-1)
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
    setIndiceSug(-1)

  }

  async function selecionarMaterial(cod:string){

    setCodigo(cod)
    setMateriaisSug([])
    setIndiceSug(-1)

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

    setTimeout(()=>{
      qtdRef.current?.focus()
    },50)

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

  async function carregarNota(){

    setInfoNota({})
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
  .from("db_proorc_cadastro")
  .select("created_by, updated_by, created_at, updated_at")
  .eq("nota",nota)
  .order("created_at",{ascending:true})

    if(info && info.length){

      const primeiro = info[0]
      const ultimo = info[info.length-1]

setInfoNota({

  criadoPor: primeiro.created_by,
  criadoEm: primeiro.created_at,

  editadoPor: ultimo.updated_by || ultimo.created_by,
  editadoEm: ultimo.updated_at || ultimo.created_at

})

    }

  }

 async function salvar(){

  if(!material){

    await confirmarCodigoDigitado()

  }

  if(!material) return



  // 🚫 impedir U para KIT
  if(aplicacao === "U" && material.tipo === "KIT"){

    alert("Aplicação U permitida apenas para ITENS")

    setCodigo("")
    setQuantidade("")
    setAplicacao("N")
    setMaterial(null)

    setTimeout(()=>{
      materialRef.current?.focus()
    },50)

    return

  }



  // 🔎 validar saldo N para permitir U
  if(aplicacao === "U"){

    const saldoN =
      cadastro
        .filter(x =>
          x.codigo === material.codigo
          && x.aplicacao === "N"
        )
        .reduce((soma,x)=>
          soma + Number(x.quantidade)
        ,0)


    const saldoU =
      cadastro
        .filter(x =>
          x.codigo === material.codigo
          && x.aplicacao === "U"
        )
        .reduce((soma,x)=>
          soma + Math.abs(Number(x.quantidade))
        ,0)


    const saldoDisponivel =
      saldoN - saldoU


    if(Number(quantidade) > saldoDisponivel){

      alert(
        "Quantidade U maior que saldo disponível em N"
      )

      setCodigo("")
      setQuantidade("")
      setAplicacao("N")
      setMaterial(null)

      setTimeout(()=>{
        materialRef.current?.focus()
      },50)

      return

    }

  }



  if(editando){

await supabase
  .from("db_proorc_cadastro")
  .update({

    quantidade:Number(quantidade),
    aplicacao,
    updated_by: usuario?.nome || "sistema",
    updated_at: new Date()

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
    p_user: usuario?.nome || "sistema"
  }
)

  }

  setCodigo("")
  setQuantidade("")
  setAplicacao("N")
  setMaterial(null)
  setEstrutura([])
  setMateriaisSug([])
  setIndiceSug(-1)

  await carregarNota()

  setTimeout(()=>{
    materialRef.current?.focus()
  },50)

}

  function formatarData(data?:string){

    if(!data) return ""

    const d = new Date(data)

return d.toLocaleDateString("pt-BR")
+" às "+
d.toLocaleTimeString("pt-BR",{
  hour:"2-digit",
  minute:"2-digit",
  second:"2-digit"
})

  }

  async function buscarNotas(valor:string){

    const { data } = await supabase
      .from("vw_proorc_cadastro")
      .select("nota")
      .limit(20)

    const listaFiltrada =
      (data || [])
        .map(x => x.nota)
        .filter(n => n.startsWith(valor))

    const listaUnica =
      [...new Set(listaFiltrada)]

    setNotasSug(listaUnica)

  }

async function excluir(id:string){

  // 1. descobrir nota do registro
  const { data:registro } = await supabase
    .from("db_proorc_cadastro")
    .select("nota")
    .eq("id",id)
    .single()


  if(registro){

    // 2. atualizar timestamp de todos registros da nota
    await supabase
      .from("db_proorc_cadastro")
      .update({

        updated_by: usuario?.nome || "sistema",
        updated_at: new Date()

      })
      .eq("nota",registro.nota)

  }


  // 3. excluir item
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

    setTimeout(()=>{
      qtdRef.current?.focus()
    },50)

  }

  const podeSalvar =
    notaValida &&
    codigo &&
    quantidade &&
    aplicacao

  function selecionarNota(n:string){

    setNota(n)

    setNotasSug([])
    setIndiceNotaSug(-1)

    validarNota(n)

    setTimeout(()=>{
      materialRef.current?.focus()
    },50)

  }
    function dadosExportacao(){

    return explodido.map(x => ({

      CODIGO: x.codigo,
      QUANTIDADE: x.quantidade,
      PONTO: "1",
      APLICACAO: x.aplicacao,
      VIABILIDADE: "SIM",
      TIPO: "I",
      DESCRICAO: x.descricao

    }))

  }

  function exportarExcel(){

    const dados = dadosExportacao()

    const ws = XLSX.utils.json_to_sheet(dados)

    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, "PROORC")

    XLSX.writeFile(wb, `proorc_${nota}.xlsx`)

  }

  function exportarPDF(){

    const dados = dadosExportacao()

    const doc = new jsPDF()

    autoTable(doc,{
      head:[[
        "CODIGO",
        "QUANTIDADE",
        "PONTO",
        "APLICAÇÃO",
        "VIABILIDADE",
        "TIPO",
        "DESCRIÇÃO"
      ]],
      body:dados.map(x => [

        x.CODIGO,
        x.QUANTIDADE,
        x.PONTO,
        x.APLICACAO,
        x.VIABILIDADE,
        x.TIPO,
        x.DESCRICAO

      ]),
      styles:{
        fontSize:8
      },
      headStyles:{
        fillColor:[30,60,114]
      }
    })

    doc.save(`proorc_${nota}.pdf`)

  }

  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <div style={styles.boasVindas}>
            {saudacao()}, {usuario?.nome || ""}
          </div>

          <div style={styles.headerDireita}>

            {infoNota?.criadoPor && (

              <div style={styles.infoNota}>

                <div>
                  Criada por <strong>{infoNota.criadoPor}</strong>{" "}
                  em {formatarData(infoNota.criadoEm)}
                </div>

                <div>
                  Editada por <strong>{infoNota.editadoPor}</strong>{" "}
                  em {formatarData(infoNota.editadoEm)}
                </div>

              </div>

            )}

            <button
              style={styles.voltar}
              onClick={()=>setPagina("menu")}
            >
              voltar
            </button>

          </div>

        </div>

        <div style={styles.grupoNota}>

          <span style={styles.labelNota}>
            NOTA
          </span>

          <input
            ref={notaRef}
            style={styles.inputConsulta}
            value={nota}

           onChange={(e)=>{

  const valor = e.target.value

  setNota(valor)

  // limpar dados ao iniciar nova nota
  if(valor.length <= 1){

    setCadastro([])
    setExplodido([])
    setCodigo("")
    setMaterial(null)
    setEstrutura([])
    setQuantidade("")
    setAplicacao("N")
    setInfoNota({})
    setNotaValida(false)

  }

  // validar automaticamente quando completar 10 digitos
  if(valor.length === 10){

    validarNota(valor)

  }

  if(valor.length < 3){

    setNotasSug([])
    setIndiceNotaSug(-1)
    return

  }

  buscarNotas(valor)

}}

            onKeyDown={(e)=>{

              if(notasSug.length){

                if(e.key==="ArrowDown"){

                  e.preventDefault()

                  setIndiceNotaSug(prev =>
                    prev < notasSug.length-1 ? prev+1 : 0
                  )

                  return
                }

                if(e.key==="ArrowUp"){

                  e.preventDefault()

                  setIndiceNotaSug(prev =>
                    prev > 0 ? prev-1 : notasSug.length-1
                  )

                  return
                }

                if(e.key==="Enter"){

                  e.preventDefault()

                  const indice =
                    indiceNotaSug >= 0
                    ? indiceNotaSug
                    : 0

                  const item = notasSug[indice]

                  if(item){

                    selecionarNota(item)

                  }

                  return
                }

              }

              if(e.key==="Tab"){

                validarNota(nota)

              }

            }}

            onBlur={()=>{

  // validar somente se tiver 10 digitos
  if(nota.length === 10){

    validarNota(nota)

  }

}}

          />

          {notasSug.length>0 && nota.length < 10 && (

            <div style={styles.sugestoesNota}>

              {notasSug.map((n,i)=>(

                <div
                  key={n}
                  style={{
                    ...styles.itemSug,
                    background:i===indiceNotaSug
                    ? "#e8f1ff"
                    : "white"
                  }}
                  onMouseDown={()=>selecionarNota(n)}
                >

                  {n}

                </div>

              ))}

            </div>

          )}

        </div>

        {notaValida && (

          <div style={styles.gridPrincipal}>

            <div>

              <div style={styles.cardPequeno}>

                <div style={styles.linhaCadastro}>

                  {materiaisSug.length > 0 && (

                    <div style={styles.sugestoesFixas}>

                      {materiaisSug.map((m,i)=> (

                        <div
                          key={m.codigo}
                          style={{
                            ...styles.itemSug,
                            background:i===indiceSug ? "#e8f1ff" : "white"
                          }}
                          onMouseDown={()=>selecionarMaterial(m.codigo)}
                        >

                          {m.codigo} - {m.descricao}

                        </div>

                      ))}

                    </div>

                  )}

                  <input
                    ref={materialRef}
                    style={styles.material}
                    placeholder="Item ou kit"
                    value={codigo}

                    onChange={(e)=>setCodigo(e.target.value.toUpperCase())}

                    onKeyDown={(e)=>{

                      if(materiaisSug.length===0) return

                      if(e.key==="ArrowDown"){

                        e.preventDefault()

                        setIndiceSug(prev=>
                          prev < materiaisSug.length-1 ? prev+1 : 0
                        )

                      }

                      if(e.key==="ArrowUp"){

                        e.preventDefault()

                        setIndiceSug(prev=>
                          prev > 0 ? prev-1 : materiaisSug.length-1
                        )

                      }

                      if(e.key==="Enter"){

                        e.preventDefault()

                        const item =
                          indiceSug>=0
                          ? materiaisSug[indiceSug]
                          : materiaisSug[0]

                        if(item){

                          selecionarMaterial(item.codigo)

                        }

                      }

                      if(e.key==="Tab"){

                        const item =
                          indiceSug>=0
                          ? materiaisSug[indiceSug]
                          : materiaisSug[0]

                        if(item){

                          selecionarMaterial(item.codigo)

                        }

                      }

                    }}

                  />

                  <input
                    ref={qtdRef}
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

                    <table style={styles.tabelaCompacta}>

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

              </div>

              <div style={styles.cardMedioGrid}>

                <strong>REGISTROS CADASTRADOS</strong>

                <table style={styles.tabelaPadrao}>

                  <thead>

                    <tr>

                      <th style={{...styles.thBlue,...styles.colCodigo}}>CODIGO</th>
                      <th style={{...styles.thBlue,...styles.colDescricao}}>DESCRIÇÃO</th>
                      <th style={{...styles.thBlue,...styles.colQtd}}>QTD</th>
                      <th style={styles.thBlue}>AP</th>
                      <th style={styles.thBlue}>AÇÕES</th>

                    </tr>

                  </thead>

                  <tbody>

                    {cadastro.map(x => (

                      <tr key={x.id}>

                        <td style={styles.tdPadrao}>{x.codigo}</td>

                        <td style={styles.tdPadrao}>{x.descricao}</td>

                        <td style={styles.tdPadrao}>
                          {x.aplicacao === "U"
                          ? Math.abs(x.quantidade)
                          : x.quantidade}
                        </td>

                        <td style={styles.tdPadrao}>
                          {x.aplicacao}
                        </td>

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

            <div style={styles.cardGrid}>

              <div style={styles.headerTabela}>

                <strong>LISTA PARA PROORC</strong>

                <div>

                  <button
                    style={styles.btnExport}
                    onClick={exportarExcel}
                  >
                    EXCEL
                  </button>

                  <button
                    style={styles.btnExportPdf}
                    onClick={exportarPDF}
                  >
                    PDF
                  </button>

                </div>

              </div>

              <table style={styles.tabelaCompacta}>

                <thead>

                  <tr>

                    <th style={{...styles.thPadrao,...styles.colCodigo}}>
                      CODIGO
                    </th>

                    <th style={{...styles.thPadrao,...styles.colQtd}}>
                      QNT
                    </th>

                    <th style={{...styles.thPadrao,...styles.colAp}}>
                      AP
                    </th>

                    <th style={{...styles.thPadrao,...styles.colDescricao}}>
                      DESCRIÇÃO
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {explodido.map(x => (

                    <tr
                      key={x.id}
                      style={
                        x.aplicacao==="S"
                        ? styles.linhaS
                        : undefined
                      }
                    >

                      <td style={styles.tdPadrao}>
                        {x.codigo}
                      </td>

                      <td style={styles.tdPadrao}>
                        {x.quantidade}
                      </td>

                      <td style={{...styles.tdPadrao,...styles.colAp}}>
                        {x.aplicacao}
                      </td>

                      <td style={styles.tdPadrao}>
                        {x.descricao}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

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
gap:10,
backgroundColor:"white",
padding:"6px 10px",
borderRadius:8,
marginBottom:12,
width:"fit-content",
position:"relative"
},

labelNota:{
fontWeight:"bold",
fontSize:14,
color:"black"
},

sugestoesNota:{
position:"absolute",
top:"100%",
left:0,
marginTop:4,
width:"100%",
maxHeight:150,
overflowY:"auto",
background:"white",
border:"1px solid #ccc",
borderRadius:8,
zIndex:1000
},

inputConsulta:{
padding:"6px 8px",
borderRadius:6,
border:"1px solid #ccc",
fontSize:14,
width:180,
textAlign:"center"
},

headerTabela:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:6
},

btnExport:{
background:"#1d6f42",
color:"white",
border:"none",
padding:"4px 10px",
borderRadius:6,
marginRight:6,
cursor:"pointer",
fontSize:12
},

btnExportPdf:{
background:"#c0392b",
color:"white",
border:"none",
padding:"4px 10px",
borderRadius:6,
cursor:"pointer",
fontSize:12
},

headerDireita:{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:6
},

infoNota:{
fontSize:12,
textAlign:"right",
lineHeight:1.4,
opacity:0.9
},

voltar:{
padding:"8px 14px",
background:"#c0392b",
border:"none",
borderRadius:6,
color:"white",
cursor:"pointer"
},

gridPrincipal:{
display:"grid",
gridTemplateColumns:"52% 48%",
gap:14,
alignItems:"start",
maxWidth:"95vw",
margin:"0 auto"
},

cardMedioGrid:{
background:"white",
color:"black",
padding:"14px 18px",
borderRadius:14,
marginBottom:18,
width:"100%",
maxWidth:"52vw",
boxShadow:"0 4px 14px rgba(0,0,0,0.25)",
borderTop:"4px solid #4da3ff"
},

cardGrid:{
background:"white",
color:"black",
padding:"14px 18px",
borderRadius:14,
marginBottom:18,
width:"100%",
maxWidth:"48vw",
boxShadow:"0 4px 14px rgba(0,0,0,0.25)",
borderTop:"4px solid #4da3ff"
},

cardPequeno:{
background:"white",
color:"black",
padding:"14px 18px",
borderRadius:14,
marginBottom:18,
width:"100%",
maxWidth:"52vw",
boxShadow:"0 4px 14px rgba(0,0,0,0.25)"
},

linhaCadastro:{
display:"flex",
gap:6,
marginBottom:10,
alignItems:"center",
position:"relative"
},

material:{
width:156,
padding:"6px 8px",
borderRadius:6,
border:"1px solid #ccc",
fontSize:14
},

qtd:{
width:80,
padding:"6px 8px",
borderRadius:6,
border:"1px solid #ccc",
fontSize:14,
textAlign:"center"
},

aplicacao:{
width:70,
padding:"6px 4px",
borderRadius:6,
border:"1px solid #ccc",
fontSize:14
},

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
fontSize:13,
color:"#000"
},

tabelaPadrao:{
borderCollapse:"collapse",
fontSize:13,
marginTop:6,
tableLayout:"fixed"
},

tabelaCompacta:{
width:"100%",
borderCollapse:"collapse",
fontSize:12,
marginTop:6,
tableLayout:"fixed"
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
textAlign:"center",
whiteSpace:"nowrap"
},

colCodigo:{width:"16%"},
colQtd:{width:"12%"},
colAp:{width:"8%"},
colDescricao:{width:"64%"},

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

linhaS:{
color:"#C00000",
fontWeight:600
}

}
