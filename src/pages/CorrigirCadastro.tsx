import { useState } from "react";
import { supabase } from "../supabase";

type Props = {
  permissoes:any[];
  setPagina?: any;
};

export default function CorrigirCadastro({
  permissoes,
  setPagina
}: Props) {

  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  function temPermissao(
    sistema:string,
    tipos:string[]
  ){

    const p =
      permissoes.find(
        x => x.sistema === sistema
      );

    if(!p) return false;

    if(p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }


  const acessoPermitido =

    temPermissao(
      "global",
      ["admin"]
    )

    ||

    (
      temPermissao(
        "global",
        ["usuario"]
      )
      &&
      temPermissao(
        "chaves",
        ["comissionador"]
      )
    );


  async function pesquisar() {

    if (!busca) return;

    setLoading(true);

    const termo = busca.trim();

    const { data, error } = await supabase
      .from("db_chaves")
      .select(`
        id,
        numero,
        nota,
        postes,
        folha,
        coordenada,
        usuario_associacao,
        data_associacao
      `)
      .or(`numero.eq.${termo},nota.eq.${termo}`)
      .order("numero",{ ascending:true });

    if (error) {

      alert("Erro ao buscar");

      setLoading(false);

      return;

    }

    setLista(data || []);

    setLoading(false);

  }


  async function removerAssociacao(id:number) {

    if(!confirm("Remover associação desta chave?"))
      return;

    const { error } = await supabase
      .from("db_chaves")
      .update({

        nota:null,
        postes:null,
        folha:null,
        coordenada:null,
        usuario_associacao:null,
        data_associacao:null

      })
      .eq("id",id);

    if(error){

      alert("Erro ao remover");

      return;

    }

    pesquisar();

  }


  if (!acessoPermitido)
    return <div>Sem permissão</div>;


  return(

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.card}>

          <h2 style={styles.title}>
            Corrigir cadastro
          </h2>


          <div style={styles.buscaArea}>

            <input
              style={styles.input}
              placeholder="Digite nº da chave ou nº da nota"
              value={busca}
              onChange={(e)=>setBusca(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key==="Enter") pesquisar();
              }}
            />


            <button
              style={styles.botao}
              onClick={pesquisar}
            >
              Pesquisar
            </button>


            {setPagina && (

              <button
                style={styles.botao}
                onClick={()=>setPagina("home")}
              >
                Voltar
              </button>

            )}

          </div>



          {loading && (
            <p style={styles.info}>
              Buscando...
            </p>
          )}



          {!loading && lista.length === 0 && (

            <p style={styles.info}>
              Nenhum registro encontrado
            </p>

          )}



          {lista.length > 0 && (

            <table style={styles.tabela}>

              <thead>

                <tr>

                  <th>Chave</th>

                  <th>Nota</th>

                  <th>Postes</th>

                  <th>Folha</th>

                  <th>Coordenada</th>

                  <th>Usuário</th>

                  <th>Data</th>

                  <th>Associação</th>

                </tr>

              </thead>



              <tbody>

                {lista.map(item => (

                  <tr key={item.id}>

                    <td>{item.numero}</td>

                    <td>{item.nota}</td>

                    <td>{item.postes}</td>

                    <td>{item.folha}</td>

                    <td>{item.coordenada}</td>

                    <td>{item.usuario_associacao}</td>

                    <td>

                      {item.data_associacao
                        ? new Date(item.data_associacao)
                          .toLocaleString("pt-BR")
                        : ""
                      }

                    </td>


                    <td>

                      <button
                        style={styles.botaoRemover}
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

    </div>

  );

}



const styles:{[key:string]:React.CSSProperties}={


  container:{

    minHeight:"100vh",

    backgroundImage:

      "url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",

    backgroundSize:"cover",

    backgroundPosition:"center",

    backgroundRepeat:"no-repeat"

  },


  overlay:{

    minHeight:"100vh",

    background:"rgba(0,0,0,0.6)",

    padding:40

  },


  card:{

    background:"rgba(255,255,255,0.95)",

    borderRadius:12,

    padding:30,

    maxWidth:1100,

    margin:"0 auto"

  },


  title:{

    marginTop:0,

    marginBottom:20

  },


  buscaArea:{

    display:"flex",

    gap:10,

    marginBottom:20

  },


  input:{

    flex:1,

    padding:12,

    borderRadius:8,

    border:"1px solid #ccc"

  },


  botao:{

    padding:"10px 18px",

    borderRadius:8,

    border:"none",

    background:"#1e3c72",

    color:"white",

    cursor:"pointer"

  },


  botaoRemover:{

    padding:"6px 14px",

    borderRadius:6,

    border:"none",

    background:"#c0392b",

    color:"white",

    cursor:"pointer"

  },


  tabela:{

    width:"100%",

    borderCollapse:"collapse"

  },


  info:{

    marginTop:10

  }

};
