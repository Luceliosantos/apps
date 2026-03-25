import React from "react";
import { Pagina } from "../App";

type Props = {
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };

  permissoes:any[];

  chavesDisponiveis: number;

  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;

  handleLogout: () => void;
};

export default function CadastroChaves({

  usuario,

  permissoes,

  chavesDisponiveis,

  setPagina,

}: Props) {

  function temPermissao(

    sistema:string,

    tipos:string[]

  ){

    const p = permissoes.find(

      x => x.sistema === sistema

    );

    if(!p) return false;

    if(p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }


  const podeCadastrar =

    temPermissao(

      "chaves",

      ["cad_ch"]

    );


  const podeAssociar =

    temPermissao(

      "chaves",

      ["comissionador","gravacao"]

    );


  const podeConsultar =

    temPermissao(

      "chaves",

      ["leitura","gravacao","comissionador","cad_ch"]

    );


  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>

            <strong>Chaves disponíveis:</strong>

            {" "}

            {chavesDisponiveis}

          </div>

          <div>

            <strong>

              {usuario.nome}

            </strong>

            {" | "}

            {usuario.matricula}

            {" | "}

            {usuario.tipo.toUpperCase()}

          </div>

        </div>


        {/* TITULO */}

        <div style={styles.titleArea}>

          <h1 style={styles.title}>

            Controle de Chaves

          </h1>

          <p style={styles.subtitle}>

            Sistema Corporativo de Gestão de Chaves

          </p>

        </div>


        {/* BOTOES */}

        <div style={styles.panel}>

          {podeCadastrar && (

            <button

              style={styles.button}

              onClick={() => setPagina("cadastro")}

            >

              Cadastrar

            </button>

          )}


          {podeConsultar && (

            <button

              style={styles.button}

              onClick={() => setPagina("consulta")}

            >

              Consulta

            </button>

          )}


          {podeAssociar && (

            <button

              style={styles.button}

              onClick={() => setPagina("associacao")}

            >

              Associar

            </button>

          )}


          <button

            style={styles.button}

            onClick={() => setPagina("menu")}

          >

            Home

          </button>


        </div>

      </div>

    </div>

  );

}



// ================================
// ESTILOS
// ================================

const styles: { [key: string]: React.CSSProperties } = {

  container: {

    minHeight: "100vh",

    width: "100%",

    backgroundImage:

      "url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg/377c7a2b-edfd-dd1e-c8a6-91d79dc31a39?version=1.0&t=1726774318701')",

    backgroundSize: "cover",

    backgroundPosition: "center",

    backgroundRepeat: "no-repeat",

  },


  overlay: {

    minHeight: "100vh",

    backgroundColor: "rgba(0,0,0,0.6)",

    padding: 40,

  },


  header: {

    display: "flex",

    justifyContent: "space-between",

    color: "white",

    fontWeight: 500,

    marginBottom: 60,

  },


  titleArea: {

    textAlign: "center",

    color: "white",

    marginBottom: 50,

  },


  title: {

    fontSize: 44,

    fontWeight: 600,

    margin: 0,

    letterSpacing: 1,

  },


  subtitle: {

    marginTop: 10,

    fontSize: 18,

    opacity: 0.85,

  },


  panel: {

    maxWidth: 600,

    margin: "0 auto",

    display: "grid",

    gridTemplateColumns: "1fr 1fr",

    gap: 20,

  },


  button: {

    padding: 18,

    fontSize: 16,

    borderRadius: 10,

    border: "1px solid rgba(255,255,255,0.25)",

    backgroundColor: "rgba(255,255,255,0.12)",

    color: "white",

    cursor: "pointer",

    backdropFilter: "blur(6px)",

    transition: "all 0.3s ease",

  },

};
