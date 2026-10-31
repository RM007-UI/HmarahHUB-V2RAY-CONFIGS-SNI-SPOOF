(() => {
"use strict";
const $=id=>document.getElementById(id),state={rows:[],filter:"all"},fa=n=>new Intl.NumberFormat("fa-IR").format(n);
function decodeB64(s){try{const b=atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"="));return new TextDecoder().decode(Uint8Array.from(b,c=>c.charCodeAt(0)))}catch{return""}}
function json(s){try{return JSON.parse(s)}catch{return null}}
function pname(p){return({vless:"VLESS",vmess:"VMess",trojan:"Trojan",ss:"Shadowsocks",shadowsocks:"Shadowsocks",socks:"SOCKS",http:"HTTP",https:"HTTPS"})[String(p||"").toLowerCase()]||"نامشخص"}
function inspectUri(raw,id){
const m=raw.trim().match(/^([a-z][a-z0-9+.-]*):\/\//i);if(!m)return null;
const p=m[1].toLowerCase();if(!["vless","vmess","trojan","ss","shadowsocks","socks","http","https"].includes(p))return null;
let tls="unknown",sni=false,transport="نامشخص";
if(p==="vmess"){const obj=json(decodeB64(raw.trim().slice(raw.indexOf("://")+3).split("#")[0]));if(obj){const sec=String(obj.tls||obj.security||"").toLowerCase();tls=sec==="tls"?"tls":(!sec||sec==="none"?"plain":"unknown");sni=!!(obj.sni||obj.host);transport=obj.net||"tcp"}}
else{let q;try{q=new URL(raw.trim()).searchParams}catch{q=new URLSearchParams()}const sec=String(q.get("security")||q.get("tls")||"").toLowerCase();if(p==="trojan")tls="tls";else if(sec==="tls")tls="tls";else if(["none","false",""].includes(sec))tls=["ss","shadowsocks"].includes(p)?"plain":"unknown";if(sec==="reality")tls="unknown";sni=!!(q.get("sni")||q.get("servername")||q.get("peer"));transport=q.get("type")||q.get("network")||"tcp"}
return{id,protocol:pname(p),tls,sni,transport:String(transport).slice(0,24),source:"URI"}
}
function inspectJson(text,start){const root=json(text);if(!root)return[];const out=Array.isArray(root.outbounds)?root.outbounds:[],rows=[];for(const o of out){const p=String(o.protocol||o.type||"");if(!p||["freedom","blackhole","dns","loopback"].includes(p.toLowerCase()))continue;const s=o.streamSettings||o.transport||{},sec=String(s.security||(s.tls&&s.tls.enabled?"tls":"")).toLowerCase(),tls=sec==="tls"?"tls":(!sec||sec==="none"?"plain":"unknown"),t=s.tlsSettings||s.realitySettings||s.tls||{};rows.push({id:start+rows.length,protocol:pname(p),tls,sni:!!(t.serverName||t.server_name||t.serverNames),transport:String(s.network||s.type||"tcp").slice(0,24),source:"JSON"})}return rows}
function parse(input){const text=input.trim();if(!text)return[];const jr=inspectJson(text,state.rows.length+1);if(jr.length)return jr;let lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(lines.length===1&&!/^[a-z][a-z0-9+.-]*:\/\//i.test(lines[0])&&!lines[0].startsWith("{")){const d=decodeB64(lines[0]);if(d.includes("://"))lines=d.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}const found=[];for(const line of lines){const r=inspectUri(line,state.rows.length+found.length+1);if(r)found.push(r)}return found}
function counts(){return{all:state.rows.length,tls:state.rows.filter(x=>x.tls==="tls").length,plain:state.rows.filter(x=>x.tls==="plain").length,unknown:state.rows.filter(x=>x.tls==="unknown").length}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){const c=counts();for(const [id,n]of [["totalCount",c.all],["tlsCount",c.tls],["plainCount",c.plain],["unknownCount",c.unknown],["allTab",c.all],["tlsTab",c.tls],["plainTab",c.plain],["unknownTab",c.unknown]])$(id).textContent=fa(n);$("downloadReport").disabled=!c.all;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.filter===state.filter));const rows=state.rows.filter(x=>state.filter==="all"||x.tls===state.filter),host=$("resultsList");if(!rows.length){host.innerHTML='<div class="empty"><span>◎</span><strong>موردی در این بخش نیست</strong><p>فایل خودت را وارد کن یا فیلتر دیگری را انتخاب کن.</p></div>';return}host.innerHTML=rows.map((r,i)=>{const cls=r.tls==="tls"?"tls":r.tls==="plain"?"plain":"unknown",label=r.tls==="tls"?"TLS":r.tls==="plain"?"غیر TLS":"نامشخص";return'<article class="result"><div class="result-icon">'+esc(r.protocol.slice(0,3))+'</div><div><div class="result-title">مورد '+fa(i+1)+' · '+esc(r.protocol)+'</div><div class="result-meta"><span>ساختار: '+r.source+'</span><span>انتقال: '+esc(r.transport)+'</span><span>SNI: '+(r.sni?"وجود دارد":"یافت نشد")+'</span></div></div><span class="pill '+cls+'">'+label+'</span></article>'}).join("")}
function add(input){const rows=parse(input);if(!rows.length){alert("کانفیگ قابل‌شناسایی در ورودی پیدا نشد.");return}state.rows.push(...rows);render()}
$("fileInput").addEventListener("change",async e=>{for(const f of Array.from(e.target.files||[])){try{add(await f.text())}catch{alert("خواندن فایل ناموفق بود.")}}e.target.value=""});
$("pasteToggle").addEventListener("click",()=>$("pastePanel").classList.toggle("hidden"));$("parsePaste").addEventListener("click",()=>add($("pasteInput").value));
$("clearButton").addEventListener("click",()=>{state.rows=[];state.filter="all";$("pasteInput").value="";render()});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{state.filter=t.dataset.filter;render()}));
const dz=$("dropzone");["dragenter","dragover"].forEach(e=>dz.addEventListener(e,x=>{x.preventDefault();dz.classList.add("dragover")}));["dragleave","drop"].forEach(e=>dz.addEventListener(e,x=>{x.preventDefault();dz.classList.remove("dragover")}));dz.addEventListener("drop",async e=>{for(const f of Array.from(e.dataTransfer.files||[])){try{add(await f.text())}catch{}}});
$("downloadReport").addEventListener("click",()=>{const rows=[["item","protocol","classification","sni_present","transport","source"],...state.rows.map((r,i)=>[i+1,r.protocol,r.tls,r.sni,r.transport,r.source])],csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="hmarahhub-audit-report.csv";a.click();URL.revokeObjectURL(url)});

