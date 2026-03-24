export const isAdminGlobal = (permissoes:any[]) => {

 return permissoes.some(

  p =>

  p.sistema === "global" &&

  p.tipo === "admin"

 )

}
