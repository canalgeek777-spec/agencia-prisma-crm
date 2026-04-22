import { useState, useCallback, createContext, useContext } from “react”;

// ── CSS RESET (remove bordas brancas do browser) ─────
const globalCSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body,#root{width:100%;height:100%;overflow:hidden;background:#070b14}`;

// ── LOGO ─────────────────────────────────────────────
const LOGO_B64 = “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”;
const LogoImg = ({ size=32 }) => (
<img src={`data:image/png;base64,${LOGO_B64}`} alt=“Prisma”
style={{ width:size, height:size, objectFit:“contain”, display:“block” }} />
);

// ── AUTH ──────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ── ROLES ─────────────────────────────────────────────
const ROLES = {
master:{
label:“Master”,color:”#f59e0b”,icon:“👑”,
desc:“Acesso total ao sistema”,
pages:[“dashboard”,“prospeccao”,“clientes”,“projetos”,“agenda”,“financeiro”,“usuarios”],
can:{view:true,create:true,edit:true,delete:true,finance:true,users:true}
},
gestor:{
label:“Gestor”,color:”#a78bfa”,icon:“🎯”,
desc:“Acesso completo exceto usuários”,
pages:[“dashboard”,“prospeccao”,“clientes”,“projetos”,“agenda”,“financeiro”],
can:{view:true,create:true,edit:true,delete:false,finance:true,users:false}
},
operacional:{
label:“Operacional”,color:”#22d3ee”,icon:“⚙️”,
desc:“Projetos e agenda”,
pages:[“dashboard”,“projetos”,“agenda”],
can:{view:true,create:false,edit:true,delete:false,finance:false,users:false}
},
comercial:{
label:“Comercial”,color:”#4ade80”,icon:“📈”,
desc:“Prospecção e clientes”,
pages:[“dashboard”,“prospeccao”,“clientes”],
can:{view:true,create:true,edit:true,delete:false,finance:false,users:false}
},
financeiro_role:{
label:“Financeiro”,color:”#fb923c”,icon:“💰”,
desc:“Módulo financeiro”,
pages:[“dashboard”,“financeiro”],
can:{view:true,create:true,edit:true,delete:false,finance:true,users:false}
},
visualizador:{
label:“Visualizador”,color:”#64748b”,icon:“👁️”,
desc:“Somente leitura”,
pages:[“dashboard”,“prospeccao”,“clientes”,“projetos”,“agenda”],
can:{view:true,create:false,edit:false,delete:false,finance:false,users:false}
},
};

const INITIAL_USERS = [
{id:1,nome:“Você (Master)”,email:“master@agencia.com”,senha:“master123”,role:“master”,ativo:true,criado:“2026-01-01”,avatar:“VM”},
{id:2,nome:“Ana Gestora”,email:“ana@agencia.com”,senha:“ana123”,role:“gestor”,ativo:true,criado:“2026-02-10”,avatar:“AG”},
{id:3,nome:“Carlos Dev”,email:“carlos@agencia.com”,senha:“carlos123”,role:“operacional”,ativo:true,criado:“2026-03-05”,avatar:“CD”},
{id:4,nome:“Julia Comercial”,email:“julia@agencia.com”,senha:“julia123”,role:“comercial”,ativo:true,criado:“2026-03-15”,avatar:“JC”},
];

const initialData = {
prospects:[
{id:1,nome:“Loja da Maria”,segmento:“E-commerce”,contato:“maria@loja.com”,telefone:”(11) 99999-1111”,status:“Novo Lead”,valor:2500,origem:“Instagram”,dataCriacao:“2026-03-20”,notas:“Interesse em tráfego pago”,observacoes:””},
{id:2,nome:“Clínica Sorriso”,segmento:“Saúde”,contato:“dr.carlos@clinica.com”,telefone:”(11) 98888-2222”,status:“Proposta Enviada”,valor:3800,origem:“Indicação”,dataCriacao:“2026-03-22”,notas:“Captação de pacientes”,observacoes:””},
{id:3,nome:“Academia FitLife”,segmento:“Fitness”,contato:“joao@fitlife.com”,telefone:”(11) 97777-3333”,status:“Negociando”,valor:1800,origem:“Google”,dataCriacao:“2026-03-28”,notas:“Foco em Meta Ads”,observacoes:””},
],
clientes:[
{id:1,nome:“Pet Shop Amigo Fiel”,segmento:“Pet”,contato:“ana@petshop.com”,telefone:”(11) 96666-4444”,plano:“Profissional”,valor:3200,inicio:“2026-01-15”,status:“Ativo”,investimento:5000,urlSite:””,urlAds:””,urlRelatorio:””,urlDrive:””,comentarios:[]},
{id:2,nome:“Restaurante Sabor & Arte”,segmento:“Food”,contato:“chef@sabor.com”,telefone:”(11) 95555-5555”,plano:“Starter”,valor:1500,inicio:“2026-02-01”,status:“Ativo”,investimento:2000,urlSite:””,urlAds:””,urlRelatorio:””,urlDrive:””,comentarios:[]},
{id:3,nome:“Imobiliária Premium”,segmento:“Imóveis”,contato:“renata@premium.com”,telefone:”(11) 94444-6666”,plano:“Enterprise”,valor:6500,inicio:“2025-11-01”,status:“Ativo”,investimento:15000,urlSite:””,urlAds:””,urlRelatorio:””,urlDrive:””,comentarios:[]},
],
projetos:[
{id:1,cliente:“Pet Shop Amigo Fiel”,nome:“Campanhas Meta Q2”,status:“Em Andamento”,inicio:“2026-04-01”,fim:“2026-06-30”,progresso:35,tarefas:[“Criar criativos”,“Configurar campanhas”,“Relatório semanal”,“Otimização”],tarefasConcluidas:[0]},
{id:2,cliente:“Restaurante Sabor & Arte”,nome:“Google Ads Launch”,status:“Em Revisão”,inicio:“2026-03-15”,fim:“2026-05-15”,progresso:70,tarefas:[“Pesquisa de palavras-chave”,“Criar anúncios”,“Landing page”,“Tracking”],tarefasConcluidas:[0,1,2]},
{id:3,cliente:“Imobiliária Premium”,nome:“Funil de Captação”,status:“Planejamento”,inicio:“2026-04-10”,fim:“2026-07-10”,progresso:10,tarefas:[“Briefing”,“Estratégia”,“Criativos”,“Go-live”],tarefasConcluidas:[]},
],
agenda:[
{id:1,titulo:“Reunião de resultado - Pet Shop”,data:“2026-04-07”,hora:“10:00”,tipo:“Reunião”,cliente:“Pet Shop Amigo Fiel”,descricao:“Apresentar relatório de março”},
{id:2,titulo:“Entrega de criativos - Restaurante”,data:“2026-04-08”,hora:“14:00”,tipo:“Entrega”,cliente:“Restaurante Sabor & Arte”,descricao:“Enviar pack de criativos”},
{id:3,titulo:“Call de prospecção - Academia”,data:“2026-04-09”,hora:“09:00”,tipo:“Prospecção”,cliente:“Academia FitLife”,descricao:“Apresentar proposta comercial”},
{id:4,titulo:“Relatório mensal - Imobiliária”,data:“2026-04-10”,hora:“16:00”,tipo:“Relatório”,cliente:“Imobiliária Premium”,descricao:“Dashboard de resultados de março”},
],
financeiro:{
receitas:[
{id:1,descricao:“Mensalidade - Pet Shop Amigo Fiel”,valor:3200,data:“2026-04-01”,status:“Recebido”,categoria:“Mensalidade”},
{id:2,descricao:“Mensalidade - Restaurante Sabor & Arte”,valor:1500,data:“2026-04-01”,status:“Recebido”,categoria:“Mensalidade”},
{id:3,descricao:“Mensalidade - Imobiliária Premium”,valor:6500,data:“2026-04-05”,status:“Pendente”,categoria:“Mensalidade”},
{id:4,descricao:“Setup - Academia FitLife”,valor:800,data:“2026-04-12”,status:“Pendente”,categoria:“Setup”},
],
despesas:[
{id:1,descricao:“Ferramentas SaaS”,valor:890,data:“2026-04-01”,categoria:“Ferramentas”},
{id:2,descricao:“Freelancer - Designer”,valor:1200,data:“2026-04-05”,categoria:“Equipe”},
{id:3,descricao:“Escritório”,valor:600,data:“2026-04-10”,categoria:“Infraestrutura”},
]
}
};

// ── HELPERS ───────────────────────────────────────────
const SC = {
“Novo Lead”:”#22d3ee”,“Proposta Enviada”:”#f59e0b”,“Negociando”:”#a78bfa”,“Fechado”:”#4ade80”,“Perdido”:”#f87171”,
“Em Andamento”:”#22d3ee”,“Em Revisão”:”#f59e0b”,“Planejamento”:”#a78bfa”,“Concluído”:”#4ade80”,
“Ativo”:”#4ade80”,“Pausado”:”#f59e0b”,“Inativo”:”#f87171”,
“Recebido”:”#4ade80”,“Pendente”:”#f59e0b”,“Atrasado”:”#f87171”,
“Reunião”:”#a78bfa”,“Entrega”:”#22d3ee”,“Prospecção”:”#f59e0b”,“Execução”:”#4ade80”,“Relatório”:”#fb923c”
};
const TI = {“Reunião”:“🎯”,“Entrega”:“📦”,“Prospecção”:“📞”,“Execução”:“⚙️”,“Relatório”:“📊”};
const fmt = v => v?.toLocaleString(“pt-BR”,{style:“currency”,currency:“BRL”});

