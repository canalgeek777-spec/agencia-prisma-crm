import { useState, createContext, useContext } from "react";

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

const ROLES = {
  master: {
    label: "Master",
    color: "#f59e0b",
    icon: "M",
    desc: "Acesso total ao sistema",
    pages: ["dashboard", "prospeccao", "clientes", "projetos", "agenda", "financeiro", "usuarios"],
    can: { view: true, create: true, edit: true, delete: true, finance: true, users: true }
  },
  gestor: {
    label: "Gestor",
    color: "#a78bfa",
    icon: "G",
    desc: "Acesso completo exceto usuarios e financeiro",
    pages: ["dashboard", "prospeccao", "clientes", "projetos", "agenda", "financeiro"],
    can: { view: true, create: true, edit: true, delete: false, finance: true, users: false }
  },
  operacional: {
    label: "Operacional",
    color: "#22d3ee",
    icon: "O",
    desc: "Executa tarefas, ve projetos e agenda",
    pages: ["dashboard", "projetos", "agenda"],
    can: { view: true, create: false, edit: true, delete: false, finance: false, users: false }
  },
  comercial: {
    label: "Comercial",
    color: "#4ade80",
    icon: "C",
    desc: "Gerencia prospeccao e clientes",
    pages: ["dashboard", "prospeccao", "clientes"],
    can: { view: true, create: true, edit: true, delete: false, finance: false, users: false }
  }
};

const INITIAL_USERS = [
  { id: 1, nome: "Voce (Master)", email: "master@agencia.com", senha: "master123", role: "master", ativo: true, criado: "2026-01-01", avatar: "VM" },
  { id: 2, nome: "Ana Gestora", email: "ana@agencia.com", senha: "ana123", role: "gestor", ativo: true, criado: "2026-02-10", avatar: "AG" },
  { id: 3, nome: "Carlos Dev", email: "carlos@agencia.com", senha: "carlos123", role: "operacional", ativo: true, criado: "2026-03-05", avatar: "CD" },
  { id: 4, nome: "Julia Comercial", email: "julia@agencia.com", senha: "julia123", role: "comercial", ativo: true, criado: "2026-03-15", avatar: "JC" }
];

const initialData = {
  prospects: [
    { id: 1, nome: "Loja da Maria", segmento: "E-commerce", contato: "maria@loja.com", telefone: "(11) 99999-1111", status: "Novo Lead", valor: 2500, origem: "Instagram" },
    { id: 2, nome: "Clinica Sorriso", segmento: "Saude", contato: "dr.carlos@clinica.com", telefone: "(11) 98888-2222", status: "Proposta Enviada", valor: 3800, origem: "Indicacao" }
  ],
  clientes: [
    { id: 1, nome: "Pet Shop Amigo Fiel", segmento: "Pet", contato: "ana@petshop.com", telefone: "(11) 96666-4444", plano: "Profissional", valor: 3200 }
  ],
  projetos: [
    { id: 1, cliente: "Pet Shop", nome: "Campanhas Meta Q2", status: "Em Andamento", progresso: 35 }
  ],
  agenda: [],
  financeiro: { receitas: [], despesas: [] }
};

