/* ==========================================================================
   九譽有限公司官網 — 前端互動
   純 vanilla JS，無任何外部依賴。所有功能在 JS 停用時皆有可用的降級行為。
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------------
     1. 手機版選單
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-nav]');
    if (!toggle || !nav) return;

    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 991 && nav.classList.contains('is-open')) setOpen(false);
    });

    // 手機版：點父項展開子選單（桌機為 hover，由 CSS 處理）
    $$('.nav__item').forEach(function (item) {
      var link = $('.nav__link', item);
      var dropdown = $('.dropdown', item);
      if (!link || !dropdown) return;
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;
        e.preventDefault();
        var expanded = item.classList.toggle('is-expanded');
        link.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    });
  }

  /* ---------------------------------------------------------------------
     2. 搜尋抽屜（提交後導向產品列表 ?q=）
     ------------------------------------------------------------------ */
  function initSearchPanel() {
    var btn = $('[data-search-toggle]');
    var panel = $('[data-search-panel]');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var input = $('input[type="search"]', panel);
        if (input) input.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     3. 產品列表：分類篩選 + 關鍵字搜尋
        - 卡片皆為靜態 HTML（SEO 友善），此處只做顯示／隱藏
        - 支援 ?cat=xxx 與 ?q=xxx 深層連結，並同步更新網址
     ------------------------------------------------------------------ */
  function initProductFilter() {
    var list = $('[data-product-list]');
    if (!list) return;

    var cards = $$('[data-product-card]', list);
    var chips = $$('[data-filter-cat]');
    var input = $('[data-filter-search]');
    var count = $('[data-result-count]');
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    var state = {
      cat: params.get('cat') || 'all',
      q: (params.get('q') || '').trim()
    };
    if (input && state.q) input.value = state.q;

    function normalize(s) { return (s || '').toLowerCase().replace(/\s+/g, ''); }

    function apply(pushUrl) {
      var q = normalize(state.q);
      var visible = 0;

      cards.forEach(function (card) {
        var matchCat = state.cat === 'all' || card.getAttribute('data-category') === state.cat;
        var matchQ = !q || normalize(card.getAttribute('data-search')).indexOf(q) > -1;
        var show = matchCat && matchQ;
        card.hidden = !show;
        if (show) visible++;
      });

      chips.forEach(function (chip) {
        var active = chip.getAttribute('data-filter-cat') === state.cat;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-current', active ? 'true' : 'false');
      });

      if (count) {
        var tpl = count.getAttribute('data-template') || '{n}';
        count.textContent = tpl.replace('{n}', String(visible));
      }
      if (empty) empty.hidden = visible !== 0;

      if (pushUrl && window.history && window.history.replaceState) {
        var next = new URLSearchParams();
        if (state.cat !== 'all') next.set('cat', state.cat);
        if (state.q) next.set('q', state.q);
        var qs = next.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        state.cat = chip.getAttribute('data-filter-cat');
        apply(true);
      });
    });

    if (input) {
      var timer = null;
      input.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = input.value.trim();
          apply(true);
        }, 160);
      });
      var form = input.closest('form');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    }

    apply(false);
  }

  /* ---------------------------------------------------------------------
     4. 下載中心篩選
     ------------------------------------------------------------------ */
  function initDownloadFilter() {
    var list = $('[data-download-list]');
    if (!list) return;

    var items = $$('[data-download-item]', list);
    var chips = $$('[data-filter-doc]');
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat') || 'all';

    function apply() {
      var visible = 0;
      items.forEach(function (item) {
        var show = cat === 'all' || item.getAttribute('data-category') === cat;
        item.hidden = !show;
        if (show) visible++;
      });
      chips.forEach(function (chip) {
        var active = chip.getAttribute('data-filter-doc') === cat;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-current', active ? 'true' : 'false');
      });
      if (empty) empty.hidden = visible !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        cat = chip.getAttribute('data-filter-doc');
        apply();
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + (cat === 'all' ? '' : '?cat=' + cat));
        }
      });
    });

    apply();
  }

  /* ---------------------------------------------------------------------
     5. 產品圖片切換
     ------------------------------------------------------------------ */
  function initGallery() {
    var gallery = $('[data-gallery]');
    if (!gallery) return;
    var main = $('[data-gallery-main]', gallery);
    var thumbs = $$('[data-gallery-thumb]', gallery);
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var img = $('img', thumb);
        if (!img) return;
        main.src = img.getAttribute('data-full') || img.src;
        main.alt = img.alt;
        thumbs.forEach(function (t) { t.classList.toggle('is-active', t === thumb); });
      });
    });
  }

  /* ---------------------------------------------------------------------
     6. 產品頁章節導覽：捲動高亮
     ------------------------------------------------------------------ */
  function initAnchorNav() {
    var nav = $('[data-anchor-nav]');
    if (!nav || !('IntersectionObserver' in window)) return;

    var links = $$('a[href^="#"]', nav);
    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) { map[id] = link; sections.push(section); }
    });
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var link = map[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------------------
     7. 詢價表單
        - 由 ?product= / ?model= 帶入產品（「詢問此產品」按鈕）
        - 前端驗證 + 送出
        - 未設定 FORM_ENDPOINT 時，改以預填的郵件方式送出（純靜態站降級）
     ------------------------------------------------------------------ */
  function initInquiryForm() {
    var form = $('[data-inquiry-form]');
    if (!form) return;

    var alertBox = $('[data-form-alert]', form.parentNode) || $('[data-form-alert]');
    var submitBtn = $('[type="submit"]', form);
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var mailto = form.getAttribute('data-mailto') || '';
    var i18n = {
      required: form.getAttribute('data-msg-required') || '此欄為必填',
      email: form.getAttribute('data-msg-email') || 'Email 格式不正確',
      sending: form.getAttribute('data-msg-sending') || '送出中…',
      ok: form.getAttribute('data-msg-ok') || '感謝您的詢問，我們將盡快與您聯絡。',
      err: form.getAttribute('data-msg-err') || '送出失敗，請稍後再試或直接來電聯絡。',
      mail: form.getAttribute('data-msg-mail') || '已為您開啟郵件軟體，請確認內容後寄出。'
    };
    var submitLabel = submitBtn ? submitBtn.textContent : '';

    // 7a. 帶入產品資訊
    var params = new URLSearchParams(window.location.search);
    var product = params.get('product');
    var model = params.get('model');
    var type = params.get('type');

    if (product) {
      var nameField = form.elements['product_name'];
      if (nameField) nameField.value = product;
    }
    if (model) {
      var modelField = form.elements['product_model'];
      if (modelField) modelField.value = model;
    }
    if (type) {
      var typeField = form.elements['product_type'];
      if (typeField) {
        var matched = Array.prototype.some.call(typeField.options, function (opt) {
          if (opt.value === type) { typeField.value = type; return true; }
          return false;
        });
        if (!matched) typeField.value = typeField.options[typeField.options.length - 1].value;
      }
    }
    if (product || model || type) {
      var anchor = $('#inquiry-form');
      if (anchor) {
        setTimeout(function () { anchor.scrollIntoView({ block: 'start' }); }, 60);
      }
    }

    // 7b. 驗證
    function setError(field, message) {
      var wrap = field.closest('.field');
      var slot = wrap ? $('.field__error', wrap) : null;
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (slot) slot.textContent = message || '';
    }

    function validate() {
      var firstBad = null;
      $$('input, select, textarea', form).forEach(function (field) {
        if (field.type === 'hidden' || field.name === '_gotcha') return;
        var value = (field.value || '').trim();
        var msg = '';
        if (field.required && !value) msg = i18n.required;
        else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) msg = i18n.email;
        setError(field, msg);
        if (msg && !firstBad) firstBad = field;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    $$('input, select, textarea', form).forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.getAttribute('aria-invalid') === 'true') validate();
      });
    });

    function showAlert(kind, message) {
      if (!alertBox) { window.alert(message); return; }
      alertBox.className = 'form-alert form-alert--' + kind;
      alertBox.textContent = message;
      alertBox.hidden = false;
      alertBox.setAttribute('role', kind === 'err' ? 'alert' : 'status');
      alertBox.scrollIntoView({ block: 'center' });
    }

    function buildMailBody(data) {
      var lines = [];
      $$('label', form).forEach(function (label) {
        var id = label.getAttribute('for');
        if (!id) return;
        var field = document.getElementById(id);
        if (!field || !field.name || !data[field.name]) return;
        lines.push(label.textContent.replace('*', '').trim() + '：' + data[field.name]);
      });
      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return; // 蜜罐
      if (!validate()) return;

      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (key !== '_gotcha') data[key] = value;
      });
      data.page_url = window.location.href;

      // 未設定後端端點 → 以郵件方式降級（純靜態網站）
      if (!endpoint) {
        var subject = '[網站詢價] ' + (data.company_name || '') + (data.product_name ? ' / ' + data.product_name : '');
        window.location.href = 'mailto:' + mailto +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(buildMailBody(data));
        showAlert('ok', i18n.mail);
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = i18n.sending; }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        showAlert('ok', i18n.ok);
      }).catch(function () {
        showAlert('err', i18n.err);
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
      });
    });
  }

  /* ---------------------------------------------------------------------
     8. 「詢問此產品」：帶入產品參數
     ------------------------------------------------------------------ */
  function initInquiryLinks() {
    $$('[data-inquiry-link]').forEach(function (link) {
      var base = link.getAttribute('href').split('?')[0];
      var params = new URLSearchParams();
      ['product', 'model', 'type'].forEach(function (key) {
        var value = link.getAttribute('data-' + key);
        if (value) params.set(key, value);
      });
      var qs = params.toString();
      link.setAttribute('href', base + (qs ? '?' + qs : '') + '#inquiry-form');
    });
  }

  /* ---------------------------------------------------------------------
     9. 捲動：進度條 + Header 陰影狀態
     ------------------------------------------------------------------ */
  function initScrollState() {
    var header = $('.site-header');
    var bar = $('[data-scroll-progress]');
    if (!header && !bar) return;

    var ticking = false;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (bar) bar.style.transform = 'scaleX(' + ratio + ')';
      if (header) header.classList.toggle('is-stuck', window.scrollY > 40);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------
     10. 捲動進場動畫
         隱藏樣式寫在 CSS 的 .js-motion 之下（class 由 <head> 的 script 掛上），
         所以 JS 失效時內容仍完整顯示。
     ------------------------------------------------------------------ */
  var REVEAL_SELECTOR = [
    '.sec-head', '.card', '.cat-card', '.feature', '.timeline__item',
    '.install-item', '.dl-card', '.split__media', '.split .prose',
    '.table-scroll', '.info-list', '.product-meta', '.hero__stat', '[data-gallery]'
  ].join(', ');

  var STAGGER_MS = 70;
  var STAGGER_MAX = 320;

  function initReveal() {
    var targets = $$(REVEAL_SELECTOR);
    if (!targets.length) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function showAll() { targets.forEach(function (el) { el.classList.add('is-in'); }); }

    if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }

    // 依同一父層分組，讓相鄰元素依序進場
    var order = new Map();
    var counts = new Map();
    targets.forEach(function (el) {
      var parent = el.parentElement;
      var index = counts.get(parent) || 0;
      order.set(el, index);
      counts.set(parent, index + 1);
    });

    var fired = false;
    var observer = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min((order.get(el) || 0) * STAGGER_MS, STAGGER_MAX) + 'ms';
        el.classList.add('is-in');
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) { observer.observe(el); });

    // 保險：觀察器完全沒觸發時，2 秒後強制顯示，避免內容看不到
    window.setTimeout(function () { if (!fired) showAll(); }, 2000);
  }

  /* ---------------------------------------------------------------------
     11. 回到頂部
     ------------------------------------------------------------------ */
  function initScrollTop() {
    var btn = $('[data-scroll-top]');
    if (!btn) return;

    var ticking = false;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 400);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    btn.addEventListener('click', function () {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ---------------------------------------------------------------------
     12. Footer 年份
     ------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ------------------------------------------------------------------ */
  function boot() {
    initMobileNav();
    initSearchPanel();
    initProductFilter();
    initDownloadFilter();
    initGallery();
    initAnchorNav();
    initInquiryLinks();
    initInquiryForm();
    initScrollState();
    initReveal();
    initScrollTop();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
