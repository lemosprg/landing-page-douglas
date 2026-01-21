// Menu mobile
const navbtn = document.getElementById("navbtn");
const nav = document.getElementById("nav");

navbtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navbtn.setAttribute("aria-expanded", String(open));
});

// Fechar menu ao clicar em um link (mobile)
nav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      navbtn.setAttribute("aria-expanded", "false");
    }
  });
});

// Ano no rodapé
document.getElementById("year").textContent = String(new Date().getFullYear());

// Voltar ao topo (garante funcionamento mesmo em navegadores/contexts que não rolam por âncora)
const backToTop = document.getElementById("backToTop");
backToTop?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Carousel de depoimentos (3 por vez no desktop)
const viewport = document.getElementById("viewport");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function visibleCount(){
  return window.matchMedia("(max-width: 980px)").matches ? 1 : 3;
}

function itemWidth(){
  if(!viewport) return 0;
  return viewport.clientWidth / visibleCount();
}

function slide(direction){
  if(!viewport) return;
  const w = itemWidth();
  viewport.scrollBy({ left: direction * w, behavior: "smooth" });
}

function autoSlide(){
  if(!viewport) return;
  const end = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 5;
  if(end){
    viewport.scrollTo({ left: 0, behavior: "smooth" });
  }else{
    slide(1);
  }
}

prev?.addEventListener("click", () => slide(-1));
next?.addEventListener("click", () => slide(1));

// Auto-rolagem a cada 5s
let timer = setInterval(autoSlide, 5000);

// Pausa ao passar o mouse (melhor UX)
viewport?.addEventListener("mouseenter", () => clearInterval(timer));
viewport?.addEventListener("mouseleave", () => (timer = setInterval(autoSlide, 5000)));

window.addEventListener("resize", () => {
  if(!viewport) return;
  viewport.scrollTo({ left: 0, behavior: "auto" });
});


// Form: envia para e-mail via mailto (site estático)
const form = document.getElementById("contactForm");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);

  const nome = String(fd.get("nome") || "").trim();
  const telefone = String(fd.get("telefone") || "").trim();
  const mensagem = String(fd.get("mensagem") || "").trim();

  const subject = encodeURIComponent("Contato pelo site - Fernandes dos Santos Advocacia");
  const body = encodeURIComponent(
    `Nome: ${nome}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`
  );

  // Você pode trocar o e-mail aqui se desejar
  window.location.href = `mailto:advdouglasfernandes@gmail.com?subject=${subject}&body=${body}`;
});


// Galeria (imagens/vídeo) - carrossel dinâmico
const gviewport = document.getElementById("gviewport");
const gprev = document.getElementById("gprev");
const gnext = document.getElementById("gnext");
const gdots = document.getElementById("gdots");
const officeVideo = document.getElementById("officeVideo");

function gSlideWidth(){
  if(!gviewport) return 0;
  return gviewport.clientWidth;
}

function gSlideTo(index){
  if(!gviewport) return;
  const w = gSlideWidth();
  gviewport.scrollTo({ left: index * w, behavior: "smooth" });
  setActiveDot(index);
  handleVideo(index);
}

function gCurrentIndex(){
  if(!gviewport) return 0;
  const w = gSlideWidth();
  return w ? Math.round(gviewport.scrollLeft / w) : 0;
}

function setActiveDot(index){
  if(!gdots) return;
  gdots.querySelectorAll(".gdot").forEach((d, i) => {
    d.classList.toggle("is-active", i === index);
  });
}

function handleVideo(index){
  if(!officeVideo || !gviewport) return;
  const videoIndex = Array.from(gviewport.children).findIndex((el) => el.querySelector("video"));
  if(index === videoIndex){
    officeVideo.muted = true;
    const p = officeVideo.play();
    if(p && typeof p.catch === "function") p.catch(() => {});
  }else{
    officeVideo.pause();
    officeVideo.currentTime = 0;
  }
}

function gInitDots(){
  if(!gdots || !gviewport) return;
  gdots.innerHTML = "";
  const count = gviewport.children.length;
  for(let i=0;i<count;i++){
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gdot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Ir para o item ${i+1}`);
    dot.addEventListener("click", () => gSlideTo(i));
    gdots.appendChild(dot);
  }
}

function gNext(){
  if(!gviewport) return;
  const count = gviewport.children.length;
  const idx = gCurrentIndex();
  gSlideTo((idx + 1) % count);
}

function gPrev(){
  if(!gviewport) return;
  const count = gviewport.children.length;
  const idx = gCurrentIndex();
  gSlideTo((idx - 1 + count) % count);
}

gprev?.addEventListener("click", gPrev);
gnext?.addEventListener("click", gNext);

gInitDots();

// Auto-rolagem da galeria a cada 5s
let gtimer = setInterval(gNext, 5000);

// Pausa ao passar o mouse
gviewport?.addEventListener("mouseenter", () => clearInterval(gtimer));
gviewport?.addEventListener("mouseleave", () => (gtimer = setInterval(gNext, 5000)));

window.addEventListener("resize", () => {
  gSlideTo(0);
});


// Fade sliders (Hero e Escritório)
(function initFadeSliders(){
  const sliders = document.querySelectorAll(".fade-slider");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const list = (slider.dataset.images || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (list.length < 2) return;

    const intervalMs = Number(slider.dataset.interval || 4500);
    const fadeMs = Number(slider.dataset.fade || 900);

    const imgs = slider.querySelectorAll(".fade-slide");
    if (imgs.length < 2) return;

    const imgA = imgs[0];
    const imgB = imgs[1];

    // Ajusta duração conforme data-fade
    imgs.forEach((img) => {
      img.style.transitionDuration = `${fadeMs}ms`;
    });

    // Preload (evita piscadas)
    list.forEach((src) => {
      const i = new Image();
      i.src = src;
    });

    let index = 0;
    let showingA = true;

    imgA.src = list[0];
    imgB.src = list[1 % list.length];
    imgA.classList.add("is-visible");
    imgB.classList.remove("is-visible");

    setInterval(() => {
      index = (index + 1) % list.length;
      const nextSrc = list[index];

      const incoming = showingA ? imgB : imgA;
      const outgoing = showingA ? imgA : imgB;

      incoming.src = nextSrc;
      incoming.classList.add("is-visible");
      outgoing.classList.remove("is-visible");

      showingA = !showingA;
    }, intervalMs);
  });
})();
