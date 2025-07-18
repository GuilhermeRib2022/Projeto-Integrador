
export default function verificarCargo(...permittedRoles) {
  return (request, response, next) => {
    const { user } = request // Obter o utilizador do request, que foi definido em Autenticacao.js
    //console.log("Cargo do utilizador:", user.cargo);
    //console.log("Cargos permitidos:", permittedRoles);

    if (user && permittedRoles.includes(user.cargo)) {
      next(); //  O utilizador tem permissão para aceder à rota
    } else {
      response.status(403).json({ message: "Cargo não autorizado" }); // Utilizador não autorizado
    }
  }
}