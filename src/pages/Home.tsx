import { Pagina } from "../App";

type Props = {
  usuario: {
    nome: string;
  };

  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;

  handleLogout: () => void;
};

export default function Home({ usuario, setPagina, handleLogout }: Props) {

  return (

    <div style={{ padding: 30 }}>

      <h2>APLICATIVOS</h2>

      <p>Bem-vindo, {usuario.nome}</p>

      <hr/>

      <h3>Sistemas disponíveis</h3>

      <br/>

      <button onClick={() => setPagina("chaves")}>

        🔑 Controle de Chaves

      </button>

      <br/><br/><br/>

      <button onClick={handleLogout}>

        sair

      </button>

    </div>

  );

}
