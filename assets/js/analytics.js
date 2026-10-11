/* Jackdsgn · medição (Meta Pixel + Google Analytics 4)
   Nada carrega antes do visitante aceitar os cookies (LGPD).
   Para ativar, preencha os IDs abaixo. Vazio = medição desligada e sem aviso de cookies. */
const ANALYTICS = {
  META_PIXEL_ID: '',   // ex.: '123456789012345' (Gerenciador de Eventos da Meta)
  GA4_ID: ''           // ex.: 'G-ABC123XYZ' (Google Analytics > Fluxos de dados > Web)
};

(function () {
  const { META_PIXEL_ID, GA4_ID } = ANALYTICS;
  const KEY = 'jk-consent';
  const enabled = Boolean(META_PIXEL_ID || GA4_ID);
  let loaded = false;

  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };

  // Evento único para o site inteiro: vai para o GA4 e, quando houver equivalente, para a Meta.
  window.track = function (name, params = {}, metaEvent) {
    if (!loaded) return;
    if (window.gtag) window.gtag('event', name, params);
    if (window.fbq && metaEvent) window.fbq('track', metaEvent, params);
  };

  function loadGA() {
    if (!GA4_ID) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    // page_view é enviado à mão, porque as páginas do site mudam pelo # (home, case, sobre)
    window.gtag('config', GA4_ID, { send_page_view: false });
  }

  function loadMeta() {
    if (!META_PIXEL_ID) return;
    /* código oficial do Meta Pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
  }

  function currentProject() {
    const h = location.hash.slice(1);
    if (!h.startsWith('case-') || typeof PROJECTS === 'undefined') return null;
    return PROJECTS.find(p => p.slug === h.slice(5)) || null;
  }

  function pageView() {
    const p = currentProject();
    const view = p ? 'case' : (location.hash === '#sobre' ? 'sobre' : 'home');
    if (window.gtag) window.gtag('event', 'page_view', { page_location: location.href, page_title: p ? p.title + ' | Jackdsgn' : document.title, view });
    if (window.fbq) window.fbq('track', 'PageView');
    if (p) window.track('view_case', { project: p.title, area: p.area, client: p.client }, 'ViewContent');
  }

  function start() {
    if (loaded || !enabled) return;
    loadGA();
    loadMeta();
    loaded = true;
    pageView();
    addEventListener('hashchange', pageView);
  }

  // Cliques que interessam: WhatsApp (o lead), copiar contato, ativar som do case
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="wa.me"]');
    if (a) {
      const p = currentProject();
      const cta = a.dataset.wa || (a.closest('.case-cta') ? 'case' : 'outro');
      window.track('whatsapp_click', { cta, project: p ? p.title : '(nenhum)' }, 'Contact');
      if (window.gtag) window.gtag('event', 'generate_lead', { cta, project: p ? p.title : '(nenhum)' });
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) { window.track('copy_contact', { kind: copy.dataset.copy.includes('@') ? 'email' : 'whatsapp' }); return; }
    if (e.target.closest('#soundBtn')) { const p = currentProject(); window.track('case_sound_on', { project: p ? p.title : '' }); }
  }, true);

  // ---------- aviso de cookies ----------
  function banner() {
    if (document.getElementById('consent')) return;
    const box = document.createElement('div');
    box.id = 'consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferências de cookies');
    box.innerHTML = '<p>Uso cookies para medir de onde vêm as visitas e melhorar os anúncios. Você escolhe.</p>' +
      '<div class="consent-actions"><button type="button" class="consent-btn consent-no">Recusar</button>' +
      '<button type="button" class="consent-btn consent-yes">Aceitar</button></div>';
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('show'));
    const close = v => { store.set(v); box.classList.remove('show'); setTimeout(() => box.remove(), 400); if (v === 'granted') start(); };
    box.querySelector('.consent-yes').onclick = () => close('granted');
    box.querySelector('.consent-no').onclick = () => close('denied');
  }

  if (!enabled) return;
  // link no rodapé para mudar a escolha depois
  const foot = document.querySelector('footer .wrap');
  if (foot) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'consent-link'; b.textContent = 'Preferências de cookies';
    b.onclick = banner;
    foot.appendChild(b);
  }
  const choice = store.get();
  if (choice === 'granted') start();
  else if (choice !== 'denied') setTimeout(banner, 1200);
})();
