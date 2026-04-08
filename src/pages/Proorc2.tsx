// arquivo completo exatamente como deve ficar

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

  const [editando,setEditando] = useState<string | null>(null)

  useEffect(()=>{
    notaRef.current?.focus()
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

},[notaValida,nota])

useEffect(()=>{

  if(nota.length < 3){

    setNotasSug([])
    setIndiceNotaSug(-1)
    return

  }

  buscarNotas()

},[nota])

useEffect(()=>{

  if(codigo.length < 2){

    setMateriaisSug([])
    setIndiceSug(-1)
    return

  }

  buscarMateriais()

},[codigo])

async function buscarNotas(){

  const { data } = await supabase
    .from("vw_proorc_cadastro")
    .select("nota")
    .ilike("nota",`${nota}%`)
    .limit(10)

  const listaUnica =
    [...new Set((data || []).map(x=>x.nota))]

  setNotasSug(listaUnica)

}

function selecionarNota(n:string){

  setNota(n)
  setNotasSug([])
  setIndiceNotaSug(-1)

  validarNota(n)

}

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

  if(data?.tipo==="KIT"){

    const { data:itens } = await supabase
      .from("vw_proorc_estrutura")
      .select("*")
      .eq("codigo_kit",data.codigo)

    setEstrutura(itens||[])

  }else{

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
    .limit(1)
    .maybeSingle()

  if(data){

    selecionarMaterial(data.codigo)

  }

}

async function carregarNota(){

  const { data } = await supabase
    .from("vw_proorc_cadastro")
    .select("*")
    .eq("nota",nota)

  setCadastro(data||[])

  const { data:exp } = await supabase
    .from("vw_proorc_cadastro_itens")
    .select("*")
    .eq("nota",nota)

  setExplodido(exp||[])

}

async function salvar(){

  if(!material){

    await confirmarCodigoDigitado()

  }

  if(!material) return

  await supabase.rpc(
    "fn_proorc_cadastrar",
    {
      p_nota:nota,
      p_codigo:material.codigo,
      p_quantidade:Number(quantidade),
      p_aplicacao:aplicacao
    }
  )

  setCodigo("")
  setQuantidade("")
  setAplicacao("N")
  setMaterial(null)
  setEstrutura([])
  setMateriaisSug([])
  setIndiceSug(-1)

  carregarNota()

  setTimeout(()=>{
    materialRef.current?.focus()
  },50)

}

function dadosExportacao(){

  return explodido.map(x=>({

    CODIGO:x.codigo,
    QUANTIDADE:x.quantidade,
    PONTO:"1",
    APLICACAO:x.aplicacao,
    VIABILIDADE:"SIM",
    TIPO:"I",
    DESCRICAO:x.descricao

  }))

}

function exportarExcel(){

  const ws=XLSX.utils.json_to_sheet(dadosExportacao())
  const wb=XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb,ws,"PROORC")

  XLSX.writeFile(wb,`proorc_${nota}.xlsx`)

}

function exportarPDF(){

  const doc=new jsPDF()

  autoTable(doc,{
    head:[["CODIGO","QUANTIDADE","PONTO","APLICAÇÃO","VIABILIDADE","TIPO","DESCRIÇÃO"]],
    body:dadosExportacao().map(x=>[
      x.CODIGO,
      x.QUANTIDADE,
      x.PONTO,
      x.APLICACAO,
      x.VIABILIDADE,
      x.TIPO,
      x.DESCRICAO
    ])
  })

  doc.save(`proorc_${nota}.pdf`)

}

const podeSalvar=
notaValida &&
codigo &&
quantidade

return(

<div style={styles.container}>

<div style={styles.overlay}>

<div style={styles.grupoNota}>

  <span style={styles.labelNota}>
    NOTA
  </span>

  <div style={{position:"relative"}}>

    <input
      ref={notaRef}
      style={styles.inputConsulta}
      value={nota}

      onChange={(e)=>{

        const v = e.target.value

        setNota(v)

        setCadastro([])
        setExplodido([])

        if(v.length < 3){

          setNotasSug([])
          setIndiceNotaSug(-1)

        }

      }}

      onKeyDown={(e)=>{

        if(notasSug.length){

          if(e.key==="ArrowDown"){

            e.preventDefault()

            setIndiceNotaSug(p =>
              p < notasSug.length-1 ? p+1 : 0
            )

          }

          if(e.key==="ArrowUp"){

            e.preventDefault()

            setIndiceNotaSug(p =>
              p > 0 ? p-1 : notasSug.length-1
            )

          }

          if(e.key==="Enter"){

            e.preventDefault()

            const item =
              indiceNotaSug >= 0
              ? notasSug[indiceNotaSug]
              : notasSug[0]

            if(item){

              selecionarNota(item)

            }

          }

        }

        if(e.key==="Tab"){

          validarNota(nota)

        }

      }}

      onBlur={()=>validarNota(nota)}

    />

    {notasSug.length>0 && (

  <div style={styles.sugestoesNota}>

    {notasSug.map((n,i)=>(

      <div
        key={n}
        style={{
          ...styles.itemSug,
          background:
            i===indiceNotaSug
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
</div>
</div>
</div>

)

}

const styles:any={

grupoNota:{
display:"flex",
alignItems:"center",
gap:10,
background:"white",
padding:"6px 10px",
borderRadius:8,
position:"relative"
},

inputConsulta:{
width:180,
padding:6,
border:"1px solid #ccc",
borderRadius:6
},

sugestoesNota:{
position:"absolute",
top:34,
left:0,
width:"100%",
maxHeight:150,
overflowY:"auto",
background:"white",
border:"1px solid #ccc",
borderRadius:6,
zIndex:1000
},

itemSug:{
padding:6,
cursor:"pointer",
fontSize:13
}

}
