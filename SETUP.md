# Agência Prisma CRM — guia de setup do Supabase

Este projeto foi restaurado a partir do histórico do repositório (commit
`1e3afb5`, de 15/04/2026) e religado a um Supabase de verdade: login,
papéis, prospecção, clientes, projetos, agenda e financeiro agora leem e
gravam em tabelas reais, não em arrays mockados.

O projeto já aponta para o seu projeto Supabase (`.env`), então falta só
rodar o schema e publicar a função de gestão de usuários.

## 1. Rodar o schema

1. Abra https://supabase.com/dashboard → seu projeto → **SQL Editor** → **New query**.
2. Cole o conteúdo de `supabase/schema.sql` inteiro e clique em **Run**.

Isso cria:
- as tabelas `role_capabilities`, `profiles`, `prospects`, `clientes`, `projetos`, `agenda`, `financeiro_receitas`, `financeiro_despesas`;
- as políticas de RLS que espelham o objeto `ROLES.can` do frontend (quem pode ver/criar/editar/excluir/ver financeiro/gerenciar usuários);
- um trigger que cria automaticamente uma linha em `profiles` sempre que uma conta é criada em `auth.users`;
- um trigger que impede qualquer pessoa sem ser Master de alterar `role`/`ativo` de um perfil;
- os mesmos dados de exemplo que já existiam na versão mockada (leads, clientes, projetos, agenda, financeiro);
- **as 4 contas de demonstração** (`master@agencia.com` / `master123`, etc.), criadas diretamente como usuários reais do Supabase Auth com a mesma senha que já aparecia na tela de login.

> O bloco que cria as contas de demo só roda se elas ainda não existirem
> (`if not exists`), então é seguro rodar o script mais de uma vez.

### Se preferir criar as contas pelo painel em vez de SQL

Caso não queira que o script mexa em `auth.users` diretamente, comente a
seção 9 do `schema.sql` e crie as contas manualmente em **Authentication
→ Users → Add user**, marcando "Auto Confirm User" e preenchendo em
**User Metadata** um JSON como:

```json
{ "nome": "Ana Gestora", "role": "gestor", "avatar": "AG" }
```

O trigger `on_auth_user_created` lê esses campos para montar o `profiles`
automaticamente.

## 2. Publicar a Edge Function `manage-user`

Criar, editar e excluir usuários (tela **Usuários**, só visível para o
papel Master) precisa de privilégio de admin sobre o Supabase Auth — algo
que a chave pública (`anon`) nunca pode ter. Por isso essa parte roda numa
Edge Function, com a *service role key*, que fica só no servidor.

```bash
npx supabase login
npx supabase link --project-ref lifwewbocbsmcscgyogx
npx supabase functions deploy manage-user
```

Não é preciso configurar `SUPABASE_URL` nem `SUPABASE_SERVICE_ROLE_KEY`
manualmente — o Supabase injeta essas variáveis automaticamente em toda
Edge Function do projeto.

## 3. Rodar o projeto localmente

```bash
npm install
npm start
```

As variáveis `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY` já
estão no `.env`. Entre com qualquer uma das contas de demo mostradas na
própria tela de login.

## 4. O que mudou em relação à versão mockada

| Antes | Agora |
|---|---|
| `INITIAL_USERS` / `initialData` em memória, perdidos a cada F5 | Tabelas reais no Postgres do Supabase |
| Login comparando e-mail/senha em texto puro dentro do bundle JS | `supabase.auth.signInWithPassword`, senha nunca trafega em texto legível nem fica em uma tabela lida pelo cliente |
| Qualquer pessoa no navegador podia ler todas as senhas abrindo o DevTools | Senhas ficam só no `auth.users` do Supabase, inacessível pela `anon key` |
| Criar/editar/apagar usuário só mexia no state local | Passa pela Edge Function `manage-user`, que confere no servidor se quem está chamando é Master antes de tocar em qualquer conta |
| Nenhuma trava real — dava pra editar o objeto `can` no DevTools e liberar tudo | RLS no Postgres é a barreira de verdade: mesmo alguém adulterando o frontend não consegue inserir/editar/excluir fora do que o papel permite |

## 5. Antes de usar isso para valer (não só como demo)

- Troque as senhas das 4 contas de demonstração — elas estão públicas neste repositório.
- Revise a lista `DEMO_ACCOUNTS` em `src/App.jsx` (usada só para preencher a tela de login) e remova-a se o CRM for para produção.
- Se quiser, adicione confirmação de e-mail obrigatória em **Authentication → Settings** — hoje as contas são criadas com `email_confirm: true` para simplificar a demonstração.
