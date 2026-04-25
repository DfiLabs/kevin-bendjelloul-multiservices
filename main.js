/* KVB Rénovation - editorial behavior layer
   - Loads content.json
   - Restrained motion: reveal-on-view + hero photo slow scale
   - Gallery lightbox, contact wiring, copy chips, share, etc. */

const CONFIG = {
  phoneDisplay: "06 32 63 77 23",
  phoneTel: "+33632637723",
  email: "kevin.benjelloul@gmail.com",
  publishEmailInSchema: false,
  whatsappEnabled: true,
  whatsappTel: "+33767647525",
  whatsappMessage: "Bonjour, je souhaite un devis (multi-services). Zone: Béziers / Hérault. Mon besoin:",
};

async function loadContentJson() {
  try {
    const res = await fetch("./content.json", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json && typeof json === "object" ? json : null;
  } catch (_) {
    return null;
  }
}

function applyContentJson(content) {
  if (!content || typeof content !== "object") return;

  const b = content.brand && typeof content.brand === "object" ? content.brand : null;
  if (b) {
    const nameEl = document.querySelector(".brand-name");
    const subEl = document.querySelector(".brand-sub");
    if (nameEl && typeof b.name === "string" && b.name.trim()) nameEl.textContent = b.name;
    if (subEl && typeof b.subtitle === "string" && b.subtitle.trim()) {
      subEl.textContent = "Béziers · Hérault";
    }
  }

  const hero = content.hero && typeof content.hero === "object" ? content.hero : null;
  if (hero) {
    const sub = document.querySelector("[data-hero-subheadline]");
    if (sub && typeof hero.subheadline === "string" && hero.subheadline.trim()) {
      sub.textContent = hero.subheadline;
    }
  }

  const c = content.contact && typeof content.contact === "object" ? content.contact : null;
  if (c) {
    if (typeof c.phoneDisplay === "string") CONFIG.phoneDisplay = c.phoneDisplay;
    if (typeof c.phoneTel === "string") CONFIG.phoneTel = c.phoneTel;
    if (typeof c.email === "string") CONFIG.email = c.email;
    if (typeof c.publishEmailInSchema === "boolean") CONFIG.publishEmailInSchema = c.publishEmailInSchema;
    if (c.whatsapp && typeof c.whatsapp === "object") {
      if (typeof c.whatsapp.enabled === "boolean") CONFIG.whatsappEnabled = c.whatsapp.enabled;
      if (typeof c.whatsapp.phoneTel === "string") CONFIG.whatsappTel = c.whatsapp.phoneTel;
      if (typeof c.whatsapp.message === "string") CONFIG.whatsappMessage = c.whatsapp.message;
    }
  }

  if (Array.isArray(content.services)) {
    const byId = new Map();
    content.services.forEach((s) => {
      if (s && typeof s === "object" && typeof s.id === "string") byId.set(s.id, s);
    });

    document.querySelectorAll("[data-service-id]").forEach((card) => {
      const id = card.getAttribute("data-service-id");
      if (!id) return;
      const s = byId.get(id);
      if (!s) return;

      const ul = card.querySelector("[data-service-examples]");
      if (ul) {
        ul.innerHTML = "";
        const ex = Array.isArray(s.examples)
          ? s.examples.filter((x) => typeof x === "string" && x.trim()).slice(0, 3)
          : [];
        ex.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          ul.appendChild(li);
        });
      }
    });
  }

  const proof = content.proofPack && typeof content.proofPack === "object" ? content.proofPack : null;
  if (proof) {
    const gallery = document.querySelector("[data-gallery]");
    if (gallery && Array.isArray(proof.gallery)) {
      gallery.innerHTML = "";
      proof.gallery.slice(0, 12).forEach((g) => {
        if (!g || typeof g !== "object") return;
        const title = typeof g.title === "string" ? g.title : "";
        const location = typeof g.location === "string" ? g.location : "";
        const src = typeof g.src === "string" ? g.src : "";
        const fullSrc = typeof g.fullSrc === "string" && g.fullSrc.trim() ? g.fullSrc : src;
        const credit = typeof g.credit === "string" ? g.credit : "";
        const alt = typeof g.alt === "string" ? g.alt : title || "Réalisation";

        const card = document.createElement("div");
        card.className = "gallery-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Voir la réalisation: ${title || alt}`);
        if (fullSrc && fullSrc.trim()) card.setAttribute("data-full-src", fullSrc);
        if (title) card.setAttribute("data-title", title);
        if (location) card.setAttribute("data-location", location);
        if (credit) card.setAttribute("data-credit", credit);

        const media = document.createElement("div");
        media.className = "gallery-media";
        if (src && src.trim()) {
          const img = document.createElement("img");
          img.loading = "lazy";
          img.src = src;
          img.alt = alt;
          media.appendChild(img);
        }

        const body = document.createElement("div");
        body.className = "gallery-body";
        const t = document.createElement("div");
        t.className = "gallery-title";
        t.textContent = title || "Réalisation";
        const loc = document.createElement("div");
        loc.className = "gallery-loc";
        loc.textContent = location || "";
        const hint = document.createElement("div");
        hint.className = "gallery-open";
        hint.textContent = "Ouvrir";
        const stack = document.createElement("div");
        stack.appendChild(t);
        if (location) stack.appendChild(loc);
        body.appendChild(stack);
        body.appendChild(hint);

        card.appendChild(media);
        card.appendChild(body);
        gallery.appendChild(card);
      });
    }
  }
}

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function showToast(msg) {
  const toast = $("[data-toast]");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function safeClipboardWrite(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      resolve();
    } catch (e) { reject(e); }
  });
}

