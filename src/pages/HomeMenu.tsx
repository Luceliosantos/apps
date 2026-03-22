import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };
};

export default function HomeMenu({
  setPagina,
  handleLogout,
  usuario
}: Props) {

  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.header}>
          <div>
            <strong>{usuario.nome}</strong> | {usuario.matricula}
          </div>

          <button
            style={styles.logout}
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

  logout:{
    padding:"8px 16px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,0.3)",
    background:"rgba(192,57,43,0.6)",
    color:"white",
    cursor:"pointer"
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
    padding:20,
    borderRadius:12,
    border:"1px solid rgba(255,255,255,0.3)",
    background:"rgba(255,255,255,0.15)",
    color:"white",
    fontSize:18,
    cursor:"pointer"
  }

};
