import ProorcAdminTabs from "../components/proorc-admin/ProorcAdminTabs";

type Props = {
  usuario?: {
    nome?: string;
  };
  permissoes?: {
    sistema: string;
    tipo: string;
  }[];
  setPagina: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProorcAdmin({
  permissoes,
  setPagina
}: Props) {

  // 🔒 verificar permissão igual ao resto do sistema
  const perfilProorc =
    permissoes?.find(x => x.sistema === "proorc")?.tipo;

  // 🚫 bloqueio de acesso
  if (perfilProorc !== "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h3>Acesso negado</h3>

        <button
          onClick={() => setPagina("proorc")}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#c0392b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Voltar
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: 20 }}>   

      <h2>CADASTRO E EDIÇÃO DE KITS E ITENS</h2>

      <ProorcAdminTabs />

    </div>
  );
}
