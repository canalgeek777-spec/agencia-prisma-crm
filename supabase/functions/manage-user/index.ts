// ═══════════════════════════════════════════════════════════════════════
// Edge Function: manage-user
// ───────────────────────────────────────────────────────────────────────
// Cria, edita e remove contas de usuário do CRM. Precisa da service role
// key (nunca exposta ao navegador) porque criar/apagar contas de auth só
// é possível com privilégio de admin. Só quem já está logado como Master
// (role "master" no profiles) pode chamar esta função — a verificação é
// feita aqui dentro, não confie no que o frontend manda.
//
// Deploy:
//   supabase functions deploy manage-user
//
// Chamada pelo frontend:
//   supabase.functions.invoke('manage-user', { body: { action: 'create', ... } })
// ═══════════════════════════════════════════════════════════════════════
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) identifica quem está chamando pelo token que o supabase-js já
  //    injeta automaticamente no header Authorization
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Não autenticado" }, 401);

  const { data: callerAuth, error: callerErr } = await admin.auth.getUser(jwt);
  if (callerErr || !callerAuth?.user) return json({ error: "Sessão inválida" }, 401);

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerAuth.user.id)
    .single();

  const { data: caps } = await admin
    .from("role_capabilities")
    .select("can_users")
    .eq("role", callerProfile?.role ?? "")
    .single();

  if (!caps?.can_users) {
    return json({ error: "Apenas o perfil Master pode gerenciar usuários" }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corpo da requisição inválido" }, 400);
  }

  const action = payload.action as string;

  try {
    if (action === "create") {
      const { email, senha, nome, role, avatar } = payload as Record<string, string>;
      if (!email || !senha || !nome || !role) return json({ error: "Campos obrigatórios faltando" }, 400);

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome,
          role,
          avatar: avatar || nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
          ativo: true,
        },
      });
      if (error) return json({ error: error.message }, 400);
      return json({ user: data.user });
    }

    if (action === "update") {
      const { id, nome, role, ativo, senha } = payload as Record<string, unknown>;
      if (!id) return json({ error: "id é obrigatório" }, 400);

      if (senha) {
        const { error: pwErr } = await admin.auth.admin.updateUserById(id as string, { password: senha as string });
        if (pwErr) return json({ error: pwErr.message }, 400);
      }

      const updateFields: Record<string, unknown> = {};
      if (typeof nome === "string") updateFields.nome = nome;
      if (typeof role === "string") updateFields.role = role;
      if (typeof ativo === "boolean") updateFields.ativo = ativo;

      if (Object.keys(updateFields).length > 0) {
        const { error: profErr } = await admin.from("profiles").update(updateFields).eq("id", id);
        if (profErr) return json({ error: profErr.message }, 400);
      }
      return json({ ok: true });
    }

    if (action === "delete") {
      const { id } = payload as Record<string, string>;
      if (!id) return json({ error: "id é obrigatório" }, 400);
      if (id === callerAuth.user.id) return json({ error: "Você não pode excluir sua própria conta" }, 400);

      const { data: targetProfile } = await admin.from("profiles").select("role").eq("id", id).single();
      if (targetProfile?.role === "master") return json({ error: "Não é possível excluir a conta Master" }, 400);

      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: `Ação desconhecida: ${action}` }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado" }, 500);
  }
});
