# LISTA DE VALIDAÇÕES

## Validações de Registo e login
- O sistema deve validar se o e-mail tem um dominio válido (ex: @hotmail, @gmail, @sapo, etc).
- As senhas devem ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número.
- O login deve validar a combinação correta de e-mail e senha.
- Deve haver confirmação por e-mail ou aprovação administrativa antes do primeiro acesso.

## Validações de Perfil de Aluno
- Alunos têm acesso apenas como visualizadores.
- Perfis devem conter dados mínimos obrigatórios: nome completo, e-mail, cargo (professor/aluno).

- ## Validações de Perfil de Professor
- Apenas professores podem publicar vídeos.
- Só estes conseguem consultar as estatisticas do vídeo.
- Perfis devem conter dados mínimos obrigatórios: nome completo, e-mail, cargo (professor/aluno) e qual o seu respetivo curso associado.

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

## Validações de Acesso ao Conteúdo
- ??????????????????????? Apenas alunos matriculados no curso correspondente podem visualizar os vídeos ??????????????????????????????????????????????????????????????
- O sistema vai registrar o histórico de visualização do aluno.
- Tem de ser possível pausar, avançar e retomar vídeos do ponto onde foi parado.

## Validações de Comentários e Feedback
- Apenas utilizadores autenticados podem comentar nos vídeos.
- Comentários tem um limite mínimo e máximo de caracteres.
- Comentários ofensivos ou com palavras-chave proibidas devem ser bloqueados ou sinalizados.
- Os alunos devem poder avaliar o conteúdo (ex: 1 a 5 estrelas).

## Validações Administrativas e de Moderação
- O admin pode aprovar ou remover conteúdos que não estejam em conformidade com o plano pedagógico.
- O admin tem acesso a um painel para gestão de usuários, conteúdos e estatísticas.
- Estatísticas (número de visualizações, interações) devem ser atualizadas em tempo real.
