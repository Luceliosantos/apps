import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  permissoes:any[];
  usuario: {
    id?: string;
    matricula: string;
    nome: string;
  };
};

export default function Home({
  setPagina,
  handleLogout,
  usuario,
  permissoes
}: Props) {

  function temPermissao(
    sistema:string,
    tipos:string[]
  ){

    const p =
      permissoes?.find(
        x => x.sistema === sistema
      );

    if(!p) return false;

    if(p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }

  // acesso módulo chaves
  const acessoChaves =
    temPermissao(
      "chaves",
      ["leitura","gravacao","comissionador","cad_ch"]
    );

  // acesso geo
  const acessoGeo =
    temPermissao(
      "acomp_geo",
      ["leitura"]
    );

  // acesso proorc
  const acessoProorc =
    temPermissao(
      "proorc",
      ["leitura","gravacao"]
    );

  // admin global
  const adminGlobal =
    temPermissao(
      "global",
      ["admin"]
    );

  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <div>
            <strong>
              {usuario.matricula?.toUpperCase()}
            </strong>
            {" | "}
              {usuario.nome?.toUpperCase()}
          </div>

          <button
            style={{
              ...styles.button,
              ...styles.logoutButton
            }}
            onClick={handleLogout}
          >
            Sair
          </button>

        </div>

        <div style={styles.titleArea}>
          <h1>Sistemas</h1>
        </div>

        <div style={styles.grid}>

          {acessoChaves && (

            <button
              style={styles.button}
              onClick={() => setPagina("home")}
            >
              Cadastro de Chaves
            </button>

          )}

          {acessoGeo && (

            <button
              style={styles.button}
              onClick={() => setPagina("geo")}
            >
              Acompanhamento GEO
            </button>

          )}

          {acessoProorc && (

            <button
              style={styles.button}
              onClick={() => setPagina("proorc")}
            >
              Proorc 2.0
            </button>

          )}

          {adminGlobal && (

            <button
              style={styles.button}
              onClick={() => setPagina("usuarios")}
            >
              Usuarios
            </button>

          )}

        </div>

      </div>

    </div>

  );

}

const styles: { [key:string]: React.CSSProperties } = {

  container:{
    minHeight:"100vh",
    backgroundImage:"url('https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg')",
    backgroundSize:"cover",
    backgroundPosition:"center"
  },

  overlay:{
    minHeight:"100vh",
    background:"rgba(0,0,0,0.75)",
    padding:40,
    color:"white"
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:60
  },

  titleArea:{
    textAlign:"center",
    marginBottom:40
  },

  grid:{
    maxWidth:500,
    margin:"0 auto",
    display:"grid",
    gap:20
  },

  button:{
    padding:18,
    fontSize:16,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backgroundColor:"rgba(255,255,255,0.12)",
    color:"white",
    cursor:"pointer",
    backdropFilter:"blur(6px)",
    transition:"all 0.3s ease"
  },

logoutButton:{
  border:"1px solid rgba(255,0,0,0.6)",
  backgroundColor:"rgba(192,57,43,0.45)",
  padding:"10px 22px",  // altura 80% e largura levemente maior
  minWidth:120          // aumenta largura sem estourar layout
}

};