// ── STYLES ────────────────────────────────────────────
const S = {
app:{display:“flex”,width:“100%”,height:“100%”,background:”#070b14”,color:”#e2e8f0”,fontFamily:”‘DM Sans’,sans-serif”,overflow:“hidden”},
sidebar:{width:236,background:”#0a0f1a”,borderRight:“1px solid #1a2535”,display:“flex”,flexDirection:“column”,flexShrink:0},
logo:{padding:“20px 18px 16px”,borderBottom:“1px solid #1a2535”},
nav:{padding:“10px 0”,flex:1,overflowY:“auto”},
navSec:{fontSize:9,color:”#2d3f54”,textTransform:“uppercase”,letterSpacing:2,fontWeight:700,padding:“14px 20px 6px”},
navItem:a=>({display:“flex”,alignItems:“center”,gap:10,padding:“9px 20px”,cursor:“pointer”,borderRadius:“0 22px 22px 0”,marginRight:10,marginBottom:1,background:a?“linear-gradient(90deg,#1d4ed833,#1d4ed800)”:“transparent”,borderLeft:a?“2px solid #3b82f6”:“2px solid transparent”,color:a?”#93c5fd”:”#4a6070”,fontWeight:a?600:400,fontSize:13}),
content:{flex:1,display:“flex”,flexDirection:“column”,overflow:“hidden”,minWidth:0},
header:{padding:“16px 28px”,borderBottom:“1px solid #1a2535”,display:“flex”,alignItems:“center”,justifyContent:“space-between”,background:”#0a0f1a”,flexShrink:0},
main:{flex:1,overflow:“auto”,padding:“24px 28px”},
card:{background:”#0a0f1a”,border:“1px solid #1a2535”,borderRadius:14,padding:20},
grid:c=>({display:“grid”,gridTemplateColumns:`repeat(${c},1fr)`,gap:14}),
kpi:{background:”#0a0f1a”,border:“1px solid #1a2535”,borderRadius:14,padding:“18px 20px”},
kL:{fontSize:10,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1.5,fontWeight:700},
kV:{fontSize:26,fontWeight:800,color:”#fff”,letterSpacing:-1,margin:“6px 0 2px”},
kS:{fontSize:11,color:”#3b5068”},
table:{width:“100%”,borderCollapse:“collapse”},
th:{textAlign:“left”,padding:“9px 14px”,fontSize:9,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1.5,borderBottom:“1px solid #1a2535”,fontWeight:700},
td:{padding:“11px 14px”,fontSize:13,borderBottom:“1px solid #0c1420”,color:”#94a3b8”},
btn:(v=“primary”)=>({padding:“8px 16px”,borderRadius:8,border:“none”,cursor:“pointer”,fontSize:12,fontWeight:700,background:v===“primary”?”#2563eb”:v===“danger”?”#7f1d1d”:v===“ghost”?“transparent”:”#131e2e”,color:v===“ghost”?”#4a6070”:v===“danger”?”#fca5a5”:”#fff”}),
inp:{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:8,padding:“9px 13px”,color:”#e2e8f0”,fontSize:13,outline:“none”,width:“100%”,boxSizing:“border-box”},
sel:{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:8,padding:“9px 13px”,color:”#e2e8f0”,fontSize:13,outline:“none”,width:“100%”,boxSizing:“border-box”},
modal:{position:“fixed”,inset:0,background:”#000b”,display:“flex”,alignItems:“center”,justifyContent:“center”,zIndex:999},
mbox:{background:”#0a0f1a”,border:“1px solid #1a2535”,borderRadius:16,padding:30,width:540,maxHeight:“88vh”,overflowY:“auto”},
lbl:{fontSize:10,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1,fontWeight:700,display:“block”,marginBottom:6},
frow:{marginBottom:15},
tag:(c=”#3b82f6”)=>({background:c+“22”,color:c,border:`1px solid ${c}44`,borderRadius:6,padding:“2px 8px”,fontSize:10,fontWeight:700}),
badge:l=>({background:(SC[l]||”#64748b”)+“22”,color:SC[l]||”#94a3b8”,border:`1px solid ${SC[l]||"#64748b"}44`,borderRadius:20,padding:“2px 10px”,fontSize:11,fontWeight:700}),
prog:{height:5,background:”#131e2e”,borderRadius:10,overflow:“hidden”},
pbar:(p,c=”#3b82f6”)=>({height:“100%”,width:`${p}%`,background:c,borderRadius:10,transition:“width .5s”}),
av:(c=”#3b82f6”)=>({width:34,height:34,borderRadius:“50%”,background:c+“33”,border:`2px solid ${c}66`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:11,fontWeight:800,color:c,flexShrink:0}),
};

const Badge = ({label}) => <span style={S.badge(label)}>{label}</span>;

// ── INPUT CONTROLADO SEM LAG ───────────────────────────
// Usa estado local p/ evitar re-render do pai a cada tecla
function Field({label, value, onChange, type=“text”, placeholder=””, readOnly=false, multiline=false, rows=3}) {
const [local, setLocal] = useState(value ?? “”);
const handleChange = useCallback(e => {
setLocal(e.target.value);
onChange(e.target.value);
}, [onChange]);
const style = {…S.inp, …(readOnly?{opacity:0.5,cursor:“not-allowed”}:{})};
return (
<div style={S.frow}>
{label && <label style={S.lbl}>{label}</label>}
{multiline
? <textarea style={{…style,height:rows*32,resize:“none”}} value={local} onChange={handleChange} placeholder={placeholder} readOnly={readOnly} />
: <input style={style} type={type} value={local} onChange={handleChange} placeholder={placeholder} readOnly={readOnly} />
}
</div>
);
}

function SelField({label, value, onChange, options}) {
return (
<div style={S.frow}>
{label && <label style={S.lbl}>{label}</label>}
<select style={S.sel} value={value} onChange={e=>onChange(e.target.value)}>
{options.map(o=><option key={o}>{o}</option>)}
</select>
</div>
);
}

// ── MODAL ─────────────────────────────────────────────
function Modal({title,onClose,children,wide}) {
return (
<div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose()}>
<div style={{...S.mbox,width:wide?680:540}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:22}}>
<span style={{fontSize:17,fontWeight:800,color:”#fff”}}>{title}</span>
<button onClick={onClose} style={{background:“none”,border:“none”,color:”#4a6070”,fontSize:20,cursor:“pointer”}}>✕</button>
</div>
{children}
</div>
</div>
);
}

function Blocked() {
return <div style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,height:“60vh”,gap:12}}>
<div style={{fontSize:56}}>🔒</div>
<div style={{fontSize:18,fontWeight:800,color:”#fff”}}>Acesso Restrito</div>
<div style={{fontSize:13,color:”#4a6070”}}>Você não tem permissão para este módulo.</div>

  </div>;
}
function ReadOnly() {
  return <div style={{background:"#1a2535",border:"1px solid #2d3f54",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#4a6070",marginBottom:14}}>👁️ Modo somente leitura</div>;
}

// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
function Login({users,onLogin}) {
const [email,setEmail] = useState(””);
const [senha,setSenha] = useState(””);
const [erro,setErro] = useState(””);
const [show,setShow] = useState(false);
const handle = () => {
const u = users.find(u=>u.email===email&&u.senha===senha&&u.ativo);
if(u){onLogin(u);setErro(””);}
else setErro(“E-mail ou senha incorretos, ou usuário inativo.”);
};
return (
<div style={{display:“flex”,width:“100%”,height:“100%”,background:”#070b14”,alignItems:“center”,justifyContent:“center”,fontFamily:”‘DM Sans’,sans-serif”}}>
<div style={{width:400}}>
<div style={{textAlign:“center”,marginBottom:36}}>
<div style={{display:“flex”,justifyContent:“center”,marginBottom:14}}>
<div style={{background:“linear-gradient(135deg,#1a2535,#0d1420)”,border:“1px solid #1a2535”,borderRadius:20,padding:14}}>
<LogoImg size={52}/>
</div>
</div>
<div style={{fontSize:24,fontWeight:800,color:”#fff”,letterSpacing:-0.5}}>Agência Prisma</div>
<div style={{fontSize:11,color:”#3b5068”,letterSpacing:2.5,textTransform:“uppercase”,marginTop:4}}>CRM de Tráfego</div>
</div>
<div style={{background:”#0a0f1a”,border:“1px solid #1a2535”,borderRadius:18,padding:34}}>
<div style={{fontSize:15,fontWeight:700,color:”#fff”,marginBottom:22}}>Entrar na sua conta</div>
<Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seu@email.com"/>
<div style={{position:“relative”,marginBottom:15}}>
<label style={S.lbl}>Senha</label>
<div style={{position:“relative”}}>
<input style={{…S.inp,paddingRight:40}} type={show?“text”:“password”} placeholder=”••••••••”
value={senha} onChange={e=>{setSenha(e.target.value);setErro(””);}}
onKeyDown={e=>e.key===“Enter”&&handle()}/>
<button onClick={()=>setShow(!show)} style={{position:“absolute”,right:10,top:“50%”,transform:“translateY(-50%)”,background:“none”,border:“none”,color:”#4a6070”,cursor:“pointer”,fontSize:14}}>{show?“🙈”:“👁”}</button>
</div>
</div>
{erro&&<div style={{background:”#7f1d1d22”,border:“1px solid #7f1d1d”,borderRadius:8,padding:“8px 12px”,fontSize:12,color:”#fca5a5”,marginBottom:14}}>{erro}</div>}
<button onClick={handle} style={{…S.btn(),width:“100%”,padding:“11px”,fontSize:14,borderRadius:10}}>Entrar</button>
<div style={{marginTop:22,borderTop:“1px solid #1a2535”,paddingTop:18}}>
<div style={{fontSize:11,color:”#3b5068”,marginBottom:10,fontWeight:700,letterSpacing:1}}>CONTAS DE DEMO</div>
{users.slice(0,4).map(u=>(
<div key={u.id} onClick={()=>{setEmail(u.email);setSenha(u.senha);setErro(””);}}
style={{display:“flex”,alignItems:“center”,gap:10,padding:“7px 10px”,borderRadius:8,cursor:“pointer”,marginBottom:4,border:“1px solid #131e2e”,background:”#070b14”}}>
<div style={S.av(ROLES[u.role]?.color)}>{u.avatar}</div>
<div style={{flex:1}}>
<div style={{fontSize:12,color:”#e2e8f0”,fontWeight:600}}>{u.nome}</div>
<div style={{fontSize:10,color:”#3b5068”}}>{u.email}</div>
</div>
<span style={S.tag(ROLES[u.role]?.color)}>{ROLES[u.role]?.icon} {ROLES[u.role]?.label}</span>
</div>
))}
</div>
</div>
</div>
</div>
);
}

// ══════════════════════════════════════════════════════
// USUARIOS
// ══════════════════════════════════════════════════════
function Usuarios({users,setUsers,currentUser}) {
const role = ROLES[currentUser.role];
if(!role.can.users) return <Blocked/>;
const [modal,setModal] = useState(false);
const [editing,setEditing] = useState(null);
const [confirm,setConfirm] = useState(null);
const blank = {nome:””,email:””,senha:””,role:“operacional”,ativo:true};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({…f,[k]:v}));

const openEdit = u => {setEditing(u);setForm({nome:u.nome,email:u.email,senha:u.senha,role:u.role,ativo:u.ativo});setModal(true);};
const openNew = () => {setEditing(null);setForm(blank);setModal(true);};
const save = () => {
if(!form.nome||!form.email||!form.senha) return;
if(editing) setUsers(users.map(u=>u.id===editing.id?{…u,…form}:u));
else {
const av=(form.nome.split(” “).slice(0,2).map(w=>w[0]).join(””)).toUpperCase();
setUsers([…users,{…form,id:Date.now(),criado:new Date().toISOString().slice(0,10),avatar:av}]);
}
setModal(false);
};
const toggleAtivo = u => {if(u.role===“master”)return;setUsers(users.map(x=>x.id===u.id?{…x,ativo:!x.ativo}:x));};
const del = u => {if(u.role===“master”)return;setUsers(users.filter(x=>x.id!==u.id));setConfirm(null);};

return (
<div>
<div style={{...S.grid(4),marginBottom:22}}>
{[[“Total”,“👥”,users.length,”#3b82f6”],[“Ativos”,“✅”,users.filter(u=>u.ativo).length,”#4ade80”],
[“Inativos”,“🚫”,users.filter(u=>!u.ativo).length,”#f87171”],[“Perfis”,“🔑”,Object.keys(ROLES).length,”#a78bfa”]].map(([l,ic,v,c])=>(
<div key={l} style={S.kpi}><div style={S.kL}>{ic} {l}</div><div style={{...S.kV,color:c}}>{v}</div></div>
))}
</div>
<div style={{...S.grid(3),marginBottom:22}}>
{Object.entries(ROLES).map(([key,r])=>(
<div key={key} style={{…S.card,borderLeft:`3px solid ${r.color}`}}>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:8}}>
<span style={{fontSize:18}}>{r.icon}</span>
<span style={{fontWeight:800,color:”#fff”,fontSize:13}}>{r.label}</span>
<span style={{…S.tag(r.color),marginLeft:“auto”}}>{users.filter(u=>u.role===key).length}x</span>
</div>
<div style={{fontSize:11,color:”#4a6070”,marginBottom:10}}>{r.desc}</div>
<div style={{display:“flex”,flexWrap:“wrap”,gap:4}}>
{[[“Ver”,r.can.view],[“Criar”,r.can.create],[“Editar”,r.can.edit],[“Excluir”,r.can.delete],[“Finanças”,r.can.finance],[“Usuários”,r.can.users]].map(([l,v])=>(
<span key={l} style={{fontSize:9,fontWeight:700,padding:“2px 7px”,borderRadius:5,background:v?”#4ade8022”:”#f8717122”,color:v?”#4ade80”:”#f87171”,border:`1px solid ${v?"#4ade8044":"#f8717144"}`}}>{v?“✓”:“✗”} {l}</span>
))}
</div>
</div>
))}
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:18}}>
<span style={{fontWeight:700,color:”#fff”,fontSize:14}}>Equipe</span>
<button style={S.btn()} onClick={openNew}>+ Novo Usuário</button>
</div>
<table style={S.table}>
<thead><tr>{[“Usuário”,“E-mail”,“Perfil”,“Módulos”,“Status”,“Criado”,“Ações”].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{users.map(u=>{
const r=ROLES[u.role]; const isMaster=u.role===“master”;
return (
<tr key={u.id}>
<td style={S.td}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div style={S.av(r.color)}>{u.avatar}</div>
<div>
<div style={{fontWeight:700,color:”#fff”,fontSize:13}}>{u.nome}</div>
{isMaster&&<div style={{fontSize:9,color:r.color,fontWeight:700}}>CONTA MASTER</div>}
</div>
</div>
</td>
<td style={S.td}>{u.email}</td>
<td style={S.td}><span style={S.tag(r.color)}>{r.icon} {r.label}</span></td>
<td style={S.td}><div style={{display:“flex”,gap:3,flexWrap:“wrap”}}>{r.pages.map(p=><span key={p} style={{fontSize:9,background:”#131e2e”,color:”#4a6070”,borderRadius:5,padding:“2px 6px”,border:“1px solid #1a2535”}}>{p}</span>)}</div></td>
<td style={S.td}><Badge label={u.ativo?“Ativo”:“Inativo”}/></td>
<td style={S.td}>{u.criado}</td>
<td style={S.td}>
<div style={{display:“flex”,gap:6}}>
<button style={S.btn(“secondary”)} onClick={()=>openEdit(u)}>✏️</button>
{!isMaster&&<button style={{…S.btn(“secondary”),color:u.ativo?”#f59e0b”:”#4ade80”}} onClick={()=>toggleAtivo(u)}>{u.ativo?“⏸”:“▶”}</button>}
{!isMaster&&<button style={S.btn(“danger”)} onClick={()=>setConfirm(u)}>🗑</button>}
</div>
</td>
</tr>
);
})}</tbody>
</table>
</div>
{modal&&(
<Modal title={editing?“Editar Usuário”:“Novo Usuário”} onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<div style={{gridColumn:“span 2”}}><Field label=“Nome Completo” value={form.nome} onChange={set(“nome”)}/></div>
<Field label=“E-mail” value={form.email} onChange={set(“email”)}/>
<Field label=“Senha” value={form.senha} onChange={set(“senha”)} type=“password”/>
<div style={{gridColumn:“span 2”}}><SelField label=“Perfil de Acesso” value={form.role} onChange={set(“role”)} options={Object.keys(ROLES).filter(k=>k!==“master”)}/></div>
{form.role&&(
<div style={{gridColumn:“span 2”,background:”#070b14”,border:“1px solid #1a2535”,borderRadius:10,padding:14}}>
<div style={{fontSize:10,color:”#3b5068”,fontWeight:700,letterSpacing:1,marginBottom:10}}>PERMISSÕES</div>
<div style={{display:“flex”,gap:6,flexWrap:“wrap”,marginBottom:8}}>
{[[“Ver”,ROLES[form.role]?.can.view],[“Criar”,ROLES[form.role]?.can.create],[“Editar”,ROLES[form.role]?.can.edit],[“Excluir”,ROLES[form.role]?.can.delete],[“Finanças”,ROLES[form.role]?.can.finance],[“Usuários”,ROLES[form.role]?.can.users]].map(([l,v])=>(
<span key={l} style={{fontSize:10,padding:“3px 9px”,borderRadius:6,background:v?”#4ade8022”:”#f8717122”,color:v?”#4ade80”:”#f87171”,border:`1px solid ${v?"#4ade8044":"#f8717144"}`,fontWeight:700}}>{v?“✓”:“✗”} {l}</span>
))}
</div>
<div style={{fontSize:10,color:”#3b5068”}}>Módulos: {ROLES[form.role]?.pages.join(”, “)}</div>
</div>
)}
<div style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:15}}>
<input type=“checkbox” checked={form.ativo} onChange={e=>setForm(f=>({…f,ativo:e.target.checked}))} id=“ativo”/>
<label htmlFor=“ativo” style={{…S.lbl,marginBottom:0,cursor:“pointer”}}>Usuário ativo</label>
</div>
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”,marginTop:8}}>
<button style={S.btn(“secondary”)} onClick={()=>setModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
{confirm&&(
<Modal title=“Confirmar Exclusão” onClose={()=>setConfirm(null)}>
<div style={{fontSize:14,color:”#94a3b8”,marginBottom:22}}>Excluir <strong style={{color:”#fff”}}>{confirm.nome}</strong>?</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”}}>
<button style={S.btn(“secondary”)} onClick={()=>setConfirm(null)}>Cancelar</button>
<button style={S.btn(“danger”)} onClick={()=>del(confirm)}>Excluir</button>
</div>
</Modal>
)}
</div>
);
}

// ══════════════════════════════════════════════════════
// PROSPECÇÃO
// ══════════════════════════════════════════════════════
function Prospeccao({data,setData}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
const [modal,setModal] = useState(false);
const [editId,setEditId] = useState(null);
const [search,setSearch] = useState(””);
const [obsId,setObsId] = useState(null);
const blank = {nome:””,segmento:””,contato:””,telefone:””,status:“Novo Lead”,valor:””,origem:””,notas:””,observacoes:””};
const [form,setForm] = useState(blank);
const [obsText,setObsText] = useState(””);
const set = k => v => setForm(f=>({…f,[k]:v}));

const filtered = data.filter(p=>p.nome.toLowerCase().includes(search.toLowerCase())||p.segmento.toLowerCase().includes(search.toLowerCase()));

const save = () => {
if(!form.nome) return;
if(editId) setData(data.map(p=>p.id===editId?{…p,…form,valor:Number(form.valor)}:p));
else setData([…data,{…form,id:Date.now(),dataCriacao:new Date().toISOString().slice(0,10),valor:Number(form.valor)}]);
setModal(false); setEditId(null); setForm(blank);
};
const openEdit = p => {setForm({…p,valor:String(p.valor)});setEditId(p.id);setModal(true);};
const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const toggleObs = p => {if(obsId===p.id){setObsId(null);}else{setObsId(p.id);setObsText(p.observacoes||””);}};
const saveObs = p => {setData(data.map(x=>x.id===p.id?{…x,observacoes:obsText}:x));setObsId(null);};
const pc = p=>p>=75?”#4ade80”:p>=40?”#f59e0b”:”#3b82f6”;

return (
<div>
{!can.create&&!can.edit&&<ReadOnly/>}
<div style={{...S.grid(5),marginBottom:20}}>
{[“Novo Lead”,“Proposta Enviada”,“Negociando”,“Fechado”,“Perdido”].map(s=>(
<div key={s} style={S.kpi}><div style={S.kL}>{s}</div><div style={{...S.kV,fontSize:24}}>{data.filter(p=>p.status===s).length}</div></div>
))}
</div>
<div style={{...S.grid(2),marginBottom:20}}>
<div style={S.kpi}><div style={S.kL}>Pipeline Total</div><div style={{…S.kV,color:”#3b82f6”}}>{fmt(data.reduce((a,p)=>a+Number(p.valor),0))}</div></div>
<div style={S.kpi}><div style={S.kL}>Total de Leads</div><div style={S.kV}>{data.length}</div></div>
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:16}}>
<input placeholder=“🔍 Buscar leads…” style={{…S.inp,maxWidth:280}} value={search} onChange={e=>setSearch(e.target.value)}/>
{can.create&&<button style={S.btn()} onClick={openNew}>+ Novo Lead</button>}
</div>
<table style={S.table}>
<thead><tr>{[“Empresa”,“Segmento”,“Contato”,“Status”,“Valor”,“Origem”,“Data”,“Obs”,””].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{filtered.map(p=>(
<>
<tr key={p.id} style={{background:obsId===p.id?”#0c1625”:“transparent”}}>
<td style={{…S.td,fontWeight:700,color:”#fff”}}>{p.nome}</td>
<td style={S.td}><span style={S.tag()}>{p.segmento}</span></td>
<td style={S.td}>{p.contato}</td>
<td style={S.td}><Badge label={p.status}/></td>
<td style={{…S.td,color:”#4ade80”,fontWeight:700}}>{fmt(p.valor)}</td>
<td style={S.td}>{p.origem}</td>
<td style={S.td}>{p.dataCriacao}</td>
<td style={S.td}>
<button onClick={()=>toggleObs(p)} style={{background:p.observacoes?”#22d3ee22”:”#131e2e”,border:`1px solid ${p.observacoes?"#22d3ee44":"#1a2535"}`,color:p.observacoes?”#22d3ee”:”#4a6070”,borderRadius:6,padding:“3px 9px”,fontSize:11,cursor:“pointer”,fontWeight:700}}>
📝 {obsId===p.id?“▲”:“▼”}
</button>
</td>
<td style={S.td}>{can.edit&&<button style={S.btn(“secondary”)} onClick={()=>openEdit(p)}>✏️</button>}</td>
</tr>
{obsId===p.id&&(
<tr key={p.id+”_o”}>
<td colSpan={9} style={{padding:“0 14px 14px”,background:”#0c1625”,borderBottom:“1px solid #1a2535”}}>
<div style={{background:”#070b14”,border:“1px solid #22d3ee33”,borderRadius:10,padding:14}}>
<div style={{fontSize:10,color:”#22d3ee”,fontWeight:700,letterSpacing:1,textTransform:“uppercase”,marginBottom:8}}>📝 Observações — {p.nome}</div>
<textarea style={{…S.inp,height:80,resize:“vertical”,borderColor:”#22d3ee33”}}
placeholder=“Anotações sobre este lead…”
value={obsText} onChange={e=>setObsText(e.target.value)} readOnly={!can.edit}/>
{can.edit&&(
<div style={{display:“flex”,gap:8,marginTop:10,justifyContent:“flex-end”}}>
<button style={S.btn(“secondary”)} onClick={()=>setObsId(null)}>Cancelar</button>
<button style={{…S.btn(),background:”#0e7490”}} onClick={()=>saveObs(p)}>Salvar</button>
</div>
)}
</div>
</td>
</tr>
)}
</>
))}
</tbody>
</table>
</div>
{modal&&(
<Modal title={editId?“Editar Lead”:“Novo Lead”} onClose={()=>setModal(false)} wide>
<div style={S.grid(2)}>
<div style={{gridColumn:“span 2”}}><Field label=“Empresa” value={form.nome} onChange={set(“nome”)}/></div>
<Field label=“Segmento” value={form.segmento} onChange={set(“segmento”)}/>
<Field label=“E-mail” value={form.contato} onChange={set(“contato”)}/>
<Field label=“Telefone” value={form.telefone} onChange={set(“telefone”)}/>
<Field label=“Valor Estimado” value={form.valor} onChange={set(“valor”)}/>
<Field label=“Origem” value={form.origem} onChange={set(“origem”)}/>
<div style={{gridColumn:“span 2”}}><SelField label=“Status” value={form.status} onChange={set(“status”)} options={[“Novo Lead”,“Proposta Enviada”,“Negociando”,“Fechado”,“Perdido”]}/></div>
<div style={{gridColumn:“span 2”}}><Field label=“Notas” value={form.notas} onChange={set(“notas”)} multiline rows={2}/></div>
<div style={{gridColumn:“span 2”}}><Field label=“Observações Internas” value={form.observacoes||””} onChange={set(“observacoes”)} multiline rows={2} placeholder=“Anotações privadas da equipe…”/></div>
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”,marginTop:8}}>
<button style={S.btn(“secondary”)} onClick={()=>setModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
</div>
);
}

// ══════════════════════════════════════════════════════
// CLIENTE DETALHE (painel lateral)
// ══════════════════════════════════════════════════════
function ClienteDetalhe({cliente,onClose,onSave,can}) {
const [c,setC] = useState({…cliente});
const [novoComentario,setNovoComentario] = useState(””);
const set = k => v => setC(x=>({…x,[k]:v}));
const addComentario = () => {
if(!novoComentario.trim()) return;
setC(x=>({…x,comentarios:[…(x.comentarios||[]),{id:Date.now(),texto:novoComentario,data:new Date().toLocaleDateString(“pt-BR”),autor:“Você”}]}));
setNovoComentario(””);
};
const removeComentario = id => setC(x=>({…x,comentarios:(x.comentarios||[]).filter(c=>c.id!==id)}));
const urlOk = url => {try{new URL(url);return true;}catch{return false;}};

return (
<div style={{position:“fixed”,inset:0,background:”#000c”,display:“flex”,alignItems:“flex-start”,justifyContent:“flex-end”,zIndex:1000}}>
<div style={{width:520,height:“100%”,background:”#0a0f1a”,borderLeft:“1px solid #1a2535”,overflowY:“auto”,display:“flex”,flexDirection:“column”}}>
<div style={{padding:“20px 24px”,borderBottom:“1px solid #1a2535”,display:“flex”,justifyContent:“space-between”,alignItems:“center”,background:”#0d1520”,flexShrink:0}}>
<div>
<div style={{fontSize:17,fontWeight:800,color:”#fff”}}>{c.nome}</div>
<div style={{display:“flex”,gap:8,marginTop:6,alignItems:“center”}}>
<span style={S.tag(”#a78bfa”)}>{c.segmento}</span>
{can.edit
? <select style={{…S.sel,width:“auto”,padding:“2px 8px”,fontSize:11}} value={c.status} onChange={e=>set(“status”)(e.target.value)}>
{[“Ativo”,“Pausado”,“Inativo”].map(o=><option key={o}>{o}</option>)}
</select>
: <Badge label={c.status}/>
}
</div>
</div>
<button onClick={onClose} style={{background:“none”,border:“none”,color:”#4a6070”,fontSize:22,cursor:“pointer”}}>✕</button>
</div>
<div style={{flex:1,padding:“20px 24px”,display:“flex”,flexDirection:“column”,gap:20,overflowY:“auto”}}>
{/* Dados */}
<div style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:12,padding:18}}>
<div style={{fontSize:10,color:”#3b5068”,fontWeight:700,letterSpacing:1.5,textTransform:“uppercase”,marginBottom:14}}>Dados do Cliente</div>
<div style={S.grid(2)}>
{can.edit?(
<>
<Field label=“Nome” value={c.nome} onChange={set(“nome”)}/>
<Field label=“Segmento” value={c.segmento} onChange={set(“segmento”)}/>
<Field label=“E-mail” value={c.contato} onChange={set(“contato”)}/>
<Field label=“Telefone” value={c.telefone||””} onChange={set(“telefone”)}/>
<Field label=“Mensalidade (R$)” value={String(c.valor)} onChange={v=>setC(x=>({…x,valor:Number(v)||x.valor}))}/>
<Field label=“Verba de Mídia (R$)” value={String(c.investimento)} onChange={v=>setC(x=>({…x,investimento:Number(v)||x.investimento}))}/>
<Field label=“Início” value={c.inicio} onChange={set(“inicio”)} type=“date”/>
<SelField label=“Plano” value={c.plano} onChange={set(“plano”)} options={[“Starter”,“Profissional”,“Enterprise”]}/>
</>
):(
[[“Plano”,c.plano,”#94a3b8”],[“Mensalidade”,fmt(c.valor),”#4ade80”],[“Verba”,fmt(c.investimento),”#a78bfa”],[“Desde”,c.inicio,”#94a3b8”],[“E-mail”,c.contato,”#93c5fd”],[“Telefone”,c.telefone||”—”,”#94a3b8”]].map(([l,v,col])=>(
<div key={l}><div style={{fontSize:9,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1,marginBottom:3}}>{l}</div><div style={{fontWeight:700,color:col,fontSize:13}}>{v}</div></div>
))
)}
</div>
</div>
{/* URLs */}
<div style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:12,padding:18}}>
<div style={{fontSize:10,color:”#3b5068”,fontWeight:700,letterSpacing:1.5,textTransform:“uppercase”,marginBottom:12}}>🔗 Links & URLs</div>
{[[“urlSite”,“Site / Landing Page”],[“urlAds”,“Conta de Anúncios”],[“urlRelatorio”,“Dashboard / Relatório”],[“urlDrive”,“Google Drive”]].map(([k,l])=>(
<div key={k} style={{marginBottom:10}}>
<label style={S.lbl}>{l}</label>
<div style={{display:“flex”,gap:6}}>
{can.edit
? <input style={{…S.inp,flex:1}} placeholder=“https://…” value={c[k]||””} onChange={e=>setC(x=>({…x,[k]:e.target.value}))}/>
: <div style={{…S.inp,flex:1,color:”#4a6070”}}>{c[k]||”—”}</div>
}
{c[k]&&urlOk(c[k])&&<a href={c[k]} target=”_blank” rel=“noreferrer” style={{…S.btn(“secondary”),padding:“9px 12px”,textDecoration:“none”,fontSize:14}}>↗</a>}
</div>
</div>
))}
</div>
{/* Comentários */}
<div style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:12,padding:18}}>
<div style={{fontSize:10,color:”#3b5068”,fontWeight:700,letterSpacing:1.5,textTransform:“uppercase”,marginBottom:12}}>💬 Comentários</div>
<div style={{display:“flex”,flexDirection:“column”,gap:8,marginBottom:14}}>
{(c.comentarios||[]).length===0&&<div style={{fontSize:12,color:”#3b5068”,textAlign:“center”,padding:“16px 0”}}>Nenhum comentário ainda</div>}
{(c.comentarios||[]).map(cm=>(
<div key={cm.id} style={{background:”#131e2e”,border:“1px solid #1a2535”,borderRadius:10,padding:“10px 14px”}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”}}>
<div style={{flex:1}}>
<div style={{fontSize:13,color:”#e2e8f0”,lineHeight:1.5}}>{cm.texto}</div>
<div style={{fontSize:10,color:”#3b5068”,marginTop:4}}>👤 {cm.autor} · {cm.data}</div>
</div>
{can.edit&&<button onClick={()=>removeComentario(cm.id)} style={{background:“none”,border:“none”,color:”#4a6070”,cursor:“pointer”,fontSize:14,padding:“0 0 0 8px”}}>✕</button>}
</div>
</div>
))}
</div>
{can.edit&&(
<div style={{display:“flex”,gap:8}}>
<textarea style={{…S.inp,flex:1,height:60,resize:“none”}}
placeholder=“Adicionar comentário… (Enter para enviar)”
value={novoComentario} onChange={e=>setNovoComentario(e.target.value)}
onKeyDown={e=>{if(e.key===“Enter”&&!e.shiftKey){e.preventDefault();addComentario();}}}/>
<button style={{…S.btn(),alignSelf:“flex-end”,padding:“10px 14px”}} onClick={addComentario}>↩</button>
</div>
)}
</div>
</div>
<div style={{padding:“16px 24px”,borderTop:“1px solid #1a2535”,display:“flex”,gap:8,justifyContent:“flex-end”,background:”#0d1520”,flexShrink:0}}>
<button style={S.btn(“secondary”)} onClick={onClose}>Fechar</button>
{can.edit&&<button style={S.btn()} onClick={()=>onSave(c)}>💾 Salvar Alterações</button>}
</div>
</div>
</div>
);
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════
function Clientes({data,setData}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
const [modal,setModal] = useState(false);
const [detalhe,setDetalhe] = useState(null);
const blank = {nome:””,segmento:””,contato:””,telefone:””,plano:“Starter”,valor:””,inicio:””,investimento:””,urlSite:””,urlAds:””,urlRelatorio:””,urlDrive:””,comentarios:[]};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({…f,[k]:v}));
const mrr = data.reduce((a,c)=>a+c.valor,0);

const save = () => {
if(!form.nome) return;
setData([…data,{…form,id:Date.now(),status:“Ativo”,valor:Number(form.valor),investimento:Number(form.investimento),comentarios:[]}]);
setModal(false); setForm(blank);
};
const saveDetalhe = updated => {setData(data.map(c=>c.id===updated.id?updated:c));setDetalhe(null);};

return (
<div>
{!can.create&&!can.edit&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
<div style={S.kpi}><div style={S.kL}>MRR</div><div style={{…S.kV,color:”#4ade80”}}>{fmt(mrr)}</div></div>
<div style={S.kpi}><div style={S.kL}>Ativos</div><div style={S.kV}>{data.filter(c=>c.status===“Ativo”).length}</div></div>
<div style={S.kpi}><div style={S.kL}>Verba Gerenciada</div><div style={{…S.kV,color:”#a78bfa”}}>{fmt(data.reduce((a,c)=>a+c.investimento,0))}</div></div>
<div style={S.kpi}><div style={S.kL}>Ticket Médio</div><div style={S.kV}>{fmt(mrr/(data.length||1))}</div></div>
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:16}}>
<span style={{fontWeight:700,color:”#fff”,fontSize:14}}>Carteira de Clientes</span>
{can.create&&<button style={S.btn()} onClick={()=>setModal(true)}>+ Novo Cliente</button>}
</div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(3,1fr)”,gap:12}}>
{data.map(c=>(
<div key={c.id} onClick={()=>setDetalhe(c)}
style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:12,padding:16,cursor:“pointer”,transition:“border-color .15s”}}
onMouseEnter={e=>e.currentTarget.style.borderColor=”#2d3f54”}
onMouseLeave={e=>e.currentTarget.style.borderColor=”#1a2535”}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:12}}>
<div><div style={{fontWeight:800,color:”#fff”,fontSize:14}}>{c.nome}</div><span style={S.tag(”#a78bfa”)}>{c.segmento}</span></div>
<Badge label={c.status}/>
</div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:8}}>
{[[“Plano”,c.plano,”#94a3b8”],[“Mensalidade”,fmt(c.valor),”#4ade80”],[“Verba”,fmt(c.investimento),”#a78bfa”],[“Desde”,c.inicio,”#94a3b8”]].map(([l,v,col])=>(
<div key={l}><div style={{fontSize:9,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1}}>{l}</div><div style={{fontWeight:700,color:col,fontSize:12}}>{v}</div></div>
))}
</div>
<div style={{marginTop:10,borderTop:“1px solid #1a2535”,paddingTop:8,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}>
<span style={{fontSize:11,color:”#3b5068”}}>📧 {c.contato}</span>
<div style={{display:“flex”,gap:4}}>
{(c.comentarios||[]).length>0&&<span style={S.tag(”#22d3ee”)}>💬 {c.comentarios.length}</span>}
{(c.urlSite||c.urlAds)&&<span style={S.tag(”#4ade80”)}>🔗</span>}
</div>
</div>
</div>
))}
</div>
</div>
{modal&&(
<Modal title=“Novo Cliente” onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<Field label=“Empresa” value={form.nome} onChange={set(“nome”)}/>
<Field label=“Segmento” value={form.segmento} onChange={set(“segmento”)}/>
<Field label=“E-mail” value={form.contato} onChange={set(“contato”)}/>
<Field label=“Telefone” value={form.telefone} onChange={set(“telefone”)}/>
<Field label=“Mensalidade (R$)” value={form.valor} onChange={set(“valor”)}/>
<Field label=“Verba de Mídia (R$)” value={form.investimento} onChange={set(“investimento”)}/>
<Field label=“Início” value={form.inicio} onChange={set(“inicio”)} type=“date”/>
<SelField label=“Plano” value={form.plano} onChange={set(“plano”)} options={[“Starter”,“Profissional”,“Enterprise”]}/>
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”}}>
<button style={S.btn(“secondary”)} onClick={()=>setModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
{detalhe&&<ClienteDetalhe cliente={detalhe} onClose={()=>setDetalhe(null)} onSave={saveDetalhe} can={can}/>}
</div>
);
}

// ══════════════════════════════════════════════════════
// PROJETOS
// ══════════════════════════════════════════════════════
function Projetos({data,setData}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
const [selected,setSelected] = useState(null);
const [editModal,setEditModal] = useState(false);
const [form,setForm] = useState(null);
const set = k => v => setForm(f=>({…f,[k]:v}));
const pc = p=>p>=75?”#4ade80”:p>=40?”#f59e0b”:”#3b82f6”;

const toggleTarefa = (proj,idx) => {
if(!can.edit) return;
setData(data.map(p=>{
if(p.id!==proj.id) return p;
const done=p.tarefasConcluidas.includes(idx)?p.tarefasConcluidas.filter(i=>i!==idx):[…p.tarefasConcluidas,idx];
return {…p,tarefasConcluidas:done,progresso:Math.round((done.length/p.tarefas.length)*100)};
}));
};

const openEdit = p => {setForm({…p,inicio:p.inicio,fim:p.fim});setEditModal(true);};
const saveEdit = () => {
setData(data.map(p=>p.id===form.id?{…form,progresso:Math.round((form.tarefasConcluidas.length/form.tarefas.length)*100)}:p));
setEditModal(false);
};

return (
<div>
{!can.edit&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
{[[“Em Andamento”,”#22d3ee”],[“Em Revisão”,”#f59e0b”],[“Planejamento”,”#a78bfa”],[“Concluído”,”#4ade80”]].map(([s,c])=>(
<div key={s} style={S.kpi}><div style={S.kL}>{s}</div><div style={{...S.kV,color:c}}>{data.filter(p=>p.status===s).length}</div></div>
))}
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:16}}>
<span style={{fontWeight:700,color:”#fff”,fontSize:14}}>Projetos em Curso</span>
{can.edit&&<span style={{fontSize:11,color:”#3b5068”}}>Clique em um projeto para expandir tarefas</span>}
</div>
<div style={{display:“flex”,flexDirection:“column”,gap:12}}>
{data.map(p=>(
<div key={p.id} style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:12,padding:18}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:12}}>
<div style={{cursor:“pointer”,flex:1}} onClick={()=>setSelected(selected?.id===p.id?null:p)}>
<div style={{fontWeight:800,color:”#fff”,fontSize:14}}>{p.nome}</div>
<div style={{fontSize:11,color:”#3b5068”,marginTop:2}}>👤 {p.cliente} · {p.inicio} → {p.fim}</div>
</div>
<div style={{display:“flex”,gap:8,alignItems:“center”}}>
<Badge label={p.status}/>
{can.edit&&<button style={S.btn(“secondary”)} onClick={()=>openEdit(p)}>✏️</button>}
</div>
</div>
<div style={{display:“flex”,alignItems:“center”,gap:10,cursor:“pointer”}} onClick={()=>setSelected(selected?.id===p.id?null:p)}>
<div style={{flex:1,...S.prog}}><div style={S.pbar(p.progresso,pc(p.progresso))}/></div>
<span style={{fontSize:12,fontWeight:800,color:pc(p.progresso),minWidth:34}}>{p.progresso}%</span>
</div>
{selected?.id===p.id&&(
<div style={{marginTop:16,borderTop:“1px solid #1a2535”,paddingTop:14}}>
<div style={{fontSize:10,color:”#3b5068”,textTransform:“uppercase”,letterSpacing:1,marginBottom:10,fontWeight:700}}>Tarefas</div>
{p.tarefas.map((t,i)=>{
const done=p.tarefasConcluidas.includes(i);
return (
<div key={i} style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:8}} onClick={()=>toggleTarefa(p,i)}>
<div style={{width:16,height:16,borderRadius:4,border:`2px solid ${done?"#4ade80":"#1a2535"}`,background:done?”#4ade80”:“transparent”,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0,cursor:can.edit?“pointer”:“default”}}>
{done&&<span style={{fontSize:10,color:”#000”,fontWeight:900}}>✓</span>}
</div>
<span style={{fontSize:13,color:done?”#4ade80”:”#94a3b8”,textDecoration:done?“line-through”:“none”}}>{t}</span>
</div>
);
})}
</div>
)}
</div>
))}
</div>
</div>
{editModal&&form&&(
<Modal title=“Editar Projeto” onClose={()=>setEditModal(false)} wide>
<div style={S.grid(2)}>
<div style={{gridColumn:“span 2”}}><Field label=“Nome do Projeto” value={form.nome} onChange={set(“nome”)}/></div>
<Field label=“Cliente” value={form.cliente} onChange={set(“cliente”)}/>
<SelField label=“Status” value={form.status} onChange={set(“status”)} options={[“Planejamento”,“Em Andamento”,“Em Revisão”,“Concluído”]}/>
<Field label=“Data de Início” value={form.inicio} onChange={set(“inicio”)} type=“date”/>
<Field label=“Data de Fim” value={form.fim} onChange={set(“fim”)} type=“date”/>
<div style={{gridColumn:“span 2”}}>
<label style={S.lbl}>Tarefas (uma por linha)</label>
<textarea style={{…S.inp,height:100,resize:“none”}}
value={form.tarefas.join(”\n”)}
onChange={e=>setForm(f=>({…f,tarefas:e.target.value.split(”\n”).filter(Boolean),tarefasConcluidas:[]}))}/>
</div>
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”,marginTop:8}}>
<button style={S.btn(“secondary”)} onClick={()=>setEditModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={saveEdit}>Salvar</button>
</div>
</Modal>
)}
</div>
);
}

// ══════════════════════════════════════════════════════
// AGENDA
// ══════════════════════════════════════════════════════
function Agenda({data,setData}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
const [modal,setModal] = useState(false);
const [editId,setEditId] = useState(null);
const blank = {titulo:””,data:””,hora:””,tipo:“Reunião”,cliente:””,descricao:””};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({…f,[k]:v}));
const today = new Date().toISOString().slice(0,10);

const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const openEdit = e => {setForm({…e});setEditId(e.id);setModal(true);};
const save = () => {
if(!form.titulo) return;
if(editId) setData(data.map(e=>e.id===editId?{…form,id:editId}:e));
else setData([…data,{…form,id:Date.now()}]);
setModal(false);setEditId(null);setForm(blank);
};
const del = id => setData(data.filter(e=>e.id!==id));

return (
<div>
{!can.create&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
{[[“Hoje”,data.filter(e=>e.data===today).length,”#3b82f6”],[“Total”,data.length,”#a78bfa”],
[“Reuniões”,data.filter(e=>e.tipo===“Reunião”).length,”#22d3ee”],[“Entregas”,data.filter(e=>e.tipo===“Entrega”).length,”#4ade80”]].map(([l,v,c])=>(
<div key={l} style={S.kpi}><div style={S.kL}>{l}</div><div style={{...S.kV,color:c}}>{v}</div></div>
))}
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:16}}>
<span style={{fontWeight:700,color:”#fff”,fontSize:14}}>Agenda de Execução</span>
{can.create&&<button style={S.btn()} onClick={openNew}>+ Novo Evento</button>}
</div>
<div style={{display:“flex”,flexDirection:“column”,gap:8}}>
{[…data].sort((a,b)=>a.data.localeCompare(b.data)||a.hora.localeCompare(b.hora)).map(e=>(
<div key={e.id} style={{background:”#070b14”,border:“1px solid #1a2535”,borderRadius:10,padding:14,display:“flex”,alignItems:“center”,gap:14,borderLeft:`3px solid ${SC[e.tipo]||"#3b82f6"}`}}>
<div style={{fontSize:24}}>{TI[e.tipo]}</div>
<div style={{flex:1}}>
<div style={{fontWeight:700,color:”#fff”,marginBottom:2}}>{e.titulo}</div>
<div style={{fontSize:11,color:”#3b5068”}}>👤 {e.cliente} · {e.descricao}</div>
</div>
<div style={{textAlign:“right”}}>
<Badge label={e.tipo}/>
<div style={{fontSize:11,color:”#3b5068”,marginTop:4}}>📅 {e.data} · ⏰ {e.hora}</div>
</div>
{can.edit&&(
<div style={{display:“flex”,gap:6,marginLeft:8}}>
<button style={S.btn(“secondary”)} onClick={()=>openEdit(e)}>✏️</button>
{can.delete&&<button style={S.btn(“danger”)} onClick={()=>del(e.id)}>🗑</button>}
</div>
)}
</div>
))}
</div>
</div>
{modal&&(
<Modal title={editId?“Editar Evento”:“Novo Evento”} onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<div style={{gridColumn:“span 2”}}><Field label=“Título” value={form.titulo} onChange={set(“titulo”)}/></div>
<Field label=“Data” value={form.data} onChange={set(“data”)} type=“date”/>
<Field label=“Hora” value={form.hora} onChange={set(“hora”)} type=“time”/>
<SelField label=“Tipo” value={form.tipo} onChange={set(“tipo”)} options={[“Reunião”,“Entrega”,“Prospecção”,“Execução”,“Relatório”]}/>
<Field label=“Cliente” value={form.cliente} onChange={set(“cliente”)}/>
<div style={{gridColumn:“span 2”}}><Field label=“Descrição” value={form.descricao} onChange={set(“descricao”)} multiline rows={2}/></div>
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”}}>
<button style={S.btn(“secondary”)} onClick={()=>setModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
</div>
);
}

// ══════════════════════════════════════════════════════
// FINANCEIRO
// ══════════════════════════════════════════════════════
function Financeiro({data,setData}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
if(!can.finance) return <Blocked/>;
const [tab,setTab] = useState(“receitas”);
const [modal,setModal] = useState(false);
const [editId,setEditId] = useState(null);
const blank = {descricao:””,valor:””,data:””,status:“Pendente”,categoria:“Mensalidade”};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({…f,[k]:v}));

const totalRec = data.receitas.reduce((a,r)=>a+r.valor,0);
const totalDes = data.despesas.reduce((a,d)=>a+d.valor,0);
const recebido = data.receitas.filter(r=>r.status===“Recebido”).reduce((a,r)=>a+r.valor,0);

const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const openEdit = item => {setForm({…item,valor:String(item.valor)});setEditId(item.id);setModal(true);};
const save = () => {
if(!form.descricao) return;
const item = {…form,valor:Number(form.valor)};
if(editId){
if(tab===“receitas”) setData({…data,receitas:data.receitas.map(r=>r.id===editId?{…item,id:editId}:r)});
else setData({…data,despesas:data.despesas.map(d=>d.id===editId?{…item,id:editId}:d)});
} else {
if(tab===“receitas”) setData({…data,receitas:[…data.receitas,{…item,id:Date.now()}]});
else setData({…data,despesas:[…data.despesas,{…item,id:Date.now()}]});
}
setModal(false);setEditId(null);setForm(blank);
};
const del = id => {
if(tab===“receitas”) setData({…data,receitas:data.receitas.filter(r=>r.id!==id)});
else setData({…data,despesas:data.despesas.filter(d=>d.id!==id)});
};

return (
<div>
<div style={{...S.grid(4),marginBottom:20}}>
{[[“Receita Total”,fmt(totalRec),”#4ade80”],[“Recebido”,fmt(recebido),”#22d3ee”],
[“Despesas”,fmt(totalDes),”#f87171”],[“Lucro”,fmt(totalRec-totalDes),totalRec>=totalDes?”#4ade80”:”#f87171”]].map(([l,v,c])=>(
<div key={l} style={S.kpi}><div style={S.kL}>{l}</div><div style={{...S.kV,color:c}}>{v}</div></div>
))}
</div>
<div style={S.card}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:18}}>
<div style={{display:“flex”,gap:6}}>
{[“receitas”,“despesas”].map(t=>(
<button key={t} style={{…S.btn(tab===t?“primary”:“secondary”),textTransform:“capitalize”}} onClick={()=>setTab(t)}>{t}</button>
))}
</div>
{can.create&&<button style={S.btn()} onClick={openNew}>+ Nova {tab===“receitas”?“Receita”:“Despesa”}</button>}
</div>
<table style={S.table}>
<thead><tr>{[“Descrição”,“Valor”,“Data”,“Categoria”,tab===“receitas”?“Status”:””,””].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
<tbody>{data[tab].map(item=>(
<tr key={item.id}>
<td style={{…S.td,fontWeight:600,color:”#fff”}}>{item.descricao}</td>
<td style={{…S.td,fontWeight:800,color:tab===“receitas”?”#4ade80”:”#f87171”}}>{fmt(item.valor)}</td>
<td style={S.td}>{item.data}</td>
<td style={S.td}><span style={S.tag(”#a78bfa”)}>{item.categoria}</span></td>
{tab===“receitas”?<td style={S.td}><Badge label={item.status}/></td>:<td style={S.td}/>}
<td style={S.td}>
{can.edit&&(
<div style={{display:“flex”,gap:6}}>
<button style={S.btn(“secondary”)} onClick={()=>openEdit(item)}>✏️</button>
{can.delete&&<button style={S.btn(“danger”)} onClick={()=>del(item.id)}>🗑</button>}
</div>
)}
</td>
</tr>
))}</tbody>
</table>
</div>
{modal&&(
<Modal title={`${editId?"Editar":"Nova"} ${tab==="receitas"?"Receita":"Despesa"}`} onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<div style={{gridColumn:“span 2”}}><Field label=“Descrição” value={form.descricao} onChange={set(“descricao”)}/></div>
<Field label=“Valor (R$)” value={form.valor} onChange={set(“valor”)}/>
<Field label=“Data” value={form.data} onChange={set(“data”)} type=“date”/>
<SelField label=“Categoria” value={form.categoria} onChange={set(“categoria”)} options={[“Mensalidade”,“Setup”,“Ferramentas”,“Equipe”,“Infraestrutura”,“Marketing”,“Outros”]}/>
{tab===“receitas”&&<SelField label=“Status” value={form.status} onChange={set(“status”)} options={[“Recebido”,“Pendente”,“Atrasado”]}/>}
</div>
<div style={{display:“flex”,gap:8,justifyContent:“flex-end”}}>
<button style={S.btn(“secondary”)} onClick={()=>setModal(false)}>Cancelar</button>
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
</div>
);
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function Dashboard({data}) {
const {user} = useAuth();
const can = ROLES[user.role].can;
const role = ROLES[user.role];
const mrr = data.clientes.reduce((a,c)=>a+c.valor,0);
const pipeline = data.prospects.reduce((a,p)=>a+Number(p.valor),0);
const rec = data.financeiro.receitas.reduce((a,r)=>a+r.valor,0);
const des = data.financeiro.despesas.reduce((a,d)=>a+d.valor,0);
return (
<div>
<div style={{...S.grid(4),marginBottom:20}}>
<div style={S.kpi}><div style={S.kL}>MRR</div><div style={{…S.kV,color:”#4ade80”}}>{fmt(mrr)}</div><div style={S.kS}>{data.clientes.length} clientes</div></div>
<div style={S.kpi}><div style={S.kL}>Pipeline</div><div style={{…S.kV,color:”#3b82f6”}}>{fmt(pipeline)}</div><div style={S.kS}>{data.prospects.length} leads</div></div>
<div style={S.kpi}><div style={S.kL}>Projetos Ativos</div><div style={{…S.kV,color:”#a78bfa”}}>{data.projetos.filter(p=>p.status!==“Concluído”).length}</div></div>
{can.finance
?<div style={S.kpi}><div style={S.kL}>Lucro do Mês</div><div style={{...S.kV,color:rec>=des?”#4ade80”:”#f87171”}}>{fmt(rec-des)}</div></div>
:<div style={S.kpi}><div style={S.kL}>Seu Perfil</div><div style={{fontSize:18,fontWeight:800,color:role.color,margin:“6px 0 4px”}}>{role.icon} {role.label}</div><div style={S.kS}>{role.desc}</div></div>
}
</div>
<div style={S.grid(2)}>
<div style={S.card}>
<div style={{fontWeight:700,color:”#fff”,marginBottom:14,fontSize:13}}>🔥 Próximos Eventos</div>
{data.agenda.slice(0,4).map(e=>(
<div key={e.id} style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,padding:“9px 0”,borderBottom:“1px solid #1a2535”}}>
<div><div style={{fontSize:13,fontWeight:600,color:”#e2e8f0”}}>{e.titulo}</div><div style={{fontSize:11,color:”#3b5068”}}>{e.cliente}</div></div>
<div style={{textAlign:“right”}}><Badge label={e.tipo}/><div style={{fontSize:10,color:”#3b5068”,marginTop:3}}>{e.data} {e.hora}</div></div>
</div>
))}
</div>
<div style={S.card}>
<div style={{fontWeight:700,color:”#fff”,marginBottom:14,fontSize:13}}>📈 Progresso de Projetos</div>
{data.projetos.map(p=>(
<div key={p.id} style={{marginBottom:14}}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:5}}>
<span style={{fontSize:12,color:”#e2e8f0”,fontWeight:600}}>{p.nome}</span>
<span style={{fontSize:11,color:”#3b5068”}}>{p.progresso}%</span>
</div>
<div style={S.prog}><div style={S.pbar(p.progresso,p.progresso>=75?”#4ade80”:p.progresso>=40?”#f59e0b”:”#3b82f6”)}/></div>
</div>
))}
</div>
{can.finance&&(
<div style={S.card}>
<div style={{fontWeight:700,color:”#fff”,marginBottom:14,fontSize:13}}>💰 Receitas Pendentes</div>
{data.financeiro.receitas.filter(r=>r.status===“Pendente”).map(r=>(
<div key={r.id} style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,padding:“9px 0”,borderBottom:“1px solid #1a2535”}}>
<div style={{fontSize:13,color:”#e2e8f0”}}>{r.descricao}</div>
<span style={{fontWeight:800,color:”#f59e0b”}}>{fmt(r.valor)}</span>
</div>
))}
</div>
)}
<div style={S.card}>
<div style={{fontWeight:700,color:”#fff”,marginBottom:14,fontSize:13}}>🎯 Funil de Prospecção</div>
{[“Novo Lead”,“Proposta Enviada”,“Negociando”,“Fechado”].map(s=>{
const n=data.prospects.filter(p=>p.status===s).length;
const pct=Math.round((n/data.prospects.length)*100)||0;
return (
<div key={s} style={{marginBottom:10}}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:4}}><span style={{fontSize:12,color:”#94a3b8”}}>{s}</span><span style={{fontSize:11,color:”#3b5068”}}>{n}</span></div>
<div style={S.prog}><div style={S.pbar(pct,SC[s])}/></div>
</div>
);
})}
</div>
</div>
</div>
);
}

// ══════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════
const ALL_PAGES = [
{id:“dashboard”,label:“Dashboard”,icon:“⚡”,section:“principal”},
{id:“prospeccao”,label:“Prospecção”,icon:“🎯”,section:“comercial”},
{id:“clientes”,label:“Clientes”,icon:“👥”,section:“comercial”},
{id:“projetos”,label:“Projetos”,icon:“📋”,section:“operacional”},
{id:“agenda”,label:“Agenda”,icon:“📅”,section:“operacional”},
{id:“financeiro”,label:“Financeiro”,icon:“💰”,section:“gestao”},
{id:“usuarios”,label:“Usuários”,icon:“🔑”,section:“gestao”},
];
const SL = {principal:“Principal”,comercial:“Comercial”,operacional:“Operacional”,gestao:“Gestão”};

export default function App() {
const [users,setUsers] = useState(INITIAL_USERS);
const [currentUser,setCurrentUser] = useState(null);
const [page,setPage] = useState(“dashboard”);
const [data,setData] = useState(initialData);
const [profileModal,setProfileModal] = useState(false);

const upP = v=>setData(d=>({…d,prospects:v}));
const upC = v=>setData(d=>({…d,clientes:v}));
const upPr = v=>setData(d=>({…d,projetos:v}));
const upA = v=>setData(d=>({…d,agenda:v}));
const upF = v=>setData(d=>({…d,financeiro:v}));

if(!currentUser) return (
<>
<style>{globalCSS}</style>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<Login users={users} onLogin={u=>{setCurrentUser(u);setPage(“dashboard”);}}/>
</>
);

const role = ROLES[currentUser.role];
const visiblePages = ALL_PAGES.filter(p=>role.pages.includes(p.id));
const sections = […new Set(visiblePages.map(p=>p.section))];
const logout = () => {setCurrentUser(null);setPage(“dashboard”);};
const curPage = ALL_PAGES.find(p=>p.id===page);

return (
<AuthCtx.Provider value={{user:currentUser,users}}>
<style>{globalCSS}</style>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<div style={S.app}>
{/* SIDEBAR */}
<div style={S.sidebar}>
<div style={S.logo}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div style={{background:“linear-gradient(135deg,#1a2535,#0d1420)”,border:“1px solid #1a2535”,borderRadius:10,padding:6,flexShrink:0}}>
<LogoImg size={28}/>
</div>
<div>
<div style={{fontSize:14,fontWeight:800,color:”#fff”,letterSpacing:-0.3,lineHeight:1.2}}>Agência Prisma</div>
<div style={{fontSize:9,color:”#3b4d63”,letterSpacing:2,textTransform:“uppercase”,marginTop:1}}>CRM</div>
</div>
</div>
</div>
<nav style={S.nav}>
{sections.map(sec=>(
<div key={sec}>
<div style={S.navSec}>{SL[sec]}</div>
{visiblePages.filter(p=>p.section===sec).map(p=>(
<div key={p.id} style={S.navItem(page===p.id)} onClick={()=>setPage(p.id)}>
<span style={{fontSize:14}}>{p.icon}</span><span>{p.label}</span>
</div>
))}
</div>
))}
</nav>
<div style={{padding:“14px 16px”,borderTop:“1px solid #1a2535”}}>
<div style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:10,cursor:“pointer”}} onClick={()=>setProfileModal(true)}>
<div style={S.av(role.color)}>{currentUser.avatar}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:12,fontWeight:700,color:”#e2e8f0”,whiteSpace:“nowrap”,overflow:“hidden”,textOverflow:“ellipsis”}}>{currentUser.nome}</div>
<div style={{fontSize:10,color:role.color,fontWeight:700}}>{role.icon} {role.label}</div>
</div>
</div>
<button onClick={logout} style={{…S.btn(“ghost”),width:“100%”,fontSize:11,padding:“6px”,borderRadius:7,border:“1px solid #1a2535”}}>Sair da conta</button>
</div>
</div>

```
    {/* CONTENT */}
    <div style={S.content}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>{curPage?.icon} {curPage?.label}</div>
          <div style={{fontSize:11,color:"#3b5068",marginTop:2}}>Abril 2026 · <span style={{color:role.color,fontWeight:700}}>{currentUser.nome}</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <LogoImg size={22}/>
          <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>Agência Prisma</span>
          <div style={{width:1,height:20,background:"#1a2535"}}/>
          <span style={S.tag(role.color)}>{role.icon} {role.label}</span>
        </div>
      </div>
      <div style={S.main}>
        {page==="dashboard" &&<Dashboard data={data}/>}
        {page==="prospeccao"&&<Prospeccao data={data.prospects} setData={upP}/>}
        {page==="clientes"  &&<Clientes data={data.clientes} setData={upC}/>}
        {page==="projetos"  &&<Projetos data={data.projetos} setData={upPr}/>}
        {page==="agenda"    &&<Agenda data={data.agenda} setData={upA}/>}
        {page==="financeiro"&&<Financeiro data={data.financeiro} setData={upF}/>}
        {page==="usuarios"  &&<Usuarios users={users} setUsers={setUsers} currentUser={currentUser}/>}
      </div>
    </div>

    {/* PROFILE MODAL */}
    {profileModal&&(
      <Modal title="Meu Perfil" onClose={()=>setProfileModal(false)}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22,background:"#070b14",borderRadius:12,padding:16}}>
          <div style={{...S.av(role.color),width:52,height:52,fontSize:18}}>{currentUser.avatar}</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{currentUser.nome}</div>
            <div style={{fontSize:12,color:"#3b5068",marginTop:2}}>{currentUser.email}</div>
            <span style={{...S.tag(role.color),marginTop:6,display:"inline-block"}}>{role.icon} {role.label}</span>
          </div>
        </div>
        <div style={{background:"#070b14",borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1,marginBottom:10}}>SUAS PERMISSÕES</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {[["Ver",role.can.view],["Criar",role.can.create],["Editar",role.can.edit],["Excluir",role.can.delete],["Finanças",role.can.finance],["Usuários",role.can.users]].map(([l,v])=>(
              <span key={l} style={{fontSize:11,padding:"4px 10px",borderRadius:6,background:v?"#4ade8022":"#f8717122",color:v?"#4ade80":"#f87171",border:`1px solid ${v?"#4ade8044":"#f8717144"}`,fontWeight:700}}>{v?"✓":"✗"} {l}</span>
            ))}
          </div>
          <div style={{fontSize:11,color:"#3b5068"}}>Módulos: <span style={{color:"#94a3b8"}}>{role.pages.join(", ")}</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#070b14",borderRadius:12,padding:14,marginBottom:16}}>
          <LogoImg size={32}/><div><div style={{fontWeight:800,color:"#fff",fontSize:14}}>Agência Prisma</div><div style={{fontSize:11,color:"#3b5068"}}>Sistema CRM de Tráfego</div></div>
        </div>
        <button onClick={()=>{logout();setProfileModal(false);}} style={{...S.btn("danger"),width:"100%",padding:11}}>Sair da conta</button>
      </Modal>
    )}
  </div>
</AuthCtx.Provider>
```

);
}
