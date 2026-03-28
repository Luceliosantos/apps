import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  permissoes: any[];
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  atualizarContagem: () => Promise<void>;
};

export default function CorrigirCadastro({
  permissoes,
  setPagina,
  atualizarContagem
}: Props) {

  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState(0);


  function temPermissao(
    sistema: string,
    tipos: string[]
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

    temPermissao("global", ["admin"])

    ||

    (
      temPermissao("global", ["usuario"])
      &&
      temPermissao("chaves", ["comissionador"])
    );


  useEffect(()=>{
    carregarQuantidadeDisponivel();
  },[]);


  async function carregarQuantidadeDisponivel(){

    const r = await supabase
      .from("db_chaves")
      .select("*", { count:"exact", head:true })
      .is("ns", null);

    setQuantidadeDisponivel(r.count || 0);

  }


  async function pesquisar(){

    if(!busca) return;

    setLoading(true);

    const valor = Number(busca);

    if(isNaN(valor)){

      setLista([]);
      setLoading(false);
      return;

    }


    const rNota = await supabase
      .from("db_chaves")
      .select("*")
      .eq("ns", valor);


    if(rNota.data && rNota.data.length > 0){

      setLista(rNota.data);
      setLoading(false);
      return;

    }


    const rNumero = await supabase
      .from("db_chaves")
      .select("*")
      .eq("numero", valor);


    setLista(rNumero.data || []);
    setLoading(false);

  }


  async function removerAssociacao(id:number){

    const confirmar =
      confirm("Deseja remover a associação desta chave?");

    if(!confirmar) return;


    await supabase
      .from("db_chaves")
      .update({

        ns: null,
        poste: null,
        flh: null,
        coord: null,
        usu_ass: null,
        dt_ass_db: null

      })
      .eq("id", id);


    pesquisar();
    carregarQuantidadeDisponivel();

  }


  if(!acessoPermitido)
    return <div>Sem permissão</div>;


  return(

    <div
      style={container}
    >

      <div
        style={box}
      >

        <div
          style={topo}
        >

          <h2 style={titulo}>
            Corrigir cadastro
          </h2>
          <button
            onClick={async ()=>{
              await atualizarContagem();
              setPagina("home");
            }}
            style={botaoConsulta}
          >
            Voltar
          </button>
        </div>

        <div style={quantidade}>
          {quantidadeDisponivel} chaves disponíveis
        </div>

        <div style={linhaBusca}>

          <input
            placeholder="Digite número da chave ou nota"
            value={busca}
            onChange={(e)=>setBusca(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") pesquisar();
            }}
            style={inputConsulta}
          />

          <button
            onClick={pesquisar}
            style={botaoConsulta}
          >
            Pesquisar
          </button>

        </div>


        {loading && (
          <p style={{color:"white"}}>
            Buscando...
          </p>
        )}


        {!loading && lista.length === 0 && (

          <p style={{color:"white"}}>
            Nenhum registro encontrado
          </p>

        )}


        {lista.length > 0 && (

          <table style={tabela}>

            <thead>

              <tr>

                <th style={th}>CHAVE</th>
                <th style={th}>NOTA</th>
                <th style={th}>POSTE</th>
                <th style={th}>FOLHA</th>
                <th style={th}>COORDENADA</th>
                <th style={th}>USUÁRIO</th>
                <th style={th}>DATA ASSOCIAÇÃO</th>
                <th style={th}>AÇÃO</th>

              </tr>

            </thead>


            <tbody>

              {lista.map(item => (

                <tr key={item.id}>

                  <td style={td}>{item.numero}</td>
                  <td style={td}>{item.ns}</td>
                  <td style={td}>{item.poste}</td>
                  <td style={td}>{item.flh}</td>
                  <td style={td}>{item.coord}</td>
                  <td style={td}>{item.usu_ass}</td>

                  <td style={td}>

                    {
                      item.dt_ass_db
                      ?

                      new Date(item.dt_ass_db)
                      .toLocaleString("pt-BR")

                      :

                      ""
                    }

                  </td>


                  <td style={td}>

                    <button
                    onClick={()=>
                      removerAssociacao(item.id)
                    }
                    style={botaoAcao}
                  >
                    Remover Associação
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



const container:React.CSSProperties={

  minHeight:"100vh",

  backgroundImage:`
    linear-gradient(
      rgba(0,0,0,0.55),
      rgba(0,0,0,0.55)
    ),
    url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg/377c7a2b-edfd-dd1e-c8a6-91d79dc31a39?version=1.0&t=1726774318701')
  `,

  backgroundSize:"cover",
  backgroundPosition:"center",

  padding:"40px"

};


const box:React.CSSProperties={

  maxWidth:"1200px",
  margin:"0 auto",
  background:"rgba(255,255,255,0.08)",
  backdropFilter:"blur(6px)",
  borderRadius:"14px",
  padding:"30px",
  border:"1px solid rgba(255,255,255,0.25)"

};

const botaoAcao:React.CSSProperties={

  padding:"8px 18px",
  borderRadius:"10px",
  border:"1px solid rgba(192,57,43,0.6)",
  background:"rgba(192,57,43,0.85)",
  color:"white",
  cursor:"pointer",
  fontWeight:"600"

};


const topo:React.CSSProperties={

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:"5px"

};


const titulo:React.CSSProperties={

  color:"white"

};


const quantidade:React.CSSProperties={

  color:"white",
  fontSize:"18px",
  marginBottom:"25px",
  textAlign:"left"

};


const linhaBusca:React.CSSProperties={

  display:"flex",
  gap:"10px",
  marginBottom:"25px",
  justifyContent:"flex-start"

};


const inputConsulta:React.CSSProperties={

  width:"20%",
  minWidth:"180px",
  padding:"10px",
  borderRadius:"8px",
  border:"1px solid rgba(255,255,255,0.4)",
  background:"rgba(255,255,255,0.15)",
  color:"white",
  outline:"none"

};


const botaoConsulta:React.CSSProperties={

  padding:"8px 18px",
  borderRadius:"10px",
  border:"1px solid rgba(255,255,255,0.4)",
  background:"rgba(255,255,255,0.15)",
  color:"white",
  cursor:"pointer",
  backdropFilter:"blur(2px)"

};


const tabela:React.CSSProperties={

  width:"100%",
  borderCollapse:"collapse",
  textAlign:"center",
  backgroundColor:"white",
  borderRadius:"10px",
  overflow:"hidden"

};


const th:React.CSSProperties={

  padding:"12px",
  border:"1px solid #ddd",
  backgroundColor:"#f4f4f4",
  fontWeight:"700"

};


const td:React.CSSProperties={

  padding:"10px",
  border:"1px solid #e5e5e5"

};
