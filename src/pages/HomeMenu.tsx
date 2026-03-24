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

export default function HomeMenu({
  setPagina,
  handleLogout,
  usuario,
  permissoes
}: Props) {

  const adminGlobal =
    permissoes?.some(

      p =>

      p.sistema === "global" &&

      p.tipo === "admin"

    );

  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>

          <div>
            <strong>{usuario.nome}</strong> | {usuario.matricula}
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

          <button
            style={styles.button}
            onClick={() => setPagina("home")}
          >
            Cadastro de Chaves
          </button>

          <button
            style={styles.button}
            onClick={() => setPagina("geo")}
          >
            Acompanhamento GEO
          </button>

          <button
            style={styles.button}
            onClick={() => setPagina("proorc")}
          >
            Proorc 2.0
          </button>

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
    backgroundColor:"rgba(192,57,43,0.45)"
  }

};
