import { useState, useEffect } from "react";
import { supabase } from "./supabase";

import ControleChaves from "./pages/ControleChaves";
import Cadastro from "./pages/Cadastro";
import Associacao from "./pages/Associacao";
import Consulta from "./pages/Consulta";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import CorrigirCadastro from "./pages/CorrigirCadastro";
import AcompGeo from "./pages/AcompGeo";
import Proorc2 from "./pages/Proorc2"

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
  | "usuarios"
  | "alterarSenha"
  | "corrigirCadastro";

export default function App() {

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [pagina, setPagina] = useState<Pagina>("login");

  const [chavesDisponiveis, setChavesDisponiveis] = useState<number>(0);

  const [permissoes,setPermissoes] = useState<any[]>([]);

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

  async function atualizarContagem() {

    const { count } = await supabase
      .from("db_chaves")
      .select("*", { count: "exact", head: true })
      .is("ns", null);

    setChavesDisponiveis(count ?? 0);

  }

  useEffect(() => {

    if (usuario) atualizarContagem();

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
  .select("id, matricula, nome, trocar_senha")
  .eq("matricula", matricula.toLowerCase())
  .eq("senha", senha)
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

    if (data.trocar_senha) {

      setPagina("alterarSenha");

    } else {

      setPagina("menu");

    }

    setLoading(false);

  }

  function validarSenhaForte(senha:string){

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    return regex.test(senha);

  }

  async function salvarNovaSenha(){

    setErro("");

    if (!novaSenha){

      setErro("Informe a nova senha");
      return;

    }

    if (!validarSenhaForte(novaSenha)){

      setErro(
        "Senha fraca. Use no mínimo 8 caracteres com maiúscula, minúscula, número e símbolo."
      );
      return;

    }

    if (novaSenha !== confirmarSenha){

      setErro("As senhas não conferem");
      return;

    }

const { error } = await supabase
  .from("db_usuarios_apps")
  .update({
    senha: novaSenha,
    trocar_senha:false
  })
      .eq("id", usuario?.id)
      .select();

    if (error){

      setErro("Erro ao salvar senha.");
      return;

    }

    setNovaSenha("");
    setConfirmarSenha("");

    alert("Senha alterada com sucesso");

    setPagina("menu");

  }

  function handleLogout(){

    setUsuario(null);

    setPermissoes([]);

    setMatricula("");
    setSenha("");

    setPagina("login");

  }

  if(usuario){

    if(pagina === "alterarSenha"){

      return(

        <div style={styles.loginContainer}>

          <div style={styles.loginCard}>

            <h2>Alterar senha</h2>

            <input
              type="password"
              placeholder="Nova senha"
              style={styles.input}
              value={novaSenha}
              onChange={(e)=>setNovaSenha(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar senha"
              style={styles.input}
              value={confirmarSenha}
              onChange={(e)=>setConfirmarSenha(e.target.value)}
            />

            {erro && (

              <p style={{color:"#c0392b"}}>
                {erro}
              </p>

            )}

            <button
              style={styles.loginButton}
              onClick={salvarNovaSenha}
            >
              Salvar senha
            </button>

          </div>

        </div>

      );

    }

    if(pagina === "menu"){

      return(

        <Home
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />

      );

    }

    if(
      pagina === "home"
      &&
      !temPermissao(
        "chaves",
        ["leitura","gravacao","comissionador","cad_ch"]
      )
    ){
      setPagina("menu");
      return null;
    }

    if(
      pagina === "usuarios"
      &&
      !temPermissao("global",["admin"])
    ){
      setPagina("menu");
      return null;
    }

    if(
      pagina === "cadastro"
      &&
      !temPermissao("chaves",["cad_ch"])
    ){
      setPagina("home");
      return null;
    }

    if(
      pagina === "associacao"
      &&
      !temPermissao(
        "chaves",
        ["gravacao","comissionador"]
      )
    ){
      setPagina("home");
      return null;
    }

    if(
      pagina === "consulta"
      &&
      !temPermissao(
        "chaves",
        ["leitura","gravacao","comissionador","cad_ch"]
      )
    ){
      setPagina("home");
      return null;
    }

    if(
      pagina === "geo"
      &&
      !temPermissao(
        "acomp_geo",
        ["leitura"]
      )
    ){
      setPagina("menu");
      return null;
    }

    if(
      pagina === "proorc"
      &&
      !temPermissao(
        "proorc",
        ["leitura","gravacao"]
      )
    ){
      setPagina("menu");
      return null;
    }

    if(pagina === "usuarios"){

      return(

        <Usuarios
          setPagina={setPagina}
        />

      );

    }

    if(pagina === "cadastro"){

      return(

<Cadastro
 usuario={usuario}
 permissoes={permissoes}
 chavesDisponiveis={chavesDisponiveis}
 atualizarContagem={atualizarContagem}
 setPagina={setPagina}
 handleLogout={handleLogout}
/>

      );

    }

    if(pagina === "associacao"){

      return(

<Associacao
 usuario={usuario}
 permissoes={permissoes}
 atualizarContagem={atualizarContagem}
 setPagina={setPagina}
/>

      );

    }

    if(pagina === "consulta"){

      return(

<Consulta
 usuario={usuario}
 permissoes={permissoes}
 setPagina={setPagina}
/>

      );

    }

if(pagina === "corrigirCadastro"){
  return(
    <CorrigirCadastro
      permissoes={permissoes}
      setPagina={setPagina}
      atualizarContagem={atualizarContagem}
    />
  );
}

    if(pagina === "geo"){

      return(

        <AcompGeo
          setPagina={setPagina}
        />

      );

    }

if(pagina === "proorc"){

  return(

    <Proorc2
      setPagina={setPagina}
    />

  );

}

    return(

       <ControleChaves
        usuario={usuario}
        permissoes={permissoes}
        chavesDisponiveis={chavesDisponiveis}
        setPagina={setPagina}
        handleLogout={handleLogout}
      />

    );

  }

  return(

    <div style={styles.loginContainer}>

      <form
        style={styles.loginCard}
        onSubmit={handleLogin}
      >

        <h2>Apps Integrados</h2>

        <input
          placeholder="Matrícula"
          style={styles.input}
          value={matricula}
          onChange={(e)=>setMatricula(e.target.value.toLowerCase())}
        />

        <input
          type="password"
          placeholder="Senha"
          style={styles.input}
          value={senha}
          onChange={(e)=>setSenha(e.target.value)}
        />

        {erro && (

          <p style={{color:"#c0392b"}}>
            {erro}
          </p>

        )}

        <button
          style={styles.loginButton}
          type="submit"
        >
          {loading
            ? "Entrando..."
            : "Entrar"}
        </button>

      </form>

    </div>

  );

}

const styles:{[key:string]:React.CSSProperties}={

  loginContainer:{
    minHeight:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"linear-gradient(to bottom,#1e3c72,#2a5298)",
    padding:16
  },

  loginCard:{
    background:"white",
    padding:"24px",
    borderRadius:12,
    width:"100%",
    maxWidth:360,
    textAlign:"center"
  },

  input:{
    width:"100%",
    padding:12,
    marginBottom:15,
    borderRadius:8,
    border:"1px solid #ccc",
    fontSize:16
  },

  loginButton:{
    padding:12,
    borderRadius:8,
    border:"none",
    background:"#1e3c72",
    color:"white",
    cursor:"pointer",
    width:"100%",
    fontSize:16
  },

  menuButton:{
    padding:12,
    borderRadius:8,
    border:"none",
    background:"#1e3c72",
    color:"white",
    cursor:"pointer",
    fontSize:16
  }

};