function setYear() {
  const y = new Date().getFullYear();
  $all("[data-year]").forEach((el) => (el.textContent = String(y)));
}

function applyContactConfig() {
  $all("a[data-phone-link]").forEach((a) => {
    a.href = `tel:${CONFIG.phoneTel}`;
    const numEl = a.querySelector(".hero-call-num");
    if (numEl) numEl.textContent = CONFIG.phoneDisplay;
    else if (a.textContent.trim().match(/^0\d(\s?\d{2}){4}$/) || a.textContent.includes("00 00")) {
      a.textContent = CONFIG.phoneDisplay;
    }
  });

  $all("a[data-email-link]").forEach((a) => {
    a.href = `mailto:${CONFIG.email}`;
    if (a.textContent.includes("@")) a.textContent = CONFIG.email;
  });

  const waTel = String(CONFIG.whatsappTel || CONFIG.phoneTel || "");
  const digits = waTel.replace(/[^\d+]/g, "").replace("+", "");
  const waUrl = `https://wa.me/${encodeURIComponent(digits)}?text=${encodeURIComponent(CONFIG.whatsappMessage || "")}`;
  $all("a[data-whatsapp-link]").forEach((a) => {
    if (!CONFIG.whatsappEnabled) {
      a.setAttribute("hidden", "true");
      return;
    }
    a.removeAttribute("hidden");
    a.href = waUrl;
    a.target = "_blank";
    a.rel = "noreferrer";
  });

  $all("button[data-copy]").forEach((btn) => {
    const v = String(btn.getAttribute("data-copy") || "");
    if (v === "+33632637723") btn.setAttribute("data-copy", CONFIG.phoneTel);
  });

  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld && ld.textContent) {
    try {
      const parsed = JSON.parse(ld.textContent);
      parsed.telephone = CONFIG.phoneTel;
      if (CONFIG.publishEmailInSchema) parsed.email = CONFIG.email;
      else if ("email" in parsed) delete parsed.email;
      parsed.url = `${location.origin}${location.pathname}`;
      ld.textContent = JSON.stringify(parsed, null, 2);
    } catch (_) { /* ignore */ }
  }
}

function wireLegalLinks() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const a = t.closest("a[data-open-details]");
    if (!a) return;
    const id = a.getAttribute("data-open-details");
    if (!id) return;
    const el = document.getElementById(id);
    if (!(el instanceof HTMLDetailsElement)) return;
    e.preventDefault();
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function wireReveal() {
  const els = $all(".reveal");
  if (!els.length) return;

  els.slice(0, 2).forEach((el) => el.classList.add("is-visible"));

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach((el) => io.observe(el));
}

