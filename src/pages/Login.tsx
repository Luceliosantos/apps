import { useNavigate } from "react-router-dom";

export default function Login(){

  const navigate = useNavigate();

  function entrar(){
    navigate("/home");
  }

  return(

    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h1>APLICATIVOS</h1>

      <br/>

      <button onClick={entrar}>
        Entrar
      </button>

    </div>

  );

}
