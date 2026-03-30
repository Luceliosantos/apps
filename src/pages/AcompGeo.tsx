'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Registro = {
  id:number
  regional:string
  nota:string
  modalidade:string
  empreiteira:string
  base_cr:number
  medida:string
  linha_med:string
  status_med:string
  obs:string
  resp_meta:string
  resp_free:string
  resp_geral:string
  data_email:string
}

export default function AcompGeo(){

  const router = useRouter()

  const [lista1,setLista1] = useState<any[]>([])
  const [lista2,setLista2] = useState<any[]>([])
  const [lista3,setLista3] = useState<any[]>([])
  const [buscaNota,setBuscaNota] = useState('')
  const [resultadoBusca,setResultadoBusca] = useState<Registro[]>([])

  async function carregarRegional(regional:string){

    const { data } = await supabase
      .from('db_acomp_geo')
      .select('*')
      .eq('regional',regional)
      .order('base_cr',{ascending:false})
      .limit(40)

    if(!data) return []

    const agrupado:any = {}

    data.forEach(r=>{

      if(!agrupado[r.nota]){
        agrupado[r.nota] = {
          nota:r.nota,
          base_cr:r.base_cr,
          m609:'',
          m614:'',
          m625:'',
          obs:''
        }
      }

      if(r.medida=='0609') agrupado[r.nota].m609=r.status_med
      if(r.medida=='0614') agrupado[r.nota].m614=r.status_med
      if(r.medida=='0625') agrupado[r.nota].m625=r.status_med

      if(
        (r.medida=='0609' || r.medida=='0614' || r.medida=='0625') &&
        r.status_med?.includes('PEND')
      ){
        agrupado[r.nota].obs=r.obs
      }

    })

    return Object.values(agrupado)
      .sort((a:any,b:any)=>b.base_cr-a.base_cr)
      .slice(0,10)

  }

  async function carregarListas(){

    setLista1(await carregarRegional('Regional 1'))
    setLista2(await carregarRegional('Regional 2'))
    setLista3(await carregarRegional('Regional 3'))

  }

  async function buscarNota(){

    const { data } = await supabase
      .from('db_acomp_geo')
      .select('*')
      .eq('nota',buscaNota)

    setResultadoBusca(data || [])

  }

  useEffect(()=>{
    carregarListas()
  },[])


  function tabela(lista:any[]){

    return(

      <table className='border w-full text-sm'>

        <thead className='bg-gray-200'>
          <tr>
            <th>Nota</th>
            <th>609</th>
            <th>614</th>
            <th>625</th>
            <th>Obs</th>
          </tr>
        </thead>

        <tbody>

          {lista.map((l,i)=>(
            <tr key={i} className='border'>
              <td>{l.nota}</td>
              <td>{l.m609}</td>
              <td>{l.m614}</td>
              <td>{l.m625}</td>
              <td>{l.obs}</td>
            </tr>
          ))}

        </tbody>

      </table>

    )

  }


  return(

    <div className='p-6'>

      <div className='flex justify-between mb-6'>

        <h1 className='text-xl font-bold'>
          Acomp Geo
        </h1>

        <button
          onClick={()=>router.push('/Home')}
          className='bg-black text-white px-4 py-2 rounded'
        >
          Voltar
        </button>

      </div>


      <div className='grid grid-cols-3 gap-6 mb-10'>

        {tabela(lista1)}
        {tabela(lista2)}
        {tabela(lista3)}

      </div>


      <div className='flex gap-2 mb-4'>

        <input
          value={buscaNota}
          onChange={e=>setBuscaNota(e.target.value)}
          placeholder='numero da nota'
          className='border px-2 py-1'
        />

        <button
          onClick={buscarNota}
          className='bg-black text-white px-4 rounded'
        >
          Buscar
        </button>

      </div>


      <table className='border w-full text-sm'>

        <thead className='bg-gray-200'>

          <tr>

            <th>regional</th>
            <th>nota</th>
            <th>modalidade</th>
            <th>empreiteira</th>
            <th>base_cr</th>
            <th>medida</th>
            <th>linha_med</th>
            <th>status_med</th>
            <th>obs</th>
            <th>resp_meta</th>
            <th>resp_free</th>
            <th>resp_geral</th>
            <th>data_email</th>

          </tr>

        </thead>

        <tbody>

          {resultadoBusca.map(r=>(
            <tr key={r.id}>

              <td>{r.regional}</td>
              <td>{r.nota}</td>
              <td>{r.modalidade}</td>
              <td>{r.empreiteira}</td>
              <td>{r.base_cr}</td>
              <td>{r.medida}</td>
              <td>{r.linha_med}</td>
              <td>{r.status_med}</td>
              <td>{r.obs}</td>
              <td>{r.resp_meta}</td>
              <td>{r.resp_free}</td>
              <td>{r.resp_geral}</td>
              <td>{r.data_email}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}