function wireHeroPhotoScale() {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const img = document.querySelector("[data-hero-photo]");
  const hero = document.querySelector(".hero");
  if (!img || !hero) return;

  let raf = 0;
  const tick = () => {
    raf = 0;
    const r = hero.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const progress = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.92)));
    const zoom = 1 + progress * 0.05;
    img.style.setProperty("--hero-zoom", zoom.toFixed(4));
  };

  tick();
  window.addEventListener("scroll", () => { if (!raf) raf = window.requestAnimationFrame(tick); }, { passive: true });
  window.addEventListener("resize", () => { if (!raf) raf = window.requestAnimationFrame(tick); }, { passive: true });
}

function wireNav() {
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
  };
  const open = () => {
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("open");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) close(); else open();
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("[data-nav-menu]") || t.closest("[data-nav-toggle]")) return;
    close();
  });

  $all("a.nav-link", menu).forEach((a) => a.addEventListener("click", close));
}

function wireStickyHeaderAndActiveNav() {
  const topbar = document.querySelector(".topbar");
  const navLinks = $all('.nav-link[href^="#"]');
  if (!topbar && !navLinks.length) return;

  let raf = 0;
  const onScroll = () => {
    raf = 0;
    if (topbar) topbar.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", () => { if (!raf) raf = window.requestAnimationFrame(onScroll); }, { passive: true });

  const links = navLinks.filter((a) => a.getAttribute("href") && a.getAttribute("href") !== "#top");
  const items = [];
  for (const a of links) {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) continue;
    const section = document.querySelector(href);
    if (!section) continue;
    items.push({ a, section, id: href.slice(1) });
  }
  if (!items.length) return;

  const setActive = (id) => {
    for (const it of items) {
      const active = it.id === id;
      it.a.classList.toggle("active", active);
      if (active) it.a.setAttribute("aria-current", "page");
      else it.a.removeAttribute("aria-current");
    }
  };

  setActive(items[0].id);

  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (!visible.length) return;
      const el = visible[0].target;
      const hit = items.find((x) => x.section === el);
      if (hit) setActive(hit.id);
    },
    { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.08, 0.16, 0.25, 0.4, 0.6] }
  );

  items.forEach((it) => io.observe(it.section));
}

function wireCopy() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const el = t.closest("[data-copy]");
    if (!el) return;
    const value = el.getAttribute("data-copy");
    if (!value) return;
    safeClipboardWrite(value)
      .then(() => showToast("Copié."))
      .catch(() => showToast("Impossible de copier."));
  });
}

function wireMailtoForm() {
  const form = $("[data-contact-form]");
  if (!(form instanceof HTMLFormElement)) return;
  form.action = `https://formsubmit.co/${CONFIG.email}`;
  form.method = "POST";
  form.enctype = "multipart/form-data";
  form.addEventListener("submit", () => showToast("Envoi de la demande…"));
}

