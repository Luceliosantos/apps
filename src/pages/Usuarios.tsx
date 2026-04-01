import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
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

export default function Usuarios({ setPagina }: Props) {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tipos, setTipos] = useState<TipoPermissao[]>([]);
  const [permissoes, setPermissoes] = useState<any>({});

  const [novoNome,setNovoNome] = useState("");
  const [novaMatricula,setNovaMatricula] = useState("");

  const sistemas = [
    "global",
    "chaves",
    "proorc",
    "acomp_geo"
  ];

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

    const mapa:any = {};

    (permissoesData || []).forEach(p => {

      const id = String(p.id_usuario);

      if (!mapa[id]) mapa[id] = {};

      mapa[id][p.sistema] = p.tipo;

    });

    setPermissoes(mapa);

  }

  function alterarPermissao(
    id_usuario:string,
    sistema:string,
    tipo:string
  ){

    setPermissoes((prev:any) => ({

      ...prev,

      [String(id_usuario)]:{

        ...prev[String(id_usuario)],

        [sistema]:tipo

      }

    }));

  }

  async function salvarUsuario(id_usuario:string){

    for(const sistema of sistemas){

      let tipo =
        permissoes[String(id_usuario)]?.[sistema];

      if(!tipo){

        tipo =
          sistema === "global"
          ? "usuario"
          : "bloqueado";

      }

      const { data } =
        await supabase
          .from("db_usuarios_apps_permissoes")
          .select("id")
          .eq("id_usuario", id_usuario)
          .eq("sistema", sistema)
          .maybeSingle();

      if(data){

        await supabase
          .from("db_usuarios_apps_permissoes")
          .update({ tipo })
          .eq("id_usuario", id_usuario)
          .eq("sistema", sistema);

      } else {

        await supabase
          .from("db_usuarios_apps_permissoes")
          .insert({

            id_usuario,
            sistema,
            tipo

          });

      }

    }

    alert("Permissões salvas");

    carregarDados();

  }

  async function excluirUsuario(id_usuario:string){

    if(!confirm("Confirma exclusão do usuário?")) return;

    await supabase
      .from("db_usuarios_apps_permissoes")
      .delete()
      .eq("id_usuario", id_usuario);

    await supabase
      .from("db_usuarios_apps")
      .delete()
      .eq("id", id_usuario);

    carregarDados();

  }

  async function resetarSenha(id_usuario:string, matricula:string){

    if(!confirm("Resetar senha para a matrícula do usuário?")) return;

    await supabase
      .from("db_usuarios_apps")
      .update({
        senha: matricula.toLowerCase(),
        trocar_senha: true
      })
      .eq("id", id_usuario);

    alert("Senha resetada");

  }

  async function cadastrarUsuario(){

    if(!novoNome || !novaMatricula){

      alert("Preencha nome e matrícula");
      return;

    }

    const { data, error } =
      await supabase
        .from("db_usuarios_apps")
        .insert({

          nome:novoNome,
          matricula:novaMatricula.toLowerCase(),
          senha:novaMatricula.toLowerCase(),
          trocar_senha:true

        })
        .select()
        .single();

    if(error){

      alert(error.message);
      return;

    }

    const permissoesPadrao = [

      { sistema:"global", tipo:"usuario" },
      { sistema:"chaves", tipo:"bloqueado" },
      { sistema:"proorc", tipo:"bloqueado" },
      { sistema:"acomp_geo", tipo:"bloqueado" }

    ];

    for(const p of permissoesPadrao){

      await supabase
        .from("db_usuarios_apps_permissoes")
        .insert({

          id_usuario:data.id,
          sistema:p.sistema,
          tipo:p.tipo

        });

    }

    setNovoNome("");
    setNovaMatricula("");

    carregarDados();

  }

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <div style={styles.topBar}>

          <h2>Administração de Usuários</h2>

          <button
            style={styles.button}
            onClick={() => setPagina("menu")}
          >
            Voltar
          </button>

        </div>

        <div style={styles.novoUsuario}>

          <h3>Novo Usuário</h3>

          <div style={styles.row}>

            <input
              placeholder="Nome"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Matrícula"
              value={novaMatricula}
              onChange={e => setNovaMatricula(e.target.value.toLowerCase())}
              style={styles.input}
            />

            <button
              style={styles.button}
              onClick={cadastrarUsuario}
            >
              Cadastrar
            </button>

          </div>

        </div>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Matrícula</th>

              {sistemas.map(s => (
                <th key={s} style={styles.th}>{s}</th>
              ))}

              <th style={styles.th}>Salvar</th>
              <th style={styles.th}>Excluir</th>
              <th style={styles.th}>Senha</th>

            </tr>

          </thead>

          <tbody>

            {usuarios.map(u => (

              <tr key={u.id}>

                <td style={styles.td}>{u.nome}</td>

                <td style={styles.td}>{u.matricula}</td>

                {sistemas.map(sistema => {

                  const opcoes =
                    tipos.filter(
                      t => t.sistema === sistema
                    );

                  return (

                    <td key={sistema} style={styles.td}>

                      <select

                        value={
                          permissoes[String(u.id)]?.[sistema]
                          || (sistema === "global"
                            ? "usuario"
                            : "bloqueado")
                        }

                        onChange={(e) =>
                          alterarPermissao(
                            u.id,
                            sistema,
                            e.target.value
                          )
                        }

                        style={styles.select}

                      >

                        {opcoes.map(t => (

                          <option
                            key={t.tipo}
                            value={t.tipo}
                          >
                            {t.tipo}
                          </option>

                        ))}

                      </select>

                    </td>

                  );

                })}

                <td style={styles.td}>

                  <button
                    style={styles.button}
                    onClick={() => salvarUsuario(u.id)}
                  >
                    Aplicar
                  </button>

                </td>

                <td style={styles.td}>

                  <button
                    style={styles.deleteButton}
                    onClick={() => excluirUsuario(u.id)}
                  >
                    Excluir
                  </button>

                </td>

                <td style={styles.td}>

                  <button
                    style={styles.resetButton}
                    onClick={() => resetarSenha(u.id, u.matricula)}
                  >
                    Resetar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

const styles:{[key:string]:React.CSSProperties} = {

  container:{
    padding:"20px",
    display:"flex",
    justifyContent:"center"
  },

  card:{
    width:"100%",
    maxWidth:1100,
    background:"white",
    padding:"20px",
    borderRadius:12,
    boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
    overflowX:"auto"
  },

  topBar:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-start",
    flexWrap:"wrap",
    gap:10,
    marginBottom:20
  },

  novoUsuario:{
    marginBottom:25
  },

  row:{
    display:"flex",
    gap:8,
    marginTop:10,
    flexWrap:"wrap"
  },

  input:{
    padding:"8px 10px",
    borderRadius:6,
    border:"1px solid #ccc",
    flex:"1 1 180px",
    minWidth:150
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    textAlign:"center",
    minWidth:900
  },

  th:{
    border:"1px solid #ccc",
    padding:"8px",
    background:"#1e3c72",
    color:"white",
    whiteSpace:"nowrap"
  },

  td:{
    border:"1px solid #ccc",
    padding:"6px 8px",
    whiteSpace:"nowrap"
  },

  select:{
    padding:"6px",
    borderRadius:5,
    border:"1px solid #ccc",
    minWidth:90
  },

  button:{
    padding:"7px 12px",
    borderRadius:8,
    border:"1px solid #1e3c72",
    background:"#1e3c72",
    color:"white",
    cursor:"pointer",
    whiteSpace:"nowrap"
  },

  deleteButton:{
    padding:"7px 12px",
    borderRadius:8,
    border:"1px solid #c0392b",
    background:"#c0392b",
    color:"white",
    cursor:"pointer",
    whiteSpace:"nowrap"
  },

  resetButton:{
    padding:"7px 12px",
    borderRadius:8,
    border:"1px solid #e67e22",
    background:"#e67e22",
    color:"white",
    cursor:"pointer",
    whiteSpace:"nowrap"
  }

};
