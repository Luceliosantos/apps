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
import Proorc2 from "./pages/Proorc2";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Card from "./components/ui/Card";

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

  const [permissoes, setPermissoes] = useState<{ sistema: string; tipo: string }[]>([]);

  function temPermissao(sistema: string, tipos: string[]) {
    const p = permissoes.find((x) => x.sistema === sistema);
    if (!p) return false;
    if (p.tipo === "admin") return true;
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

  async function carregarPermissoes(id_usuario: string) {
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
      setErro("Matricula ou senha invalidos.");
      setLoading(false);
      return;
    }

    const usuarioLogado: Usuario = {
      id: data.id,
      matricula: data.matricula,
      nome: data.nome,
      tipo: "user",
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

  function validarSenhaForte(senha: string) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return regex.test(senha);
  }

  async function salvarNovaSenha() {
    setErro("");

    if (!novaSenha) {
      setErro("Informe a nova senha");
      return;
    }

    if (!validarSenhaForte(novaSenha)) {
      setErro(
        "Senha fraca. Use no minimo 8 caracteres com maiuscula, minuscula, numero e simbolo."
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas nao conferem");
      return;
    }

    const { error } = await supabase
      .from("db_usuarios_apps")
      .update({
        senha: novaSenha,
        trocar_senha: false,
      })
      .eq("id", usuario?.id)
      .select();

    if (error) {
      setErro("Erro ao salvar senha.");
      return;
    }

    setNovaSenha("");
    setConfirmarSenha("");

    alert("Senha alterada com sucesso");

    setPagina("menu");
  }

  function handleLogout() {
    setUsuario(null);
    setPermissoes([]);
    setMatricula("");
    setSenha("");
    setPagina("login");
  }

  if (usuario) {
    if (pagina === "alterarSenha") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
          <Card className="w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Alterar senha
              </h2>
              <p className="text-text-secondary mt-2">
                Crie uma nova senha para sua conta
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                label="Nova senha"
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                error={erro && !novaSenha ? erro : undefined}
              />

              <Input
                type="password"
                label="Confirmar senha"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />

              {erro && (
                <p className="text-sm text-error text-center">{erro}</p>
              )}

              <Button onClick={salvarNovaSenha} className="w-full">
                Salvar senha
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (pagina === "menu") {
      return (
        <Home
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    if (
      pagina === "home" &&
      !temPermissao("chaves", ["leitura", "gravacao", "comissionador", "cad_ch"])
    ) {
      setPagina("menu");
      return null;
    }

    if (pagina === "usuarios" && !temPermissao("global", ["admin"])) {
      setPagina("menu");
      return null;
    }

    if (pagina === "cadastro" && !temPermissao("chaves", ["cad_ch"])) {
      setPagina("home");
      return null;
    }

    if (
      pagina === "associacao" &&
      !temPermissao("chaves", ["gravacao", "comissionador"])
    ) {
      setPagina("home");
      return null;
    }

    if (
      pagina === "consulta" &&
      !temPermissao("chaves", ["leitura", "gravacao", "comissionador", "cad_ch"])
    ) {
      setPagina("home");
      return null;
    }

    if (pagina === "geo" && !temPermissao("acomp_geo", ["leitura"])) {
      setPagina("menu");
      return null;
    }

    if (
      pagina === "proorc" &&
      !temPermissao("proorc", ["leitura", "gravacao"])
    ) {
      setPagina("menu");
      return null;
    }

    if (pagina === "usuarios") {
      return (
        <Usuarios
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    if (pagina === "cadastro") {
      return (
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

    if (pagina === "associacao") {
      return (
        <Associacao
          usuario={usuario}
          permissoes={permissoes}
          atualizarContagem={atualizarContagem}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    if (pagina === "consulta") {
      return (
        <Consulta
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    if (pagina === "corrigirCadastro") {
      return (
        <CorrigirCadastro
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          atualizarContagem={atualizarContagem}
          handleLogout={handleLogout}
        />
      );
    }

    if (pagina === "geo") {
      return (
        <AcompGeo
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    if (pagina === "proorc") {
      return (
        <Proorc2
          usuario={usuario}
          permissoes={permissoes}
          setPagina={setPagina}
          handleLogout={handleLogout}
        />
      );
    }

    return (
      <ControleChaves
        usuario={usuario}
        permissoes={permissoes}
        chavesDisponiveis={chavesDisponiveis}
        setPagina={setPagina}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Apps Integrados
          </h1>
          <p className="text-text-secondary mt-2">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Matricula"
            placeholder="Digite sua matricula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.toLowerCase())}
            autoComplete="username"
          />

          <Input
            type="password"
            label="Senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />

          {erro && <p className="text-sm text-error text-center">{erro}</p>}

          <Button type="submit" loading={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