function wirePhotoUpload() {
  const form = $("[data-mailto-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const input = form.querySelector("[data-photo-input]");
  const preview = form.querySelector("[data-photo-preview]");
  const shareBtn = form.querySelector("[data-share-request]");
  const countEl = form.querySelector("[data-upload-count]");

  if (!(input instanceof HTMLInputElement) || !(preview instanceof HTMLElement) || !(shareBtn instanceof HTMLElement)) return;

  const isShareSupported = () => {
    if (!("share" in navigator)) return false;
    if (!("canShare" in navigator)) return true;
    try {
      const files = input.files ? Array.from(input.files) : [];
      // @ts-ignore
      return files.length ? navigator.canShare({ files }) : navigator.canShare({ text: "x" });
    } catch { return false; }
  };

  if (isShareSupported()) shareBtn.removeAttribute("hidden");

  const render = () => {
    const files = input.files ? Array.from(input.files) : [];
    preview.innerHTML = "";
    if (countEl instanceof HTMLElement) countEl.textContent = String(files.length || 0);
    if (shareBtn instanceof HTMLButtonElement) shareBtn.disabled = files.length === 0;
    if (!files.length) { preview.setAttribute("hidden", "true"); return; }
    preview.removeAttribute("hidden");

    files.slice(0, 6).forEach((f) => {
      const item = document.createElement("div");
      item.className = "upload-item";
      const thumb = document.createElement("div");
      thumb.className = "upload-thumb";
      if (f.type && f.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.alt = f.name || "Photo";
        img.loading = "lazy";
        img.src = URL.createObjectURL(f);
        thumb.appendChild(img);
      } else { thumb.textContent = "Fichier"; }
      const meta = document.createElement("div");
      meta.className = "upload-meta";
      meta.textContent = f.name || "Photo";
      item.appendChild(thumb);
      item.appendChild(meta);
      preview.appendChild(item);
    });

    if (files.length > 6) {
      const more = document.createElement("div");
      more.className = "upload-more";
      more.textContent = `+${files.length - 6}`;
      preview.appendChild(more);
    }
  };

  input.addEventListener("change", render);

  shareBtn.addEventListener("click", async () => {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const files = input.files ? Array.from(input.files) : [];

    if (!files.length) {
      showToast("Ajoutez des photos avant d’envoyer.");
      input.focus();
      return;
    }

    const text = [
      "Demande de devis", "", message, "",
      `Nom: ${name}`,
      `Téléphone: ${phone}`,
      email ? `Email: ${email}` : "",
    ].filter(Boolean).join("\n");

    try {
      // @ts-ignore
      if (navigator.canShare && !navigator.canShare({ files })) {
        showToast("Partage de fichiers non supporté ici. Utilisez l’email et joignez les photos.");
        return;
      }
      // @ts-ignore
      await navigator.share({ title: "Demande de devis", text, files });
      showToast("Partage envoyé.");
    } catch (_) {
      showToast("Partage annulé.");
    }
  });
}

function wireScrollTop() {
  $all("[data-scroll-top]").forEach((btn) => {
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  });
}

function wireGalleryLightbox() {
  const cards = $all(".gallery-card[data-full-src]");
  if (!cards.length) return;

  const modal = document.createElement("div");
  modal.className = "gallery-lightbox";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Photo de réalisation");
  modal.setAttribute("hidden", "true");
  modal.innerHTML = `
    <button class="gallery-lightbox-close" type="button" aria-label="Fermer">Fermer</button>
    <div class="gallery-lightbox-frame">
      <img class="gallery-lightbox-img" alt="" />
      <div class="gallery-lightbox-caption">
        <div>
          <div class="gallery-lightbox-title"></div>
          <div class="gallery-lightbox-location"></div>
        </div>
        <div class="gallery-lightbox-credit"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const img = modal.querySelector(".gallery-lightbox-img");
  const titleEl = modal.querySelector(".gallery-lightbox-title");
  const locationEl = modal.querySelector(".gallery-lightbox-location");
  const creditEl = modal.querySelector(".gallery-lightbox-credit");
  const closeBtn = modal.querySelector(".gallery-lightbox-close");

  const close = () => {
    modal.setAttribute("hidden", "true");
    document.body.classList.remove("lightbox-open");
  };
  const open = (card) => {
    if (!(card instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;
    const src = card.getAttribute("data-full-src") || "";
    if (!src) return;
    const title = card.getAttribute("data-title") || "Réalisation";
    const location = card.getAttribute("data-location") || "";
    const credit = card.getAttribute("data-credit") || "";
    img.src = src;
    img.alt = title;
    if (titleEl) titleEl.textContent = title;
    if (locationEl) locationEl.textContent = location;
    if (creditEl) creditEl.textContent = credit;
    modal.removeAttribute("hidden");
    document.body.classList.add("lightbox-open");
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => open(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target === closeBtn) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) close();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setYear();
  const content = await loadContentJson();
  applyContentJson(content);
  applyContactConfig();
  wireReveal();
  wireHeroPhotoScale();
  wireNav();
  wireStickyHeaderAndActiveNav();
  wireCopy();
  wireMailtoForm();
  wirePhotoUpload();
  wireLegalLinks();
  wireGalleryLightbox();
  wireScrollTop();
});
