type Props = {
  usuario: {
    nome: string;
  };
  setPagina: (pagina: any) => void;
  handleLogout: () => void;
};

export default function Home({ usuario, setPagina, handleLogout }: Props) {

  return (

    <div style={{ padding: 30 }}>

      <h2>APLICATIVOS</h2>

      <p>Bem-vindo, {usuario.nome}</p>

      <hr/>

      <h3>Sistemas disponíveis</h3>

      <button
        onClick={() => setPagina("chaves")}
        style={botao}
      >
        🔑 Controle de Chaves
      </button>

      <br/><br/>

      <button disabled style={botaoDisabled}>
        📦 Outro sistema (em breve)
      </button>

      <br/><br/>

      <button onClick={handleLogout}>
        sair
      </button>

    </div>

  );

}

const botao = {
  padding: 15,
  width: 250,
  cursor: "pointer"
};

const botaoDisabled = {
  padding: 15,
  width: 250,
  opacity: 0.5
};
