/* Avvio prima del disegno della pagina: applica tema, dimensione del testo e larghezza salvati (chiavi di Dashboard Kit), così non c'è il lampo. */
try{var s=localStorage,r=document.documentElement,t=s.getItem("kit-theme"),f=s.getItem("kit-fs"),l=s.getItem("kit-layout"),o=s.getItem("fe_theme");
if(o!==null){if(t===null&&(o==="light"||o==="dark")){t=o;s.setItem("kit-theme",o)}s.removeItem("fe_theme")}
if(t==="light"||t==="dark")r.setAttribute("data-theme",t);
if(f==="lg"||f==="xl")r.setAttribute("data-kit-fs",f);
if(l==="boxed"||l==="fluid")r.setAttribute("data-layout",l)}catch(e){}
