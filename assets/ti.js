// Prototipo dimostrativo non ufficiale · Estage con una gerarchia visiva nuova
const D = window.DATI;
const $ = s => document.querySelector(s);
const nomeComp = Object.fromEntries(D.competenze.map(c => [c.id, c.nome]));
const breve = n => n.replace(/\s*[–(].*$/, "");

// ---- Pagina Estage: offerte prima di tutto ----
function offerte() {
  const lista = $("#offerte"); if (!lista) return;
  const cerca = $("#cerca"), studi = $("#studi"), chips = $("#chips"), esito = $("#esito");
  const scelte = new Set();
  studi.innerHTML += D.studi.map((s, i) => `<option value="${i}">${s.nome}</option>`).join("");
  chips.innerHTML = D.competenze.map(c => `<button class="chip" type="button" aria-pressed="false" data-c="${c.id}">${c.nome}</button>`).join("");
  studi.onchange = () => { scelte.clear(); if (studi.value !== "") D.studi[studi.value].competenze.forEach(c => scelte.add(c)); aggiorna(); };
  chips.onclick = e => { const b = e.target.closest(".chip"); if (!b) return; scelte.has(b.dataset.c) ? scelte.delete(b.dataset.c) : scelte.add(b.dataset.c); studi.value = ""; aggiorna(); };
  cerca.oninput = aggiorna;
  function aggiorna() {
    chips.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", scelte.has(b.dataset.c)));
    const q = cerca.value.trim().toLowerCase();
    const pos = D.posizioni.filter(p => (!q || `${p.titolo} ${p.ente} ${p.luogo}`.toLowerCase().includes(q)) && (!scelte.size || p.competenze.some(c => scelte.has(c))));
    lista.innerHTML = pos.length ? pos.map(p => `
      <article class="offerta">
        <div class="logo">${p.logo ? `<img src="${p.logo}" alt="${p.ente}">` : `<span class="sigla">${breve(p.ente)}</span>`}</div>
        <div>
          <h3><a href="${p.link}" class="apri">${p.titolo}</a></h3>
          <div class="meta">${breve(p.ente)} · ${p.luogo} · ${p.tipo}</div>
          <div>${p.competenze.map(c => `<span class="tag${scelte.has(c) ? " si" : ""}">${nomeComp[c]}</span>`).join("")}</div>
        </div>
        <a class="pulsante apri" href="${p.link}">Candidati</a>
      </article>`).join("") : `<p>Nessuna offerta con questi filtri. <a href="#" onclick="location.reload()">Mostra tutte</a></p>`;
    esito.innerHTML = studi.value !== ""
      ? `Studi ${D.studi[studi.value].nome.toLowerCase()}? <b>${pos.length} offerte</b> cercano quello che sai fare.`
      : `<b>${pos.length} offerte</b> aperte${scelte.size ? " per le competenze scelte" : ""}.`;
  }
  aggiorna();
  // conferma del requisito prima di aprire l'annuncio
  const box = $("#conferma"), check = $("#conferma-check"), vai = $("#conferma-vai");
  lista.addEventListener("click", e => {
    const a = e.target.closest("a.apri"); if (!a) return;
    e.preventDefault(); vai.href = a.href; check.checked = false; vai.setAttribute("aria-disabled", "true"); box.classList.add("aperta");
  });
  check.onchange = () => vai.setAttribute("aria-disabled", String(!check.checked));
  vai.onclick = () => setTimeout(() => box.classList.remove("aperta"), 100);
  $("#conferma-annulla").onclick = () => box.classList.remove("aperta");
}

// ---- Storie in evidenza ----
function storie() {
  const box = $("#storie-evidenza"); if (!box) return;
  box.innerHTML = D.storie.map(s => `
    <article class="storia">
      <img src="${s.foto}" alt="${s.nome}">
      <div class="testo">
        <h3>${s.titolo}</h3>
        <p style="margin:0;font-size:14px">${s.testo}</p>
        <blockquote>«${s.citazione}»</blockquote>
        <div class="chi">${s.nome} · ${s.ruolo}</div>
        <a href="${s.link}" target="_blank" rel="noopener">Leggi l'intervista →</a>
      </div>
    </article>`).join("");
}

// ---- Modulo aziende ----
function modulo() {
  const f = $("#modulo-aziende"); if (!f) return;
  const nota = $("#nota-invio");
  f.onsubmit = e => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll("[required]").forEach(el => { const v = !el.value.trim(); el.classList.toggle("errore", v); if (v) ok = false; });
    const comp = f.querySelectorAll('input[name="competenze"]:checked').length;
    if (!ok || !comp) { nota.className = "nota-invio"; nota.textContent = !ok ? "Completa i campi evidenziati." : "Scegli almeno una competenza."; return; }
    nota.className = "nota-invio ok"; nota.textContent = "Grazie! L'offerta è in attesa di approvazione da parte del team Estage. (Prototipo: nessun dato inviato.)";
    f.querySelector("button").disabled = true;
  };
}

offerte(); storie(); modulo();
