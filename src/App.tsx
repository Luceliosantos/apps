import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import CadastroChaves from "./pages/CadastroChaves";
import Cadastro from "./pages/Cadastro";
import Associacao from "./pages/Associacao";
import Consulta from "./pages/Consulta";
import HomeMenu from "./pages/HomeMenu";
import Usuarios from "./pages/Usuarios";

type Usuario = {
  id: string;
  matricula: string;
  nome: string;
  tipo: string;
};

export type Pagina =
  | "login"
  | "menu"
  | "home"
  | "cadastro"
  | "associacao"
  | "consulta"
  | "geo"
  | "proorc"
  | "usuarios";

export default function App() {

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState<Pagina>("login");
  const [chavesDisponiveis, setChavesDisponiveis] = useState<number>(0);
  const [permissoes,setPermissoes] = useState<any[]>([]);

  async function atualizarContagem() {

    const { count } = await supabase
      .from("db_chaves")
      .select("*", { count: "exact", head: true })
      .is("ns", null);

    setChavesDisponiveis(count ?? 0);

  }

  useEffect(() => {

    if (usuario) {

      atualizarContagem();

    }

  }, [usuario]);

  async function carregarPermissoes(id_usuario:string){

    const { data } = await supabase
      .from("db_usuarios_apps_permissoes")
      .select("sistema,tipo")
      .eq("id_usuario", id_usuario);

    setPermissoes(data || []);

  }

  async function handleLogin(e?: React.FormEvent) {

    if (e) e.preventDefault();

    setErro("");
    setLoading(true);

    const { data, error } = await supabase
      .from("db_usuarios_apps")
      .select("id, matricula, nome")
      .eq("matricula", matricula)
      .single();

    if (error || !data) {

      setErro("Matrícula ou senha inválidos.");
      setLoading(false);
      return;

    }

    const usuarioLogado: Usuario = {

      id: data.id,
      matricula: data.matricula,
      nome: data.nome,
      tipo: "user"

    };

    setUsuario(usuarioLogado);

    await carregarPermissoes(usuarioLogado.id);

    await atualizarContagem();

    setPagina("menu");

    setLoading(false);

  }

  function handleLogout() {

    setUsuario(null);
    setPermissoes([]);
    setMatricula("");
    setSenha("");
    setPagina("login");

  }

  // ============================
  // USUÁRIO LOGADO
  // ============================

  if (usuario) {

    if (pagina === "menu") {

      return (

        <HomeMenu
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />

      );

    }

    if (pagina === "usuarios") {

      return (

        <Usuarios
          setPagina={setPagina}
        />

      );

    }

    if (pagina === "cadastro") {

      return (

        <Cadastro
          usuario={usuario}
          chavesDisponiveis={chavesDisponiveis}
          atualizarContagem={atualizarContagem}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />

      );

    }

    if (pagina === "associacao") {

      return (

        <Associacao
          usuario={usuario}
          atualizarContagem={atualizarContagem}
          setPagina={setPagina}
        />

      );

    }

    if (pagina === "consulta") {

      return (

        <Consulta
          usuario={usuario}
          setPagina={setPagina}
        />

      );

    }

    if (pagina === "geo") {

      return (

        <div style={{ padding: 40 }}>

          <h1>Acompanhamento GEO em desenvolvimento aguarde...</h1>

          <button
            style={styles.button}
            onClick={() => setPagina("menu")}
          >
            Voltar
          </button>

        </div>

      );

    }

    if (pagina === "proorc") {

      return (

        <div style={{ padding: 40 }}>

          <h1>Proorc 2.0 em desenvolvimento aguarde...</h1>

          <button
            style={styles.button}
            onClick={() => setPagina("menu")}
          >
            Voltar
          </button>

        </div>

      );

    }

    return (

      <CadastroChaves
        usuario={usuario}
        chavesDisponiveis={chavesDisponiveis}
        setPagina={setPagina}
        handleLogout={handleLogout}
      />

    );

  }

  // ============================
  // LOGIN
  // ============================

  return (

    <div style={styles.loginContainer}>

      <form style={styles.loginCard} onSubmit={handleLogin}>

        <h2>Apps Integrados</h2>

        <input
          placeholder="Matrícula"
          style={styles.input}
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          style={styles.input}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <p style={{ color: "#c0392b" }}>{erro}</p>}

        <button
          style={styles.button}
          type="submit"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

      </form>

    </div>

  );

}

const styles: { [key: string]: React.CSSProperties } = {

  loginContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
  },

  loginCard: {
    background: "white",
    padding: 40,
    borderRadius: 12,
    width: 350,
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    border: "1px solid #ccc",
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
