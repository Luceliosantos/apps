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
      .select("sistema, tipo")
      .order("tipo");

    const { data: permissoesData } = await supabase
      .from("db_usuarios_apps_permissoes")
      .select("id_usuario, sistema, tipo");

    setUsuarios(usuariosData || []);
    setTipos(tiposData || []);

    // monta mapa de permissões existentes
    const mapa:any = {};

    permissoesData?.forEach(p => {

      if (!mapa[p.id_usuario]) {

        mapa[p.id_usuario] = {};

      }

      mapa[p.id_usuario][p.sistema] = p.tipo;

    });

    setPermissoes(mapa);

  }

  function alterarPermissao(
    id_usuario:string,
    sistema:string,
    tipo:string
  ){

    setPermissoes(prev => ({

      ...prev,

      [id_usuario]:{

        ...prev[id_usuario],

        [sistema]:tipo

      }

    }));

  }

  async function salvarUsuario(id_usuario:string){

    for(const sistema of sistemas){

      await supabase
        .from("db_usuarios_apps_permissoes")
        .upsert({

          id_usuario,

          sistema,

          tipo:
            permissoes[id_usuario]?.[sistema]
            || "bloqueado"

        });

    }

    alert("Permissões atualizadas");

  }

  async function cadastrarUsuario(){

    if(!novoNome || !novaMatricula){

      alert("Preencha nome e matrícula");

      return;

    }

    const { error } =
      await supabase
        .from("db_usuarios_apps")
        .insert({

          nome:novoNome,
          matricula:novaMatricula

        });

    if(error){

      alert(error.message);

      return;

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
              onChange={e =>
                setNovoNome(e.target.value)
              }
              style={styles.input}
            />

            <input
              placeholder="Matrícula"
              value={novaMatricula}
              onChange={e =>
                setNovaMatricula(e.target.value)
              }
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

              <th style={styles.th}>
                Nome
              </th>

              <th style={styles.th}>
                Matrícula
              </th>

              {sistemas.map(s => (

                <th key={s} style={styles.th}>
                  {s}
                </th>

              ))}

              <th style={styles.th}>
                Ação
              </th>

            </tr>

          </thead>

          <tbody>

            {usuarios.map(u => (

              <tr key={u.id}>

                <td style={styles.td}>
                  {u.nome}
                </td>

                <td style={styles.td}>
                  {u.matricula}
                </td>

                {sistemas.map(sistema => {

                  const opcoes =
                    tipos.filter(

                      t =>

                      t.sistema === sistema

                    );

                  return (

                    <td key={sistema} style={styles.td}>

                      <select

                        value={
                          permissoes[u.id]?.[sistema]
                          || "bloqueado"
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

                    onClick={() =>
                      salvarUsuario(u.id)
                    }

                  >

                    Aplicar

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
    padding:40,
    display:"flex",
    justifyContent:"center"
  },

  card:{
    width:"100%",
    maxWidth:1100,
    background:"white",
    padding:30,
    borderRadius:12,
    boxShadow:"0 4px 20px rgba(0,0,0,0.15)"
  },

  topBar:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:20
  },

  novoUsuario:{
    marginBottom:30
  },

  row:{
    display:"flex",
    gap:10,
    marginTop:10
  },

  input:{
    padding:8,
    borderRadius:6,
    border:"1px solid #ccc",
    flex:1
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
    textAlign:"center"
  },

  th:{
    border:"1px solid #ccc",
    padding:10,
    background:"#1e3c72",
    color:"white"
  },

  td:{
    border:"1px solid #ccc",
    padding:8
  },

  select:{
    padding:5,
    borderRadius:5,
    border:"1px solid #ccc"
  },

  button:{
    padding:"8px 14px",
    borderRadius:8,
    border:"1px solid #1e3c72",
    background:"#1e3c72",
    color:"white",
    cursor:"pointer"
  }

};
