import { useEffect, useState } from "react";
import { UserPlus, Save, Trash2, Key } from "lucide-react";
import { supabase } from "../supabase";
import type { Pagina } from "../App";
import Layout from "../components/Layout";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";

type Props = {
  usuario: {
    matricula: string;
    nome: string;
  };
  permissoes: { sistema: string; tipo: string }[];
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
};

type Usuario = {
  id: string;
  matricula: string;
  nome: string;
};

type TipoPermissao = {
  sistema: string;
  tipo: string;
};

type PermissoesMap = Record<string, Record<string, string>>;

export default function Usuarios({
  usuario,
  permissoes: userPermissoes,
  setPagina,
  handleLogout,
}: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tipos, setTipos] = useState<TipoPermissao[]>([]);
  const [permissoes, setPermissoes] = useState<PermissoesMap>({});

  const [novoNome, setNovoNome] = useState("");
  const [novaMatricula, setNovaMatricula] = useState("");

  const sistemas = ["global", "chaves", "proorc", "acomp_geo"];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: usuariosData } = await supabase
      .from("db_usuarios_apps")
      .select("id, matricula, nome")
      .order("nome");

    const { data: tiposData } = await supabase
      .from("db_usuarios_apps_tipos_permissoes")
      .select("sistema, tipo");

    const { data: permissoesData } = await supabase
      .from("db_usuarios_apps_permissoes")
      .select("id_usuario, sistema, tipo");

    setUsuarios(usuariosData || []);
    setTipos(tiposData || []);

    const mapa: PermissoesMap = {};
    (permissoesData || []).forEach((p) => {
      const id = String(p.id_usuario);
      if (!mapa[id]) mapa[id] = {};
      mapa[id][p.sistema] = p.tipo;
    });
    setPermissoes(mapa);
  }

  function alterarPermissao(id_usuario: string, sistema: string, tipo: string) {
    setPermissoes((prev) => ({
      ...prev,
      [String(id_usuario)]: {
        ...prev[String(id_usuario)],
        [sistema]: tipo,
      },
    }));
  }

  async function salvarUsuario(id_usuario: string) {
    for (const sistema of sistemas) {
      let tipo = permissoes[String(id_usuario)]?.[sistema];
      if (!tipo) {
        tipo = sistema === "global" ? "usuario" : "bloqueado";
      }

      const { data } = await supabase
        .from("db_usuarios_apps_permissoes")
        .select("id")
        .eq("id_usuario", id_usuario)
        .eq("sistema", sistema)
        .maybeSingle();

      if (data) {
        await supabase
          .from("db_usuarios_apps_permissoes")
          .update({ tipo })
          .eq("id_usuario", id_usuario)
          .eq("sistema", sistema);
      } else {
        await supabase
          .from("db_usuarios_apps_permissoes")
          .insert({ id_usuario, sistema, tipo });
      }
    }

    alert("Permissoes salvas");
    carregarDados();
  }

  async function excluirUsuario(id_usuario: string) {
    if (!confirm("Confirma exclusao do usuario?")) return;

    await supabase
      .from("db_usuarios_apps_permissoes")
      .delete()
      .eq("id_usuario", id_usuario);

    await supabase.from("db_usuarios_apps").delete().eq("id", id_usuario);

    carregarDados();
  }

  async function resetarSenha(id_usuario: string, matricula: string) {
    if (!confirm("Resetar senha para a matricula do usuario?")) return;

    await supabase
      .from("db_usuarios_apps")
      .update({
        senha: matricula.toLowerCase(),
        trocar_senha: true,
      })
      .eq("id", id_usuario);

    alert("Senha resetada");
  }

  async function cadastrarUsuario() {
    if (!novoNome || !novaMatricula) {
      alert("Preencha nome e matricula");
      return;
    }

    const { data, error } = await supabase
      .from("db_usuarios_apps")
      .insert({
        nome: novoNome,
        matricula: novaMatricula.toLowerCase(),
        senha: novaMatricula.toLowerCase(),
        trocar_senha: true,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const permissoesPadrao = [
      { sistema: "global", tipo: "usuario" },
      { sistema: "chaves", tipo: "bloqueado" },
      { sistema: "proorc", tipo: "bloqueado" },
      { sistema: "acomp_geo", tipo: "bloqueado" },
    ];

    for (const p of permissoesPadrao) {
      await supabase
        .from("db_usuarios_apps_permissoes")
        .insert({ id_usuario: data.id, sistema: p.sistema, tipo: p.tipo });
    }

    setNovoNome("");
    setNovaMatricula("");
    carregarDados();
  }

  return (
    <Layout
      usuario={usuario}
      permissoes={userPermissoes}
      pagina="usuarios"
      setPagina={setPagina}
      handleLogout={handleLogout}
      title="Administracao de Usuarios"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* New User Card */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Usuario</CardTitle>
          </CardHeader>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Nome completo"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                placeholder="Matricula"
                value={novaMatricula}
                onChange={(e) => setNovaMatricula(e.target.value.toLowerCase())}
              />
            </div>
            <Button onClick={cadastrarUsuario} icon={<UserPlus size={18} />}>
              Cadastrar
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead>Nome</TableHead>
              <TableHead>Matricula</TableHead>
              {sistemas.map((s) => (
                <TableHead key={s} className="capitalize">
                  {s}
                </TableHead>
              ))}
              <TableHead>Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell className="font-mono text-sm">{u.matricula}</TableCell>
                {sistemas.map((sistema) => {
                  const opcoes = tipos.filter((t) => t.sistema === sistema);
                  const valorAtual =
                    permissoes[String(u.id)]?.[sistema] ||
                    (sistema === "global" ? "usuario" : "bloqueado");

                  return (
                    <TableCell key={sistema}>
                      <select
                        value={valorAtual}
                        onChange={(e) =>
                          alterarPermissao(u.id, sistema, e.target.value)
                        }
                        className="w-full px-2 py-1.5 rounded-md bg-bg-secondary text-text-primary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        {opcoes.map((t) => (
                          <option key={t.tipo} value={t.tipo}>
                            {t.tipo}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  );
                })}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => salvarUsuario(u.id)}
                      icon={<Save size={14} />}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => resetarSenha(u.id, u.matricula)}
                      icon={<Key size={14} />}
                    >
                      Senha
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => excluirUsuario(u.id)}
                      icon={<Trash2 size={14} />}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
