import { useEffect, useState } from "react"
import { supabase } from "../utils/supabase"

export default function Proorc2() {

  const [nota, setNota] = useState("")
  const [busca, setBusca] = useState("")

  const [materiais, setMateriais] = useState<any[]>([])
  const [selecionado, setSelecionado] = useState<any>(null)

  const [quantidade, setQuantidade] = useState(1)

  const [listaNota, setListaNota] = useState<any[]>([])

  useEffect(() => {

    if (busca.length < 2) return

    buscarMateriais()

  }, [busca])

  useEffect(() => {

    if (!nota) return

    carregarNota()

  }, [nota])

  async function buscarMateriais() {

    const { data } = await supabase

      .from("vw_proorc_materiais")

      .select("*")

      .or(

        `codigo.ilike.%${busca}%,descricao.ilike.%${busca}%`

      )

      .limit(20)

    setMateriais(data || [])

  }

  async function carregarNota() {

    const { data } = await supabase

      .from("db_proorc_nota_materiais")

      .select(`

        id,
        quantidade,
        tipo,

        db_proorc_materiais(

          codigo,
          descricao,
          unidade

        )

      `)

      .eq("nota", nota)

    setListaNota(data || [])

  }

  async function adicionarMaterial() {

    if (!nota) {

      alert("informe a nota")
      return

    }

    await supabase.rpc(

      "fn_add_material_nota",

      {

        p_nota: nota,
        p_codigo: selecionado.codigo,
        p_quantidade: quantidade,
        p_tipo: selecionado.tipo

      }

    )

    setSelecionado(null)
    setBusca("")
    setQuantidade(1)

    carregarNota()

  }

  async function excluir(id:string) {

    await supabase

      .from("db_proorc_nota_materiais")

      .delete()

      .eq("id", id)

    carregarNota()

  }

  return (

    <div className="page">

      <h2>

        PROORC 2.0

      </h2>

      <div className="card">

        <label>

          nota

        </label>

        <input

          value={nota}

          onChange={(e)=>setNota(e.target.value)}

        />

      </div>

      <div className="card">

        <label>

          buscar material

        </label>

        <input

          value={busca}

          onChange={(e)=>setBusca(e.target.value)}

        />

        <div className="lista">

          {materiais.map(m => (

            <div

              key={m.codigo}

              onClick={()=>setSelecionado(m)}

              className="linha"

            >

              {m.codigo}

              {" - "}

              {m.descricao}

              <span>

                {m.tipo}

              </span>

            </div>

          ))}

        </div>

      </div>

      {selecionado && (

        <div className="card">

          <div>

            {selecionado.codigo}

            {" - "}

            {selecionado.descricao}

          </div>

          <input

            type="number"

            value={quantidade}

            onChange={(e)=>setQuantidade(Number(e.target.value))}

          />

          <button

            onClick={adicionarMaterial}

          >

            adicionar

          </button>

        </div>

      )}

      <div className="card">

        <h3>

          materiais da nota

        </h3>

        {listaNota.map(item => (

          <div

            key={item.id}

            className="linha"

          >

            <div>

              {item.db_proorc_materiais.codigo}

              {" - "}

              {item.db_proorc_materiais.descricao}

            </div>

            <div>

              {item.quantidade}

            </div>

            <button

              onClick={()=>excluir(item.id)}

            >

              excluir

            </button>

          </div>

        ))}

      </div>

    </div>

  )

}