async function renderOnlineSources(){
  const host=$("onlineSources");
  if(!host)return;
  try{
    const response=await fetch("./sources.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();
    const sources=Array.isArray(data.sources)?data.sources:[];
    host.innerHTML=sources.map(source=>{
      const outputs=Array.isArray(source.outputs)?source.outputs:[];
      const links=outputs.map(item=>'<a class="source-file" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.label)+'</a>').join("");
      return '<article class="source-card"><div class="source-card-head"><span class="source-kind">'+esc(source.kind)+'</span><span class="source-updated">آخرین فعالیت: '+esc(source.pushed_at||"نامشخص")+'</span></div><h3>'+esc(source.name)+'</h3><p class="source-description">'+esc(source.description)+'</p><div class="source-links">'+links+'</div><div class="source-license">'+esc(source.license)+'</div><a class="source-repo" href="'+esc(source.repo)+'" target="_blank" rel="noopener noreferrer">مشاهدهٔ مخزن در GitHub ↗</a></article>';
    }).join("");
    if(!sources.length)host.innerHTML='<div class="source-loading">هنوز منبعی ثبت نشده است.</div>';
  }catch(error){
    host.innerHTML='<div class="source-loading">فهرست منابع بارگذاری نشد؛ فایل sources.json را بررسی کن.</div>';
  }
}

render();
renderOnlineSources();
})();