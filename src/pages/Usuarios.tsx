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

    permissoesData?.forEach(p => {

      if (!mapa[p.id_usuario]) {

        mapa[p.id_usuario] = {};

      }

      mapa[p.id_usuario][p.sistema] = p.tipo;

    });

    setPermissoes(mapa);

  }

  async function salvarPermissao(
    id_usuario:string,
    sistema:string,
    tipo:string
  ) {

    await supabase
      .from("db_usuarios_apps_permissoes")
      .upsert({
        id_usuario,
        sistema,
        tipo
      });

    carregarDados();

  }

  return (

    <div style={styles.container}>

      <h2>Administração de Usuários</h2>

      <button
        style={styles.button}
        onClick={() => setPagina("menu")}
      >
        Voltar
      </button>

      <table style={styles.table}>

        <thead>

          <tr>

            <th>Nome</th>

            <th>Matrícula</th>

            {sistemas.map(s => (

              <th key={s}>
                {s}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {usuarios.map(u => (

            <tr key={u.id}>

              <td>
                {u.nome}
              </td>

              <td>
                {u.matricula}
              </td>

              {sistemas.map(sistema => (

                <td key={sistema}>

                  <select

                    value={
                      permissoes[u.id]?.[sistema]
                      || "bloqueado"
                    }

                    onChange={(e) =>
                      salvarPermissao(
                        u.id,
                        sistema,
                        e.target.value
                      )
                    }

                  >

                    {tipos

                      .filter(t => t.sistema === sistema)

                      .map(t => (

                        <option
                          key={t.tipo}
                          value={t.tipo}
                        >

                          {t.tipo}

                        </option>

                      ))}

                  </select>

                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

const styles:{[key:string]:React.CSSProperties} = {

  container:{
    padding:40
  },

  table:{
    borderCollapse:"collapse",
    width:"100%"
  },

  button:{
    padding:18,
    fontSize:16,
    borderRadius:10,
    border:"1px solid rgba(255,255,255,0.25)",
    backgroundColor:"rgba(255,255,255,0.12)",
    color:"black",
    cursor:"pointer",
    backdropFilter:"blur(6px)",
    transition:"all 0.3s ease",
    marginBottom:20
  }

};
