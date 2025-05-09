# Testes

Os testes são importantes na validação da qualidade da aplicação web. Nos testes é necessário considerar as situações em que o sistema não deve reagir, ou deve reagir com alerta de erro, garantindo o bom funcionamento e segurança da aplicação.
Nos testes, é preciso dizer o que vai ser testado para cada funcionalidade, incluindo validações de campos, registo na base de dados ou cálculos a serem feitos.

Devem ser entregues as seguintes especificações de testes: 
## Design dos testes funcionais: 
- **Caso de testes por programa com indicação de programa**
- **Validações de campos** - Verifica a reação aos dados fornecidos pelo utilizador
- **Validações de cálculos** - Verifica cálculos matemáticos
- **Validação de registo/alteração em base de dados** - Garante que as operações sejam realizadas corretamente.
- **Validação de acessos para execução do programa** - Garante que apenas cargos autorizados realizem a ação.

## Utilizador

### Registo de Utilizador
- **Programa:** Registo de Utilizador
- **Descrição:** Criação de um novo utilizador.
- **Validação de campos:**
  - O nome de utilizador, email e password não podem estar vazios.
  -  O email e nome de utilizador devem ser únicos.
- **Validação de cálculos**
  - Deve gerar um ID único automáticamente.
  - A data de criação deve ser a data atual do sistema.
- **Validação de Registo**
  - O utilizador deve ser registado na base de dados com todos os campos.
  - Caso o email e o nome exista, retornar erro.
- **Validação de acessos**
  - .
### Login de Utilizador
- **Programa:** Login de Utilizador
- **Descrição:** Verificação credenciais e retornar token de acesso.
- **Validação de campos:**
  - O nome de utilizador e a password não pode estar vazio.
- **Validação de cálculos**
  - Deve comparar a senha fornecida com o hash armazenado.
- **Validação de Registo**
  - Retornar o token JWT e armazenar no armazenamento local.
  - Retornar falha caso a senha seja inválida ou o utilizador não exista
- **Validação de acessos**
  - .

### Atualização de Dados de Utilizador
- **Programa:** Atualização de dados do Utilizador
- **Descrição:** Modificar dados do utilizador
- **Validação de campos:**
  - O nome de utilizador, email e password não podem estar vazios.
  -  O email e nome de utilizador devem ser únicos.
  -  O campo email deve ser válido
- **Validação de cálculos**
  - Deve gerar um ID único automáticamente.
  - A data de criação deve ser a data atual do sistema.
- **Validação de Registo**
  - O utilizador deve ser registado na base de dados com todos os campos.
  - Caso o email e o nome exista, retornar erro.
- **Validação de acessos**
  - Apenas o Administrador pode atualizar as informações

### Exclusão de Utilizador
- **Programa:** Atualização de dados do Utilizador
- **Descrição:** Modificar dados do utilizador
- **Validação de campos:**
  - O ID deve existir e ser válido.
- **Validação de Registo**
  - O utilizador deve ser removido da base de dados.
  - Se não existir o id, retornar erro.
- **Validação de acessos**
  - Apenas o Administrador pode atualizar as informações

### Consulta de Utilizador
- **Programa:** Listar todos os utilizadores
- **Descrição:** Ver todos os utilizadores logados.
- **Validação de Registo**
  - O resultado deve ser um array de utilizadores 
- **Validação de acessos**
  - Apenas o Administrador pode atualizar as informações
