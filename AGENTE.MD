# AGENTS.md — Sistema de Gerenciamento de Treinos CT

Você está trabalhando no backend do Sistema de Gerenciamento de Treinos CT.

## Fonte da verdade

Antes de criar ou alterar funcionalidades, consulte o documento:

`Documento_Requisitos_CT.docx`

Não invente regra de negócio fora desse documento.

O sistema deve atender aos requisitos: cadastro/edição de cronogramas semanais, visualização de treino do dia, autenticação com perfis Administrador e Instrutor, e persistência em banco local. 

## Stack

- Java 21
- Spring Boot
- Maven
- Spring Web
- Spring Data JPA
- Spring Security
- Validation
- Lombok
- MySQL ou H2 para ambiente local

## Arquitetura

Siga a estrutura:

- `entity/` → entidades JPA
- `repository/` → acesso ao banco
- `service/` → regras de negócio
- `controller/` → endpoints REST
- `dto/` → request/response
- `security/` → autenticação e autorização
- `config/` → configurações
- `exception/` → tratamento de erros

Controllers não devem conter regra de negócio.
Services concentram validações e regras.
Repositories não devem conter lógica de negócio.

## Perfis de usuário

Existem dois perfis:

- `ADMIN`: pode criar, editar e excluir cronogramas
- `INSTRUTOR`: pode apenas visualizar cronogramas

## Entidades iniciais

Crie inicialmente:

### Usuario

Campos sugeridos:

- id
- nome
- email
- senha
- perfil

### CronogramaTreino

Campos sugeridos:

- id
- diaSemana
- modalidade
- pilar
- descricao
- ativo
- criadoEm
- atualizadoEm

### Enums

- PerfilUsuario: `ADMIN`, `INSTRUTOR`
- Modalidade: `FUNCIONAL`, `MF_COMBATE`, `TAEKWONDO`, `ALTO_RENDIMENTO`
- DiaSemana: `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`, `DOMINGO`

## Regras de negócio

Implemente as regras:

- Um cronograma precisa ter pelo menos um pilar/conteúdo.
- Apenas ADMIN pode criar, editar ou excluir cronogramas.
- INSTRUTOR tem acesso somente leitura.
- O cronograma é organizado por semana e dia da semana.
- Não permitir dois cronogramas ativos para o mesmo dia e modalidade.

## Endpoints iniciais

Crie os seguintes endpoints REST:

### Autenticação

- `POST /api/auth/login`

### Cronogramas

- `POST /api/cronogramas`
- `GET /api/cronogramas`
- `GET /api/cronogramas/hoje`
- `GET /api/cronogramas/{id}`
- `PUT /api/cronogramas/{id}`
- `DELETE /api/cronogramas/{id}`

## Segurança

- Use Spring Security.
- Libere apenas `/api/auth/login`.
- Todas as outras rotas precisam de autenticação.
- Rotas de criação, edição e exclusão são exclusivas para ADMIN.
- Rotas de visualização podem ser acessadas por ADMIN e INSTRUTOR.

## Integração com Frontend

O frontend será feito no Lovable/React.

Configure CORS para permitir requisições do frontend local:

- `http://localhost:3000`
- `http://localhost:5173`

A API deve retornar JSON simples e amigável para consumo pelo React.

## Banco de dados

Configure ambiente local com H2 ou MySQL.

Se usar H2, deixe o console habilitado apenas em desenvolvimento.

Se usar MySQL, use variáveis no `application.yml`.

## Validações

Use Bean Validation:

- campos obrigatórios com `@NotBlank`
- enums obrigatórios com `@NotNull`
- email válido com `@Email`

## Padrão de resposta

Use DTOs para entrada e saída.

Não retorne entidades diretamente nos controllers.

## Tratamento de erros

Crie tratamento global com `@RestControllerAdvice`.

Retorne mensagens claras para erros de validação, acesso negado e recurso não encontrado.

## Tarefa inicial

Estruture o projeto Spring Boot completo com:

1. Pacotes principais
2. Entidades
3. Enums
4. Repositories
5. DTOs
6. Services
7. Controllers
8. Configuração inicial de segurança
9. Configuração de CORS
10. Arquivo `application.yml`
11. Dados iniciais para teste, se necessário

Não implemente funcionalidades fora do documento de requisitos.