const S = {
  app: { display: "flex", height: "100vh", background: "#070b14", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" },
  sidebar: { width: 236, background: "#0a0f1a", borderRight: "1px solid #1a2535", display: "flex", flexDirection: "column", flexShrink: 0 },
  logo: { padding: "20px 18px 16px", borderBottom: "1px solid #1a2535" },
  content: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { padding: "16px 28px", borderBottom: "1px solid #1a2535", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0f1a" },
  headerTitle: { fontSize: 20, fontWeight: 800, color: "#fff" },
  main: { flex: 1, overflow: "auto", padding: "24px 28px" },
  card: { background: "#0a0f1a", border: "1px solid #1a2535", borderRadius: 14, padding: 20 },
  kpi: { background: "#0a0f1a", border: "1px solid #1a2535", borderRadius: 14, padding: "18px 20px" },
  kpiLabel: { fontSize: 10, color: "#3b5068", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 },
  kpiValue: { fontSize: 26, fontWeight: 800, color: "#fff" },
  input: { background: "#070b14", border: "1px solid #1a2535", borderRadius: 8, padding: "9px 13px", color: "#e2e8f0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#2563eb", color: "#fff" }
};

function Login({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handle = () => {
    const u = users.find(u => u.email === email && u.senha === senha && u.ativo);
    if (u) { onLogin(u); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070b14", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 400, background: "#0a0f1a", border: "1px solid #1a2535", borderRadius: 18, padding: 34 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 22, textAlign: "center" }}>Agencia Prisma CRM</div>
        <input style={{ ...S.input, marginBottom: 12 }} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={{ ...S.input, marginBottom: 22 }} type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
        <button onClick={handle} style={{ ...S.btn, width: "100%", padding: "11px" }}>Entrar</button>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const { user } = useAuth();
  return (
    <div>
      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Bem-vindo, {user.nome}!</div>
        <div style={{ fontSize: 13, color: "#3b5068", marginTop: 8 }}>Seu perfil: {ROLES[user.role].label}</div>
      </div>
    </div>
  );
}

function Prospeccao({ data }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Prospeccao</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total de leads: {data.length}</div>
    </div>
  );
}

function Clientes({ data }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Clientes</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total de clientes: {data.length}</div>
    </div>
  );
}

function Projetos({ data }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Projetos</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total de projetos: {data.length}</div>
    </div>
  );
}

function Agenda({ data }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Agenda</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total de eventos: {data.length}</div>
    </div>
  );
}

function Financeiro({ data }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Financeiro</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Modulo financeiro</div>
    </div>
  );
}

function Usuarios({ users }) {
  return (
    <div style={S.card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Usuarios</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Total de usuarios: {users.length}</div>
    </div>
  );
}

const ALL_PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "D" },
  { id: "prospeccao", label: "Prospeccao", icon: "P" },
  { id: "clientes", label: "Clientes", icon: "C" },
  { id: "projetos", label: "Projetos", icon: "J" },
  { id: "agenda", label: "Agenda", icon: "A" },
  { id: "financeiro", label: "Financeiro", icon: "F" },
  { id: "usuarios", label: "Usuarios", icon: "U" }
];

export default function App() {
  const [users] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [data] = useState(initialData);

  if (!currentUser) {
    return <Login users={users} onLogin={u => { setCurrentUser(u); }} />;
  }

  const role = ROLES[currentUser.role];
  const visiblePages = ALL_PAGES.filter(p => role.pages.includes(p.id));

  return (
    <AuthCtx.Provider value={{ user: currentUser, users }}>
      <div style={S.app}>
        <div style={S.sidebar}>
          <div style={S.logo}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Agencia Prisma</div>
          </div>
          <nav style={{ padding: "10px 0", flex: 1 }}>
            {visiblePages.map(p => (
              <div key={p.id} style={{ padding: "9px 20px", cursor: "pointer", color: page === p.id ? "#93c5fd" : "#4a6070", background: page === p.id ? "#1d4ed833" : "transparent" }} onClick={() => setPage(p.id)}>
                {p.label}
              </div>
            ))}
          </nav>
          <div style={{ padding: "14px 16px", borderTop: "1px solid #1a2535" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{currentUser.nome}</div>
            <button onClick={() => setCurrentUser(null)} style={{ ...S.btn, width: "100%", marginTop: 10 }}>Sair</button>
          </div>
        </div>

        <div style={S.content}>
          <div style={S.header}>
            <div style={S.headerTitle}>{page.charAt(0).toUpperCase() + page.slice(1)}</div>
          </div>
          <div style={S.main}>
            {page === "dashboard" && <Dashboard data={data} />}
            {page === "prospeccao" && <Prospeccao data={data.prospects} />}
            {page === "clientes" && <Clientes data={data.clientes} />}
            {page === "projetos" && <Projetos data={data.projetos} />}
            {page === "agenda" && <Agenda data={data.agenda} />}
            {page === "financeiro" && <Financeiro data={data.financeiro} />}
            {page === "usuarios" && <Usuarios users={users} />}
          </div>
        </div>
      </div>
    </AuthCtx.Provider>
  );
}