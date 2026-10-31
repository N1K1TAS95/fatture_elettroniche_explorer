'use strict';
/* ====================== Tabelle codici FatturaPA ====================== */
const TD={TD01:'Fattura',TD02:'Acconto/anticipo su fattura',TD03:'Acconto/anticipo su parcella',TD04:'Nota di credito',TD05:'Nota di debito',TD06:'Parcella',TD07:'Fattura semplificata',TD08:'Nota di credito semplificata',TD09:'Nota di debito semplificata',TD16:'Integrazione fattura reverse charge interno',TD17:'Integrazione/autofattura acquisto servizi dall\'estero',TD18:'Integrazione acquisto beni intracomunitari',TD19:'Integrazione/autofattura acquisto beni ex art.17',TD20:'Autofattura / regolarizzazione',TD21:'Autofattura per splafonamento',TD22:'Estrazione beni da Deposito IVA',TD23:'Estrazione beni da Deposito IVA con versamento',TD24:'Fattura differita (lett. a)',TD25:'Fattura differita (lett. b)',TD26:'Cessione beni ammortizzabili / passaggi interni',TD27:'Autofattura per autoconsumo / cessioni gratuite',TD28:'Acquisti da San Marino con IVA'};
const MP={MP01:'Contanti',MP02:'Assegno',MP03:'Assegno circolare',MP04:'Contanti presso Tesoreria',MP05:'Bonifico',MP06:'Vaglia cambiario',MP07:'Bollettino bancario',MP08:'Carta di pagamento',MP09:'RID',MP10:'RID utenze',MP11:'RID veloce',MP12:'RIBA',MP13:'MAV',MP14:'Quietanza erario',MP15:'Giroconto',MP16:'Domiciliazione bancaria',MP17:'Domiciliazione postale',MP18:'Bollettino postale',MP19:'SEPA Direct Debit',MP20:'SEPA DD CORE',MP21:'SEPA DD B2B',MP22:'Trattenuta su somme già riscosse',MP23:'PagoPA'};
const NAT={N1:'Escluse ex art.15',N2:'Non soggette','N2.1':'Non soggette artt. 7-7septies',  'N2.2':'Non soggette altri casi',N3:'Non imponibili','N3.1':'Esportazioni','N3.2':'Cessioni intracomunitarie','N3.3':'Cessioni verso San Marino','N3.4':'Operazioni assimilate alle esportazioni','N3.5':'Dichiarazione d\'intento','N3.6':'Altre non imponibili',N4:'Esenti',N5:'Regime del margine',N6:'Inversione contabile','N6.1':'Reverse charge rottami','N6.2':'Reverse charge oro/argento','N6.3':'Reverse charge subappalto edile','N6.4':'Reverse charge fabbricati','N6.5':'Reverse charge cellulari','N6.6':'Reverse charge elettronica','N6.7':'Reverse charge edilizia','N6.8':'Reverse charge energia','N6.9':'Reverse charge altri',N7:'IVA assolta in altro stato UE'};
const RF={RF01:'Ordinario',RF02:'Contribuenti minimi',RF04:'Agricoltura e attività connesse',RF05:'Vendita sali e tabacchi',RF06:'Commercio fiammiferi',RF07:'Editoria',RF08:'Gestione servizi telefonia pubblica',RF09:'Rivendita documenti di trasporto',RF10:'Intrattenimenti, giochi',RF11:'Agenzie di viaggi e turismo',RF12:'Agriturismo',RF13:'Vendite a domicilio',RF14:'Rivendita beni usati',RF15:'Agenzie di vendite all\'asta',RF16:'IVA per cassa P.A.',RF17:'IVA per cassa',RF18:'Altro',RF19:'Regime forfettario'};
const ESI={I:'Immediata',D:'Differita',S:'Scissione dei pagamenti'};
const COND={TP01:'Pagamento a rate',TP02:'Pagamento completo',TP03:'Anticipo'};
[TD,MP,NAT,RF,ESI,COND].forEach(m=>Object.setPrototypeOf(m,null));

/* ====================== Tema (auto / chiaro / scuro) ====================== */
function setTheme(t){
  if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else{t='auto';document.documentElement.removeAttribute('data-theme')}
  try{localStorage.setItem('fe_theme',t)}catch{}
  document.querySelectorAll('#themeMenu .opt').forEach(b=>b.classList.toggle('on',b.dataset.th===t));
  document.querySelector('#bTheme use').setAttribute('href','#i-'+{auto:'auto',light:'sun',dark:'moon'}[t]);
  document.getElementById('themeLbl').textContent={auto:'Automatico',light:'Chiaro',dark:'Scuro'}[t];
}
(()=>{let t='auto';try{t=localStorage.getItem('fe_theme')||'auto'}catch{}setTheme(t)})();

/* ====================== Utility ====================== */
const $id=i=>document.getElementById(i);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EUR=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
const NUM=new Intl.NumberFormat('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
const money=(v,cur)=>{try{return cur&&cur!=='EUR'?new Intl.NumberFormat('it-IT',{style:'currency',currency:cur}).format(v):EUR.format(v)}catch{return EUR.format(v)}};
const fdate=s=>s&&/^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4):esc(s||'');
const num=s=>{const n=parseFloat(s);return isNaN(n)?0:n};
const MESI=['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const debounce=(f,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};

/* IndexedDB minimale (handle cartella + cache) */
const idb=(()=>{let p;const open=()=>p||(p=new Promise((res,rej)=>{const r=indexedDB.open('fatture-elettroniche-explorer',1);r.onupgradeneeded=()=>{r.result.createObjectStore('kv');r.result.createObjectStore('cache')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  // Se IndexedDB non risponde (browser, impostazioni o modalità privata) l'app continua a funzionare senza cache né recenti.
  const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('IndexedDB non disponibile')),ms))]);
  const tx=(s,m,fn)=>withTimeout((async()=>{const db=await open();return new Promise((res,rej)=>{const t=db.transaction(s,m);const rq=fn(t.objectStore(s));t.oncomplete=()=>res(rq.result);t.onerror=()=>rej(t.error)})})(),4000);
  return{get:(s,k)=>tx(s,'readonly',o=>o.get(k)),set:(s,k,v)=>tx(s,'readwrite',o=>o.put(v,k)),del:(s,k)=>tx(s,'readwrite',o=>o.delete(k))}})();

