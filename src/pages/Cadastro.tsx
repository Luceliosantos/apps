import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Registro = {
  numero: string;
  data: string;
  erro?: string;
};

type Props = {
  usuario: {
    matricula: string;
    nome: string;
    tipo: string;
  };
  permissoes:any[];
  chavesDisponiveis: number;
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
  atualizarContagem: () => Promise<void>;
};

export default function Cadastro({
  usuario,
  permissoes,
  setPagina,
  atualizarContagem,
}: Props) {

  function temPermissao(sistema:string, tipos:string[]){

    const p = permissoes.find(x => x.sistema === sistema);

    if(!p) return false;

    if(p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }

  if(!temPermissao("chaves",["cad_ch"])){

    setPagina("home");

    return null;

  }

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [_, setErroImportacao] = useState("");
  const [loading, setLoading] = useState(false);

  function dataHojeBR(){

    return new Date().toLocaleDateString("pt-BR");

  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {

      const data = evt.target?.result;

      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const json: any[][] = XLSX.utils.sheet_to_json(worksheet,{ header: 1 });

      const novos: Registro[] = [];

      for (let i = 1; i < json.length; i++) {

        const numero = String(json[i][0] ?? "").trim();

        let erro = "";

        if (!/^\d{6}$/.test(numero)) {

          erro = "Número deve ter 6 dígitos";

        }

        novos.push({

          numero,

          data: dataHojeBR(),

          erro: erro || undefined,

        });

      }

      setRegistros(novos);

      setErroImportacao("");

    };

    reader.readAsBinaryString(file);

  }

  async function handleCadastrar(){

    setErroImportacao("");

    const registrosAtualizados = [...registros];

    let possuiErro = false;

    for (let i = 0; i < registrosAtualizados.length; i++){

      const r = registrosAtualizados[i];

      const { data } = await supabase

        .from("db_chaves")

        .select("id")

        .eq("numero", r.numero)

        .maybeSingle();

      if (data){

        registrosAtualizados[i].erro = "Chave já existe";

        possuiErro = true;

      }

    }

    setRegistros(registrosAtualizados);

    if (possuiErro){

      setErroImportacao("Existem duplicidades.");

      return;

    }

    setLoading(true);

    for (const r of registrosAtualizados){

      await supabase.from("db_chaves").insert([{

        numero: r.numero,

        dt_disp: new Date().toISOString().split("T")[0],

        usu_cad_db: usuario.matricula,

      }]);

    }

    alert("Chaves cadastradas!");

    setRegistros([]);

    atualizarContagem();

    setLoading(false);

  }

  return (

    <div style={styles.container}>

      <div style={styles.overlay}>

        <div style={styles.topBar}>

          <strong>

            {usuario.matricula} - {usuario.nome}

          </strong>

          <button style={styles.button} onClick={()=>setPagina("home")}>
            Home
          </button>

        </div>

        {registros.length === 0 && (

          <input type="file" accept=".xls,.xlsx" onChange={handleFile} />

        )}

        {registros.length > 0 && (

          <button
            style={styles.button}
            onClick={handleCadastrar}
            disabled={loading}
          >

            {loading
              ? "Cadastrando..."
              : `Cadastrar ${registros.length} chaves`
            }

          </button>

        )}

      </div>

    </div>

  );

}

const styles:any = {

  container:{padding:40},

  overlay:{},

  topBar:{display:"flex",justifyContent:"space-between"},

  button:{padding:10}

};
