import { useState, useCallback, createContext, useContext } from "react";
// ── CSS RESET (remove bordas brancas do browser) ─────
const globalCSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body,#r
// ── LOGO ─────────────────────────────────────────────
const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABWGlDQ1BJQ0MgUHJvZmlsZQAAeJx
const LogoImg = ({ size=32 }) => (
<img src={`data:image/png;base64,${LOGO_B64}`} alt="Prisma"
style={{ width:size, height:size, objectFit:"contain", display:"block" }} />
);
// ── AUTH ──────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);
// ── ROLES ─────────────────────────────────────────────
const ROLES = {
master:{
label:"Master",color:"#f59e0b",icon:" ",
desc:"Acesso total ao sistema",
pages:["dashboard","prospeccao","clientes","projetos","agenda","financeiro","usuarios"],
can:{view:true,create:true,edit:true,delete:true,finance:true,users:true}
},
gestor:{
label:"Gestor",color:"#a78bfa",icon:" ",
desc:"Acesso completo exceto usuários",
pages:["dashboard","prospeccao","clientes","projetos","agenda","financeiro"],
can:{view:true,create:true,edit:true,delete:false,finance:true,users:false}
},
operacional:{
label:"Operacional",color:"#22d3ee",icon:" ",
desc:"Projetos e agenda",
pages:["dashboard","projetos","agenda"],
can:{view:true,create:false,edit:true,delete:false,finance:false,users:false}
},
comercial:{
label:"Comercial",color:"#4ade80",icon:" ",
desc:"Prospecção e clientes",
pages:["dashboard","prospeccao","clientes"],
can:{view:true,create:true,edit:true,delete:false,finance:false,users:false}
},
financeiro_role:{
label:"Financeiro",color:"#fb923c",icon:" ",
desc:"Módulo financeiro",
pages:["dashboard","financeiro"],
can:{view:true,create:true,edit:true,delete:false,finance:true,users:false}
},
visualizador:{
label:"Visualizador",color:"#64748b",icon:" ",
desc:"Somente leitura",
pages:["dashboard","prospeccao","clientes","projetos","agenda"],
can:{view:true,create:false,edit:false,delete:false,finance:false,users:false}
},
};
const INITIAL_USERS = [
{id:1,nome:"Você (Master)",email:"master@agencia.com",senha:"master123",role:"master",ativo
{id:2,nome:"Ana Gestora",email:"ana@agencia.com",senha:"ana123",role:"gestor",ativo:true,cr
{id:3,nome:"Carlos Dev",email:"carlos@agencia.com",senha:"carlos123",role:"operacional",ati
{id:4,nome:"Julia Comercial",email:"julia@agencia.com",senha:"julia123",role:"comercial",at
];
const initialData = {
prospects:[
{id:1,nome:"Loja da Maria",segmento:"E-commerce",contato:"maria@loja.com",telefone:"(11)
{id:2,nome:"Clínica Sorriso",segmento:"Saúde",contato:"dr.carlos@clinica.com",telefone:"(
{id:3,nome:"Academia FitLife",segmento:"Fitness",contato:"joao@fitlife.com",telefone:"(11
],
clientes:[
{id:1,nome:"Pet Shop Amigo Fiel",segmento:"Pet",contato:"ana@petshop.com",telefone:"(11)
{id:2,nome:"Restaurante Sabor & Arte",segmento:"Food",contato:"chef@sabor.com",telefone:"
{id:3,nome:"Imobiliária Premium",segmento:"Imóveis",contato:"renata@premium.com",telefone
],
projetos:[
{id:1,cliente:"Pet Shop Amigo Fiel",nome:"Campanhas Meta Q2",status:"Em Andamento",inicio
{id:2,cliente:"Restaurante Sabor & Arte",nome:"Google Ads Launch",status:"Em Revisão",ini
{id:3,cliente:"Imobiliária Premium",nome:"Funil de Captação",status:"Planejamento",inicio
],
agenda:[
{id:1,titulo:"Reunião de resultado - Pet Shop",data:"2026-04-07",hora:"10:00",tipo:"Reuni
{id:2,titulo:"Entrega de criativos - Restaurante",data:"2026-04-08",hora:"14:00",tipo:"En
{id:3,titulo:"Call de prospecção - Academia",data:"2026-04-09",hora:"09:00",tipo:"Prospec
{id:4,titulo:"Relatório mensal - Imobiliária",data:"2026-04-10",hora:"16:00",tipo:"Relató
],
financeiro:{
receitas:[
{id:1,descricao:"Mensalidade - Pet Shop Amigo Fiel",valor:3200,data:"2026-04-01",status
{id:2,descricao:"Mensalidade - Restaurante Sabor & Arte",valor:1500,data:"2026-04-01",s
{id:3,descricao:"Mensalidade - Imobiliária Premium",valor:6500,data:"2026-04-05",status
{id:4,descricao:"Setup - Academia FitLife",valor:800,data:"2026-04-12",status:"Pendente
],
despesas:[
{id:1,descricao:"Ferramentas SaaS",valor:890,data:"2026-04-01",categoria:"Ferramentas"}
{id:2,descricao:"Freelancer - Designer",valor:1200,data:"2026-04-05",categoria:"Equipe"
{id:3,descricao:"Escritório",valor:600,data:"2026-04-10",categoria:"Infraestrutura"},
]
}
};
// ── HELPERS ───────────────────────────────────────────
const SC = {
"Novo Lead":"#22d3ee","Proposta Enviada":"#f59e0b","Negociando":"#a78bfa","Fechado":"#4ade8
"Em Andamento":"#22d3ee","Em Revisão":"#f59e0b","Planejamento":"#a78bfa","Concluído":"#4ade
"Ativo":"#4ade80","Pausado":"#f59e0b","Inativo":"#f87171",
"Recebido":"#4ade80","Pendente":"#f59e0b","Atrasado":"#f87171",
"Reunião":"#a78bfa","Entrega":"#22d3ee","Prospecção":"#f59e0b","Execução":"#4ade80","Relató
};
const TI = {"Reunião":" ","Entrega":" ","Prospecção":" ","Execução":" ","Relatório":" "
const fmt = v => v?.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
// ── STYLES ────────────────────────────────────────────
const S = {
app:{display:"flex",width:"100%",height:"100%",background:"#070b14",color:"#e2e8f0",fontFam
sidebar:{width:236,background:"#0a0f1a",borderRight:"1px solid #1a2535",display:"flex",flex
logo:{padding:"20px 18px 16px",borderBottom:"1px solid #1a2535"},
nav:{padding:"10px 0",flex:1,overflowY:"auto"},
navSec:{fontSize:9,color:"#2d3f54",textTransform:"uppercase",letterSpacing:2,fontWeight:700
navItem:a=>({display:"flex",alignItems:"center",gap:10,padding:"9px 20px",cursor:"pointer",
content:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0},
header:{padding:"16px 28px",borderBottom:"1px solid #1a2535",display:"flex",alignItems:"cen
main:{flex:1,overflow:"auto",padding:"24px 28px"},
card:{background:"#0a0f1a",border:"1px solid #1a2535",borderRadius:14,padding:20},
grid:c=>({display:"grid",gridTemplateColumns:`repeat(${c},1fr)`,gap:14}),
kpi:{background:"#0a0f1a",border:"1px solid #1a2535",borderRadius:14,padding:"18px 20px"},
kL:{fontSize:10,color:"#3b5068",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}
kV:{fontSize:26,fontWeight:800,color:"#fff",letterSpacing:-1,margin:"6px 0 2px"},
kS:{fontSize:11,color:"#3b5068"},
table:{width:"100%",borderCollapse:"collapse"},
th:{textAlign:"left",padding:"9px 14px",fontSize:9,color:"#3b5068",textTransform:"uppercase
td:{padding:"11px 14px",fontSize:13,borderBottom:"1px solid #0c1420",color:"#94a3b8"},
btn:(v="primary")=>({padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontS
inp:{background:"#070b14",border:"1px solid #1a2535",borderRadius:8,padding:"9px 13px",colo
sel:{background:"#070b14",border:"1px solid #1a2535",borderRadius:8,padding:"9px 13px",colo
modal:{position:"fixed",inset:0,background:"#000b",display:"flex",alignItems:"center",justi
mbox:{background:"#0a0f1a",border:"1px solid #1a2535",borderRadius:16,padding:30,width:540,
lbl:{fontSize:10,color:"#3b5068",textTransform:"uppercase",letterSpacing:1,fontWeight:700,d
frow:{marginBottom:15},
tag:(c="#3b82f6")=>({background:c+"22",color:c,border:`1px solid ${c}44`,borderRadius:6,pad
badge:l=>({background:(SC[l]||"#64748b")+"22",color:SC[l]||"#94a3b8",border:`1px solid ${SC
prog:{height:5,background:"#131e2e",borderRadius:10,overflow:"hidden"},
pbar:(p,c="#3b82f6")=>({height:"100%",width:`${p}%`,background:c,borderRadius:10,transition
av:(c="#3b82f6")=>({width:34,height:34,borderRadius:"50%",background:c+"33",border:`2px sol
};
const Badge = ({label}) => <span style={S.badge(label)}>{label}</span>;
// ── INPUT CONTROLADO SEM LAG ───────────────────────────
// Usa estado local p/ evitar re-render do pai a cada tecla
function Field({label, value, onChange, type="text", placeholder="", readOnly=false, multilin
const [local, setLocal] = useState(value ?? "");
const handleChange = useCallback(e => {
setLocal(e.target.value);
onChange(e.target.value);
}, [onChange]);
const style = {...S.inp, ...(readOnly?{opacity:0.5,cursor:"not-allowed"}:{})};
return (
<div style={S.frow}>
{label && <label style={S.lbl}>{label}</label>}
{multiline
? <textarea style={{...style,height:rows*32,resize:"none"}} value={local} onChange={h
: <input style={style} type={type} value={local} onChange={handleChange} placeholder=
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
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin
<span style={{fontSize:17,fontWeight:800,color:"#fff"}}>{title}</span>
<button onClick={onClose} style={{background:"none",border:"none",color:"#4a6070",f
</div>
{children}
</div>
</div>
);
}
function Blocked() {
return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyConten
<div style={{fontSize:56}}> </div>
<div style={{fontSize:18,fontWeight:800,color:"#fff"}}>Acesso Restrito</div>
<div style={{fontSize:13,color:"#4a6070"}}>Você não tem permissão para este módulo.</div>
</div>;
}
function ReadOnly() {
return <div style={{background:"#1a2535",border:"1px solid #2d3f54",borderRadius:8,padding:
}
// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
function Login({users,onLogin}) {
const [email,setEmail] = useState("");
const [senha,setSenha] = useState("");
const [erro,setErro] = useState("");
const [show,setShow] = useState(false);
const handle = () => {
const u = users.find(u=>u.email===email&&u.senha===senha&&u.ativo);
if(u){onLogin(u);setErro("");}
else setErro("E-mail ou senha incorretos, ou usuário inativo.");
};
return (
<div style={{display:"flex",width:"100%",height:"100%",background:"#070b14",alignItems:"c
<div style={{width:400}}>
<div style={{textAlign:"center",marginBottom:36}}>
<div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
<div style={{background:"linear-gradient(135deg,#1a2535,#0d1420)",border:"1px sol
<LogoImg size={52}/>
</div>
</div>
<div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>Agência P
<div style={{fontSize:11,color:"#3b5068",letterSpacing:2.5,textTransform:"uppercase
</div>
<div style={{background:"#0a0f1a",border:"1px solid #1a2535",borderRadius:18,padding:
<div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:22}}>Entrar na su
<Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="s
<div style={{position:"relative",marginBottom:15}}>
<label style={S.lbl}>Senha</label>
<div style={{position:"relative"}}>
<input style={{...S.inp,paddingRight:40}} type={show?"text":"password"} placeho
value={senha} onChange={e=>{setSenha(e.target.value);setErro("");}}
onKeyDown={e=>e.key==="Enter"&&handle()}/>
<button onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"
</div>
</div>
{erro&&<div style={{background:"#7f1d1d22",border:"1px solid #7f1d1d",borderRadius:
<button onClick={handle} style={{...S.btn(),width:"100%",padding:"11px",fontSize:14
<div style={{marginTop:22,borderTop:"1px solid #1a2535",paddingTop:18}}>
<div style={{fontSize:11,color:"#3b5068",marginBottom:10,fontWeight:700,letterSpa
{users.slice(0,4).map(u=>(
<div key={u.id} onClick={()=>{setEmail(u.email);setSenha(u.senha);setErro("");}
style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRa
<div style={S.av(ROLES[u.role]?.color)}>{u.avatar}</div>
<div style={{flex:1}}>
<div style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{u.nome}</div>
<div style={{fontSize:10,color:"#3b5068"}}>{u.email}</div>
</div>
<span style={S.tag(ROLES[u.role]?.color)}>{ROLES[u.role]?.icon} {ROLES[u.role
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
const blank = {nome:"",email:"",senha:"",role:"operacional",ativo:true};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({...f,[k]:v}));
const openEdit = u => {setEditing(u);setForm({nome:u.nome,email:u.email,senha:u.senha,role:
const openNew = () => {setEditing(null);setForm(blank);setModal(true);};
const save = () => {
if(!form.nome||!form.email||!form.senha) return;
if(editing) setUsers(users.map(u=>u.id===editing.id?{...u,...form}:u));
else {
const av=(form.nome.split(" ").slice(0,2).map(w=>w[0]).join("")).toUpperCase();
setUsers([...users,{...form,id:Date.now(),criado:new Date().toISOString().slice(0,10),a
}
setModal(false);
};
const toggleAtivo = u => {if(u.role==="master")return;setUsers(users.map(x=>x.id===u.id?{..
const del = u => {if(u.role==="master")return;setUsers(users.filter(x=>x.id!==u.id));setCon
return (
<div>
<div style={{...S.grid(4),marginBottom:22}}>
{[["Total"," ",users.length,"#3b82f6"],["Ativos"," ",users.filter(u=>u.ativo).lengt
["Inativos"," ",users.filter(u=>!u.ativo).length,"#f87171"],["Perfis"," ",Object
<div key={l} style={S.kpi}><div style={S.kL}>{ic} {l}</div><div style={{...S.kV,col
))}
</div>
<div style={{...S.grid(3),marginBottom:22}}>
{Object.entries(ROLES).map(([key,r])=>(
<div key={key} style={{...S.card,borderLeft:`3px solid ${r.color}`}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
<span style={{fontSize:18}}>{r.icon}</span>
<span style={{fontWeight:800,color:"#fff",fontSize:13}}>{r.label}</span>
<span style={{...S.tag(r.color),marginLeft:"auto"}}>{users.filter(u=>u.role===k
</div>
<div style={{fontSize:11,color:"#4a6070",marginBottom:10}}>{r.desc}</div>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
{[["Ver",r.can.view],["Criar",r.can.create],["Editar",r.can.edit],["Excluir",r.
<span key={l} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadiu
))}
</div>
</div>
))}
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin
<span style={{fontWeight:700,color:"#fff",fontSize:14}}>Equipe</span>
<button style={S.btn()} onClick={openNew}>+ Novo Usuário</button>
</div>
<table style={S.table}>
<thead><tr>{["Usuário","E-mail","Perfil","Módulos","Status","Criado","Ações"].map(h
<tbody>{users.map(u=>{
const r=ROLES[u.role]; const isMaster=u.role==="master";
return (
<tr key={u.id}>
<td style={S.td}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={S.av(r.color)}>{u.avatar}</div>
<div>
<div style={{fontWeight:700,color:"#fff",fontSize:13}}>{u.nome}</div>
{isMaster&&<div style={{fontSize:9,color:r.color,fontWeight:700}}>CONTA
</div>
</div>
</td>
<td style={S.td}>{u.email}</td>
<td style={S.td}><span style={S.tag(r.color)}>{r.icon} {r.label}</span></td>
<td style={S.td}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{r.pages
<td style={S.td}><Badge label={u.ativo?"Ativo":"Inativo"}/></td>
<td style={S.td}>{u.criado}</td>
<td style={S.td}>
<div style={{display:"flex",gap:6}}>
<button style={S.btn("secondary")} onClick={()=>openEdit(u)}> </button>
{!isMaster&&<button style={{...S.btn("secondary"),color:u.ativo?"#f59e0b"
{!isMaster&&<button style={S.btn("danger")} onClick={()=>setConfirm(u)}>
</div>
</td>
</tr>
);
})}</tbody>
</table>
</div>
{modal&&(
<Modal title={editing?"Editar Usuário":"Novo Usuário"} onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<div style={{gridColumn:"span 2"}}><Field label="Nome Completo" value={form.nome}
<Field label="E-mail" value={form.email} onChange={set("email")}/>
<Field label="Senha" value={form.senha} onChange={set("senha")} type="password"/>
<div style={{gridColumn:"span 2"}}><SelField label="Perfil de Acesso" value={form
{form.role&&(
<div style={{gridColumn:"span 2",background:"#070b14",border:"1px solid #1a2535
<div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1,margi
<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
{[["Ver",ROLES[form.role]?.can.view],["Criar",ROLES[form.role]?.can.create]
<span key={l} style={{fontSize:10,padding:"3px 9px",borderRadius:6,backgr
))}
</div>
<div style={{fontSize:10,color:"#3b5068"}}>Módulos: {ROLES[form.role]?.pages.
</div>
)}
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:15}}>
<input type="checkbox" checked={form.ativo} onChange={e=>setForm(f=>({...f,ativ
<label htmlFor="ativo" style={{...S.lbl,marginBottom:0,cursor:"pointer"}}>Usuár
</div>
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
<button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
{confirm&&(
<Modal title="Confirmar Exclusão" onClose={()=>setConfirm(null)}>
<div style={{fontSize:14,color:"#94a3b8",marginBottom:22}}>Excluir <strong style={{
<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btn("secondary")} onClick={()=>setConfirm(null)}>Cancelar</butto
<button style={S.btn("danger")} onClick={()=>del(confirm)}>Excluir</button>
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
const [search,setSearch] = useState("");
const [obsId,setObsId] = useState(null);
const blank = {nome:"",segmento:"",contato:"",telefone:"",status:"Novo Lead",valor:"",orige
const [form,setForm] = useState(blank);
const [obsText,setObsText] = useState("");
const set = k => v => setForm(f=>({...f,[k]:v}));
const filtered = data.filter(p=>p.nome.toLowerCase().includes(search.toLowerCase())||p.segm
const save = () => {
if(!form.nome) return;
if(editId) setData(data.map(p=>p.id===editId?{...p,...form,valor:Number(form.valor)}:p));
else setData([...data,{...form,id:Date.now(),dataCriacao:new Date().toISOString().slice(0
setModal(false); setEditId(null); setForm(blank);
};
const openEdit = p => {setForm({...p,valor:String(p.valor)});setEditId(p.id);setModal(true)
const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const toggleObs = p => {if(obsId===p.id){setObsId(null);}else{setObsId(p.id);setObsText(p.o
const saveObs = p => {setData(data.map(x=>x.id===p.id?{...x,observacoes:obsText}:x));setObs
const pc = p=>p>=75?"#4ade80":p>=40?"#f59e0b":"#3b82f6";
return (
<div>
{!can.create&&!can.edit&&<ReadOnly/>}
<div style={{...S.grid(5),marginBottom:20}}>
{["Novo Lead","Proposta Enviada","Negociando","Fechado","Perdido"].map(s=>(
<div key={s} style={S.kpi}><div style={S.kL}>{s}</div><div style={{...S.kV,fontSize
))}
</div>
<div style={{...S.grid(2),marginBottom:20}}>
<div style={S.kpi}><div style={S.kL}>Pipeline Total</div><div style={{...S.kV,color:"
<div style={S.kpi}><div style={S.kL}>Total de Leads</div><div style={S.kV}>{data.leng
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
<input placeholder=" Buscar leads..." style={{...S.inp,maxWidth:280}} value={sear
{can.create&&<button style={S.btn()} onClick={openNew}>+ Novo Lead</button>}
</div>
<table style={S.table}>
<thead><tr>{["Empresa","Segmento","Contato","Status","Valor","Origem","Data","Obs",
<tbody>
{filtered.map(p=>(
<>
<tr key={p.id} style={{background:obsId===p.id?"#0c1625":"transparent"}}>
<td style={{...S.td,fontWeight:700,color:"#fff"}}>{p.nome}</td>
<td style={S.td}><span style={S.tag()}>{p.segmento}</span></td>
<td style={S.td}>{p.contato}</td>
<td style={S.td}><Badge label={p.status}/></td>
<td style={{...S.td,color:"#4ade80",fontWeight:700}}>{fmt(p.valor)}</td>
<td style={S.td}>{p.origem}</td>
<td style={S.td}>{p.dataCriacao}</td>
<td style={S.td}>
<button onClick={()=>toggleObs(p)} style={{background:p.observacoes?"#22d
{obsId===p.id?"▲":"▼"}
</button>
</td>
<td style={S.td}>{can.edit&&<button style={S.btn("secondary")} onClick={()=
</tr>
{obsId===p.id&&(
<tr key={p.id+"_o"}>
<td colSpan={9} style={{padding:"0 14px 14px",background:"#0c1625",border
<div style={{background:"#070b14",border:"1px solid #22d3ee33",borderRa
<div style={{fontSize:10,color:"#22d3ee",fontWeight:700,letterSpacing
<textarea style={{...S.inp,height:80,resize:"vertical",borderColor:"#
placeholder="Anotações sobre este lead..."
value={obsText} onChange={e=>setObsText(e.target.value)} readOnly={
{can.edit&&(
<div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex
<button style={S.btn("secondary")} onClick={()=>setObsId(null)}>C
<button style={{...S.btn(),background:"#0e7490"}} onClick={()=>sa
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
<Modal title={editId?"Editar Lead":"Novo Lead"} onClose={()=>setModal(false)} wide>
<div style={S.grid(2)}>
<div style={{gridColumn:"span 2"}}><Field label="Empresa" value={form.nome} onCha
<Field label="Segmento" value={form.segmento} onChange={set("segmento")}/>
<Field label="E-mail" value={form.contato} onChange={set("contato")}/>
<Field label="Telefone" value={form.telefone} onChange={set("telefone")}/>
<Field label="Valor Estimado" value={form.valor} onChange={set("valor")}/>
<Field label="Origem" value={form.origem} onChange={set("origem")}/>
<div style={{gridColumn:"span 2"}}><SelField label="Status" value={form.status} o
<div style={{gridColumn:"span 2"}}><Field label="Notas" value={form.notas} <div style={{gridColumn:"span 2"}}><Field label="Observações Internas" value={for
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
<button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
onChan
)}
</div>
);
}
// ══════════════════════════════════════════════════════
// CLIENTE DETALHE (painel lateral)
// ══════════════════════════════════════════════════════
function ClienteDetalhe({cliente,onClose,onSave,can}) {
const [c,setC] = useState({...cliente});
const [novoComentario,setNovoComentario] = useState("");
const set = k => v => setC(x=>({...x,[k]:v}));
const addComentario = () => {
if(!novoComentario.trim()) return;
setC(x=>({...x,comentarios:[...(x.comentarios||[]),{id:Date.now(),texto:novoComentario,da
setNovoComentario("");
};
const removeComentario = id => setC(x=>({...x,comentarios:(x.comentarios||[]).filter(c=>c.i
const urlOk = url => {try{new URL(url);return true;}catch{return false;}};
return (
<div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"flex-
<div style={{width:520,height:"100%",background:"#0a0f1a",borderLeft:"1px solid #1a2535
<div style={{padding:"20px 24px",borderBottom:"1px solid #1a2535",display:"flex",just
<div>
<div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{c.nome}</div>
<div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
<span style={S.tag("#a78bfa")}>{c.segmento}</span>
{can.edit
? <select style={{...S.sel,width:"auto",padding:"2px 8px",fontSize:11}} value
{["Ativo","Pausado","Inativo"].map(o=><option key={o}>{o}</option>)}
</select>
: <Badge label={c.status}/>
}
</div>
</div>
<button onClick={onClose} style={{background:"none",border:"none",color:"#4a6070",f
</div>
<div style={{flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:20,
{/* Dados */}
<div style={{background:"#070b14",border:"1px solid #1a2535",borderRadius:12,paddin
<div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1.5,textTra
<div style={S.grid(2)}>
{can.edit?(
<>
<Field label="Nome" value={c.nome} onChange={set("nome")}/>
<Field label="Segmento" value={c.segmento} onChange={set("segmento")}/>
<Field label="E-mail" value={c.contato} onChange={set("contato")}/>
<Field label="Telefone" value={c.telefone||""} onChange={set("telefone")}/>
<Field label="Mensalidade (R$)" value={String(c.valor)} onChange={v=>setC(x
<Field label="Verba de Mídia (R$)" value={String(c.investimento)} onChange=
<Field label="Início" value={c.inicio} onChange={set("inicio")} type="date"
<SelField label="Plano" value={c.plano} onChange={set("plano")} options={["
</>
):(
[["Plano",c.plano,"#94a3b8"],["Mensalidade",fmt(c.valor),"#4ade80"],["Verba",
<div key={l}><div style={{fontSize:9,color:"#3b5068",textTransform:"upperca
))
)}
</div>
</div>
{/* URLs */}
<div style={{background:"#070b14",border:"1px solid #1a2535",borderRadius:12,paddin
<div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1.5,textTra
{[["urlSite","Site / Landing Page"],["urlAds","Conta de Anúncios"],["urlRelatorio
<div key={k} style={{marginBottom:10}}>
<label style={S.lbl}>{l}</label>
<div style={{display:"flex",gap:6}}>
{can.edit
? <input style={{...S.inp,flex:1}} placeholder="https://..." value={c[k]|
: <div style={{...S.inp,flex:1,color:"#4a6070"}}>{c[k]||"—"}</div>
}
{c[k]&&urlOk(c[k])&&<a href={c[k]} target="_blank" rel="noreferrer" style={
</div>
</div>
))}
</div>
{/* Comentários */}
<div style={{background:"#070b14",border:"1px solid #1a2535",borderRadius:12,paddin
<div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1.5,textTra
<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
{(c.comentarios||[]).length===0&&<div style={{fontSize:12,color:"#3b5068",textA
{(c.comentarios||[]).map(cm=>(
<div key={cm.id} style={{background:"#131e2e",border:"1px solid #1a2535",bord
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex
<div style={{flex:1}}>
<div style={{fontSize:13,color:"#e2e8f0",lineHeight:1.5}}>{cm.texto}</d
<div style={{fontSize:10,color:"#3b5068",marginTop:4}}> {cm.autor} ·
</div>
{can.edit&&<button onClick={()=>removeComentario(cm.id)} style={{backgrou
</div>
</div>
))}
</div>
{can.edit&&(
<div style={{display:"flex",gap:8}}>
<textarea style={{...S.inp,flex:1,height:60,resize:"none"}}
placeholder="Adicionar comentário... (Enter para enviar)"
value={novoComentario} onChange={e=>setNovoComentario(e.target.value)}
onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addComen
<button style={{...S.btn(),alignSelf:"flex-end",padding:"10px 14px"}} onClick
</div>
)}
</div>
</div>
<div style={{padding:"16px 24px",borderTop:"1px solid #1a2535",display:"flex",gap:8,j
<button style={S.btn("secondary")} onClick={onClose}>Fechar</button>
{can.edit&&<button style={S.btn()} onClick={()=>onSave(c)}> Salvar Alterações</bu
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
const blank = {nome:"",segmento:"",contato:"",telefone:"",plano:"Starter",valor:"",inicio:"
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({...f,[k]:v}));
const mrr = data.reduce((a,c)=>a+c.valor,0);
const save = () => {
if(!form.nome) return;
setData([...data,{...form,id:Date.now(),status:"Ativo",valor:Number(form.valor),investime
setModal(false); setForm(blank);
};
const saveDetalhe = updated => {setData(data.map(c=>c.id===updated.id?updated:c));setDetalh
return (
<div>
{!can.create&&!can.edit&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
<div style={S.kpi}><div style={S.kL}>MRR</div><div style={{...S.kV,color:"#4ade80"}}>
<div style={S.kpi}><div style={S.kL}>Ativos</div><div style={S.kV}>{data.filter(c=>c.
<div style={S.kpi}><div style={S.kL}>Verba Gerenciada</div><div style={{...S.kV,color
<div style={S.kpi}><div style={S.kL}>Ticket Médio</div><div style={S.kV}>{fmt(mrr/(da
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
<span style={{fontWeight:700,color:"#fff",fontSize:14}}>Carteira de Clientes</span>
{can.create&&<button style={S.btn()} onClick={()=>setModal(true)}>+ Novo Cliente</b
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
{data.map(c=>(
<div key={c.id} onClick={()=>setDetalhe(c)}
style={{background:"#070b14",border:"1px solid #1a2535",borderRadius:12,padding
onMouseEnter={e=>e.currentTarget.style.borderColor="#2d3f54"}
onMouseLeave={e=>e.currentTarget.style.borderColor="#1a2535"}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
<div><div style={{fontWeight:800,color:"#fff",fontSize:14}}>{c.nome}</div><sp
<Badge label={c.status}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{[["Plano",c.plano,"#94a3b8"],["Mensalidade",fmt(c.valor),"#4ade80"],["Verba"
<div key={l}><div style={{fontSize:9,color:"#3b5068",textTransform:"upperca
))}
</div>
<div style={{marginTop:10,borderTop:"1px solid #1a2535",paddingTop:8,display:"f
<span style={{fontSize:11,color:"#3b5068"}}> {c.contato}</span>
<div style={{display:"flex",gap:4}}>
{(c.comentarios||[]).length>0&&<span style={S.tag("#22d3ee")}> {c.comenta
{(c.urlSite||c.urlAds)&&<span style={S.tag("#4ade80")}> </span>}
</div>
</div>
</div>
))}
</div>
</div>
{modal&&(
<Modal title="Novo Cliente" onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<Field label="Empresa" value={form.nome} onChange={set("nome")}/>
<Field label="Segmento" value={form.segmento} onChange={set("segmento")}/>
<Field label="E-mail" value={form.contato} onChange={set("contato")}/>
<Field label="Telefone" value={form.telefone} onChange={set("telefone")}/>
<Field label="Mensalidade (R$)" value={form.valor} onChange={set("valor")}/>
<Field label="Verba de Mídia (R$)" value={form.investimento} onChange={set("inves
<Field label="Início" value={form.inicio} onChange={set("inicio")} type="date"/>
<SelField label="Plano" value={form.plano} onChange={set("plano")} options={["Sta
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button
<button style={S.btn()} onClick={save}>Salvar</button>
</div>
</Modal>
)}
</div>
{detalhe&&<ClienteDetalhe cliente={detalhe} onClose={()=>setDetalhe(null)} onSave={save
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
const set = k => v => setForm(f=>({...f,[k]:v}));
const pc = p=>p>=75?"#4ade80":p>=40?"#f59e0b":"#3b82f6";
const toggleTarefa = (proj,idx) => {
if(!can.edit) return;
setData(data.map(p=>{
if(p.id!==proj.id) return p;
const done=p.tarefasConcluidas.includes(idx)?p.tarefasConcluidas.filter(i=>i!==idx):[..
return {...p,tarefasConcluidas:done,progresso:Math.round((done.length/p.tarefas.length)
}));
};
const openEdit = p => {setForm({...p,inicio:p.inicio,fim:p.fim});setEditModal(true);};
const saveEdit = () => {
setData(data.map(p=>p.id===form.id?{...form,progresso:Math.round((form.tarefasConcluidas.
setEditModal(false);
};
return (
<div>
{!can.edit&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
{[["Em Andamento","#22d3ee"],["Em Revisão","#f59e0b"],["Planejamento","#a78bfa"],["Co
<div key={s} style={S.kpi}><div style={S.kL}>{s}</div><div style={{...S.kV,color:c}
))}
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin
<span style={{fontWeight:700,color:"#fff",fontSize:14}}>Projetos em Curso</span>
{can.edit&&<span style={{fontSize:11,color:"#3b5068"}}>Clique em um projeto para ex
</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
{data.map(p=>(
<div key={p.id} style={{background:"#070b14",border:"1px solid #1a2535",borderRad
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
<div style={{cursor:"pointer",flex:1}} onClick={()=>setSelected(selected?.id=
<div style={{fontWeight:800,color:"#fff",fontSize:14}}>{p.nome}</div>
<div style={{fontSize:11,color:"#3b5068",marginTop:2}}> {p.cliente} · {p.
</div>
<div style={{display:"flex",gap:8,alignItems:"center"}}>
<Badge label={p.status}/>
{can.edit&&<button style={S.btn("secondary")} onClick={()=>openEdit(p)}> <
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onCli
<div style={{flex:1,...S.prog}}><div style={S.pbar(p.progresso,pc(p.progresso
<span style={{fontSize:12,fontWeight:800,color:pc(p.progresso),minWidth:34}}>
</div>
{selected?.id===p.id&&(
<div style={{marginTop:16,borderTop:"1px solid #1a2535",paddingTop:14}}>
<div style={{fontSize:10,color:"#3b5068",textTransform:"uppercase",letterSp
{p.tarefas.map((t,i)=>{
const done=p.tarefasConcluidas.includes(i);
return (
<div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBo
<div style={{width:16,height:16,borderRadius:4,border:`2px solid ${do
{done&&<span style={{fontSize:10,color:"#000",fontWeight:900}}>✓</s
</div>
<span style={{fontSize:13,color:done?"#4ade80":"#94a3b8",textDecorati
</div>
);
})}
</div>
)}
</div>
type="
))}
</div>
</div>
{editModal&&form&&(
<Modal title="Editar Projeto" onClose={()=>setEditModal(false)} wide>
<div style={S.grid(2)}>
<div style={{gridColumn:"span 2"}}><Field label="Nome do Projeto" value={form.nom
<Field label="Cliente" value={form.cliente} onChange={set("cliente")}/>
<SelField label="Status" value={form.status} onChange={set("status")} options={["
<Field label="Data de Início" value={form.inicio} onChange={set("inicio")} <Field label="Data de Fim" value={form.fim} onChange={set("fim")} type="date"/>
<div style={{gridColumn:"span 2"}}>
<label style={S.lbl}>Tarefas (uma por linha)</label>
<textarea style={{...S.inp,height:100,resize:"none"}}
value={form.tarefas.join("\n")}
onChange={e=>setForm(f=>({...f,tarefas:e.target.value.split("\n").filter(Bool
</div>
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
<button style={S.btn("secondary")} onClick={()=>setEditModal(false)}>Cancelar</bu
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
const blank = {titulo:"",data:"",hora:"",tipo:"Reunião",cliente:"",descricao:""};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({...f,[k]:v}));
const today = new Date().toISOString().slice(0,10);
const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const openEdit = e => {setForm({...e});setEditId(e.id);setModal(true);};
const save = () => {
if(!form.titulo) return;
if(editId) setData(data.map(e=>e.id===editId?{...form,id:editId}:e));
else setData([...data,{...form,id:Date.now()}]);
setModal(false);setEditId(null);setForm(blank);
};
const del = id => setData(data.filter(e=>e.id!==id));
return (
<div>
{!can.create&&<ReadOnly/>}
<div style={{...S.grid(4),marginBottom:20}}>
{[["Hoje",data.filter(e=>e.data===today).length,"#3b82f6"],["Total",data.length,"#a78
["Reuniões",data.filter(e=>e.tipo==="Reunião").length,"#22d3ee"],["Entregas",data.f
<div key={l} style={S.kpi}><div style={S.kL}>{l}</div><div style={{...S.kV,color:c}
))}
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
<span style={{fontWeight:700,color:"#fff",fontSize:14}}>Agenda de Execução</span>
{can.create&&<button style={S.btn()} onClick={openNew}>+ Novo Evento</button>}
</div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{[...data].sort((a,b)=>a.data.localeCompare(b.data)||a.hora.localeCompare(b.hora)).
<div key={e.id} style={{background:"#070b14",border:"1px solid #1a2535",borderRad
<div style={{fontSize:24}}>{TI[e.tipo]}</div>
<div style={{flex:1}}>
<div style={{fontWeight:700,color:"#fff",marginBottom:2}}>{e.titulo}</div>
<div style={{fontSize:11,color:"#3b5068"}}> {e.cliente} · {e.descricao}</di
{e.ho
</div>
<div style={{textAlign:"right"}}>
<Badge label={e.tipo}/>
<div style={{fontSize:11,color:"#3b5068",marginTop:4}}> {e.data} · </div>
{can.edit&&(
<div style={{display:"flex",gap:6,marginLeft:8}}>
<button style={S.btn("secondary")} onClick={()=>openEdit(e)}> </button>
{can.delete&&<button style={S.btn("danger")} onClick={()=>del(e.id)}> </bu
</div>
)}
</div>
))}
</div>
</div>
{modal&&(
<Modal title={editId?"Editar Evento":"Novo Evento"} onClose={()=>setModal(false)}>
<div style={S.grid(2)}>
<div style={{gridColumn:"span 2"}}><Field label="Título" value={form.titulo} onCh
<Field label="Data" value={form.data} onChange={set("data")} type="date"/>
<Field label="Hora" value={form.hora} onChange={set("hora")} type="time"/>
<SelField label="Tipo" value={form.tipo} onChange={set("tipo")} options={["Reuniã
<Field label="Cliente" value={form.cliente} onChange={set("cliente")}/>
<div style={{gridColumn:"span 2"}}><Field label="Descrição" value={form.descricao
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button
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
const [tab,setTab] = useState("receitas");
const [modal,setModal] = useState(false);
const [editId,setEditId] = useState(null);
const blank = {descricao:"",valor:"",data:"",status:"Pendente",categoria:"Mensalidade"};
const [form,setForm] = useState(blank);
const set = k => v => setForm(f=>({...f,[k]:v}));
const totalRec = data.receitas.reduce((a,r)=>a+r.valor,0);
const totalDes = data.despesas.reduce((a,d)=>a+d.valor,0);
const recebido = data.receitas.filter(r=>r.status==="Recebido").reduce((a,r)=>a+r.valor,0);
const openNew = () => {setForm(blank);setEditId(null);setModal(true);};
const openEdit = item => {setForm({...item,valor:String(item.valor)});setEditId(item.id);se
const save = () => {
if(!form.descricao) return;
const item = {...form,valor:Number(form.valor)};
if(editId){
if(tab==="receitas") setData({...data,receitas:data.receitas.map(r=>r.id===editId?{...i
else setData({...data,despesas:data.despesas.map(d=>d.id===editId?{...item,id:editId}:d
} else {
if(tab==="receitas") setData({...data,receitas:[...data.receitas,{...item,id:Date.now()
else setData({...data,despesas:[...data.despesas,{...item,id:Date.now()}]});
}
setModal(false);setEditId(null);setForm(blank);
};
const del = id => {
if(tab==="receitas") setData({...data,receitas:data.receitas.filter(r=>r.id!==id)});
else setData({...data,despesas:data.despesas.filter(d=>d.id!==id)});
};
return (
<div>
<div style={{...S.grid(4),marginBottom:20}}>
{[["Receita Total",fmt(totalRec),"#4ade80"],["Recebido",fmt(recebido),"#22d3ee"],
["Despesas",fmt(totalDes),"#f87171"],["Lucro",fmt(totalRec-totalDes),totalRec>=tota
<div key={l} style={S.kpi}><div style={S.kL}>{l}</div><div style={{...S.kV,color:c}
))}
</div>
<div style={S.card}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin
<div style={{display:"flex",gap:6}}>
{["receitas","despesas"].map(t=>(
<button key={t} style={{...S.btn(tab===t?"primary":"secondary"),textTransform:"
))}
</div>
{can.create&&<button style={S.btn()} onClick={openNew}>+ Nova {tab==="receitas"?"Re
</div>
<table style={S.table}>
<thead><tr>{["Descrição","Valor","Data","Categoria",tab==="receitas"?"Status":"",""
<tbody>{data[tab].map(item=>(
<tr key={item.id}>
<td style={{...S.td,fontWeight:600,color:"#fff"}}>{item.descricao}</td>
<td style={{...S.td,fontWeight:800,color:tab==="receitas"?"#4ade80":"#f87171"}}
<td style={S.td}>{item.data}</td>
<td style={S.td}><span style={S.tag("#a78bfa")}>{item.categoria}</span></td>
{tab==="receitas"?<td style={S.td}><Badge label={item.status}/></td>:<td style=
<td style={S.td}>
{can.edit&&(
<div style={{display:"flex",gap:6}}>
<button style={S.btn("secondary")} onClick={()=>openEdit(item)}> </butto
{can.delete&&<button style={S.btn("danger")} onClick={()=>del(item.id)}>
</div>
)}
</td>
</tr>
))}</tbody>
</table>
</div>
{modal&&(
<Modal title={`${editId?"Editar":"Nova"} ${tab==="receitas"?"Receita":"Despesa"}`} on
<div style={S.grid(2)}>
<div style={{gridColumn:"span 2"}}><Field label="Descrição" value={form.descricao
<Field label="Valor (R$)" value={form.valor} onChange={set("valor")}/>
<Field label="Data" value={form.data} onChange={set("data")} type="date"/>
<SelField label="Categoria" value={form.categoria} onChange={set("categoria")} op
{tab==="receitas"&&<SelField label="Status" value={form.status} onChange={set("st
</div>
<div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
<button style={S.btn("secondary")} onClick={()=>setModal(false)}>Cancelar</button
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
<div style={S.kpi}><div style={S.kL}>MRR</div><div style={{...S.kV,color:"#4ade80"}}>
<div style={S.kpi}><div style={S.kL}>Pipeline</div><div style={{...S.kV,color:"#3b82f
<div style={S.kpi}><div style={S.kL}>Projetos Ativos</div><div style={{...S.kV,color:
{can.finance
?<div style={S.kpi}><div style={S.kL}>Lucro do Mês</div><div style={{...S.kV,color:
:<div style={S.kpi}><div style={S.kL}>Seu Perfil</div><div style={{fontSize:18,font
}
</div>
<div style={S.grid(2)}>
<div style={S.card}>
<div style={{fontWeight:700,color:"#fff",marginBottom:14,fontSize:13}}> Próximos
{data.agenda.slice(0,4).map(e=>(
<div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:
<div><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{e.titulo}</div>
<div style={{textAlign:"right"}}><Badge label={e.tipo}/><div style={{fontSize:1
</div>
))}
</div>
<div style={S.card}>
<div style={{fontWeight:700,color:"#fff",marginBottom:14,fontSize:13}}> Progresso
{data.projetos.map(p=>(
<div key={p.id} style={{marginBottom:14}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
<span style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{p.nome}</span>
<span style={{fontSize:11,color:"#3b5068"}}>{p.progresso}%</span>
</div>
<div style={S.prog}><div style={S.pbar(p.progresso,p.progresso>=75?"#4ade80":p.
</div>
))}
</div>
{can.finance&&(
<div style={S.card}>
<div style={{fontWeight:700,color:"#fff",marginBottom:14,fontSize:13}}> Receita
{data.financeiro.receitas.filter(r=>r.status==="Pendente").map(r=>(
<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItem
<div style={{fontSize:13,color:"#e2e8f0"}}>{r.descricao}</div>
<span style={{fontWeight:800,color:"#f59e0b"}}>{fmt(r.valor)}</span>
</div>
))}
</div>
)}
<div style={S.card}>
<div style={{fontWeight:700,color:"#fff",marginBottom:14,fontSize:13}}> Funil de
{["Novo Lead","Proposta Enviada","Negociando","Fechado"].map(s=>{
const n=data.prospects.filter(p=>p.status===s).length;
const pct=Math.round((n/data.prospects.length)*100)||0;
return (
<div key={s} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><
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
{id:"dashboard",label:"Dashboard",icon:" ",section:"principal"},
{id:"prospeccao",label:"Prospecção",icon:" ",section:"comercial"},
{id:"clientes",label:"Clientes",icon:" ",section:"comercial"},
{id:"projetos",label:"Projetos",icon:" ",section:"operacional"},
{id:"agenda",label:"Agenda",icon:" ",section:"operacional"},
{id:"financeiro",label:"Financeiro",icon:" ",section:"gestao"},
{id:"usuarios",label:"Usuários",icon:" ",section:"gestao"},
];
const SL = {principal:"Principal",comercial:"Comercial",operacional:"Operacional",gestao:"Ges
export default function App() {
const [users,setUsers] = useState(INITIAL_USERS);
const [currentUser,setCurrentUser] = useState(null);
const [page,setPage] = useState("dashboard");
const [data,setData] = useState(initialData);
const [profileModal,setProfileModal] = useState(false);
const upP = v=>setData(d=>({...d,prospects:v}));
const upC = v=>setData(d=>({...d,clientes:v}));
const upPr = v=>setData(d=>({...d,projetos:v}));
const upA = v=>setData(d=>({...d,agenda:v}));
const upF = v=>setData(d=>({...d,financeiro:v}));
if(!currentUser) return (
<>
<style>{globalCSS}</style>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&displ
<Login users={users} onLogin={u=>{setCurrentUser(u);setPage("dashboard");}}/>
</>
);
const role = ROLES[currentUser.role];
const visiblePages = ALL_PAGES.filter(p=>role.pages.includes(p.id));
const sections = [...new Set(visiblePages.map(p=>p.section))];
const logout = () => {setCurrentUser(null);setPage("dashboard");};
const curPage = ALL_PAGES.find(p=>p.id===page);
return (
<AuthCtx.Provider value={{user:currentUser,users}}>
<style>{globalCSS}</style>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&displ
<div style={S.app}>
{/* SIDEBAR */}
<div style={S.sidebar}>
<div style={S.logo}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{background:"linear-gradient(135deg,#1a2535,#0d1420)",border:"1px s
<LogoImg size={28}/>
</div>
<div>
<div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.3,lineH
<div style={{fontSize:9,color:"#3b4d63",letterSpacing:2,textTransform:"upperc
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
<div style={{padding:"14px 16px",borderTop:"1px solid #1a2535"}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"po
<div style={S.av(role.color)}>{currentUser.avatar}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",o
<div style={{fontSize:10,color:role.color,fontWeight:700}}>{role.icon} {role.
</div>
</div>
<button onClick={logout} style={{...S.btn("ghost"),width:"100%",fontSize:11,paddi
</div>
</div>
{/* CONTENT */}
<div style={S.content}>
<div style={S.header}>
<div>
<div style={S.headerTitle}>{curPage?.icon} {curPage?.label}</div>
<div style={{fontSize:11,color:"#3b5068",marginTop:2}}>Abril 2026 · <span style
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
{page==="clientes" &&<Clientes data={data.clientes} setData={upC}/>}
{page==="projetos" &&<Projetos data={data.projetos} setData={upPr}/>}
{page==="agenda" &&<Agenda data={data.agenda} setData={upA}/>}
{page==="financeiro"&&<Financeiro data={data.financeiro} setData={upF}/>}
{page==="usuarios" &&<Usuarios users={users} setUsers={setUsers} currentUser={cu
</div>
</div>
{/* PROFILE MODAL */}
{profileModal&&(
<Modal title="Meu Perfil" onClose={()=>setProfileModal(false)}>
<div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22,background
<div style={{...S.av(role.color),width:52,height:52,fontSize:18}}>{currentUser.
<div>
<div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{currentUser.nome}</di
<div style={{fontSize:12,color:"#3b5068",marginTop:2}}>{currentUser.email}</d
<span style={{...S.tag(role.color),marginTop:6,display:"inline-block"}}>{role
</div>
</div>
<div style={{background:"#070b14",borderRadius:12,padding:16,marginBottom:16}}>
<div style={{fontSize:10,color:"#3b5068",fontWeight:700,letterSpacing:1,marginB
<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
{[["Ver",role.can.view],["Criar",role.can.create],["Editar",role.can.edit],["
<span key={l} style={{fontSize:11,padding:"4px 10px",borderRadius:6,backgro
))}
</div>
<div style={{fontSize:11,color:"#3b5068"}}>Módulos: <span style={{color:"#94a3b
</div>
<div style={{display:"flex",alignItems:"center",gap:10,background:"#070b14",borde
<LogoImg size={32}/><div><div style={{fontWeight:800,color:"#fff",fontSize:14}}
</div>
<button onClick={()=>{logout();setProfileModal(false);}} style={{...S.btn("danger
</Modal>
)}
</div>
</AuthCtx.Provider>
);
}
