import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  permissoes: any[];
};

type Registro = {
  id: number;
  numero: number;
  ns: string;
  flh: string;
  poste: string;
  coord: string;
  usu_ass: string;
  dt_ass_db: string;
};

export default function CorrigirCadastro({ setPagina, permissoes }: Props) {

  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState<Registro[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function pesquisar() {

    try {

      setCarregando(true);

      const numeroBusca = busca.replace(/\D/g, "");

      const { data, error } = await supabase
        .from("db_chaves")
        .select("id, numero, ns, flh, poste, coord, usu_ass, dt_ass_db")
        .or(`numero.eq.${numeroBusca},ns.eq.${numeroBusca}`)
        .order("numero");

      if (error) throw error;

      setDados(data || []);

    } catch (err) {

      alert("Erro ao buscar");

    } finally {

      setCarregando(false);

    }
  }

  async function removerAssociacao(id:number) {

    try {

      const { error } = await supabase
        .from("db_chaves")
        .update({
          ns: null,
          flh: null,
          poste: null,
          coord: null,
          usu_ass: null,
          dt_ass_db: null
        })
        .eq("id", id);

      if (error) throw error;

      pesquisar();

    } catch {

      alert("Erro ao remover associação");

    }

  }

  return (

    <div className="pagina">

      <div style={{ position:"absolute", top:20, right:20 }}>

        <button
          className="botaoVermelho"
          onClick={() => setPagina("Consulta")}
        >
          Home
        </button>

      </div>

      <div className="caixa">

        <h2 style={{ marginBottom:20 }}>
          Corrigir cadastro
        </h2>

        <div style={{
          display:"flex",
          gap:10,
          marginBottom:20
        }}>

          <input
            className="inputGrande"
            value={busca}
            onChange={(e)=>setBusca(e.target.value)}
            placeholder="Digite número da chave ou nota"
          />

          <button
            className="botaoAzul"
            onClick={pesquisar}
          >
            Pesquisar
          </button>

        </div>

        {carregando && (
          <div>Buscando...</div>
        )}

        {!carregando && dados.length === 0 && (
          <div>Nenhum registro encontrado</div>
        )}

        {dados.length > 0 && (

          <table className="tabela">

            <thead>

              <tr>

                <th>Chave</th>
                <th>Nota</th>
                <th>Poste</th>
                <th>Folha</th>
                <th>Coordenada</th>
                <th>Usuário</th>
                <th>Data Associação</th>
                <th></th>

              </tr>

            </thead>

            <tbody>

              {dados.map(item => (

                <tr key={item.id}>

                  <td>{item.numero}</td>
                  <td>{item.ns}</td>
                  <td>{item.poste}</td>
                  <td>{item.flh}</td>
                  <td>{item.coord}</td>
                  <td>{item.usu_ass}</td>

                  <td>

                    {item.dt_ass_db
                      ? new Date(item.dt_ass_db).toLocaleString()
                      : ""
                    }

                  </td>

                  <td>

                    <button
                      className="botaoVermelho"
                      onClick={()=>removerAssociacao(item.id)}
                    >
                      Remover
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}