/* ====================== Lettura file (XML / P7M) ====================== */
// Mini parser BER/DER per estrarre l'XML dal contenitore CAdES (.p7m)
function berNode(b,pos){
  const tag=b[pos];let p=pos+1;if((tag&0x1f)===0x1f){while(b[p++]&0x80);}
  const l=b[p++];let len;
  if(l===0x80)len=-1;else if(l&0x80){const n=l&0x7f;len=0;for(let i=0;i<n;i++)len=len*256+b[p++];}else len=l;
  if(len>=0)return{tag,cons:!!(tag&0x20),start:p,end:p+len,next:p+len};
  let q=p;while(!(b[q]===0&&b[q+1]===0))q=berNode(b,q).next;
  return{tag,cons:!!(tag&0x20),start:p,end:q,next:q+2};
}
function berKids(b,n){const o=[];let q=n.start;while(q<n.end){const c=berNode(b,q);o.push(c);q=c.next}return o}
function berOctets(b,n){return n.cons?berKids(b,n).flatMap(c=>berOctets(b,c)):[b.subarray(n.start,n.end)]}
function looksXml(u){let i=0;if(u[0]===0xEF&&u[1]===0xBB&&u[2]===0xBF)i=3;while(i<u.length&&(u[i]===32||u[i]===10||u[i]===13||u[i]===9))i++;return u[i]===0x3C}
function berFindXml(b,n,d=0){
  if(n.tag===0x04||n.tag===0x24){const parts=berOctets(b,n).filter(x=>x.length);if(parts.length&&looksXml(parts[0])){
    const tot=parts.reduce((a,x)=>a+x.length,0),out=new Uint8Array(tot);let o=0;for(const x of parts){out.set(x,o);o+=x.length}return out}}
  if(n.cons&&d<14)for(const c of berKids(b,n)){const r=berFindXml(b,c,d+1);if(r)return r}
  return null;
}
function unwrapP7m(u){
  let b=u;
  if(b[0]!==0x30){ // forse base64 / PEM
    const txt=new TextDecoder('latin1').decode(b).replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');
    try{const bin=atob(txt);b=Uint8Array.from(bin,c=>c.charCodeAt(0))}catch{}
  }
  try{const r=berFindXml(b,berNode(b,0));if(r){return looksXml(r)?r:unwrapP7m(r)}}catch{}
  // fallback grezzo: cerca la radice nel binario
  const s=new TextDecoder('latin1').decode(b);
  const i=s.search(/<\?xml|<([\w-]+:)?FatturaElettronica[\s>]/);
  const m=[...s.matchAll(/<\/([\w-]+:)?FatturaElettronica>/g)].pop();
  if(i<0||!m)throw new Error('XML non trovato nel file .p7m');
  return Uint8Array.from(s.slice(i,m.index+m[0].length),c=>c.charCodeAt(0));
}
function decodeXml(u){
  const head=new TextDecoder('latin1').decode(u.subarray(0,200));const m=/encoding=["']([\w-]+)/i.exec(head);
  try{return new TextDecoder(m?m[1]:'utf-8').decode(u)}catch{return new TextDecoder('utf-8').decode(u)}
}
async function readXml(file){
  if(file.size>80*1024*1024)throw new Error('File troppo grande (oltre 80 MB)');
  let b=new Uint8Array(await file.arrayBuffer());
  if(!looksXml(b))b=unwrapP7m(b);
  const text=decodeXml(b).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
  const parse=t=>{const d=new DOMParser().parseFromString(t,'application/xml');return d.getElementsByTagName('parsererror').length?null:d};
  let dom=parse(text);
  if(!dom){ // alcuni emittenti producono namespace non validi (spazi negli URI, xmlns:schemaLocation…): li ripariamo
    const fixed=text.replace(/xmlns:schemaLocation\s*=\s*("[^"]*"|'[^']*')/g,'').replace(/(xmlns(?::\w+)?\s*=\s*)"([^"]*)"/g,(m,a,v)=>a+'"'+v.replace(/\s+/g,'')+'"');
    dom=parse(fixed);
  }
  if(!dom)throw new Error('XML non valido');
  return{text,dom};
}

/* ====================== Parsing FatturaPA ====================== */
const $c=(el,path)=>{let cur=el?[el]:[];for(const p of path.split('/')){const nx=[];for(const c of cur)for(const ch of c.children)if(ch.localName===p)nx.push(ch);cur=nx;if(!cur.length)return[]}return cur};
const tx=(el,path)=>{const r=$c(el,path)[0];return r?r.textContent.trim():''};

function party(h,name){
  const da=$c(h,name+'/DatiAnagrafici')[0],se=$c(h,name+'/Sede')[0];
  const paese=tx(da,'IdFiscaleIVA/IdPaese'),piva=tx(da,'IdFiscaleIVA/IdCodice'),cf=tx(da,'CodiceFiscale');
  const nome=tx(da,'Anagrafica/Denominazione')||[tx(da,'Anagrafica/Nome'),tx(da,'Anagrafica/Cognome')].filter(Boolean).join(' ');
  const ind=[[tx(se,'Indirizzo'),tx(se,'NumeroCivico')].filter(Boolean).join(' '),[tx(se,'CAP'),tx(se,'Comune'),tx(se,'Provincia')&&'('+tx(se,'Provincia')+')'].filter(Boolean).join(' '),tx(se,'Nazione')].filter(Boolean).join(', ');
  return{id:piva||cf||nome.toUpperCase(),nome:nome||'(senza nome)',piva:piva?paese+piva:'',cf,rf:tx(da,'RegimeFiscale'),ind,
    rea:$c(h,name+'/IscrizioneREA')[0]?tx($c(h,name+'/IscrizioneREA')[0],'Ufficio')+' '+tx($c(h,name+'/IscrizioneREA')[0],'NumeroREA'):'',
    tel:tx(h,name+'/Contatti/Telefono'),mail:tx(h,name+'/Contatti/Email')};
}
function parseDoc(root){
  const h=$c(root,'FatturaElettronicaHeader')[0];
  const sdi={progressivo:tx(h,'DatiTrasmissione/ProgressivoInvio'),formato:tx(root,'')||root.getAttribute('versione')||'',codDest:tx(h,'DatiTrasmissione/CodiceDestinatario'),
    pec:tx(h,'DatiTrasmissione/PECDestinatario'),trasm:tx(h,'DatiTrasmissione/IdTrasmittente/IdPaese')+tx(h,'DatiTrasmissione/IdTrasmittente/IdCodice')};
  const ced=party(h,'CedentePrestatore'),ces=party(h,'CessionarioCommittente');
  return $c(root,'FatturaElettronicaBody').map((b,idx)=>{
    const g='DatiGenerali/DatiGeneraliDocumento';
    const td=tx(b,g+'/TipoDocumento').replace(/[^A-Za-z0-9]/g,'').slice(0,8),dataRaw=tx(b,g+'/Data'),data=/^\d{4}-\d{2}-\d{2}/.test(dataRaw)?dataRaw.slice(0,10):'',numero=tx(b,g+'/Numero'),divisa=tx(b,g+'/Divisa')||'EUR';
    const riep=$c(b,'DatiBeniServizi/DatiRiepilogo').map(r=>({aliq:tx(r,'AliquotaIVA'),nat:tx(r,'Natura'),imp:num(tx(r,'ImponibileImporto')),iva:num(tx(r,'Imposta')),esi:tx(r,'EsigibilitaIVA'),rif:tx(r,'RiferimentoNormativo')}));
    const righe=$c(b,'DatiBeniServizi/DettaglioLinee').map(l=>({n:tx(l,'NumeroLinea'),cod:tx(l,'CodiceArticolo/CodiceValore'),d:tx(l,'Descrizione'),q:tx(l,'Quantita'),um:tx(l,'UnitaMisura'),pu:tx(l,'PrezzoUnitario'),pt:tx(l,'PrezzoTotale'),iva:tx(l,'AliquotaIVA'),nat:tx(l,'Natura'),
      sc:$c(l,'ScontoMaggiorazione').map(s=>(tx(s,'Tipo')==='MG'?'+':'-')+(tx(s,'Percentuale')?tx(s,'Percentuale')+'%':tx(s,'Importo'))).join(' ')}));
    const imp=riep.reduce((a,r)=>a+r.imp,0),iva=riep.reduce((a,r)=>a+r.iva,0);
    const totDoc=tx(b,g+'/ImportoTotaleDocumento');const tot=totDoc!==''?num(totDoc):imp+iva;
    const sg=(td==='TD04'||td==='TD08')?-1:1;
    const caus=$c(b,g+'/Causale').map(c=>c.textContent.trim());
    const rit=$c(b,g+'/DatiRitenuta').map(r=>({tipo:tx(r,'TipoRitenuta'),imp:num(tx(r,'ImportoRitenuta')),aliq:tx(r,'AliquotaRitenuta'),caus:tx(r,'CausalePagamento')}));
    const cassa=$c(b,g+'/DatiCassaPrevidenziale').map(r=>({tipo:tx(r,'TipoCassa'),imp:num(tx(r,'ImportoContributoCassa')),aliq:tx(r,'AlCassa')}));
    const bollo=num(tx(b,g+'/DatiBollo/ImportoBollo'))||(tx(b,g+'/DatiBollo/BolloVirtuale')==='SI'?2:0);
    const rif=[];
    for(const k of['DatiOrdineAcquisto','DatiContratto','DatiConvenzione','DatiRicezione','DatiFattureCollegate'])
      for(const r of $c(b,'DatiGenerali/'+k)){const bits=[tx(r,'IdDocumento'),tx(r,'Data')&&fdate(tx(r,'Data')),tx(r,'CodiceCIG')&&'CIG '+tx(r,'CodiceCIG'),tx(r,'CodiceCUP')&&'CUP '+tx(r,'CodiceCUP')].filter(Boolean);rif.push(k.replace('Dati','')+': '+bits.join(' · '))}
    for(const r of $c(b,'DatiGenerali/DatiDDT'))rif.push('DDT: '+tx(r,'NumeroDDT')+' '+fdate(tx(r,'DataDDT')));
    const pag=[];
    for(const p of $c(b,'DatiPagamento'))for(const d of $c(p,'DettaglioPagamento'))
      pag.push({cond:tx(p,'CondizioniPagamento'),mod:tx(d,'ModalitaPagamento'),scad:tx(d,'DataScadenzaPagamento'),imp:num(tx(d,'ImportoPagamento')),iban:tx(d,'IBAN'),ist:tx(d,'IstitutoFinanziario'),benef:tx(d,'Beneficiario')});
    const all=$c(b,'Allegati').map(a=>({nome:tx(a,'NomeAttachment'),fmt:tx(a,'FormatoAttachment'),descr:tx(a,'DescrizioneAttachment')}));
    const cig=rif.join(' ');
    const d={idx,sdi,ced,ces,td,data,numero,divisa,tot,imp,iva,sg,totS:tot*sg,impS:imp*sg,ivaS:iva*sg,caus,rit,cassa,bollo,rif,riep,righe,pag,all,
      art73:tx(b,g+'/Art73'),arr:num(tx(b,g+'/Arrotondamento'))};
    d.s=[numero,td,TD[td]||'',ced.nome,ced.piva,ced.cf,ces.nome,ces.piva,ces.cf,caus.join(' '),cig,righe.map(r=>r.d+' '+r.cod).join(' '),all.map(a=>a.nome).join(' '),
      pag.map(p=>p.iban).join(' '),String(tot),NUM.format(tot),fdate(data),data].join(' ').toLowerCase();
    return d;
  });
}
async function parseFile(file){
  const{dom}=await readXml(file);const root=dom.documentElement;
  if(root.localName!=='FatturaElettronica')return[];
  return parseDoc(root);
}

/* ====================== Stato ====================== */
const VER=4;
let ALL=[],view=[],ERR=[],entriesCur=null,rootName='',dirHandle=null;
let CP_OPTS=[];
let myId=localStorage.getItem('fe_my')||'';
const F={q:'',dir:'',cp:'',anno:'',per:'',dal:'',al:'',td:'',min:'',max:'',dup:true};
let tab='fatt',sortF={k:'data',d:-1},shown=0,drawerIdx=-1,canon=new Map(),maxTot=1;
const PAGE=200;
const nm=p=>canon.get(p.id)||p.nome;
function toast(t){const e=$id('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
const META=/_(MT|NS|RC|NE|DT|AT|EC|MC|SE)_\d+/i;

/* ====================== Scansione cartella ====================== */
function progress(txt,frac){$id('overlay').style.display='flex';$id('ovText').textContent=txt;$id('ovBar').style.width=Math.round((frac||0)*100)+'%'}
async function walk(dir,prefix,out){
  for await(const[name,h]of dir.entries()){
    if(h.kind==='directory'){if(/^[.@#$]/.test(name))continue;await walk(h,prefix+name+'/',out)}
    else if(/\.(xml|p7m)$/i.test(name)&&!META.test(name)){out.push({path:prefix+name,getFile:()=>h.getFile()});if(out.length%50===0)progress('Scansione cartelle… '+out.length+' file trovati')}
  }
}
async function loadEntries(entries,root,key=root){
  leaveSingle();snap=null;rootName=root;entriesCur=entries;
  let old={};try{const c=await idb.get('cache',key);if(c&&c.v===VER)old=c.files}catch{}
  const nf={},docs=[],errors=[];let done=0,reused=0;const queue=entries.slice().reverse();
  const worker=async()=>{
    while(queue.length){
      const e=queue.pop();
      try{
        const file=await e.getFile();const key=file.size+'|'+file.lastModified;
        let rec=old[e.path];
        if(!rec||rec.k!==key)rec={k:key,docs:await parseFile(file)};else reused++;
        nf[e.path]=rec;
        for(const d of rec.docs)docs.push(Object.assign({},d,{path:e.path,e}));
      }catch(err){errors.push({path:e.path,msg:err.message||String(err)})}
      if(++done%10===0||done===entries.length)progress(`Lettura fatture… ${done}/${entries.length}`+(reused?` (${reused} da cache)`:''),done/entries.length);
    }
  };
  await Promise.all(Array.from({length:6},worker));
  idb.set('cache',key,{v:VER,files:nf}).catch(()=>{});
  ALL=docs;ERR=errors;
  // duplicati
  const seen=new Set();ALL.sort((a,b)=>a.path<b.path?-1:1);
  for(const d of ALL){const k=[d.ced.id,d.td,d.numero,d.data].join('|');d.dup=seen.has(k);seen.add(k)}
  $id('overlay').style.display='none';
  setupAfterLoad(entries.length,reused);
}
function setupAfterLoad(nFiles,reused){
  buildCanon();
  // elenco parti per "la mia azienda"
  const cnt=new Map();
  for(const d of ALL)for(const p of[d.ced,d.ces]){const x=cnt.get(p.id)||{id:p.id,nome:p.nome,piva:p.piva,n:0};x.n++;cnt.set(p.id,x)}
  const parties=[...cnt.values()].sort((a,b)=>b.n-a.n);
  if(!myId||!cnt.has(myId))myId=parties.length&&ALL.length>1?parties[0].id:'';
  $id('my').innerHTML='<option value="">(nessuna)</option>'+parties.slice(0,300).map(p=>`<option value="${esc(p.id)}" data-name="${esc(nm(p))}" data-sub="${esc(p.piva||p.id)} · ${p.n} fatture">${esc(nm(p))} — ${esc(p.piva||p.id)} (${p.n} fatture)</option>`).join('');
  $id('my').value=myId;
  const yc=Object.create(null);for(const d of ALL)if(d.data&&!(F.dup&&d.dup))yc[d.data.slice(0,4)]=(yc[d.data.slice(0,4)]||0)+1;
  const years=Object.keys(yc).sort().reverse();
  if(!years.includes(F.anno))F.anno='';
  $id('years').innerHTML='<span class="lbl">Anno</span><button class="pill" data-y="">Tutti</button>'+years.map(y=>`<button class="pill" data-y="${esc(y)}">${esc(y)}<small>${yc[y]}</small></button>`).join('');
  const tds=[...new Set(ALL.map(d=>d.td))].sort();
  $id('td').innerHTML='<option value="">Tutti</option>'+tds.map(t=>`<option value="${esc(t)}">${esc(t)} · ${esc(TD[t]||'')}</option>`).join('');
  $id('toolbar').style.display='block';document.body.classList.add('fixed');$id('tabs').style.display='flex';$id('bRescan').disabled=false;
  const nd=ALL.filter(d=>d.dup).length;$id('dupN').textContent=nd?`(${nd})`:'';
  $id('bErr').style.display=ERR.length?'':'none';$id('bErr').textContent=`${ERR.length} file non letti`;
  $id('status').textContent=`${rootName} · ${ALL.length.toLocaleString('it-IT')} fatture da ${nFiles.toLocaleString('it-IT')} file`+(reused?` · ${reused.toLocaleString('it-IT')} da cache`:'');
  classify();apply(true);
}
function buildCanon(){
  // nome canonico per ogni soggetto (lo stesso P.IVA compare spesso con varianti: "ACME SRL", "ACME S.R.L.")
  const nc=new Map();
  for(const d of ALL)for(const p of[d.ced,d.ces]){let m=nc.get(p.id);if(!m)nc.set(p.id,m=new Map());m.set(p.nome,(m.get(p.nome)||0)+1)}
  canon=new Map();for(const[id,m]of nc)canon.set(id,[...m.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length)[0][0]);
}
function classify(){
  for(const d of ALL){
    d.dir=!myId?'':d.ced.id===myId?'emessa':d.ces.id===myId?'ricevuta':'';
    d.cp=d.dir==='emessa'?d.ces:d.dir==='ricevuta'?d.ced:null;
  }
  const m=new Map();
  for(const d of ALL)for(const p of d.cp?[d.cp]:[d.ced,d.ces]){if(p.id!==myId)m.set(p.id,nm(p)+(p.piva?' — '+p.piva:''))}
  CP_OPTS=[...m.values()].sort((a,b)=>a.localeCompare(b,'it'));
}

/* ====================== Filtri / ordinamento ====================== */
function apply(reset){
  const toks=F.q.toLowerCase().split(/\s+/).filter(Boolean),cp=F.cp.toLowerCase().split(' — ')[0].trim();
  const min=F.min===''?null:+F.min,max=F.max===''?null:+F.max;
  view=ALL.filter(d=>{
    if(F.dup&&d.dup)return false;
    if(F.dir&&d.dir!==F.dir)return false;
    if(F.td&&d.td!==F.td)return false;
    if(F.anno&&d.data.slice(0,4)!==F.anno)return false;
    if(F.per){const m=+d.data.slice(5,7);if(F.per[0]==='m'?m!==+F.per.slice(1):Math.ceil(m/3)!==+F.per.slice(1))return false}
    if(F.dal&&d.data<F.dal)return false;if(F.al&&d.data>F.al)return false;
    if(min!==null&&d.tot<min)return false;if(max!==null&&d.tot>max)return false;
    if(cp){const ps=d.cp?[d.cp]:[d.ced,d.ces];if(!ps.some(p=>(nm(p)+' '+p.nome+' '+p.piva+' '+p.cf).toLowerCase().includes(cp)))return false}
    for(const t of toks)if(!d.s.includes(t))return false;
    return true;
  });
  maxTot=Math.max(1,...view.map(d=>Math.abs(d.totS)));
  sortView();syncUI();render();
}
const KEY={data:d=>d.data,numero:d=>d.numero,td:d=>d.td,ced:d=>nm(d.ced).toLowerCase(),ces:d=>nm(d.ces).toLowerCase(),cp:d=>nm(d.cp||d.ced).toLowerCase(),imp:d=>d.impS,iva:d=>d.ivaS,tot:d=>d.totS,dir:d=>d.dir};
function sortView(){const f=KEY[sortF.k]||KEY.data,s=sortF.d;view.sort((a,b)=>{const x=f(a),y=f(b);return(x<y?-1:x>y?1:(a.numero<b.numero?-1:1))*s})}
function readFilters(){
  F.q=$id('q').value;F.cp=$id('cp').value;F.per=$id('per').value;F.dal=$id('dal').value;F.al=$id('al').value;
  F.td=$id('td').value;F.min=$id('min').value;F.max=$id('max').value;F.dup=$id('dup').checked;apply();
}
function syncUI(){
  document.querySelectorAll('#years .pill').forEach(b=>b.classList.toggle('on',b.dataset.y===F.anno));
  document.querySelectorAll('#dirSeg button').forEach(b=>b.classList.toggle('on',b.dataset.dir===F.dir));
  const ch=[];
  if(F.cp)ch.push(['cp','Cliente/fornitore',F.cp.split(' — ')[0]]);
  if(F.per)ch.push(['per','Periodo',$id('per').selectedOptions[0].text]);
  if(F.dal)ch.push(['dal','Dal',fdate(F.dal)]);
  if(F.al)ch.push(['al','Al',fdate(F.al)]);
  if(F.td)ch.push(['td','Tipo',F.td]);
  if(F.min!=='')ch.push(['min','Da',EUR.format(+F.min)]);
  if(F.max!=='')ch.push(['max','Fino a',EUR.format(+F.max)]);
  if(!F.dup)ch.push(['dup','Duplicati','inclusi']);
  $id('chips').innerHTML=ch.map(c=>`<button class="chip" data-clr="${c[0]}" title="Rimuovi filtro">${c[1]}: <b>${esc(c[2])}</b><i>✕</i></button>`).join('');
  const n=$id('fcount');n.style.display=ch.length?'':'none';n.textContent=ch.length;
  if(typeof refreshUI==='function')refreshUI();
}
function resetAll(){
  ['q','cp','dal','al','min','max','per','td'].forEach(i=>$id(i).value='');$id('dup').checked=true;F.anno='';F.dir='';readFilters();
}

/* ====================== Rendering ====================== */
const sumBy=(arr,f)=>arr.reduce((a,d)=>a+f(d),0);
const sgn=v=>v<0?'neg':'';
function render(){
  const st=$id('stats');
  if(!ALL.length){st.style.display='none';return}
  const imp=sumBy(view,d=>d.impS),iva=sumBy(view,d=>d.ivaS),tot=sumBy(view,d=>d.totS);
  const em=view.filter(d=>d.dir==='emessa'),ri=view.filter(d=>d.dir==='ricevuta');
  const c=[['Fatture',view.length.toLocaleString('it-IT')+(view.length!==ALL.length?`<em>su ${ALL.length.toLocaleString('it-IT')}</em>`:'')],['Imponibile',EUR.format(imp)],['IVA',EUR.format(iva)],['Totale',EUR.format(tot)]];
  if(em.length&&ri.length){c.push(['Emesso',EUR.format(sumBy(em,d=>d.totS))]);c.push(['Ricevuto',EUR.format(sumBy(ri,d=>d.totS))])}
  st.style.display='grid';
  st.innerHTML=c.map(x=>`<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.t===tab));
  if(!ALL.length)return;
  if(tab==='fatt')renderList();else if(tab==='cp')renderCp();else renderMesi();
}
function th(k,label,cls,st){const on=st.k===k;return`<th class="${cls||''}${on?' on':''}" data-k="${k}">${label}${on?(st.d>0?' ▲':' ▼'):''}</th>`}
const noRes=()=>`<div class="empty"><div class="ico"><svg class="i" aria-hidden="true"><use href="#i-search"/></svg></div><h2>Nessun risultato</h2><p>Nessuna fattura corrisponde ai filtri attuali.</p><button class="btn" data-act="reset">Azzera i filtri</button></div>`;
let two=false,showDir=false;
function rowHtml(d,i){
  const neg=d.sg<0,p=two?null:(d.cp||d.ced);
  const desc=(d.righe[0]&&d.righe[0].d)||d.caus[0]||'';
  const sub=(p?(p.piva||p.cf):'')+(desc?(p?' · ':'')+desc.slice(0,80):'');
  const party=q=>`${esc(nm(q))}<div class="sub">${esc(q.piva||q.cf)}</div>`;
  return`<tr data-i="${i}"${i===drawerIdx?' class="sel"':''}><td>${fdate(d.data)}</td><td class="c-num">${esc(d.numero)}</td>
  <td class="c-tipo"><span class="badge${neg?' cr':''}" title="${esc(TD[d.td]||'')}">${esc(d.td)}</span></td>
  ${two?`<td class="wrapc">${party(d.ced)}<div class="sub only-sm">${esc(d.td)} n. ${esc(d.numero)}${showDir&&d.dir?' · '+(d.dir==='emessa'?'Emessa':'Ricevuta'):''}</div></td><td class="wrapc c-ces">${party(d.ces)}</td>`:`<td class="wrapc">${esc(nm(p))}<div class="sub only-sm">${esc(d.td)} n. ${esc(d.numero)}${showDir&&d.dir?' · '+(d.dir==='emessa'?'Emessa':'Ricevuta'):''}</div><div class="sub">${esc(sub)}</div></td>`}
  ${showDir?`<td class="c-dir">${d.dir?`<span class="badge ${d.dir==='emessa'?'em':'ri'}">${d.dir==='emessa'?'Emessa':'Ricevuta'}</span>`:''}</td>`:''}
  <td class="n c-imp ${sgn(d.sg)}">${money(d.impS,d.divisa)}</td><td class="n c-iva ${sgn(d.sg)}">${money(d.ivaS,d.divisa)}</td>
  <td class="n ${sgn(d.sg)}"><b>${money(d.totS,d.divisa)}</b></td>
  <td class="c-att">${d.all.length?'<span class="att" title="Allegati"><svg class="i" aria-hidden="true"><use href="#i-clip"/></svg></span>':''}${d.dup?' <span class="badge gr" title="Duplicato di un\'altra fattura">dup</span>':''}</td></tr>`;
}
const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))fill()},{rootMargin:'600px'});
function fill(){
  const s=$id('sent');if(!s||tab!=='fatt')return;
  while(shown<view.length&&s.getBoundingClientRect().top<innerHeight+600)appendRows();
}
function appendRows(){
  const tb=$id('tb');if(!tb||shown>=view.length)return;
  const end=Math.min(view.length,shown+PAGE);let h='';for(let i=shown;i<end;i++)h+=rowHtml(view[i],i);
  tb.insertAdjacentHTML('beforeend',h);shown=end;
  $id('sent').textContent=shown<view.length?`${shown.toLocaleString('it-IT')} di ${view.length.toLocaleString('it-IT')} fatture — scorri per caricare le altre`:`${view.length.toLocaleString('it-IT')} fatture`;
}
function renderList(){
  if(!view.length){$id('content').innerHTML=noRes();return}
  two=!myId;showDir=!!myId&&view.some(d=>d.dir==='emessa');
  $id('content').innerHTML=`<table><thead><tr>${th('data','Data','',sortF)}${th('numero','Numero','c-num',sortF)}${th('td','Tipo','c-tipo',sortF)}${two?th('ced','Cedente / fornitore','',sortF)+th('ces','Cessionario / cliente','c-ces',sortF):th('cp','Controparte','',sortF)}${showDir?th('dir','Direzione','c-dir',sortF):''}${th('imp','Imponibile','n c-imp',sortF)}${th('iva','IVA','n c-iva',sortF)}${th('tot','Totale','n',sortF)}<th class="c-att" style="cursor:default"></th></tr></thead><tbody id="tb"></tbody></table><div class="more" id="sent"></div>`;
  shown=0;appendRows();io.disconnect();io.observe($id('sent'));fill();
}
let cpSort={k:'tot',d:-1},cpRows=[];
function renderCp(){
  const m=new Map();
  for(const d of view){const p=d.cp||d.ced;const x=m.get(p.id)||{p,n:0,imp:0,iva:0,tot:0,last:''};x.n++;x.imp+=d.impS;x.iva+=d.ivaS;x.tot+=d.totS;if(d.data>x.last)x.last=d.data;m.set(p.id,x)}
  cpRows=[...m.values()];const k=cpSort.k,s=cpSort.d;
  const val={nome:x=>nm(x.p).toLowerCase(),n:x=>x.n,imp:x=>x.imp,iva:x=>x.iva,tot:x=>x.tot,last:x=>x.last};
  cpRows.sort((a,b)=>(val[k](a)<val[k](b)?-1:1)*s);
  if(!cpRows.length){$id('content').innerHTML=noRes();return}
  const mx=Math.max(1,...cpRows.map(x=>Math.abs(x.tot)));
  $id('content').innerHTML=`<table><thead><tr>${th('nome',myId?'Cliente / fornitore':'Cedente','',cpSort)}<th class="c-num" style="cursor:default">P.IVA / CF</th>${th('n','Fatture','n',cpSort)}${th('imp','Imponibile','n c-imp',cpSort)}${th('iva','IVA','n c-iva',cpSort)}${th('tot','Totale','n',cpSort)}${th('last','Ultima fattura','c-tipo',cpSort)}</tr></thead><tbody id="tbcp">`+
   cpRows.map((x,i)=>`<tr data-i="${i}" title="Mostra le fatture di ${esc(nm(x.p))}"><td class="wrapc">${esc(nm(x.p))}</td><td class="mute c-num">${esc(x.p.piva||x.p.cf)}</td><td class="n">${x.n}</td><td class="n c-imp">${EUR.format(x.imp)}</td><td class="n c-iva">${EUR.format(x.iva)}</td><td class="n"><b>${EUR.format(x.tot)}</b></td><td class="c-tipo">${fdate(x.last)}</td></tr>`).join('')+'</tbody></table>';
}
let mesiRows=[];
function renderMesi(){
  const m=new Map();
  for(const d of view){const k=d.data.slice(0,7);if(!k)continue;const x=m.get(k)||{k,n:0,em:0,ri:0,tot:0,imp:0};x.n++;x.tot+=d.totS;x.imp+=d.impS;if(d.dir==='emessa')x.em+=d.totS;else if(d.dir==='ricevuta')x.ri+=d.totS;m.set(k,x)}
  mesiRows=[...m.values()].sort((a,b)=>a.k<b.k?-1:1);
  if(!mesiRows.length){$id('content').innerHTML=noRes();return}
  const two2=!!myId&&mesiRows.some(r=>r.em)&&mesiRows.some(r=>r.ri);
  const series=two2?[['em','Emesso','var(--c1)'],['ri','Ricevuto','var(--c2)']]:[['tot','Totale','var(--c1)']];
  const maxV=Math.max(1,...mesiRows.flatMap(r=>series.map(s=>Math.abs(r[s[0]]))));
  const nice=(()=>{const e=Math.pow(10,Math.floor(Math.log10(maxV))),f=maxV/e;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e})();
  const top=nice,colW=two2?50:34,W=Math.max(640,mesiRows.length*colW+70),H=260,L=58,B=34,T=10,ph=H-B-T;
  const short=v=>Math.abs(v)>=1e6?(v/1e6).toFixed(1).replace('.',',')+' M':Math.abs(v)>=1e3?Math.round(v/1e3)+' k':String(Math.round(v));
  let svg=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Andamento mensile">`;
  for(let i=0;i<=4;i++){const v=top*i/4,y=T+ph-ph*i/4;svg+=`<line x1="${L}" x2="${W-6}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L-8}" y="${y+4}" text-anchor="end" font-size="11" fill="var(--mute)">${short(v)} €</text>`}
  mesiRows.forEach((r,i)=>{
    const x0=L+i*colW+4,bw=(colW-8)/series.length;
    series.forEach((s,j)=>{const v=r[s[0]],h=Math.max(v?1:0,Math.abs(v)/top*ph);svg+=`<rect class="mbar" data-m="${r.k}" x="${x0+j*bw}" y="${T+ph-h}" width="${bw-1}" height="${h}" rx="2" fill="${s[2]}" style="cursor:pointer"><title>${MESI[+r.k.slice(5)-1]} ${r.k.slice(0,4)} · ${s[1]}: ${EUR.format(v)} (${r.n} fatture)</title></rect>`});
    const newY=i===0||r.k.slice(0,4)!==mesiRows[i-1].k.slice(0,4);
    svg+=`<text x="${x0+(colW-8)/2}" y="${H-16}" text-anchor="middle" font-size="10.5" fill="var(--mute)">${MESI[+r.k.slice(5)-1]}</text>`;
    if(newY)svg+=`<text x="${x0}" y="${H-3}" font-size="11" font-weight="700" fill="var(--ink)">${r.k.slice(0,4)}</text>`;
  });
  svg+='</svg>';
  const leg=`<div class="legend">${series.map(s=>`<span><i style="background:${s[2]}"></i>${s[1]}</span>`).join('')}<span>· clicca una barra o una riga per vedere le fatture di quel mese</span></div>`;
  $id('content').innerHTML=leg+`<div class="chartwrap">${svg}</div><table><thead><tr><th style="cursor:default">Mese</th><th class="n" style="cursor:default">Fatture</th>${two2?'<th class="n" style="cursor:default">Emesso</th><th class="n" style="cursor:default">Ricevuto</th>':''}<th class="n c-imp" style="cursor:default">Imponibile</th><th class="n" style="cursor:default">Totale</th></tr></thead><tbody id="tbm">`+
   [...mesiRows].reverse().map(r=>`<tr data-m="${r.k}"><td>${MESI[+r.k.slice(5)-1]} ${r.k.slice(0,4)}</td><td class="n">${r.n}</td>${two2?`<td class="n">${EUR.format(r.em)}</td><td class="n">${EUR.format(r.ri)}</td>`:''}<td class="n c-imp">${EUR.format(r.imp)}</td><td class="n"><b>${EUR.format(r.tot)}</b></td></tr>`).join('')+'</tbody></table>';
}
function filterMonth(k){
  const[y,mo]=k.split('-');const last=new Date(+y,+mo,0).getDate();
  F.anno='';$id('per').value='';
  $id('dal').value=`${k}-01`;$id('al').value=`${k}-${String(last).padStart(2,'0')}`;tab='fatt';readFilters();
}

/* ====================== Dettaglio fattura ====================== */
let dMode='d';
function kv(rows){return`<div class="kv">`+rows.filter(r=>r[1]!==''&&r[1]!=null).map(r=>`<span>${r[0]}</span><span>${r[1]}</span>`).join('')+'</div>'}
function partyBox(title,p){return`<div class="card box2"><h3>${title}</h3><h4>${esc(nm(p))}</h4>${kv([['P.IVA',esc(p.piva)],['Cod. fiscale',esc(p.cf)],['Indirizzo',esc(p.ind)],['Regime fiscale',p.rf?esc(p.rf+' · '+(RF[p.rf]||'')):''],['REA',esc(p.rea.trim())],['Telefono',esc(p.tel)],['Email',esc(p.mail)]])}</div>`}
function openDrawer(i){
  drawerIdx=i;$id('split').classList.add('open');$id('scrim').classList.add('on');loadDetail();
}
function closeDrawer(){$id('split').classList.remove('open','full');$id('scrim').classList.remove('on');markSel(-1);drawerIdx=-1}
function markSel(i){
  document.querySelectorAll('#tb tr.sel').forEach(r=>r.classList.remove('sel'));
  const r=document.querySelector(`#tb tr[data-i="${i}"]`);if(r){r.classList.add('sel');
    const b=r.getBoundingClientRect(),c=$id('content').getBoundingClientRect();if(b.top<Math.max(60,c.top)||b.bottom>Math.min(innerHeight,c.bottom))r.scrollIntoView({block:'center'})}
}
function stepDrawer(n){const i=drawerIdx+n;if(i<0||i>=view.length)return;for(let g=0;i>=shown&&shown<view.length&&$id('tb')&&g<200;g++)appendRows();drawerIdx=i;loadDetail()}
async function loadDetail(){
  const d=view[drawerIdx];if(!d)return;
  markSel(drawerIdx);
  $id('dTitle').innerHTML=`${esc(TD[d.td]||d.td)} n. ${esc(d.numero)}`;
  $id('dSub').textContent=`${fdate(d.data)} · ${nm(d.ced)}`+(single&&view.length>1?` · fattura ${drawerIdx+1} di ${view.length}`:'');
  $id('dPrev').style.display=$id('dNext').style.display=(single&&view.length<2)?'none':'';
  $id('dPrev').disabled=drawerIdx<=0;$id('dNext').disabled=drawerIdx>=view.length-1;
  $id('dTabD').classList.toggle('on',dMode==='d');$id('dTabX').classList.toggle('on',dMode==='x');
  $id('dbody').innerHTML='<p class="mute">Caricamento…</p>';
  let att=[],xml='';
  try{
    const{text,dom}=await readXml(await d.e.getFile());xml=text;
    const body=$c(dom.documentElement,'FatturaElettronicaBody')[d.idx];
    att=$c(body,'Allegati').map(a=>({nome:tx(a,'NomeAttachment'),fmt:tx(a,'FormatoAttachment'),descr:tx(a,'DescrizioneAttachment'),b64:tx(a,'Attachment')}));
  }catch(e){$id('dbody').innerHTML='<p class="neg">Impossibile rileggere il file: '+esc(e.message)+'</p>';return}
  if(view[drawerIdx]!==d)return;
  if(dMode==='x'){$id('dbody').innerHTML=`<p class="mute">${esc(d.path)}</p><pre class="xml">${esc(prettyXml(xml))}</pre>`;return}
  const cur=d.divisa;
  const mm=v=>money(v,cur);
  const righe=d.righe.length?`<div class="card box2"><div class="tablewrap" style="max-height:none"><table><thead><tr><th>#</th><th>Descrizione</th><th class="n">Q.tà</th><th class="n">Prezzo unit.</th><th class="n">Totale</th><th class="n">IVA</th></tr></thead><tbody>${d.righe.map(r=>`<tr style="cursor:default"><td>${esc(r.n)}</td><td style="white-space:normal;min-width:240px">${esc(r.d)}${r.cod?`<div class="mute" style="font-size:12px">cod. ${esc(r.cod)}</div>`:''}${r.sc?`<div class="mute" style="font-size:12px">sconto/magg. ${esc(r.sc)}</div>`:''}</td><td class="n">${r.q?esc(String(num(r.q)))+' '+esc(r.um):''}</td><td class="n">${r.pu?mm(num(r.pu)):''}</td><td class="n">${mm(num(r.pt))}</td><td class="n">${r.iva?num(r.iva)+'%':''}${r.nat?` ${esc(r.nat)}`:''}</td></tr>`).join('')}</tbody></table></div></div>`:'';
  const riep=`<div class="card box2"><h3>Riepilogo IVA</h3><table><thead><tr><th>Aliquota</th><th class="n">Imponibile</th><th class="n">Imposta</th><th>Esigibilità</th></tr></thead><tbody>${d.riep.map(r=>`<tr style="cursor:default"><td>${num(r.aliq)}%${r.nat?` · ${esc(r.nat)} ${esc(NAT[r.nat]||'')}`:''}</td><td class="n">${mm(r.imp)}</td><td class="n">${mm(r.iva)}</td><td>${esc(ESI[r.esi]||r.esi)}${r.rif?`<div class="mute" style="font-size:12px;white-space:normal">${esc(r.rif)}</div>`:''}</td></tr>`).join('')}</tbody></table>
    <p style="text-align:right;margin:8px 0 0">Imponibile <b>${money(d.imp,cur)}</b> · IVA <b>${money(d.iva,cur)}</b> · Totale documento <b style="font-size:16px">${money(d.tot,cur)}</b></p></div>`;
  const pag=d.pag.length?`<div class="card box2"><h3>Pagamento</h3><table><thead><tr><th>Modalità</th><th>Scadenza</th><th class="n">Importo</th><th>IBAN / Istituto</th></tr></thead><tbody>${d.pag.map(p=>`<tr style="cursor:default"><td>${esc(MP[p.mod]||p.mod)}${p.cond?`<div class="mute" style="font-size:12px">${esc(COND[p.cond]||p.cond)}</div>`:''}</td><td>${fdate(p.scad)}</td><td class="n">${mm(p.imp)}</td><td>${esc(p.iban)} ${esc(p.ist)}</td></tr>`).join('')}</tbody></table></div>`:'';
  const extra=[];
  if(d.caus.length)extra.push(['Causale',esc(d.caus.join(' '))]);
  if(d.bollo)extra.push(['Bollo',money(d.bollo,cur)]);
  d.rit.forEach(r=>extra.push(['Ritenuta',`${esc(r.tipo)} ${esc(r.aliq)}% = ${money(r.imp,cur)} ${esc(r.caus)}`]));
  d.cassa.forEach(r=>extra.push(['Cassa prev.',`${esc(r.tipo)} ${money(r.imp,cur)}`]));
  d.rif.forEach(r=>extra.push(['Riferimento',esc(r)]));
  const al=att.length?`<div class="card box2"><h3>Allegati (${att.length})</h3>${att.map((a,j)=>`<div style="display:flex;gap:8px;align-items:center;margin:4px 0"><span style="flex:1"><svg class="i" aria-hidden="true"><use href="#i-clip"/></svg> ${esc(a.nome)} <span class="mute">${esc(a.fmt)} ${esc(a.descr)} · ${Math.round(a.b64.length*0.75/1024)} KB</span></span><button class="btn" data-att="${j}" data-act="open">Apri</button><button class="btn" data-att="${j}" data-act="dl">Scarica</button></div>`).join('')}</div>`:'';
  const scad=d.pag.map(p=>p.scad).filter(Boolean).sort()[0];
  const summ=`<div class="card summary"><div class="stat big"><small>Totale documento</small><b class="${sgn(d.sg)}">${money(d.totS,cur)}</b></div><div class="stat"><small>Imponibile</small><b>${money(d.impS,cur)}</b></div><div class="stat"><small>IVA</small><b>${money(d.ivaS,cur)}</b></div>${scad?`<div class="stat"><small>Scadenza</small><b>${fdate(scad)}</b></div>`:''}</div>`;
  $id('dbody').innerHTML=summ+`<div class="parties">${partyBox('Cedente / prestatore',d.ced)}${partyBox('Cessionario / committente',d.ces)}</div><div class="dcols"><div class="dc1">${righe}${riep}</div><div class="dc2">
  ${extra.length?`<div class="card box2"><h3>Dati documento</h3>${kv([['Tipo',esc(d.td+' · '+(TD[d.td]||''))],...extra])}</div>`:''}
  ${pag}${al}
  <div class="card box2"><h3>Trasmissione e file</h3>${kv([['File',esc(d.path)],['Progressivo invio',esc(d.sdi.progressivo)],['Cod. destinatario',esc(d.sdi.codDest)],['PEC destinatario',esc(d.sdi.pec)],['Trasmittente',esc(d.sdi.trasm)]])}</div></div></div>`;
  $id('dbody').scrollTop=0;
  $id('dbody').onclick=e=>{const b=e.target.closest('[data-att]');if(!b)return;const a=att[+b.dataset.att];
    let u;try{const bin=atob(a.b64.replace(/\s+/g,''));u=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)u[k]=bin.charCodeAt(k)}catch{toast('Allegato non valido (base64 errato)');return}
    const pdf=/pdf/i.test(a.fmt+a.nome)&&String.fromCharCode(...u.subarray(0,5))==='%PDF-';
    // nel browser si apre solo un vero PDF (controllo dei primi byte)
    const blob=new Blob([u],{type:pdf?'application/pdf':'application/octet-stream'});const url=URL.createObjectURL(blob);
    if(b.dataset.act==='open'&&pdf)window.open(url,'_blank','noopener');else{const l=document.createElement('a');l.href=url;l.download=safeName(a.nome);l.click()}
    setTimeout(()=>URL.revokeObjectURL(url),60000)};
}
// nome file di un allegato: senza percorsi e senza estensioni eseguibili
function safeName(n){n=String(n||'allegato').replace(/[\\/:*?"<>|\x00-\x1f]+/g,'_').replace(/^\.+/,'').slice(0,120)||'allegato';
  return/\.(exe|bat|cmd|com|scr|msi|ps1|vbs|vbe|js|jse|wsf|hta|jar|dll|lnk|reg|pif|cpl)$/i.test(n)?n+'.bloccato':n}
function prettyXml(x){
  let pad=0;const out=[];
  for(let l of x.replace(/>\s*</g,'>\n<').split('\n')){
    l=l.trim();if(!l)continue;
    if(l.length>300)l=l.slice(0,200)+` … [${l.length-200} caratteri omessi] …`+(l.match(/<\/[^>]+>$/)||[''])[0];
    if(/^<\//.test(l))pad=Math.max(0,pad-1);
    out.push('  '.repeat(pad)+l);
    if(/^<[^!?\/][^>]*[^\/]>$/.test(l)&&!/<\//.test(l))pad++;
  }
  return out.join('\n');
}

/* ====================== Copia di cortesia (stampa / PDF) ====================== */
// Layout fattura proprio (non deriva da fogli di stile di terzi). Nessuna libreria: il PDF lo salva il browser
// dal dialogo di stampa. Tutti i valori del file passano da esc() (come nel dettaglio) e non c'è alcuno script.
function courtesyDoc(d){
  const cur=d.divisa,mm=v=>esc(money(v,cur));
  const party=(t,p)=>`<div class="pd-box"><h3>${t}</h3><b>${esc(nm(p))}</b>${[p.ind,p.piva&&'P.IVA '+p.piva,p.cf&&'C.F. '+p.cf,p.rf&&'Regime fiscale '+p.rf+' · '+(RF[p.rf]||''),p.rea.trim()&&'REA '+p.rea.trim(),p.tel&&'Tel. '+p.tel,p.mail].filter(Boolean).map(x=>`<div>${esc(x)}</div>`).join('')}</div>`;
  const righe=d.righe.map(r=>`<tr><td>${esc(r.n)}</td><td>${esc(r.d)}${r.cod?`<small>cod. ${esc(r.cod)}</small>`:''}${r.sc?`<small>sconto/magg. ${esc(r.sc)}</small>`:''}</td><td class="n">${r.q?esc(String(num(r.q)))+' '+esc(r.um):''}</td><td class="n">${r.pu?mm(num(r.pu)):''}</td><td class="n">${mm(num(r.pt))}</td><td class="n">${r.iva!==''?esc(String(num(r.iva)))+'%':''}${r.nat?' '+esc(r.nat):''}</td></tr>`).join('');
  const riep=d.riep.map(r=>`<tr><td>${esc(String(num(r.aliq)))}%${r.nat?' · '+esc(r.nat+' '+(NAT[r.nat]||'')):''}${r.rif?`<small>${esc(r.rif)}</small>`:''}</td><td>${esc(ESI[r.esi]||r.esi)}</td><td class="n">${mm(r.imp)}</td><td class="n">${mm(r.iva)}</td></tr>`).join('');
  const tot=[['Imponibile',mm(d.imp)],['IVA',mm(d.iva)]];
  if(d.bollo)tot.push(['Bollo',mm(d.bollo)]);
  d.cassa.forEach(r=>tot.push(['Cassa previdenziale '+esc(r.tipo),mm(r.imp)]));
  d.rit.forEach(r=>tot.push(['Ritenuta '+esc(r.aliq)+'% '+esc(r.caus),'−'+mm(r.imp)]));
  const pag=d.pag.map(p=>`<tr><td>${esc(MP[p.mod]||p.mod)}${p.cond?`<small>${esc(COND[p.cond]||p.cond)}</small>`:''}</td><td>${fdate(p.scad)}</td><td class="n">${mm(p.imp)}</td><td>${esc([p.iban,p.ist].filter(Boolean).join(' · '))}</td></tr>`).join('');
  const note=[...d.caus.map(c=>['Causale',c]),...d.rif.map(r=>['Riferimento',r])];
  if(d.art73)note.push(['Art. 73',d.art73]);
  return`<article class="pd">
    <div class="pd-head"><div><h1>${esc(TD[d.td]||d.td)}</h1><div>${esc(d.td)}</div></div><div class="pd-num"><b>N. ${esc(d.numero)}</b><div>del ${fdate(d.data)||'—'}</div></div></div>
    <div class="pd-cols">${party('Cedente / prestatore',d.ced)}${party('Cessionario / committente',d.ces)}</div>
    ${note.length?`<div class="pd-note">${note.map(n=>`<div><b>${n[0]}:</b> ${esc(n[1])}</div>`).join('')}</div>`:''}
    <table class="pd-t"><thead><tr><th>#</th><th>Descrizione</th><th class="n">Q.tà</th><th class="n">Prezzo unit.</th><th class="n">Totale</th><th class="n">IVA</th></tr></thead><tbody>${righe}</tbody></table>
    <table class="pd-t"><thead><tr><th>Aliquota IVA</th><th>Esigibilità</th><th class="n">Imponibile</th><th class="n">Imposta</th></tr></thead><tbody>${riep}</tbody></table>
    <div class="pd-tot">${tot.map(t=>`<div><span>${t[0]}</span><span>${t[1]}</span></div>`).join('')}<div class="pd-grand"><span>Totale documento</span><span>${mm(d.tot)}</span></div></div>
    ${pag?`<table class="pd-t"><thead><tr><th>Pagamento</th><th>Scadenza</th><th class="n">Importo</th><th>IBAN / Istituto</th></tr></thead><tbody>${pag}</tbody></table>`:''}
    ${d.all.length?`<div class="pd-note"><b>Allegati:</b> ${d.all.map(a=>esc(a.nome)).join(', ')} (non inclusi in questa copia)</div>`:''}
    <footer class="pd-foot">Copia di cortesia generata da Fatture Elettroniche Explorer a partire dal file «${esc(d.path.split('/').pop())}». Non ha valore fiscale: il documento originale è il file XML FatturaPA.</footer>
  </article>`;
}
function printCourtesy(){
  const d=view[drawerIdx];if(!d)return;
  const host=$id('printDoc');host.innerHTML=courtesyDoc(d);
  // il nome proposto da Chrome per il PDF viene dal titolo della pagina
  const t=document.title;
  document.title=safeName(`Fattura ${d.numero} ${d.data} ${nm(d.ced)}`).replace(/\s+/g,'_').slice(0,100);
  document.body.classList.add('printing');
  const done=()=>{removeEventListener('afterprint',done);document.body.classList.remove('printing');host.textContent='';document.title=t};
  addEventListener('afterprint',done);
  print();
}

/* ====================== CSV ====================== */
function exportCsv(){
  const c=v=>{v=String(v??'');return/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const n=v=>String(v).replace('.',',');
  const T=v=>{v=String(v==null?'':v);return/^[=+\-@\t\r]/.test(v)?"'"+v:v}; // evita l'esecuzione di formule in Excel
  const rows=[['Data','Numero','Tipo','Direzione','Cedente','P.IVA cedente','Cessionario','P.IVA cessionario','Imponibile','IVA','Totale','Divisa','Causale','File']];
  for(const d of view)rows.push([T(d.data.split('-').reverse().join('/')),T(d.numero),T(d.td),T(d.dir),T(nm(d.ced)),T(d.ced.piva||d.ced.cf),T(nm(d.ces)),T(d.ces.piva||d.ces.cf),n(d.impS),n(d.ivaS),n(d.totS),T(d.divisa),T(d.caus.join(' ')),T(d.path)]);
  const blob=new Blob(['﻿'+rows.map(r=>r.map(c).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fatture.csv';a.click();
}

/* ====================== Recenti (cartelle e fatture) ====================== */
const WELCOME=$id('content').innerHTML;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
let RECENTS=[],curKey='',single=false,snap=null;
const recents={
  async load(){try{RECENTS=(await idb.get('kv','recents'))||[]}catch{RECENTS=[]}renderRecents()},
  async find(h,kind){for(const r of RECENTS){if(r.kind!==kind)continue;try{if(await r.handle.isSameEntry(h))return r}catch{}}return null},
  async upsert(h,kind,extra){const old=await this.find(h,kind);RECENTS=RECENTS.filter(r=>r!==old);
    RECENTS.unshift({...(old||{}),id:(old&&old.id)||uid(),kind,name:h.name,handle:h,t:Date.now(),...extra});RECENTS=RECENTS.slice(0,15);await this.persist()},
  async remove(id){const r=RECENTS.find(x=>x.id===id);RECENTS=RECENTS.filter(x=>x.id!==id);if(r&&r.kind==='dir')idb.del('cache',id).catch(()=>{});await this.persist()},
  async clear(){idb.del('cache','sel').catch(()=>{});for(const r of RECENTS)if(r.kind==='dir')idb.del('cache',r.id).catch(()=>{});RECENTS=[];await this.persist()},
  async persist(){try{await idb.set('kv','recents',RECENTS)}catch{}renderRecents()}
};
function recItem(r){
  const when=new Date(r.t).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const sub=r.kind==='dir'?(r.n!=null?r.n.toLocaleString('it-IT')+' fatture · ':'')+when:(r.desc?r.desc+' · ':'')+when;
  return`<div class="rec" data-id="${esc(r.id)}" tabindex="0" role="button"><span class="ri">${r.kind==='dir'?'<svg class="i" aria-hidden="true"><use href="#i-folder"/></svg>':'<svg class="i" aria-hidden="true"><use href="#i-file"/></svg>'}</span><div class="rt"><b>${esc(r.name)}</b><small>${esc(sub)}</small></div><button class="rx" data-del="${esc(r.id)}" title="Rimuovi dai recenti" aria-label="Rimuovi dai recenti"><svg class="i" aria-hidden="true"><use href="#i-x"/></svg></button></div>`;
}
function renderRecents(){
  const has=RECENTS.length,html=RECENTS.map(recItem).join('');
  $id('bRecent').style.display=has?'':'none';
  $id('recentMenu').innerHTML=has?`<div class="mh"><b>Aperti di recente</b><button class="btn ghost" data-clear>Svuota</button></div>${html}<p class="mf">Il browser non rivela il percorso completo: ricorda la cartella (o il file) insieme al permesso di accesso. Alla riapertura può chiederti di confermarlo.</p>`:'';
  const rh=$id('recentHello');if(rh)rh.innerHTML=has?`<h3>Aperti di recente</h3><div class="recs">${html}</div>`:'';
}
async function openRecent(r){
  if(!r)return;
  try{
    let p=await r.handle.queryPermission({mode:'read'});
    if(p!=='granted')p=await r.handle.requestPermission({mode:'read'});
    if(p!=='granted'){toast('Permesso di lettura negato');return}
    if(r.kind==='dir')await pick(r.handle);else await openFileHandles([r.handle]);
  }catch(e){toast('Impossibile aprire «'+r.name+'»: '+(e.message||e))}
}
const hideMenu=()=>$id('recentMenu').classList.remove('open');
$id('bRecent').onclick=()=>{const m=$id('recentMenu');m.classList.toggle('open');if(m.classList.contains('open'))placeRecent()};
document.addEventListener('click',e=>{
  const del=e.target.closest('[data-del]');if(del){e.stopPropagation();recents.remove(del.dataset.del);return}
  if(e.target.closest('[data-clear]')){recents.clear();hideMenu();return}
  const rec=e.target.closest('.rec');if(rec){hideMenu();openRecent(RECENTS.find(r=>r.id===rec.dataset.id));return}
  if(!e.target.closest('#recentMenu')&&!e.target.closest('#bRecent'))hideMenu();
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('rec')){e.preventDefault();e.target.click()}});

/* ====================== Fattura singola ====================== */
function leaveSingle(){
  if(!single)return;single=false;document.body.classList.remove('single');
  $id('split').classList.remove('open','full');$id('scrim').classList.remove('on');drawerIdx=-1;
}
function enterSingle(docs,label){
  if(!single)snap=ALL.length?{ALL,ERR,rootName,entriesCur,dirHandle,nFiles:(entriesCur||[]).length||ALL.length,myId}:null;
  single=true;ALL=docs;ERR=[];buildCanon();classify();view=docs.slice();
  document.body.classList.add('single');
  $id('split').classList.add('open','full');$id('scrim').classList.remove('on');
  $id('status').textContent=label;$id('bRescan').disabled=true;
  dMode='d';drawerIdx=0;loadDetail();toTop();
}
function exitSingle(){
  if(!single)return;leaveSingle();
  if(snap){const s=snap;snap=null;ALL=s.ALL;ERR=s.ERR;rootName=s.rootName;entriesCur=s.entriesCur;dirHandle=s.dirHandle;myId=s.myId;setupAfterLoad(s.nFiles,0)}
  else{ALL=[];view=[];ERR=[];$id('toolbar').style.display='none';$id('tabs').style.display='none';$id('stats').style.display='none';
    $id('content').innerHTML=WELCOME;$id('status').textContent='';$id('bRescan').disabled=true;renderRecents()}
}
async function openSingleFile(file,name){
  try{
    progress('Lettura fattura…');
    const docs=(await parseFile(file)).map(d=>Object.assign({},d,{path:name,e:{path:name,getFile:async()=>file}}));
    $id('overlay').style.display='none';
    if(!docs.length){toast('Il file non è una fattura elettronica FatturaPA');return null}
    enterSingle(docs,name);return docs;
  }catch(e){$id('overlay').style.display='none';toast('Impossibile leggere «'+name+'»: '+(e.message||e));return null}
}
const descOf=d=>`${d.td} n. ${d.numero} · ${nm(d.ced)}`;
async function openFileHandles(hs){
  hs=hs.filter(h=>h&&h.kind==='file');if(!hs.length)return;
  if(hs.length===1){
    const docs=await openSingleFile(await hs[0].getFile(),hs[0].name);
    if(docs)await recents.upsert(hs[0],'file',{desc:descOf(docs[0])});
  }else{dirHandle=null;curKey='sel';await loadEntries(hs.map(h=>({path:h.name,getFile:()=>h.getFile()})),hs.length+' file selezionati','sel')}
}
async function openFiles(){
  if(window.showOpenFilePicker){
    try{await openFileHandles(await showOpenFilePicker({multiple:true,types:[{description:'Fatture elettroniche (XML / P7M)',accept:{'text/xml':['.xml'],'application/pkcs7-mime':['.p7m']}}]}))}
    catch(e){if(e.name!=='AbortError')toast('Errore: '+e.message)}
  }else $id('fFiles').click();
}
async function openPlainFiles(files){
  files=[...files].filter(f=>/\.(xml|p7m)$/i.test(f.name));if(!files.length){toast('Nessun file .xml / .p7m');return}
  if(files.length===1)await openSingleFile(files[0],files[0].name);
  else{dirHandle=null;await loadEntries(files.map(f=>({path:f.name,getFile:async()=>f})),files.length+' file selezionati','sel')}
}
$id('bFile').onclick=openFiles;
$id('fFiles').onchange=e=>{openPlainFiles(e.target.files);e.target.value=''};
// trascinamento di cartelle / file sulla pagina
let dragN=0;
addEventListener('dragenter',e=>{e.preventDefault();dragN++;document.body.classList.add('drag')});
addEventListener('dragover',e=>e.preventDefault());
addEventListener('dragleave',()=>{if(--dragN<=0){dragN=0;document.body.classList.remove('drag')}});
addEventListener('drop',async e=>{
  e.preventDefault();dragN=0;document.body.classList.remove('drag');
  const items=[...(e.dataTransfer.items||[])].filter(i=>i.kind==='file');
  if(items.length&&items[0].getAsFileSystemHandle){
    const hs=(await Promise.all(items.map(i=>i.getAsFileSystemHandle()))).filter(Boolean);
    const dir=hs.find(h=>h.kind==='directory');
    if(dir)await pick(dir);else await openFileHandles(hs);
  }else await openPlainFiles(e.dataTransfer.files);
});
// stampa sempre in tema chiaro
let _th='auto';
addEventListener('beforeprint',()=>{try{_th=localStorage.getItem('fe_theme')||'auto'}catch{}document.documentElement.setAttribute('data-theme','light')});
addEventListener('afterprint',()=>setTheme(_th));

/* ====================== Eventi ====================== */
async function pick(handle){
  try{
    if(!handle)handle=await window.showDirectoryPicker({id:'fatture',mode:'read'});
    dirHandle=handle;
    const old=await recents.find(handle,'dir');curKey=old?old.id:uid();
    await scan();
    if(ALL.length)await recents.upsert(handle,'dir',{id:curKey,n:ALL.length});
  }catch(e){if(e.name!=='AbortError'){$id('overlay').style.display='none';toast('Errore: '+(e.message||e))}}
}
async function scan(){
  progress('Scansione cartelle…');const out=[];
  await walk(dirHandle,'',out);
  if(!out.length){leaveSingle();$id('overlay').style.display='none';ALL=[];view=[];$id('toolbar').style.display='none';$id('tabs').style.display='none';$id('stats').style.display='none';$id('content').innerHTML='<div class="empty"><div class="ico">📭</div><h2>Nessun file .xml / .p7m trovato</h2><p>La cartella «'+esc(dirHandle.name)+'» non contiene fatture elettroniche.</p></div>';return}
  await loadEntries(out,dirHandle.name,curKey);
}
$id('bPick').onclick=()=>{if('showDirectoryPicker' in window)pick();else toast('Usa Chrome o Edge, oppure il pulsante modalità compatibile')};
$id('bRescan').onclick=async()=>{if(dirHandle)await pick(dirHandle);else if(entriesCur)await loadEntries(entriesCur,rootName)};
if(!('showDirectoryPicker' in window)){$id('bFallback').style.display='';}
$id('fFallback').onchange=async e=>{
  const files=[...e.target.files].filter(f=>/\.(xml|p7m)$/i.test(f.name)&&!META.test(f.name));if(!files.length)return;
  const root=(files[0].webkitRelativePath||'').split('/')[0]||'cartella';dirHandle=null;
  await loadEntries(files.map(f=>({path:f.webkitRelativePath||f.name,getFile:async()=>f})),root);
};
recents.load();
$id('errClose').onclick=()=>$id('errDlg').close();
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){$id(g.dataset.go).click();return}if(e.target.closest('[data-act="reset"]'))resetAll()});

const onF=debounce(readFilters,150);
['q','cp','dal','al','min','max'].forEach(i=>$id(i).addEventListener('input',onF));
['per','td','dup'].forEach(i=>$id(i).addEventListener('change',readFilters));
$id('my').onchange=e=>{myId=e.target.value;localStorage.setItem('fe_my',myId);F.dir='';classify();apply()};
$id('bReset').onclick=resetAll;
$id('fbtn').onclick=()=>$id('adv').classList.toggle('open');
$id('dirSeg').onclick=e=>{const b=e.target.closest('button');if(b){F.dir=b.dataset.dir;apply()}};
$id('years').onclick=e=>{const b=e.target.closest('.pill');if(b){F.anno=b.dataset.y;apply()}};
$id('chips').onclick=e=>{const c=e.target.closest('[data-clr]');if(!c)return;const k=c.dataset.clr;if(k==='dup')$id('dup').checked=true;else $id(k).value='';readFilters()};
$id('tabs').onclick=e=>{const t=e.target.closest('.tab');if(t){tab=t.dataset.t;render();toTop()}};
$id('bCsv').onclick=()=>{exportCsv();toast(`Esportate ${view.length} fatture in CSV`)};
$id('bErr').onclick=()=>{$id('errList').innerHTML=ERR.map(x=>`<div style="margin-bottom:6px"><b>${esc(x.path)}</b><br><span class="mute">${esc(x.msg)}</span></div>`).join('');$id('errDlg').showModal()};
$id('content').addEventListener('click',e=>{
  const h=e.target.closest('th[data-k]');
  if(h){const st=tab==='fatt'?sortF:cpSort;const k=h.dataset.k;if(st.k===k)st.d*=-1;else{st.k=k;st.d=(k==='data'||k==='tot'||k==='imp'||k==='iva'||k==='n'||k==='last')?-1:1}if(tab==='fatt')sortView();render();return}
  const bar=e.target.closest('[data-m]');if(bar){filterMonth(bar.dataset.m);return}
  const tr=e.target.closest('tr[data-i]');if(!tr)return;
  if(tab==='fatt')openDrawer(+tr.dataset.i);
  else if(tab==='cp'){const x=cpRows[+tr.dataset.i];$id('cp').value=nm(x.p)+(x.p.piva?' — '+x.p.piva:'');tab='fatt';readFilters();toTop()}
});
$id('dClose').onclick=()=>single?exitSingle():closeDrawer();
$id('dPrint').onclick=printCourtesy;
$id('dFull').onclick=()=>{const f=$id('split').classList.toggle('full');if(f)$id('scrim').classList.remove('on');else if(innerWidth<=1250)$id('scrim').classList.add('on')};$id('scrim').onclick=closeDrawer;
$id('dPrev').onclick=()=>stepDrawer(-1);
$id('dNext').onclick=()=>stepDrawer(1);
$id('dTabD').onclick=()=>{dMode='d';loadDetail()};
$id('dTabX').onclick=()=>{dMode='x';loadDetail()};
document.addEventListener('keydown',e=>{
  const typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  if(e.key==='/'&&!typing&&ALL.length&&!single){e.preventDefault();$id('q').focus();$id('q').select();return}
  if(e.key==='Escape'){if(single)exitSingle();else if($id('split').classList.contains('full'))$id('dFull').click();else if($id('split').classList.contains('open'))closeDrawer();else if(typing)document.activeElement.blur();return}
  if($id('split').classList.contains('open')&&!typing){if(e.key==='ArrowLeft'||e.key==='k')stepDrawer(-1);else if(e.key==='ArrowRight'||e.key==='j')stepDrawer(1)}
});

/* ====================== PWA ====================== */
// Il service worker rende l'app installabile e utilizzabile offline. Funziona solo su HTTPS
// (o localhost): da file locale (file://) o in HTTP semplice viene semplicemente ignorato.
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}

/* ====================== Interfaccia: header, azienda, menu a tendina ====================== */
const topBar=$id('top');
const closeNav=()=>{topBar.classList.remove('open');$id('bMenu').setAttribute('aria-expanded','false')};
$id('bMenu').onclick=()=>{const o=topBar.classList.toggle('open');$id('bMenu').setAttribute('aria-expanded',String(o));hideMenu()};
$id('hActions').addEventListener('click',e=>{const b=e.target.closest('.btn,.seg button');if(b&&b.id!=='bRecent'&&innerWidth<=1100)closeNav()});
document.addEventListener('click',e=>{if(!e.target.closest('#top')&&!e.target.closest('#recentMenu'))closeNav()});
addEventListener('resize',()=>{hideMenu();if(innerWidth>1100)closeNav()});
function toTop(){scrollTo({top:0});const c=$id('content');if(c)c.scrollTop=0}
function placeRecent(){
  const m=$id('recentMenu');m.style.top=m.style.left='';
  if(innerWidth<=1100)return;
  const r=$id('bRecent').getBoundingClientRect(),w=Math.min(460,innerWidth-24);
  m.style.top=Math.round(r.bottom+8)+'px';
  m.style.left=Math.round(Math.max(12,Math.min(r.right-w,innerWidth-w-12)))+'px';
}
$id('myBadge').onclick=()=>{$id('adv').classList.add('open');const b=$id('my').parentNode.querySelector('.sel-btn');if(b)b.focus()};
var SELS=[];
function refreshUI(){
  for(const f of SELS||[])f();
  const o=$id('my').selectedOptions[0],name=myId&&o&&o.dataset.name,b=$id('myBadge');
  b.hidden=!name;
  if(name){$id('myName').textContent=name;b.title='La mia azienda: '+name+' (clicca per cambiarla)'}
}
const ICO=n=>`<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
function popPlace(wrap,pop){
  pop.classList.remove('r');
  const r=pop.getBoundingClientRect();
  if(r.right>innerWidth-8)pop.classList.add('r');
  pop.scrollIntoView({block:'nearest'});
}
let openPop=null;
function closePop(){if(openPop){openPop();openPop=null}}
document.addEventListener('mousedown',e=>{if(openPop&&!e.target.closest('.sel'))closePop()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&openPop){e.stopPropagation();closePop()}},true);
function moveAct(pop,d){
  const L=[...pop.querySelectorAll('.opt')];if(!L.length)return;
  let i=L.findIndex(x=>x.classList.contains('act'));
  if(i>=0)L[i].classList.remove('act');
  i=i<0?(d>0?0:L.length-1):Math.max(0,Math.min(L.length-1,i+d));
  L[i].classList.add('act');L[i].scrollIntoView({block:'nearest'});
}
/* select nativo -> menu personalizzato (il <select> resta la fonte dei dati ed emette 'change') */
function enhanceSelect(sel){
  const wrap=document.createElement('div');wrap.className='sel';
  sel.parentNode.insertBefore(wrap,sel);wrap.appendChild(sel);
  sel.classList.add('sr');sel.tabIndex=-1;sel.setAttribute('aria-hidden','true');
  const btn=document.createElement('button');btn.type='button';btn.className='sel-btn';
  btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');
  btn.innerHTML='<span class="sel-v"></span>'+ICO('chev');
  const pop=document.createElement('div');pop.className='pop';pop.hidden=true;
  wrap.append(btn,pop);
  const label=o=>o.dataset.name||o.textContent;
  const sync=()=>{const o=sel.selectedOptions[0];btn.querySelector('.sel-v').textContent=o?label(o):''};
  const items=()=>{
    const out=[],one=o=>({v:o.value,t:label(o),s:o.dataset.sub||''});
    for(const c of sel.children){if(c.tagName==='OPTGROUP'){out.push({g:c.label});for(const o of c.children)out.push(one(o))}else out.push(one(c))}
    return out;
  };
  let q='';
  const draw=()=>{
    const all=items(),n=all.filter(x=>!x.g).length,qq=q.trim().toLowerCase();
    let html='';
    if(n>20)html+=`<div class="psearch">${ICO('search')}<input type="search" placeholder="Cerca…" autocomplete="off" value="${esc(q)}" aria-label="Cerca nell'elenco"></div>`;
    let g='',shown=0,gh='';
    html+='<div class="plist" role="listbox">';
    for(const x of all){
      if(x.g){gh=`<div class="pg">${esc(x.g)}</div>`;continue}
      if(qq&&!(x.t+' '+x.s).toLowerCase().includes(qq))continue;
      html+=gh;gh='';shown++;
      html+=`<div class="opt${x.v===sel.value?' on':''}" role="option" data-v="${esc(x.v)}"><span class="ot"><b>${esc(x.t)}</b>${x.s?`<small>${esc(x.s)}</small>`:''}</span>${x.v===sel.value?ICO('check'):''}</div>`;
    }
    if(!shown)html+='<div class="pempty">Nessun risultato</div>';
    html+='</div>';
    pop.innerHTML=html;
    const on=pop.querySelector('.opt.on')||pop.querySelector('.opt');if(on)on.classList.add('act');
  };
  const close=()=>{pop.hidden=true;btn.setAttribute('aria-expanded','false')};
  const open=()=>{
    closePop();q='';draw();pop.hidden=false;btn.setAttribute('aria-expanded','true');openPop=close;popPlace(wrap,pop);
    const i=pop.querySelector('input');if(i)i.focus();else pop.focus();
    const on=pop.querySelector('.opt.on');if(on)on.scrollIntoView({block:'nearest'});
  };
  const pick=v=>{close();openPop=null;sel.value=v;sync();btn.focus();sel.dispatchEvent(new Event('change',{bubbles:true}))};
  pop.tabIndex=-1;
  btn.onclick=()=>pop.hidden?open():close();
  btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(pop.hidden)open()}});
  sel.addEventListener('focus',()=>btn.focus());
  pop.addEventListener('input',e=>{if(e.target.matches('input')){q=e.target.value;draw();const i=pop.querySelector('input');i.focus();i.setSelectionRange(q.length,q.length)}});
  pop.addEventListener('click',e=>{const o=e.target.closest('.opt');if(o){e.preventDefault();pick(o.dataset.v)}});
  pop.addEventListener('mousemove',e=>{const o=e.target.closest('.opt');if(o&&!o.classList.contains('act')){const a=pop.querySelector('.opt.act');if(a)a.classList.remove('act');o.classList.add('act')}});
  pop.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();moveAct(pop,1)}
    else if(e.key==='ArrowUp'){e.preventDefault();moveAct(pop,-1)}
    else if(e.key==='Enter'){e.preventDefault();const a=pop.querySelector('.opt.act');if(a)pick(a.dataset.v)}
    else if(e.key==='Tab')close();
  });
  SELS.push(sync);sync();
}
/* campo di testo con suggerimenti (cliente / fornitore) */
function enhanceCombo(inp,getList){
  const wrap=document.createElement('div');wrap.className='sel';
  inp.parentNode.insertBefore(wrap,inp);wrap.appendChild(inp);
  const chev=document.createElement('button');chev.type='button';chev.className='sel-chev';chev.tabIndex=-1;chev.setAttribute('aria-label','Mostra elenco');chev.innerHTML=ICO('chev');wrap.appendChild(chev);
  const pop=document.createElement('div');pop.className='pop';pop.hidden=true;wrap.appendChild(pop);
  const close=()=>{pop.hidden=true;inp.setAttribute('aria-expanded','false')};
  const draw=()=>{
    const qq=inp.value.toLowerCase().split(' — ')[0].trim(),all=getList();
    const hit=(qq?all.filter(x=>x.toLowerCase().includes(qq)):all);
    const part=hit.slice(0,60);
    if(!part.length){close();return}
    pop.innerHTML='<div class="plist" role="listbox">'+part.map(x=>{const i=x.lastIndexOf(' — ');const t=i>0?x.slice(0,i):x,s=i>0?x.slice(i+3):'';
      return`<div class="opt" role="option" data-v="${esc(x)}"><span class="ot"><b>${esc(t)}</b>${s?`<small>${esc(s)}</small>`:''}</span></div>`}).join('')
      +(hit.length>60?`<div class="pempty">Altri ${hit.length-60} risultati: continua a scrivere per restringere</div>`:'')+'</div>';
    const f=pop.querySelector('.opt');if(f)f.classList.add('act');
    if(pop.hidden){closePop();pop.hidden=false;inp.setAttribute('aria-expanded','true');openPop=close;popPlace(wrap,pop)}
  };
  chev.addEventListener('mousedown',e=>e.preventDefault());
  chev.addEventListener('click',()=>{if(!pop.hidden){close();openPop=null}else{inp.focus();draw()}});
  inp.addEventListener('input',draw);
  inp.addEventListener('focus',draw);
  inp.addEventListener('keydown',e=>{
    if(pop.hidden){if(e.key==='ArrowDown')draw();return}
    if(e.key==='ArrowDown'){e.preventDefault();moveAct(pop,1)}
    else if(e.key==='ArrowUp'){e.preventDefault();moveAct(pop,-1)}
    else if(e.key==='Enter'){const a=pop.querySelector('.opt.act');if(a){e.preventDefault();inp.value=a.dataset.v;close();openPop=null;inp.dispatchEvent(new Event('input',{bubbles:true}))}}
    else if(e.key==='Tab')close();
  });
  pop.addEventListener('mousedown',e=>e.preventDefault());
  pop.addEventListener('click',e=>{const o=e.target.closest('.opt');if(o){e.preventDefault();inp.value=o.dataset.v;close();openPop=null;inp.dispatchEvent(new Event('input',{bubbles:true}))}});
  pop.addEventListener('mousemove',e=>{const o=e.target.closest('.opt');if(o&&!o.classList.contains('act')){const a=pop.querySelector('.opt.act');if(a)a.classList.remove('act');o.classList.add('act')}});
}
['my','per','td'].forEach(i=>enhanceSelect($id(i)));
enhanceCombo($id('cp'),()=>CP_OPTS);
/* tema: un solo pulsante con menu */
(()=>{
  const btn=$id('bTheme'),menu=$id('themeMenu');
  const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
  btn.onclick=()=>{if(!menu.hidden){close();openPop=null;return}closePop();menu.hidden=false;btn.setAttribute('aria-expanded','true');openPop=close};
  menu.onclick=e=>{const o=e.target.closest('[data-th]');if(o){setTheme(o.dataset.th);close();openPop=null}};
})();
/* il pannello dei filtri si chiude con un clic fuori */
document.addEventListener('mousedown',e=>{
  if(!e.target.closest('#adv,#fbtn,#myBadge,.chip'))$id('adv').classList.remove('open');
});
