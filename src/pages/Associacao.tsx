import { supabase } from "../supabase";
import { Pagina } from "../App";
import { useState, useEffect } from "react";

useEffect(() => {

  async function carregarDisponiveis(){

    const { count } =
      await supabase
        .from("db_chaves")
        .select("*", { count:"exact", head:true })
        .is("ns", null);

    setQtdDisponiveis(count || 0);

  }

  carregarDisponiveis();

},[]);

type Props = {
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };

  permissoes:any[];

  atualizarContagem: () => Promise<void>;

  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

type Registro = {
  numero: number;
  flh: string;
  poste: string;
  coord: string;
  dt_ass_db: string;
};

export default function Associacao({

  usuario,

  permissoes,

  atualizarContagem,

  setPagina,

}: Props) {

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


  // bloqueio de acesso
  if(

    !temPermissao(

      "chaves",

      ["gravacao","comissionador"]

    )

  ){

    setPagina("home");

    return null;

  }


  const [nota, setNota] = useState("");

  const [folha, setFolha] = useState("");

  const [poste, setPoste] = useState("");

  const [coordenada, setCoordenada] = useState("");

  const [mensagem, setMensagem] = useState("");

  const [loading, setLoading] = useState(false);

  const [lista, setLista] = useState<Registro[]>([]);

  const [destacarUltima, setDestacarUltima] = useState(false);
  
  const [qtdDisponiveis, setQtdDisponiveis] = useState(0);

  const notaValida =
    /^[1-9][0-9]{9}$/.test(nota);

  const folhaValida =
    /^[0-9]+$/.test(folha);

  const posteValido =
    /^[0-9]+$/.test(poste);

  const coordenadaValida =
    /^[0-9]{6}:[0-9]{7}$/.test(coordenada);


  const formValido =
    notaValida
    &&
    folhaValida
    &&
    posteValido
    &&
    coordenadaValida;


  async function buscarLista(n:string){

    const { data } =
      await supabase
        .from("db_chaves")
        .select(
          "numero, flh, poste, coord, dt_ass_db"
        )
        .eq(
          "ns",
          Number(n)
        )
        .order(
          "dt_ass_db",
          { ascending:false }
        );

    if(data) setLista(data);

  }


  async function handleAssociar(){

    if(!formValido) return;

    setLoading(true);

    setMensagem("");


    const { data: coordExiste } =
      await supabase
        .from("db_chaves")
        .select("numero")
        .eq("coord", coordenada)
        .not("ns","is",null)
        .maybeSingle();


    if(coordExiste){

      setMensagem(
        "Já existe chave nesta coordenada."
      );

      setLoading(false);

      return;

    }


    const { data: conjuntoExiste } =
      await supabase
        .from("db_chaves")
        .select("numero")
        .match({

          ns:Number(nota),

          flh:folha,

          poste:poste

        })
        .maybeSingle();


    if(conjuntoExiste){

      setMensagem(
        "Já existe chave com esta Nota, Folha e Poste."
      );

      setLoading(false);

      return;

    }


    const { data: chave } =
      await supabase
        .from("db_chaves")
        .select("numero")
        .is("ns",null)
        .order("numero",{ ascending:true })
        .limit(1)
        .maybeSingle();


    if(!chave){

      setMensagem(
        "Não existem chaves disponíveis."
      );

      setLoading(false);

      return;

    }


    const { error } =
      await supabase
        .from("db_chaves")
        .update({

          ns:Number(nota),

          flh:folha,

          poste:poste,

          coord:coordenada,

          usu_ass:usuario.matricula,

          dt_ass_db:new Date()

        })
        .eq("numero",Number(chave.numero))
        .is("ns",null);


    if(error){

      setMensagem(error.message);

      setLoading(false);

      return;

    }


    setMensagem(
      "Chave associada com sucesso!"
    );


    await atualizarContagem();

    await buscarLista(nota);

setDestacarUltima(true);

setFolha("");
setPoste("");
setCoordenada("");

document.getElementById("campoFolha")?.focus();

setLoading(false);

  }


  return (

    <div style={styles.container}>

      <div style={styles.overlay}>


        <div style={styles.topBar}>

<div>

  <strong>
    {usuario.nome?.toUpperCase()}
  </strong>

  {" | "}

  {usuario.matricula?.toUpperCase()}

  <div>
    Chaves disponíveis: {qtdDisponiveis}
  </div>

</div>


          <button

            style={styles.button}

            onClick={() => setPagina("home")}

          >

            Home

          </button>

        </div>


        <div style={styles.contentRow}>


          <div style={styles.card}>

            <h2 style={{ marginBottom:15 }}>
              Associar Chave
            </h2>

            <input

              style={styles.input}

              placeholder="Nota (10 dígitos)"

              value={nota}

              onChange={(e)=>{

                const valor =
                  e.target.value.replace(/\D/g,"");

                setNota(valor);

                setDestacarUltima(false);


                if(
                  /^[1-9][0-9]{9}$/
                  .test(valor)
                ){

                  buscarLista(valor);

                }
                else{

                  setLista([]);

                }

              }}

            />


<input
  id="campoFolha"
  style={styles.input}
  placeholder="Folha"
  value={folha}

              onChange={(e)=>

                setFolha(

                  e.target.value
                    .replace(/\D/g,"")

                )

              }

            />


            <input

              style={styles.input}

              placeholder="Poste"

              value={poste}

              onChange={(e)=>

                setPoste(

                  e.target.value
                    .replace(/\D/g,"")

                )

              }

            />


            <input

              style={styles.input}

              placeholder="Coordenada (111111:2222222)"

              value={coordenada}

onChange={(e)=>{

  let v =
    e.target.value
      .replace(/\D/g,"")
      .slice(0,13);

  if(v.length > 6){

    v =
      v.slice(0,6)
      + ":"
      + v.slice(6);

  }

  setCoordenada(v);

}}

            />


            <button

              style={{

                ...styles.button,

                opacity:
                  formValido
                  ? 1
                  : 0.5

              }}

              disabled={
                !formValido
                || loading
              }

              onClick={handleAssociar}

            >

              {loading
                ? "Associando..."
                : "Associar"}

            </button>


            {mensagem && (

              <div

                style={

                  mensagem.includes("sucesso")

                  ? styles.msgSucesso

                  : styles.msgErro

                }

              >

                {mensagem}

              </div>

            )}

          </div>


          {lista.length > 0 && (

            <div style={styles.listaCard}>

              <h3>

                Chaves da Nota {nota}

              </h3>


              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>
                      Número
                    </th>

                    <th style={styles.th}>
                      Folha
                    </th>

                    <th style={styles.th}>
                      Poste
                    </th>

                    <th style={styles.th}>
                      Coordenada
                    </th>

                    <th style={styles.th}>
                      Data/Hora
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {lista.map((r,i)=>(

                    <tr

                      key={i}

                      style={

                        destacarUltima
                        && i === 0

                        ? styles.linhaUltima

                        : styles.linhaNormal

                      }

                    >

                      <td style={styles.td}>
                        {r.numero}
                      </td>

                      <td style={styles.td}>
                        {r.flh}
                      </td>

                      <td style={styles.td}>
                        {r.poste}
                      </td>

                      <td style={styles.td}>
                        {r.coord}
                      </td>

                      <td style={styles.td}>

                        {new Date(
                          r.dt_ass_db
                        ).toLocaleString("pt-BR")}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}



const styles:{[key:string]:React.CSSProperties} = {

  container:{

    minHeight:"100vh",

    backgroundImage:
      "url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",

    backgroundSize:"cover",

    backgroundPosition:"center"

  },


  overlay:{

    minHeight:"100vh",

    background:"rgba(0,0,0,0.75)",

    padding:40,

    color:"white"

  },


  topBar:{

    marginBottom:40,

    display:"flex",

    justifyContent:"space-between",

    alignItems:"center"

  },


  contentRow:{

    display:"flex",

    gap:40,

    alignItems:"flex-start"

  },


  card:{

    width:400,

    background:"rgba(255,255,255,0.08)",

    backdropFilter:"blur(20px)",

    borderRadius:20,

    padding:30

  },


  listaCard:{

    flex:1,

    background:"rgba(255,255,255,0.08)",

    padding:25,

    borderRadius:20,

    backdropFilter:"blur(20px)"

  },


  input:{

    width:"100%",

    padding:14,

    marginBottom:15,

    borderRadius:10,

    border:"none"

  },


  button:{
  padding:"8px 12px",
  height:"32px",
  fontSize:14,
  borderRadius:8,
  border:"1px solid rgba(255,255,255,0.35)",
  backgroundColor:"rgba(255,255,255,0.15)",
  color:"white",
  cursor:"pointer",
  boxShadow:"0 2px 4px rgba(0,0,0,0.3)"
},


  table:{

    width:"100%",

    borderCollapse:"collapse",

    marginTop:20,

    backgroundColor:"white",

    color:"black"

  },


  th:{

    border:"1px solid #ccc",

    padding:"5px 8px",

    textAlign:"center",

    backgroundColor:"#1e3c72",

    color:"white",

    fontSize:"13px"

  },


  td:{

    border:"1px solid #ccc",

    padding:"5px 8px",

    textAlign:"center",

    fontSize:"13px"

  },


  linhaUltima:{

    backgroundColor:"#a3d9a5"

  },


  linhaNormal:{},


  msgErro:{

    marginTop:15,

    padding:12,

    background:"rgba(231,76,60,0.2)",

    borderRadius:8,

    color:"#ff6b6b"

  },


  msgSucesso:{

    marginTop:15,

    padding:12,

    background:"rgba(46,204,113,0.2)",

    borderRadius:8,

    color:"#2ecc71"

  },

};
