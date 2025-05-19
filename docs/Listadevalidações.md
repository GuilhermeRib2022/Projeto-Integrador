# LISTA DE VALIDAÇÕES

## Validações de Registo e login
- O sistema deve validar se o e-mail informado é institucional (ex: termina com @instituicao.edu).
- O aluno só poderá cadastrar-se se for autorizado pela instituição.
- As senhas devem ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número.
- O login deve validar a combinação correta de e-mail e senha.
- Deve haver confirmação por e-mail ou aprovação administrativa antes do primeiro acesso.

## Validações de Perfil
- Apenas professores podem publicar vídeos.
- Alunos têm acesso apenas como visualizadores.
- Perfis devem conter dados mínimos obrigatórios: nome completo, e-mail, cargo (docente/aluno), e curso associado.

## Validações de Publicação de Conteúdo
- Qualquer vídeo deve estar associado obrigatoriamente a um curso e a uma disciplina.
- O sistema deve validar se o vídeo enviado está num formato suportado (ex: .mp4, .mov).
- Qual vídeo tem que conter um títulos e uma descrição, os vídeos devem ter tamanho mínimo e máximo (ex: título mínimo 5 caracteres, máximo 100).
- O vídeo deve passar por uma análise prévia (do administrador) antes de ser publicado.
- Cada professor só pode publicar vídeos em disciplinas que leciona.

## Validações de Organização de Conteúdo
- Os cursos e disciplinas devem estar previamente introduzidos no sistema.
- Um vídeo não pode ser publicado sem disciplina associada.
- Pode-se filtrar vídeos por curso, disciplina, professor e data.
- Os vídeos duplicados (mesmo título e disciplina) devem ser sinalizados.

