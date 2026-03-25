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

  if(

    !temPermissao(
      "chaves",
      ["cad_ch"]
    )

  ){

    setPagina("home");

    return null;

  }

  const [registros, setRegistros] = useState<Registro[]>([]);

  const [erroImportacao, setErroImportacao] = useState("");

  const [loading, setLoading] = useState(false);


  function dataHojeBR(){

    return new Date().toLocaleDateString("pt-BR");

  }


  function handleFile(e: React.ChangeEvent<HTMLInputElement>){

    const file = e.target.files?.[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {

      const data = evt.target?.result;

      if(!data) return;

      const workbook =
        XLSX.read(data,{ type:"binary" });

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const json:any[][] =
        XLSX.utils.sheet_to_json(
          worksheet,
          { header:1 }
        );

      const novos:Registro[] = [];

      for(let i=1;i<json.length;i++){

        const numero =
          String(json[i][0] ?? "").trim();

        let erro="";

        if(!/^\d{6}$/.test(numero)){

          erro =
            "Número deve ter 6 dígitos numéricos";

        }

        novos.push({

          numero,

          data:dataHojeBR(),

          erro:erro || undefined

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

    for(let i=0;i<registrosAtualizados.length;i++){

      const r = registrosAtualizados[i];

      const { data } =
        await supabase
          .from("db_chaves")
          .select("id")
          .eq("numero", r.numero)
          .maybeSingle();

      if(data){

        registrosAtualizados[i].erro =
          "Chave já existente no banco";

        possuiErro = true;

      }

    }

    setRegistros(registrosAtualizados);

    if(possuiErro){

      setErroImportacao(
        "Existem registros inválidos ou duplicados. Corrija antes de cadastrar."
      );

      return;

    }

    setLoading(true);

    for(const r of registrosAtualizados){

      await supabase
        .from("db_chaves")
        .insert([{

          numero:r.numero,

          dt_disp:new Date()
            .toISOString()
            .split("T")[0],

          usu_cad_db:usuario.matricula

        }]);

    }

    alert("Chaves cadastradas com sucesso!");

    setRegistros([]);

    atualizarContagem();

    setLoading(false);

  }


  return (

    <div style={styles.container}>

      <div style={styles.electricParticles}></div>

      <div style={styles.overlay}>

        <div style={styles.topBar}>

          <div style={styles.headerUsuario}>

            <div style={styles.linhaUsuario}>

              {usuario.matricula}

              {" - "}

              {usuario.nome}

            </div>

          </div>

          <div style={styles.acoesUsuario}>

            <button
              style={styles.button}
              onClick={() => setPagina("home")}
            >
              Home
            </button>

          </div>

        </div>


        <div style={styles.mainContent}>

          <div style={styles.cardPrincipal}>


            <div style={styles.uploadArea}>

              <input

                type="file"

                accept=".xls,.xlsx"

                onChange={handleFile}

                style={styles.inputFile}

                id="file-upload"

              />

              <label

                htmlFor="file-upload"

                style={styles.labelUpload}

              >

                <div style={styles.uploadIcon}>📁</div>

                <div>

                  <strong>

                    Selecionar Arquivo Excel

                  </strong>

                  <p>

                    Arraste ou clique para importar

                  </p>

                </div>

              </label>

            </div>


            {erroImportacao && (

              <div style={styles.alertaErro}>

                ⚠️ {erroImportacao}

              </div>

            )}


            {registros.length > 0 && (

              <>

                <div style={styles.caixaQuantidade}>


                  <div style={styles.statsContent}>

                    <div style={styles.statItem}>

                      <strong style={styles.statNumber}>

                        {registros.length}

                      </strong>

                      <span>

                        registros importados

                      </span>

                    </div>


                    <div style={styles.validosInvalidos}>

                      <span style={styles.validos}>

                        {

                          registros.filter(
                            r => !r.erro
                          ).length

                        }

                        {" "}válidos

                      </span>


                      <span style={styles.invalidos}>

                        {

                          registros.filter(
                            r => r.erro
                          ).length

                        }

                        {" "}com erro

                      </span>

                    </div>

                  </div>


                  <div style={styles.botaoContainer}>

                    <button

                      style={{

                        ...styles.button,

                        opacity:

                          loading

                          ||

                          registros.filter(
                            r => !r.erro
                          ).length === 0

                          ? 0.5

                          : 1

                      }}

                      onClick={handleCadastrar}

                      disabled={

                        loading

                        ||

                        registros.filter(
                          r => !r.erro
                        ).length === 0

                      }

                    >

                      {

                        loading

                        ? "Cadastrando..."

                        : `Cadastrar ${
                            registros.filter(
                              r => !r.erro
                            ).length
                          } Chaves`

                      }

                    </button>

                  </div>

                </div>


                <div style={styles.tabelaContainer}>

                  <table style={styles.tabela}>

                    <thead style={styles.thead}>

                      <tr>

                        <th style={styles.thNumero}>
                          Número
                        </th>

                        <th style={styles.thData}>
                          Data
                        </th>

                        <th style={styles.thStatus}>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {registros.map((r,index)=>(

                        <tr

                          key={index}

                          style={

                            r.erro

                            ? styles.linhaErro

                            : styles.linhaOk

                          }

                        >

                          <td style={styles.tdNumero}>
                            {r.numero}
                          </td>

                          <td style={styles.tdData}>
                            {r.data}
                          </td>

                          <td style={styles.tdStatus}>

                            {

                              r.erro

                              ? (

                                <span style={styles.statusErro}>

                                  {r.erro}

                                </span>

                              )

                              : (

                                <span style={styles.statusOk}>
                                  OK
                                </span>

                              )

                            }

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}
