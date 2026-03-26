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
  const [erroImportacao, setErroImportacao] = useState("");
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
          erro = "Número deve ter 6 dígitos numéricos";
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

  async function handleCadastrar() {

    setErroImportacao("");

    const registrosAtualizados = [...registros];

    let possuiErro = false;

    for (let i = 0; i < registrosAtualizados.length; i++) {

      const r = registrosAtualizados[i];

      const { data } = await supabase
        .from("db_chaves")
        .select("id")
        .eq("numero", r.numero)
        .maybeSingle();

      if (data) {

        registrosAtualizados[i].erro = "Chave já existente no banco";
        possuiErro = true;

      }

    }

    setRegistros(registrosAtualizados);

    if (possuiErro) {

      setErroImportacao("Existem registros inválidos ou duplicados.");
      return;

    }

    setLoading(true);

    for (const r of registrosAtualizados) {

      await supabase.from("db_chaves").insert([{
        numero: r.numero,
        dt_disp: new Date().toISOString().split("T")[0],
        usu_cad_db: usuario.matricula,
      }]);

    }

    alert("Chaves cadastradas com sucesso!");

    setRegistros([]);
    atualizarContagem();
    setLoading(false);

  }

  return (

<div style={styles.container}>

<div style={styles.overlay}>

<div style={styles.topBar}>

<div style={styles.linhaUsuario}>
{usuario.matricula} - {usuario.nome}
</div>

<button
style={styles.button}
onClick={() => setPagina("home")}
>
Home
</button>

</div>

<div style={styles.cardPrincipal}>

<input
type="file"
accept=".xls,.xlsx"
onChange={handleFile}
style={{marginBottom:20}}
/>

{registros.length > 0 && (

<>

<div style={styles.validosInvalidos}>

<b>{registros.length}</b> registros importados

<span style={styles.validos}>
{
registros.filter(r=>!r.erro).length
} válidos
</span>

<span>|</span>

<span style={styles.invalidos}>
{
registros.filter(r=>r.erro).length
} com erro
</span>

</div>

<div style={{textAlign:"center"}}>

<button
style={styles.button}
onClick={handleCadastrar}
>
Cadastrar {
registros.filter(r=>!r.erro).length
} Chaves
</button>

</div>

<table style={styles.tabela}>

<thead>

<tr>

<th style={styles.th}>NÚMERO</th>
<th style={styles.th}>DATA</th>
<th style={styles.th}>STATUS</th>

</tr>

</thead>

<tbody>

{registros.map((r,i)=>(

<tr key={i}>

<td style={styles.td}>{r.numero}</td>
<td style={styles.td}>{r.data}</td>

<td style={styles.td}>

{r.erro
? <span style={styles.invalidos}>{r.erro}</span>
: <span style={styles.validos}>OK</span>
}

</td>

</tr>

))}

</tbody>

</table>

</>

)}

</div>
</div>
</div>

);

}

const styles:{[key:string]:React.CSSProperties}={

container:{
minHeight:"100vh",
backgroundImage:`
linear-gradient(rgba(10,31,68,0.55), rgba(10,31,68,0.75)),
url("https://www.neoenergia.com/documents/107588/2280860/Neoenergia_Caminho_da_energia_da_geracao_a_distribuicao+c+%281%29.jpg")
`,
backgroundSize:"cover",
padding:40,
color:"white"
},

overlay:{
maxWidth:1100,
margin:"auto"
},

topBar:{
display:"flex",
justifyContent:"space-between",
marginBottom:20
},

cardPrincipal:{
background:"rgba(255,255,255,0.06)",
padding:30,
borderRadius:20
},

validosInvalidos:{
display:"flex",
gap:8,
alignItems:"center",
marginBottom:15
},

validos:{color:"#00ff88"},
invalidos:{color:"#ff6b6b"},

tabela:{
width:"auto",
minWidth:"100%",
borderCollapse:"collapse",
background:"rgba(255,255,255,0.06)",
tableLayout:"auto"
},

th:{
border:"1px solid rgba(255,255,255,0.15)",
padding:8.5,
textAlign:"center",
textTransform:"uppercase",
whiteSpace:"nowrap"
},

td:{
border:"1px solid rgba(255,255,255,0.15)",
padding:8.5,
textAlign:"center",
whiteSpace:"nowrap"
},

button:{
padding:"11px 18px",
borderRadius:8,
border:"1px solid rgba(255,255,255,0.25)",
background:"rgba(255,255,255,0.12)",
color:"white",
cursor:"pointer"
}

};
