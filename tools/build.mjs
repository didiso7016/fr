#!/usr/bin/env node
/* ==========================================================================
   九譽有限公司官網 — 靜態網站產生器
   --------------------------------------------------------------------------
   用法： node tools/build.mjs
   輸入： tools/data/*.mjs
   輸出： 專案根目錄的純靜態 HTML（繁中）、/en（英文）、sitemap.xml、robots.txt
          以及 assets/img 內尚未存在的圖片佔位檔
   ========================================================================== */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteUrl, company, inquiry, categories, nav, footerLinks, ui, formText } from './data/site.mjs';
import { products } from './data/products.mjs';
import { hero, aboutBrief, milestones, values, quality, applications, extraDownloads } from './data/content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['zh', 'en'];
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/* ==========================================================================
   1. 工具函式
   ========================================================================== */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** 取欄位的語系值：pick(obj,'name','zh') → obj.nameZh ?? obj.zh ?? obj.name */
const pick = (obj, key, locale) => {
  const suffix = locale === 'zh' ? 'Zh' : 'En';
  if (obj == null) return '';
  if (obj[key + suffix] != null) return obj[key + suffix];
  if (obj[locale] != null) return obj[locale];
  return obj[key] ?? '';
};

const T = (locale) => ui[locale];

/**
 * 首頁 Hero 標題的逐字打字效果。
 * 完整文字直接寫在 HTML 裡（爬蟲與螢幕閱讀器看到的是完整標題），
 * 只用 CSS 依 --i 逐字揭露，不改變內容寬度，因此不會造成版面跳動。
 * 中文逐字、英文逐詞（逐字母會讓瀏覽器在單字中間換行）。
 */
function typewriter(lines) {
  const isCjk = lines.some((line) => /[\u3400-\u9fff\uf900-\ufaff]/.test(line));
  // 中文逐字（間隔短）／英文逐詞（間隔長），總長度都落在 1 秒左右
  const speed = isCjk ? '55ms' : '150ms';
  let index = 0;

  const html = lines.map((line) => {
    const tokens = isCjk ? Array.from(line) : line.split(/(\s+)/).filter(Boolean);
    return tokens
      .map((token) => (/^\s+$/.test(token) ? ' ' : `<span class="tw" style="--i:${index++}">${esc(token)}</span>`))
      .join('');
  }).join('<br>');

  return `<h1 style="--tw-speed:${speed}">${html}<span class="tw-cursor" aria-hidden="true" style="--i:${index}"></span></h1>`;
}

/** 站內絕對路徑（含語言前綴） */
function rootPath(locale, href) {
  const base = locale === 'zh' ? '' : '/en';
  if (!href || href === '/') return base + '/';
  return base + href;
}

/** 由頁面所在目錄換算成相對連結，讓 file:// 直接開啟也能正常運作 */
function rel(fromDir, target) {
  const hashIndex = target.indexOf('#');
  const hash = hashIndex > -1 ? target.slice(hashIndex) : '';
  let pathPart = hashIndex > -1 ? target.slice(0, hashIndex) : target;

  const queryIndex = pathPart.indexOf('?');
  const query = queryIndex > -1 ? pathPart.slice(queryIndex) : '';
  if (queryIndex > -1) pathPart = pathPart.slice(0, queryIndex);

  if (pathPart.endsWith('/')) pathPart += 'index.html';

  const fromSegs = fromDir ? fromDir.split('/') : [];
  const toSegs = pathPart.replace(/^\//, '').split('/');

  let i = 0;
  while (i < fromSegs.length && i < toSegs.length - 1 && fromSegs[i] === toSegs[i]) i++;
  const out = fromSegs.slice(i).map(() => '..').concat(toSegs.slice(i)).join('/');
  return (out || 'index.html') + query + hash;
}

/** 資源（CSS / JS / 圖片）相對路徑 */
const asset = (fromDir, p) => rel(fromDir, '/' + String(p).replace(/^\//, ''));

/** 頁面連結：本語系內的站內連結 */
const href = (locale, fromDir, target) => rel(fromDir, rootPath(locale, target));

const activeProducts = products
  .filter((p) => p.status !== 'inactive')
  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
const productBySlug = Object.fromEntries(activeProducts.map((p) => [p.slug, p]));
const usedCategories = categories.filter((c) => activeProducts.some((p) => p.category === c.slug));

/* ==========================================================================
   2. 圖示（inline SVG，避免額外請求）
   ========================================================================== */
const icons = {
  logo: `<svg class="brand__mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <rect width="48" height="48" rx="8" fill="#07331f"/>
    <path d="M24 10c4.6 5.4 7.4 9.6 7.4 13.4A7.4 7.4 0 0 1 24 30.8a7.4 7.4 0 0 1-7.4-7.4C16.6 19.6 19.4 15.4 24 10Z" fill="#00a54e"/>
    <circle cx="15" cy="35" r="2.6" fill="#6fd79b"/>
    <circle cx="24" cy="37" r="3.2" fill="#a5e8c2"/>
    <circle cx="33" cy="35" r="2.6" fill="#6fd79b"/>
  </svg>`,
  caret: `<svg class="nav__caret" viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 8.5 1.5 4h9z"/></svg>`,
  arrow: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M9 3l5 5-5 5-1.1-1.1L11 9H2V7h9L7.9 4.1z"/></svg>`,
  search: `<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M8.5 2a6.5 6.5 0 0 1 5.2 10.4l4.1 4.1-1.4 1.4-4.1-4.1A6.5 6.5 0 1 1 8.5 2Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>`,
  arrowUp: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 2.6l5.7 5.7-1.4 1.4L9 6.4V14H7V6.4L3.7 9.7 2.3 8.3z"/></svg>`,
  menu: `<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M2 4h16v2H2V4Zm0 5h16v2H2V9Zm0 5h16v2H2v-2Z"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2.5L17.5 8H14V4.5ZM8 13h1.8a1.7 1.7 0 0 1 0 3.4H9V18H8v-5Zm1 1v1.4h.8a.7.7 0 0 0 0-1.4H9Zm3.4-1h1.4c1.3 0 2.1.9 2.1 2.5S15.1 18 13.8 18h-1.4v-5Zm1 1v3h.4c.7 0 1.1-.5 1.1-1.5s-.4-1.5-1.1-1.5h-.4Z"/></svg>`,
  download: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2h2v5.6l2.3-2.3 1.4 1.4L8 11.4 3.3 6.7l1.4-1.4L7 7.6V2ZM3 12h10v2H3v-2Z"/></svg>`,
  bubbles: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="30" r="5"/><circle cx="29" cy="22" r="7"/><circle cx="37" cy="34" r="4"/><path d="M4 42h40"/></svg>`,
  propeller: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="4"/><path d="M24 20c-2-7 1-12 6-12s5 7-2 10M28 26c6 4 7 9 3 12s-8-2-6-9M20 26c-4 6-9 6-11 1s4-7 9-5"/></svg>`,
  blower: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="24" r="12"/><circle cx="20" cy="24" r="3"/><path d="M32 18h12v12H32M20 12v4M20 32v4"/></svg>`,
  filter: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10h36l-13 15v13l-10 4V25z"/><path d="M14 40h20"/></svg>`,
  valve: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 28h12m16 0h12"/><circle cx="24" cy="28" r="8"/><path d="M24 20V8m-6 0h12"/></svg>`,
};

/* ==========================================================================
   3. 共用區塊
   ========================================================================== */
function navItems(locale) {
  return nav.map((item) => {
    if (!item.childrenFromCategories) return item;
    return {
      ...item,
      children: [
        { zh: '全部產品', en: 'All products', href: '/products/' },
        ...usedCategories.map((c) => ({
          zh: c.zh, en: c.en, href: `/products/?cat=${c.slug}`,
          subZh: c.en, subEn: c.zh,
        })),
      ],
    };
  });
}

function renderHeader({ locale, dir, current }) {
  const t = T(locale);
  const other = locale === 'zh' ? 'en' : 'zh';
  const items = navItems(locale).map((item) => {
    const isCurrent = current === item.href ||
      (item.href === '/products/' && current.startsWith('/products/'));
    const link = `<a class="nav__link" href="${esc(href(locale, dir, item.href))}"${isCurrent ? ' aria-current="page"' : ''}${item.children ? ' aria-expanded="false"' : ''}>${esc(pick(item, 'name', locale))}${item.children ? icons.caret : ''}</a>`;
    if (!item.children) return `<li class="nav__item">${link}</li>`;
    const sub = item.children.map((child) => {
      const note = pick(child, 'sub', locale);
      return `<li><a href="${esc(href(locale, dir, child.href))}">${esc(pick(child, 'name', locale))}${note ? `<small>${esc(note)}</small>` : ''}</a></li>`;
    }).join('\n            ');
    return `<li class="nav__item">${link}
          <ul class="dropdown">
            ${sub}
          </ul>
        </li>`;
  }).join('\n        ');

  // 語言切換：停在同一頁
  const selfPath = current === '/' ? '/' : current;
  const zhHref = rel(dir, rootPath('zh', selfPath));
  const enHref = rel(dir, rootPath('en', selfPath));

  return `<header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${esc(href(locale, dir, '/'))}">
        ${icons.logo}
        <span class="brand__text">
          <span class="brand__zh">${esc(company.nameZh)}</span>
          <span class="brand__en">${esc(company.nameEn)}</span>
        </span>
      </a>

      <nav class="nav" id="site-nav" data-nav aria-label="${esc(t.menu)}">
        <ul class="nav__list">
        ${items}
        </ul>
      </nav>

      <div class="header-tools">
        <button class="icon-btn" type="button" data-search-toggle aria-expanded="false" aria-controls="site-search" aria-label="${esc(t.search)}">${icons.search}</button>
        <div class="lang-switch">
          <a href="${esc(zhHref)}" hreflang="zh-Hant"${locale === 'zh' ? ' aria-current="true"' : ''}>繁中</a>
          <a href="${esc(enHref)}" hreflang="en"${locale === 'en' ? ' aria-current="true"' : ''}>EN</a>
        </div>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav" aria-label="${esc(t.openMenu)}">${icons.menu}</button>
      </div>
    </div>

    <div class="search-panel" id="site-search" data-search-panel>
      <div class="wrap">
        <form class="search-form" action="${esc(href(locale, dir, '/products/'))}" method="get" role="search">
          <label class="sr-only" for="q">${esc(t.searchProducts)}</label>
          <input type="search" id="q" name="q" placeholder="${esc(t.searchPlaceholder)}" autocomplete="off">
          <button class="btn btn--primary" type="submit">${esc(t.search)}</button>
        </form>
      </div>
    </div>

    <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>
  </header>`;
}

function renderFooter({ locale, dir }) {
  const t = T(locale);
  const links = footerLinks.map((l) =>
    `<li><a href="${esc(href(locale, dir, l.href))}">${esc(pick(l, 'name', locale))}</a></li>`).join('\n            ');
  const address = locale === 'zh' ? company.addressZh : company.addressEn;

  return `<footer class="site-footer">
    <div class="wrap footer-main">
      <div class="footer-brand">
        <div class="footer-brand__zh">${esc(company.nameZh)}</div>
        <div class="footer-brand__en">${esc(company.nameEn)}</div>
        <p>${locale === 'zh'
    ? '自 1996 年起專注污水處理、曝氣、攪拌與鼓風設備，提供設備供應與選型支援。'
    : 'Focused on wastewater treatment, aeration, mixing and blower equipment since 1996.'}</p>
      </div>

      <div class="footer-col">
        <h3>${esc(t.quickLinks)}</h3>
        <ul>
            ${links}
        </ul>
      </div>

      <div class="footer-col footer-contact">
        <h3>${esc(t.contactInfo)}</h3>
        <dl>
          <div class="row"><dt>${esc(t.addressLabel)}</dt><dd>${esc(company.zip)}<br>${esc(address)}</dd></div>
          <div class="row"><dt>TEL</dt><dd><a href="tel:${esc(company.telHref)}">${esc(company.tel)}</a></dd></div>
          <div class="row"><dt>FAX</dt><dd>${esc(company.fax)}</dd></div>
          <div class="row"><dt>Email</dt><dd><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></dd></div>
        </dl>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>&copy; <span data-year>${new Date().getFullYear()}</span> ${esc(company.nameEn)} ${esc(t.copyright)}</span>
      <span>${esc(t.taxIdLabel)} ${esc(company.taxId)}</span>
    </div>
  </footer>`;
}

function renderCta({ locale, dir }) {
  const titleZh = '正在尋找適合的水處理設備？';
  const titleEn = 'Looking for the right water treatment equipment?';
  const leadZh = '請告訴我們現場條件與處理需求，九譽協助您評估合適的設備配置。';
  const leadEn = 'Tell us your site conditions and treatment requirements — we will help evaluate a suitable configuration.';
  const t = T(locale);
  return `<section class="cta-band">
    <div class="wrap cta-band__inner">
      <div>
        <h2>${esc(locale === 'zh' ? titleZh : titleEn)}</h2>
        <p>${esc(locale === 'zh' ? leadZh : leadEn)}</p>
      </div>
      <div class="btn-row">
        <a class="btn btn--primary" href="${esc(href(locale, dir, '/contact.html'))}#inquiry-form">${esc(locale === 'zh' ? '送出詢價' : 'Send enquiry')}</a>
        <a class="btn btn--ghost-light" href="tel:${esc(company.telHref)}">${esc(company.tel)}</a>
      </div>
    </div>
  </section>`;
}

/* --- 卡片 --------------------------------------------------------------- */
function productCard({ locale, dir, product, withData = false }) {
  const t = T(locale);
  const cat = categoryBySlug[product.category];
  const name = pick(product, 'name', locale);
  const short = pick(product, 'short', locale);
  const url = href(locale, dir, `/products/${product.slug}.html`);
  const searchIndex = [
    product.nameZh, product.nameEn, product.brand, product.model,
    ...(product.models || []),
    ...(product.specTable ? product.specTable.rows.map((r) => r[0]) : []),
    product.shortZh, product.shortEn, cat?.zh, cat?.en, product.slug,
  ].filter(Boolean).join(' ');

  const dataAttrs = withData
    ? ` data-product-card data-category="${esc(product.category)}" data-search="${esc(searchIndex)}"`
    : '';
  const models = (product.models || []).slice(0, 3)
    .map((m) => `<span class="badge">${esc(m)}</span>`).join('');

  return `<article class="card"${dataAttrs}>
        <a class="card__media" href="${esc(url)}" aria-hidden="true" tabindex="-1">
          <img src="${esc(asset(dir, product.cover))}" alt="" width="640" height="480" loading="lazy" decoding="async">
          ${cat ? `<span class="card__tag">${esc(pick(cat, 'name', locale))}</span>` : ''}
        </a>
        <div class="card__body">
          <h3 class="card__title"><a href="${esc(url)}">${esc(name)}</a></h3>
          <p class="card__title-en">${esc(locale === 'zh' ? product.nameEn : product.nameZh)}</p>
          <p class="card__desc">${esc(short)}</p>
          ${models ? `<div class="card__models">${models}</div>` : ''}
          <div class="card__foot">
            <a class="link-arrow" href="${esc(url)}">${esc(t.viewProduct)} ${icons.arrow}</a>
          </div>
        </div>
      </article>`;
}

function categoryCard({ locale, dir, category }) {
  const t = T(locale);
  const count = activeProducts.filter((p) => p.category === category.slug).length;
  const url = count
    ? href(locale, dir, `/products/?cat=${category.slug}`)
    : href(locale, dir, '/contact.html#inquiry-form');
  return `<a class="cat-card" href="${esc(url)}">
        <span class="cat-card__icon">${icons[category.icon] || icons.valve}</span>
        <div>
          <h3>${esc(pick(category, 'name', locale))}</h3>
          <p class="cat-card__en">${esc(locale === 'zh' ? category.en : category.zh)}</p>
        </div>
        <p>${esc(pick(category, 'desc', locale))}</p>
        <span class="link-arrow">${esc(count ? t.viewProducts : t.contactUs)} ${icons.arrow}</span>
      </a>`;
}

function downloadCard({ locale, dir, file }) {
  const t = T(locale);
  const title = pick(file, 'title', locale);
  const metas = [
    file.productName ? `<span>${esc(t.category)}：${esc(file.productName)}</span>` : '',
    `<span>${esc(t.fileLanguage)}：${esc(t.langNames[file.language] || file.language)}</span>`,
    file.version ? `<span>${esc(t.fileVersion)}：${esc(file.version)}</span>` : '',
    file.size ? `<span>${esc(t.fileSize)}：${esc(file.size)}</span>` : '',
    file.date ? `<span>${esc(t.filePublish)}：${esc(file.date)}</span>` : '',
  ].filter(Boolean).join('\n            ');

  const button = file.available
    ? `<a class="btn btn--outline btn--sm" href="${esc(asset(dir, file.path))}" download>${icons.download} PDF ${esc(locale === 'zh' ? '下載' : 'download')}</a>`
    : `<a class="btn btn--outline btn--sm" href="${esc(href(locale, dir, '/contact.html'))}#inquiry-form">${esc(t.pdfPending)}</a>`;

  return `<article class="dl-card" data-download-item data-category="${esc(file.category)}">
        <span class="dl-card__icon">${icons.pdf}</span>
        <div class="dl-card__body">
          <h3 class="dl-card__title">${esc(title)}</h3>
          <div class="dl-card__metas">
            ${metas}
          </div>
          <div class="dl-card__foot">${button}</div>
        </div>
      </article>`;
}

/* --- 詢價表單 ----------------------------------------------------------- */
function inquiryForm({ locale, dir }) {
  const f = formText[locale];
  const types = f.types.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('\n              ');
  const field = (name, label, { type = 'text', required = false, full = false, autocomplete = '' } = {}) => `
          <div class="field${full ? ' field--full' : ''}">
            <label for="f-${name}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
            <input type="${type}" id="f-${name}" name="${name}"${required ? ' required' : ''}${autocomplete ? ` autocomplete="${autocomplete}"` : ''}>
            <p class="field__error" data-error></p>
          </div>`;

  return `<div class="form-alert" data-form-alert hidden></div>
      <form class="inquiry-form" data-inquiry-form novalidate
        data-endpoint="${esc(inquiry.endpoint)}"
        data-mailto="${esc(inquiry.mailto)}"
        data-msg-required="${esc(f.required)}"
        data-msg-email="${esc(f.invalidEmail)}"
        data-msg-sending="${esc(f.sending)}"
        data-msg-ok="${esc(f.success)}"
        data-msg-err="${esc(f.error)}"
        data-msg-mail="${esc(f.mailFallback)}">
        <div class="form-grid">
          ${field('company_name', f.companyName, { required: true, autocomplete: 'organization' })}
          ${field('contact_name', f.contactName, { required: true, autocomplete: 'name' })}
          ${field('email', f.email, { type: 'email', required: true, autocomplete: 'email' })}
          ${field('phone', f.phone, { type: 'tel', autocomplete: 'tel' })}
          ${field('country', f.country, { autocomplete: 'country-name' })}
          <div class="field">
            <label for="f-product_type">${esc(f.productType)}</label>
            <select id="f-product_type" name="product_type">
              <option value="">${esc(f.selectPlaceholder)}</option>
              ${types}
            </select>
            <p class="field__error" data-error></p>
          </div>
          ${field('product_name', f.productName)}
          ${field('product_model', f.productModel)}
          ${field('quantity', f.quantity)}
          <div class="field field--full">
            <label for="f-message">${esc(f.message)} <span class="req" aria-hidden="true">*</span></label>
            <textarea id="f-message" name="message" required></textarea>
            <p class="field__error" data-error></p>
          </div>
          <div class="field field--full">
            <label for="f-attachment">${esc(f.attachment)}</label>
            <input type="file" id="f-attachment" name="attachment" accept=".pdf,.jpg,.jpeg,.png">
            <p class="field__hint">${esc(f.attachmentHint)}</p>
          </div>
        </div>

        <div class="honeypot" aria-hidden="true">
          <label for="f-gotcha">Leave this field empty</label>
          <input type="text" id="f-gotcha" name="_gotcha" tabindex="-1" autocomplete="off">
        </div>

        <div class="form-actions">
          <button class="btn btn--primary" type="submit">${esc(f.submit)}</button>
          <span class="form-note">${esc(f.privacy)}</span>
        </div>
      </form>`;
}

/* ==========================================================================
   4. 頁面外殼（head / JSON-LD / hreflang）
   ========================================================================== */
function organizationJsonLd(locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: locale === 'zh' ? company.nameZh : company.nameEn,
    alternateName: locale === 'zh' ? company.nameEn : company.nameZh,
    url: siteUrl + rootPath(locale, '/'),
    logo: siteUrl + '/assets/img/logo.svg',
    foundingDate: String(company.since),
    taxID: company.taxId,
    email: company.email,
    telephone: company.telHref,
    faxNumber: company.fax,
    address: {
      '@type': 'PostalAddress',
      streetAddress: locale === 'zh' ? company.addressZh : company.addressEn,
      postalCode: company.zip,
      addressCountry: 'TW',
    },
  };
}

function page({ locale, dir, file, current, title, description, bodyClass = '', main, jsonLd = [], ogImage = 'assets/img/og-default.svg' }) {
  const t = T(locale);
  const canonical = siteUrl + rootPath(locale, current);
  const altZh = siteUrl + rootPath('zh', current);
  const altEn = siteUrl + rootPath('en', current);
  const fullTitle = `${title} | ${locale === 'zh' ? company.nameZh : company.nameEn}`;
  const blocks = jsonLd.map((data) =>
    `<script type="application/ld+json">${JSON.stringify(data)}</script>`).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="alternate" hreflang="zh-Hant" href="${esc(altZh)}">
<link rel="alternate" hreflang="en" href="${esc(altEn)}">
<link rel="alternate" hreflang="x-default" href="${esc(altZh)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(locale === 'zh' ? company.nameZh : company.nameEn)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(siteUrl + '/' + String(ogImage).replace(/^\//, ''))}">
<meta property="og:locale" content="${locale === 'zh' ? 'zh_TW' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#07331f">
<link rel="icon" type="image/svg+xml" href="${esc(asset(dir, 'assets/img/favicon.svg'))}">
<link rel="stylesheet" href="${esc(asset(dir, 'assets/css/style.css'))}">
<script>document.documentElement.classList.add('js-motion')</script>
${blocks ? '  ' + blocks : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip-link" href="#main">${esc(t.skipToContent)}</a>
${renderHeader({ locale, dir, current })}

<main id="main">
${main}
</main>

<button class="scroll-top-btn" type="button" data-scroll-top aria-label="${esc(locale === 'zh' ? '回到頁面頂端' : 'Back to top')}">${icons.arrowUp}</button>

${renderFooter({ locale, dir })}
<script src="${esc(asset(dir, 'assets/js/main.js'))}" defer></script>
</body>
</html>
`;
}

function pageHead({ locale, dir, current, titleZh, titleEn, enSubZh, enSubEn, leadZh, leadEn, crumbs = [], crumbOnly = false }) {
  const t = T(locale);
  const trail = [{ label: t.home, href: '/' }, ...crumbs];
  const items = trail.map((c, i) => {
    const last = i === trail.length - 1;
    const label = esc(c.label);
    return last
      ? `<span aria-current="page">${label}</span>`
      : `<a href="${esc(href(locale, dir, c.href))}">${label}</a><span class="crumb__sep">/</span>`;
  }).join('\n        ');

  const lead = locale === 'zh' ? leadZh : leadEn;
  const sub = locale === 'zh' ? enSubZh : enSubEn;
  const crumbNav = `<nav class="crumb" aria-label="${esc(locale === 'zh' ? '麵包屑' : 'Breadcrumb')}">
        ${items}
        </nav>`;

  // 產品詳細頁的 h1 位於 product hero，此處只輸出麵包屑，避免一頁兩個 h1
  if (crumbOnly) {
    return `<section class="page-head page-head--slim">
      <div class="wrap">
        ${crumbNav}
      </div>
    </section>`;
  }

  return `<section class="page-head">
      <div class="wrap">
        ${crumbNav}
        <h1>${esc(locale === 'zh' ? titleZh : titleEn)}</h1>
        ${sub ? `<p class="page-head__en">${esc(sub)}</p>` : ''}
        ${lead ? `<p>${esc(lead)}</p>` : ''}
      </div>
    </section>`;
}

function breadcrumbJsonLd(locale, crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: siteUrl + rootPath(locale, c.href),
    })),
  };
}

/* ==========================================================================
   5. 各頁面
   ========================================================================== */

/* --- 首頁 --------------------------------------------------------------- */
function buildHome(locale) {
  const dir = locale === 'zh' ? '' : 'en';
  const t = T(locale);
  const isZh = locale === 'zh';

  const heroTitle = typewriter(isZh ? hero.titleZh : hero.titleEn);
  const stats = hero.stats.map((s) => `<div class="hero__stat">
          <dt>${esc(pick(s, 'label', locale))}</dt>
          <dd>${esc(pick(s, 'value', locale))}</dd>
        </div>`).join('\n        ');

  const cats = categories.map((c) => categoryCard({ locale, dir, category: c })).join('\n      ');
  const featured = activeProducts.filter((p) => p.featured)
    .map((p) => productCard({ locale, dir, product: p })).join('\n      ');
  const valueCards = values.map((v, i) => `<div class="feature">
        <span class="feature__num">0${i + 1}</span>
        <h3>${esc(pick(v, 'title', locale))}</h3>
        <p>${esc(pick(v, 'body', locale))}</p>
      </div>`).join('\n      ');
  const apps = applications.map((a) => `<a class="card" href="${esc(href(locale, dir, `/applications.html#${a.slug}`))}">
        <span class="card__media">
          <img src="${esc(asset(dir, a.image))}" alt="" width="640" height="480" loading="lazy" decoding="async">
        </span>
        <span class="card__body">
          <span class="card__title">${esc(pick(a, 'name', locale))}</span>
          <span class="card__title-en">${esc(isZh ? a.nameEn : a.nameZh)}</span>
          <span class="card__desc">${esc(pick(a, 'summary', locale))}</span>
          <span class="card__foot"><span class="link-arrow">${esc(t.learnMore)} ${icons.arrow}</span></span>
        </span>
      </a>`).join('\n      ');

  const aboutBody = (isZh ? aboutBrief.bodyZh : aboutBrief.bodyEn)
    .map((p) => `<p>${esc(p)}</p>`).join('\n          ');

  const main = `  <section class="hero">
    <div class="hero__media">
      <img src="${esc(asset(dir, hero.image))}" alt="${esc(pick(hero, 'alt', locale))}" width="1600" height="900" fetchpriority="high" decoding="async">
    </div>
    <div class="wrap hero__inner">
      <span class="hero__badge">${esc(pick(hero, 'badge', locale))}</span>
      ${heroTitle}
      <p class="hero__sub-en">${esc(pick(hero, 'subEn', locale))}</p>
      <p class="hero__lead">${esc(pick(hero, 'lead', locale))}</p>
      <div class="btn-row">
        <a class="btn btn--primary" href="${esc(href(locale, dir, '/products/'))}">${esc(t.viewProducts)}</a>
        <a class="btn btn--ghost-light" href="${esc(href(locale, dir, '/contact.html'))}">${esc(t.contactUs)}</a>
      </div>
    </div>
    <div class="wrap">
      <dl class="hero__stats">
        ${stats}
      </dl>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Products</span>
        <h2>${esc(isZh ? '核心產品分類' : 'Product Categories')}</h2>
        <p>${esc(isZh
    ? '涵蓋污水處理流程中的曝氣、攪拌、鼓風與污泥處理設備，可依現場條件選型。'
    : 'Aeration, mixing, blower and sludge equipment across the wastewater treatment process, selected to suit site conditions.')}</p>
      </div>
      <div class="grid grid--3">
      ${cats}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="wrap split">
      <div class="prose">
        <span class="eyebrow">About</span>
        <h2>${esc(isZh ? '關於九譽' : 'About Fine Reputation')}</h2>
          ${aboutBody}
        <p><a class="btn btn--outline" href="${esc(href(locale, dir, '/about.html'))}">${esc(t.learnMore)}</a></p>
      </div>
      <div class="split__media">
        <img src="${esc(asset(dir, aboutBrief.image))}" alt="${esc(pick(aboutBrief, 'alt', locale))}" width="800" height="600" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Featured</span>
        <h2>${esc(isZh ? '產品精選' : 'Featured Products')}</h2>
      </div>
      <div class="grid grid--3">
      ${featured}
      </div>
      <p style="margin-top:28px"><a class="link-arrow" href="${esc(href(locale, dir, '/products/'))}">${esc(isZh ? '瀏覽所有產品' : 'Browse all products')} ${icons.arrow}</a></p>
    </div>
  </section>

  <section class="section section--deep">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Why Fine Reputation</span>
        <h2>${esc(isZh ? '為什麼選擇九譽' : 'Why choose Fine Reputation')}</h2>
      </div>
      <div class="grid grid--4">
      ${valueCards}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Applications</span>
        <h2>${esc(isZh ? '應用領域' : 'Applications')}</h2>
        <p>${esc(isZh ? '從使用需求出發，找到適合的設備組合。' : 'Start from the duty you need, and find the matching equipment.')}</p>
      </div>
      <div class="grid grid--4">
      ${apps}
      </div>
    </div>
  </section>

  <section class="section section--gray">
    <div class="wrap split">
      <div>
        <span class="eyebrow">Downloads</span>
        <h2>${esc(isZh ? '技術資料與型錄下載' : 'Technical Data & Catalogues')}</h2>
        <p style="margin-top:14px">${esc(isZh
    ? '產品型錄與規格表集中於技術資料頁，可依設備分類查找；若需要的文件尚未上線，歡迎來信索取。'
    : 'Catalogues and specification sheets are collected on the downloads page by equipment category. If the document you need is not listed yet, please contact us.')}</p>
        <div class="btn-row" style="margin-top:24px">
          <a class="btn btn--deep" href="${esc(href(locale, dir, '/downloads.html'))}">${esc(isZh ? '前往技術資料' : 'Go to downloads')}</a>
        </div>
      </div>
      <div class="split__media">
        <img src="${esc(asset(dir, 'assets/img/downloads.svg'))}" alt="" width="800" height="600" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

${renderCta({ locale, dir })}`;

  return {
    file: locale === 'zh' ? 'index.html' : 'en/index.html',
    html: page({
      locale, dir, current: '/',
      title: isZh ? '污水處理設備 | 曝氣散氣盤、沉水攪拌機、鼓風機' : 'Wastewater Treatment Equipment | Diffusers, Mixers, Blowers',
      description: pick(hero, 'lead', locale),
      main,
      jsonLd: [organizationJsonLd(locale), {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: isZh ? company.nameZh : company.nameEn,
        url: siteUrl + rootPath(locale, '/'),
        inLanguage: t.htmlLang,
      }],
    }),
  };
}

/* --- 公司介紹 ----------------------------------------------------------- */
function buildAbout(locale) {
  const dir = locale === 'zh' ? '' : 'en';
  const isZh = locale === 'zh';
  const crumbs = [{ label: isZh ? '關於九譽' : 'About', href: '/about.html' }];

  const profile = (isZh ? aboutBrief.bodyZh : aboutBrief.bodyEn).map((p) => `<p>${esc(p)}</p>`).join('\n          ');
  const timeline = milestones.map((m) => {
    const list = (isZh ? m.listZh : m.listEn) || [];
    return `<div class="timeline__item">
          <div class="timeline__year">${esc(isZh ? m.year : (m.yearEn || m.year))}</div>
          <h3>${esc(pick(m, 'title', locale))}</h3>
          <p>${esc(pick(m, 'body', locale))}</p>
          ${list.length ? `<ul>${list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
        </div>`;
  }).join('\n        ');

  const valueCards = values.map((v, i) => `<div class="feature">
          <span class="feature__num">0${i + 1}</span>
          <h3>${esc(pick(v, 'title', locale))}</h3>
          <p>${esc(pick(v, 'body', locale))}</p>
        </div>`).join('\n        ');

  const qualityBody = (isZh ? quality.bodyZh : quality.bodyEn).map((p) => `<p>${esc(p)}</p>`).join('\n          ');

  const main = `${pageHead({
    locale, dir, current: '/about.html', crumbs,
    titleZh: '關於九譽', titleEn: 'About Fine Reputation',
    enSubZh: 'About Fine Reputation Co., Ltd.', enSubEn: '關於九譽有限公司',
    leadZh: '創立於 1996 年的台灣污水處理設備供應商，從設備代理到自有產品研發，累積多年實務經驗。',
    leadEn: 'A Taiwanese wastewater treatment equipment supplier founded in 1996 — from equipment distribution to in-house product development.',
  })}

  <section class="section" id="profile">
    <div class="wrap split">
      <div class="prose">
        <span class="eyebrow">Company Profile</span>
        <h2>${esc(isZh ? '公司介紹' : 'Company Profile')}</h2>
          ${profile}
      </div>
      <div class="split__media">
        <img src="${esc(asset(dir, aboutBrief.image))}" alt="${esc(pick(aboutBrief, 'alt', locale))}" width="800" height="600" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

  <section class="section section--tint" id="history">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Milestones</span>
        <h2>${esc(isZh ? '發展歷程' : 'Milestones')}</h2>
      </div>
      <div class="timeline">
        ${timeline}
      </div>
    </div>
  </section>

  <section class="section" id="strengths">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Our Strengths</span>
        <h2>${esc(isZh ? '公司優勢' : 'Our Strengths')}</h2>
      </div>
      <div class="grid grid--4">
        ${valueCards}
      </div>
    </div>
  </section>

  <section class="section section--gray" id="quality">
    <div class="wrap split">
      <div class="prose">
        <span class="eyebrow">Quality Philosophy</span>
        <h2>${esc(isZh ? '品質理念' : 'Quality Philosophy')}</h2>
          ${qualityBody}
      </div>
      <div class="split__media">
        <img src="${esc(asset(dir, 'assets/img/quality.svg'))}" alt="" width="800" height="600" loading="lazy" decoding="async">
      </div>
    </div>
  </section>

${renderCta({ locale, dir })}`;

  return {
    file: locale === 'zh' ? 'about.html' : 'en/about.html',
    html: page({
      locale, dir, current: '/about.html',
      title: isZh ? '關於九譽｜公司介紹與發展歷程' : 'About Fine Reputation | Company Profile',
      description: isZh
        ? '九譽有限公司創立於 1996 年，為台灣污水處理設備供應商，2004 年起投入散氣盤研發生產，產品出口東南亞市場。'
        : 'Fine Reputation Co., Ltd. was founded in 1996 as a Taiwanese wastewater treatment equipment supplier, developing disc diffusers in-house since 2004 and exporting to Southeast Asia.',
      main,
      jsonLd: [breadcrumbJsonLd(locale, [{ label: T(locale).home, href: '/' }, ...crumbs]), organizationJsonLd(locale)],
    }),
  };
}

/* --- 產品列表 ----------------------------------------------------------- */
function buildProductList(locale) {
  const dir = locale === 'zh' ? 'products' : 'en/products';
  const t = T(locale);
  const isZh = locale === 'zh';
  const crumbs = [{ label: isZh ? '產品中心' : 'Products', href: '/products/' }];

  const chips = [{ slug: 'all', label: t.all }, ...usedCategories.map((c) => ({ slug: c.slug, label: pick(c, 'name', locale) }))]
    .map((c) => `<a class="chip${c.slug === 'all' ? ' is-active' : ''}" href="${esc(c.slug === 'all' ? href(locale, dir, '/products/') : href(locale, dir, `/products/?cat=${c.slug}`))}" data-filter-cat="${esc(c.slug)}">${esc(c.label)}</a>`)
    .join('\n          ');

  const cards = activeProducts
    .map((p) => productCard({ locale, dir, product: p, withData: true })).join('\n      ');

  const main = `${pageHead({
    locale, dir, current: '/products/', crumbs,
    titleZh: '產品中心', titleEn: 'Products',
    enSubZh: 'Wastewater Treatment Equipment', enSubEn: '污水處理設備',
    leadZh: '曝氣、攪拌、鼓風與污泥處理設備。可使用分類或關鍵字（如 PJM、散氣）快速查找。',
    leadEn: 'Aeration, mixing, blower and sludge treatment equipment. Filter by category or search by keyword (e.g. PJM, diffuser).',
  })}

  <section class="section">
    <div class="wrap">
      <div class="toolbar">
        <div class="chips">
          ${chips}
        </div>
        <form class="filter-search" role="search" onsubmit="return false">
          <label class="sr-only" for="product-search">${esc(t.searchProducts)}</label>
          ${icons.search}
          <input type="search" id="product-search" name="q" placeholder="${esc(t.searchPlaceholder)}" data-filter-search autocomplete="off">
        </form>
      </div>

      <p class="result-count" data-result-count data-template="${esc(t.resultCount)}" role="status">${esc(t.resultCount.replace('{n}', String(activeProducts.length)))}</p>

      <div class="grid grid--3" data-product-list>
      ${cards}
      </div>

      <div class="empty-state" data-empty-state hidden>${esc(t.noResult)}</div>
    </div>
  </section>

${renderCta({ locale, dir })}`;

  return {
    file: locale === 'zh' ? 'products/index.html' : 'en/products/index.html',
    html: page({
      locale, dir, current: '/products/',
      title: isZh ? '產品中心｜曝氣、攪拌、鼓風與污泥處理設備' : 'Products | Aeration, Mixing, Blower & Sludge Equipment',
      description: isZh
        ? '九譽產品中心：細氣泡散氣盤、沉水攪拌機（PJ / PJM 系列）、Hoffman & Lamson 離心式鼓風機、污泥脫水設備。支援分類篩選與型號搜尋。'
        : 'Fine Reputation products: fine bubble disc diffusers, PJ / PJM submersible mixers, Hoffman & Lamson centrifugal blowers and sludge dewatering equipment.',
      main,
      jsonLd: [
        breadcrumbJsonLd(locale, [{ label: t.home, href: '/' }, ...crumbs]),
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: activeProducts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: pick(p, 'name', locale),
            url: siteUrl + rootPath(locale, `/products/${p.slug}.html`),
          })),
        },
      ],
    }),
  };
}

/* --- 產品詳細頁 --------------------------------------------------------- */
function buildProductDetail(locale, product) {
  const dir = locale === 'zh' ? 'products' : 'en/products';
  const t = T(locale);
  const isZh = locale === 'zh';
  const cat = categoryBySlug[product.category];
  const name = pick(product, 'name', locale);
  const crumbs = [
    { label: isZh ? '產品中心' : 'Products', href: '/products/' },
    { label: name, href: `/products/${product.slug}.html` },
  ];

  const desc = (isZh ? product.descZh : product.descEn) || [];
  const apps = (isZh ? product.applicationsZh : product.applicationsEn) || [];
  const files = product.files || [];
  const installation = product.installation || [];

  /* 章節導覽 */
  const sections = [
    desc.length && { id: 'overview', label: t.overview },
    product.features?.length && { id: 'features', label: t.features },
    (product.specTable || product.specList?.length) && { id: 'specs', label: t.specs },
    apps.length && { id: 'applications', label: t.applicationsTitle },
    installation.length && { id: 'installation', label: t.installation },
    files.length && { id: 'documents', label: t.documents },
  ].filter(Boolean);

  const anchorNav = `<nav class="anchor-nav" data-anchor-nav aria-label="${esc(isZh ? '本頁章節' : 'On this page')}">
      <div class="wrap">
        <ul>
          ${sections.map((s) => `<li><a href="#${s.id}">${esc(s.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </nav>`;

  /* 圖片 */
  const gallery = product.gallery?.length ? product.gallery : [product.cover];
  const thumbs = gallery.length > 1 ? `<div class="gallery__thumbs">
          ${gallery.map((g, i) => `<button class="gallery__thumb${i === 0 ? ' is-active' : ''}" type="button" data-gallery-thumb aria-label="${esc(name)} ${i + 1}">
            <img src="${esc(asset(dir, g))}" data-full="${esc(asset(dir, g))}" alt="" width="168" height="126" loading="lazy" decoding="async">
          </button>`).join('\n          ')}
        </div>` : '';

  /* 右側快速規格 */
  const quickRows = [
    cat && { label: t.category, value: pick(cat, 'name', locale) },
    product.brand && { label: t.brand, value: product.brand },
    product.model && { label: t.model, value: product.model },
    ...(product.specList || []).slice(0, 4).map((s) => ({ label: pick(s, 'label', locale), value: pick(s, 'value', locale) })),
  ].filter(Boolean);

  const inquiryHref = href(locale, dir, '/contact.html');
  const pdf = files.find((f) => f.available);

  const heroBlock = `<section class="section">
      <div class="wrap product-hero">
        <div data-gallery>
          <div class="gallery__main">
            <img src="${esc(asset(dir, gallery[0]))}" alt="${esc(name)}" width="960" height="720" data-gallery-main fetchpriority="high" decoding="async">
          </div>
          ${thumbs}
        </div>

        <div class="product-meta">
          <p class="product-meta__cat">${esc(cat ? pick(cat, 'name', locale) : '')}</p>
          <h1>${esc(name)}</h1>
          <p class="product-meta__en">${esc(isZh ? product.nameEn : product.nameZh)}</p>
          <p class="product-meta__lead">${esc(pick(product, 'short', locale))}</p>

          <dl class="spec-quick">
            ${quickRows.map((r) => `<div class="spec-quick__row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('\n            ')}
          </dl>

          <div class="btn-row">
            <a class="btn btn--primary" href="${esc(inquiryHref)}" data-inquiry-link
               data-product="${esc(name)}"
               data-model="${esc(product.model || '')}"
               data-type="${esc(cat ? (pick(cat, 'formType', locale) || pick(cat, 'name', locale)) : '')}">${esc(t.inquireThis)}</a>
            ${pdf
    ? `<a class="btn btn--outline" href="${esc(asset(dir, pdf.path))}" download>${icons.download} ${esc(t.downloadPdf)}</a>`
    : `<a class="btn btn--outline" href="${esc(href(locale, dir, '/downloads.html'))}">${esc(t.documents)}</a>`}
          </div>
        </div>
      </div>
    </section>`;

  const overview = desc.length ? `<section class="section section--tint" id="overview">
      <div class="wrap">
        <div class="sec-head"><span class="eyebrow">Overview</span><h2>${esc(t.overview)}</h2></div>
        <div class="prose" style="max-width:860px">
          ${desc.map((p) => `<p>${esc(p)}</p>`).join('\n          ')}
        </div>
      </div>
    </section>` : '';

  const featureBlock = product.features?.length ? `<section class="section" id="features">
      <div class="wrap">
        <div class="sec-head"><span class="eyebrow">Features</span><h2>${esc(t.features)}</h2></div>
        <div class="grid grid--2">
          ${product.features.map((f, i) => `<div class="feature">
            <span class="feature__num">0${i + 1}</span>
            <h3>${esc(pick(f, 'title', locale))}</h3>
            <p>${esc(pick(f, 'body', locale))}</p>
          </div>`).join('\n          ')}
        </div>
      </div>
    </section>` : '';

  let specBlock = '';
  if (product.specTable || product.specList?.length) {
    const table = product.specTable ? `<div class="table-scroll">
          <table class="spec-table">
            <caption>${esc(pick(product.specTable, 'caption', locale))}</caption>
            <thead>
              <tr>${product.specTable.columns.map((c) => `<th scope="col">${esc(pick(c, 'name', locale))}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${product.specTable.rows.map((row) => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row" style="text-align:left">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>
        <p class="table-hint">${esc(t.tableHint)}</p>` : '';

    const list = product.specList?.length ? `<dl class="info-list" style="margin-top:${product.specTable ? '36px' : '0'}">
          ${product.specList.map((s) => `<div class="info-list__row"><dt>${esc(pick(s, 'label', locale))}</dt><dd>${esc(pick(s, 'value', locale))}</dd></div>`).join('\n          ')}
        </dl>` : '';

    specBlock = `<section class="section section--gray" id="specs">
      <div class="wrap">
        <div class="sec-head"><span class="eyebrow">Specifications</span><h2>${esc(t.specs)}</h2></div>
        ${table}
        ${list}
        <p class="table-hint">${esc(t.specNote)}</p>
      </div>
    </section>`;
  }

  const appBlock = apps.length ? `<section class="section" id="applications">
      <div class="wrap">
        <div class="sec-head"><span class="eyebrow">Applications</span><h2>${esc(t.applicationsTitle)}</h2></div>
        <div class="prose" style="max-width:820px">
          <ul>${apps.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>` : '';

  const installBlock = installation.length ? `<section class="section section--tint" id="installation">
      <div class="wrap">
        <div class="sec-head">
          <span class="eyebrow">Installation</span>
          <h2>${esc(t.installation)}</h2>
          <p>${esc(isZh
    ? '可依池型、水深與維護條件選擇安裝方式，特殊現場亦可依需求進行設計。'
    : 'The mounting arrangement is chosen to suit tank geometry, water depth and maintenance access; custom designs are available.')}</p>
        </div>
        <div class="grid grid--2">
          ${installation.map((item) => `<article class="install-item">
            <div class="install-item__media">
              <img src="${esc(asset(dir, item.image))}" alt="${esc(pick(item, 'title', locale))}" width="640" height="480" loading="lazy" decoding="async">
            </div>
            <div class="install-item__body">
              <h3>${esc(pick(item, 'title', locale))}</h3>
              <p>${esc(pick(item, 'body', locale))}</p>
            </div>
          </article>`).join('\n          ')}
        </div>
      </div>
    </section>` : '';

  const docBlock = files.length ? `<section class="section" id="documents">
      <div class="wrap">
        <div class="sec-head"><span class="eyebrow">Documents</span><h2>${esc(t.documents)}</h2></div>
        <div class="grid">
          ${files.map((f) => downloadCard({ locale, dir, file: { ...f, category: product.category, productName: name } })).join('\n          ')}
        </div>
      </div>
    </section>` : '';

  const related = activeProducts.filter((p) => p.slug !== product.slug)
    .sort((a, b) => (a.category === product.category ? -1 : 0) - (b.category === product.category ? -1 : 0))
    .slice(0, 3);
  const relatedBlock = related.length ? `<section class="section section--gray">
      <div class="wrap">
        <div class="sec-head"><h2>${esc(t.relatedProducts)}</h2></div>
        <div class="grid grid--3">
      ${related.map((p) => productCard({ locale, dir, product: p })).join('\n      ')}
        </div>
      </div>
    </section>` : '';

  const main = `${pageHead({
    locale, dir, current: `/products/${product.slug}.html`, crumbs, crumbOnly: true,
  })}
    ${anchorNav}
    ${heroBlock}
    ${overview}
    ${featureBlock}
    ${specBlock}
    ${appBlock}
    ${installBlock}
    ${docBlock}
    ${relatedBlock}
${renderCta({ locale, dir })}`;

  return {
    file: `${locale === 'zh' ? '' : 'en/'}products/${product.slug}.html`,
    html: page({
      locale, dir, current: `/products/${product.slug}.html`,
      title: pick(product, 'seoTitle', locale) || name,
      description: pick(product, 'seoDesc', locale) || pick(product, 'short', locale),
      ogImage: product.cover,
      main,
      jsonLd: [
        breadcrumbJsonLd(locale, [{ label: t.home, href: '/' }, ...crumbs]),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name,
          alternateName: isZh ? product.nameEn : product.nameZh,
          description: pick(product, 'short', locale),
          image: siteUrl + '/' + String(product.cover).replace(/^\//, ''),
          category: cat ? pick(cat, 'name', locale) : undefined,
          brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
          manufacturer: { '@type': 'Organization', name: isZh ? company.nameZh : company.nameEn },
          url: siteUrl + rootPath(locale, `/products/${product.slug}.html`),
        },
      ],
    }),
  };
}

/* --- 應用領域 ----------------------------------------------------------- */
function buildApplications(locale) {
  const dir = locale === 'zh' ? '' : 'en';
  const t = T(locale);
  const isZh = locale === 'zh';
  const crumbs = [{ label: isZh ? '應用領域' : 'Applications', href: '/applications.html' }];

  const blocks = applications.map((app, index) => {
    const related = (app.products || []).map((s) => productBySlug[s]).filter(Boolean);
    return `<section class="section${index % 2 ? ' section--tint' : ''}" id="${esc(app.slug)}">
      <div class="wrap">
        <div class="split${index % 2 ? ' split--rev' : ''}">
          <div class="prose">
            <span class="eyebrow">${esc(isZh ? app.nameEn : app.nameZh)}</span>
            <h2>${esc(pick(app, 'name', locale))}</h2>
            <p>${esc(pick(app, 'summary', locale))}</p>
            <p>${esc(pick(app, 'body', locale))}</p>
          </div>
          <div class="split__media">
            <img src="${esc(asset(dir, app.image))}" alt="${esc(pick(app, 'name', locale))}" width="800" height="600" loading="lazy" decoding="async">
          </div>
        </div>
        ${related.length ? `<h3 style="margin-top:44px;margin-bottom:20px">${esc(t.relatedProducts)}</h3>
        <div class="grid grid--3">
      ${related.map((p) => productCard({ locale, dir, product: p })).join('\n      ')}
        </div>` : ''}
      </div>
    </section>`;
  }).join('\n\n  ');

  const main = `${pageHead({
    locale, dir, current: '/applications.html', crumbs,
    titleZh: '應用領域', titleEn: 'Applications',
    enSubZh: 'Applications', enSubEn: '應用領域',
    leadZh: '從使用需求出發：污水處理、曝氣系統、污水攪拌與工業水處理，各自對應適合的設備組合。',
    leadEn: 'Start from the duty: wastewater treatment, aeration systems, mixing and industrial water treatment — each with its matching equipment.',
  })}

  ${blocks}

${renderCta({ locale, dir })}`;

  return {
    file: locale === 'zh' ? 'applications.html' : 'en/applications.html',
    html: page({
      locale, dir, current: '/applications.html',
      title: isZh ? '應用領域｜污水處理、曝氣、攪拌與工業水處理' : 'Applications | Wastewater, Aeration, Mixing & Industrial Water',
      description: isZh
        ? '依應用領域查找設備：污水處理、曝氣系統、污水攪拌與工業水處理，對應散氣盤、沉水攪拌機、鼓風機與污泥處理設備。'
        : 'Find equipment by application: wastewater treatment, aeration systems, mixing and industrial water treatment — matched with diffusers, mixers, blowers and sludge equipment.',
      main,
      jsonLd: [breadcrumbJsonLd(locale, [{ label: t.home, href: '/' }, ...crumbs])],
    }),
  };
}

/* --- 技術資料／下載中心 ------------------------------------------------- */
function collectDownloads(locale) {
  const list = [];
  activeProducts.forEach((p) => {
    (p.files || []).forEach((f) => list.push({
      ...f, category: p.category, productName: pick(p, 'name', locale),
    }));
  });
  extraDownloads.forEach((f) => list.push({ ...f, productName: '' }));
  return list;
}

function buildDownloads(locale) {
  const dir = locale === 'zh' ? '' : 'en';
  const t = T(locale);
  const isZh = locale === 'zh';
  const crumbs = [{ label: isZh ? '技術資料' : 'Downloads', href: '/downloads.html' }];
  const files = collectDownloads(locale);

  const usedDocCats = [
    ...usedCategories.filter((c) => files.some((f) => f.category === c.slug)),
  ];
  const hasCompany = files.some((f) => f.category === 'company');

  const chips = [
    { slug: 'all', label: t.all },
    ...usedDocCats.map((c) => ({ slug: c.slug, label: pick(c, 'name', locale) })),
    ...(hasCompany ? [{ slug: 'company', label: isZh ? '公司文件' : 'Company' }] : []),
  ].map((c) => `<a class="chip${c.slug === 'all' ? ' is-active' : ''}" href="${esc(c.slug === 'all' ? href(locale, dir, '/downloads.html') : href(locale, dir, `/downloads.html?cat=${c.slug}`))}" data-filter-doc="${esc(c.slug)}">${esc(c.label)}</a>`)
    .join('\n          ');

  const cards = files.map((f) => downloadCard({ locale, dir, file: f })).join('\n      ');

  const main = `${pageHead({
    locale, dir, current: '/downloads.html', crumbs,
    titleZh: '技術資料', titleEn: 'Technical Downloads',
    enSubZh: 'Catalogues & Specification Sheets', enSubEn: '產品型錄與規格表',
    leadZh: '產品型錄、規格表與公司文件集中於此。若需要的文件尚未上線，歡迎透過詢價表單或來信索取。',
    leadEn: 'Catalogues, specification sheets and company documents in one place. If a document is not listed yet, please request it via the enquiry form.',
  })}

  <section class="section">
    <div class="wrap">
      <div class="toolbar">
        <div class="chips">
          ${chips}
        </div>
      </div>

      <div class="grid" data-download-list>
      ${cards}
      </div>

      <div class="empty-state" data-empty-state hidden>${esc(t.noResultDoc)}</div>

      <p class="table-hint" style="margin-top:28px">${esc(isZh
    ? '說明：將 PDF 檔案放入專案的 downloads/ 目錄，並於 tools/data 內把該文件的 available 改為 true，重新產生網站後即可直接下載。'
    : 'Note: place the PDF in the downloads/ folder, set the document\'s available flag to true in tools/data, and rebuild to enable direct download.')}</p>
    </div>
  </section>

${renderCta({ locale, dir })}`;

  return {
    file: locale === 'zh' ? 'downloads.html' : 'en/downloads.html',
    html: page({
      locale, dir, current: '/downloads.html',
      title: isZh ? '技術資料與型錄下載' : 'Technical Data & Catalogue Downloads',
      description: isZh
        ? '九譽產品型錄與規格表下載：細氣泡散氣盤、沉水攪拌機、Hoffman & Lamson 離心式鼓風機與污泥處理設備相關文件。'
        : 'Download catalogues and specification sheets for fine bubble diffusers, submersible mixers, Hoffman & Lamson blowers and sludge equipment.',
      main,
      jsonLd: [breadcrumbJsonLd(locale, [{ label: t.home, href: '/' }, ...crumbs])],
    }),
  };
}

/* --- 聯絡我們 ----------------------------------------------------------- */
function buildContact(locale) {
  const dir = locale === 'zh' ? '' : 'en';
  const t = T(locale);
  const f = formText[locale];
  const isZh = locale === 'zh';
  const crumbs = [{ label: isZh ? '聯絡我們' : 'Contact', href: '/contact.html' }];
  const address = isZh ? company.addressZh : company.addressEn;

  const main = `${pageHead({
    locale, dir, current: '/contact.html', crumbs,
    titleZh: '聯絡我們', titleEn: 'Contact Us',
    enSubZh: 'Contact Fine Reputation Co., Ltd.', enSubEn: '聯絡九譽有限公司',
    leadZh: '設備選型、報價或技術問題，歡迎透過電話、Email 或下方詢價表單與我們聯絡。',
    leadEn: 'For equipment selection, quotations or technical questions, contact us by phone, email or the enquiry form below.',
  })}

  <section class="section">
    <div class="wrap split">
      <div>
        <span class="eyebrow">Company Information</span>
        <h2>${esc(isZh ? '公司資訊' : 'Company Information')}</h2>
        <dl class="info-list" style="margin-top:24px">
          <div class="info-list__row"><dt>${esc(isZh ? '公司名稱' : 'Company')}</dt><dd>${esc(company.nameZh)}<br>${esc(company.nameEn)}</dd></div>
          <div class="info-list__row"><dt>${esc(t.taxIdLabel)}</dt><dd>${esc(company.taxId)}</dd></div>
          <div class="info-list__row"><dt>${esc(t.addressLabel)}</dt><dd>${esc(company.zip)}<br>${esc(address)}</dd></div>
          <div class="info-list__row"><dt>${esc(t.telLabel)}</dt><dd><a href="tel:${esc(company.telHref)}">${esc(company.tel)}</a></dd></div>
          <div class="info-list__row"><dt>${esc(t.faxLabel)}</dt><dd>${esc(company.fax)}</dd></div>
          <div class="info-list__row"><dt>${esc(t.emailLabel)}</dt><dd><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></dd></div>
        </dl>
      </div>
      ${company.mapEmbed ? `<div class="map-embed">
        <iframe src="${esc(company.mapEmbed)}" title="${esc(isZh ? '公司位置地圖' : 'Company location map')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>` : ''}
    </div>
  </section>

  <section class="section section--tint" id="inquiry-form">
    <div class="wrap" style="max-width:920px">
      <div class="sec-head">
        <span class="eyebrow">Enquiry</span>
        <h2>${esc(f.title)}</h2>
        <p>${esc(f.lead)}</p>
      </div>
      ${inquiryForm({ locale, dir })}
    </div>
  </section>`;

  return {
    file: locale === 'zh' ? 'contact.html' : 'en/contact.html',
    html: page({
      locale, dir, current: '/contact.html',
      title: isZh ? '聯絡我們｜詢價表單' : 'Contact Us | Enquiry Form',
      description: isZh
        ? `九譽有限公司聯絡資訊：${company.addressZh}，電話 ${company.tel}，Email ${company.email}。歡迎填寫詢價表單洽詢水處理設備。`
        : `Contact Fine Reputation Co., Ltd. — ${company.addressEn}. Tel ${company.tel}, email ${company.email}. Send an enquiry about water treatment equipment.`,
      main,
      jsonLd: [breadcrumbJsonLd(locale, [{ label: t.home, href: '/' }, ...crumbs]), organizationJsonLd(locale)],
    }),
  };
}

/* ==========================================================================
   6. sitemap.xml / robots.txt
   ========================================================================== */
function buildSitemap() {
  const paths = [
    { p: '/', priority: '1.0' },
    { p: '/about.html', priority: '0.8' },
    { p: '/products/', priority: '0.9' },
    ...activeProducts.map((x) => ({ p: `/products/${x.slug}.html`, priority: '0.8' })),
    { p: '/applications.html', priority: '0.7' },
    { p: '/downloads.html', priority: '0.6' },
    { p: '/contact.html', priority: '0.7' },
  ];

  const urls = [];
  LOCALES.forEach((locale) => {
    paths.forEach(({ p, priority }) => {
      urls.push(`  <url>
    <loc>${siteUrl + rootPath(locale, p)}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${siteUrl + rootPath('zh', p)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl + rootPath('en', p)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl + rootPath('zh', p)}"/>
  </url>`);
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

const buildRobots = () => `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

/* ==========================================================================
   7. 圖片佔位檔（僅在檔案不存在時產生，方便日後直接換成實拍照片）
   ========================================================================== */
function placeholderSvg({ label, sub, variant = 'plain', w = 800, h = 600 }) {
  const glyphs = {
    diffuser: `<g fill="none" stroke="#00a54e" stroke-width="6">
      <ellipse cx="400" cy="360" rx="150" ry="46"/><path d="M250 360v-26c0-26 67-46 150-46s150 20 150 46v26"/>
      <circle cx="330" cy="240" r="20"/><circle cx="400" cy="200" r="28"/><circle cx="470" cy="245" r="16"/>
      <circle cx="360" cy="160" r="12"/><circle cx="440" cy="148" r="10"/></g>`,
    mixer: `<g fill="none" stroke="#00a54e" stroke-width="6">
      <rect x="250" y="280" width="170" height="86" rx="22"/><path d="M420 300h40v46h-40M250 323H180"/>
      <circle cx="520" cy="323" r="14"/>
      <path d="M520 309c14-40 44-52 60-34s-10 42-46 42M520 337c30 22 34 50 12 58s-32-22-18-50"/></g>`,
    blower: `<g fill="none" stroke="#00a54e" stroke-width="6">
      <circle cx="360" cy="320" r="100"/><circle cx="360" cy="320" r="26"/>
      <path d="M460 280h120v80H460M360 220v-40M360 420v40M300 250l-40-30M420 250l40-30"/></g>`,
    sludge: `<g fill="none" stroke="#00a54e" stroke-width="6">
      <path d="M230 230h340l-118 140v110l-104 40V370z"/><path d="M300 470h200"/>
      <path d="M340 540h120"/></g>`,
    tank: `<g fill="none" stroke="#00a54e" stroke-width="5">
      <path d="M120 400h560v150H120z"/><path d="M120 400V250h560v150"/>
      <path d="M170 550V430M270 550V430M370 550V430M470 550V430M570 550V430" stroke-width="3" opacity=".55"/>
      <circle cx="240" cy="330" r="16"/><circle cx="330" cy="300" r="22"/><circle cx="430" cy="320" r="14"/>
      <circle cx="520" cy="292" r="20"/><circle cx="600" cy="330" r="12"/></g>`,
    plant: `<g fill="none" stroke="#00a54e" stroke-width="5">
      <path d="M110 520h580"/><path d="M160 520V330h150v190M340 520V250h130v270M500 520V370h180v150"/>
      <path d="M200 370h70M200 420h70M380 300h50M380 360h50M380 420h50M540 420h100M540 470h100" stroke-width="3" opacity=".6"/></g>`,
    doc: `<g fill="none" stroke="#00a54e" stroke-width="5">
      <path d="M270 170h190l110 110v330H270z"/><path d="M460 170v110h110"/>
      <path d="M320 380h220M320 440h220M320 500h140" stroke-width="4" opacity=".7"/></g>`,
    quality: `<g fill="none" stroke="#00a54e" stroke-width="5">
      <path d="M400 150l170 70v150c0 110-72 180-170 210-98-30-170-100-170-210V220z"/>
      <path d="M330 370l52 52 108-108" stroke-width="8"/></g>`,
    install1: `<g fill="none" stroke="#00a54e" stroke-width="5"><path d="M150 180v380M150 560h500M560 180v380"/>
      <path d="M150 300h60v-40h-60" stroke-width="4"/><rect x="200" y="380" width="110" height="60" rx="16"/>
      <path d="M255 380V200M310 400h30v20h-30"/><path d="M150 240h40M150 340h40M150 440h40" stroke-width="3" opacity=".6"/></g>`,
    install2: `<g fill="none" stroke="#00a54e" stroke-width="5"><path d="M120 560h560M120 200v360"/>
      <path d="M330 560v-70h90v70" stroke-width="4"/><rect x="320" y="400" width="110" height="60" rx="16"/>
      <path d="M430 420h30v20h-30"/><path d="M470 430c50-20 90 0 90 0" stroke-width="3" opacity=".6"/></g>`,
    install3: `<g fill="none" stroke="#00a54e" stroke-width="5"><path d="M160 160v400M160 560h520"/>
      <path d="M160 330h120" stroke-width="4"/><rect x="280" y="300" width="110" height="60" rx="16"/>
      <path d="M390 320h30v20h-30"/><path d="M160 290l90 30-90 30" stroke-width="3" opacity=".5"/></g>`,
    install4: `<g fill="none" stroke="#00a54e" stroke-width="5"><path d="M130 560h540M130 190v370"/>
      <path d="M210 560V300h70" stroke-width="4"/><rect x="280" y="330" width="110" height="60" rx="16" transform="rotate(-12 335 360)"/>
      <path d="M392 338l28 6-6 20-28-6"/><path d="M470 300h120v60H470" stroke-width="3" opacity=".5" stroke-dasharray="10 8"/></g>`,
    plain: '',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0v40" fill="none" stroke="#dbe9e0" stroke-width="1"/>
    </pattern>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4faf6"/><stop offset="1" stop-color="#e0f1e7"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="#c4dccd" stroke-width="2"/>
  ${glyphs[variant] || ''}
  <text x="40" y="${h - 58}" font-family="Segoe UI, Noto Sans TC, sans-serif" font-size="26" font-weight="700" fill="#0b4a2c">${esc(label)}</text>
  ${sub ? `<text x="40" y="${h - 28}" font-family="Segoe UI, sans-serif" font-size="17" fill="#5a6b61">${esc(sub)}</text>` : ''}
</svg>
`;
}

const IMAGE_PLACEHOLDERS = [
  ['assets/img/hero.svg', { label: '曝氣池與散氣系統', sub: 'Hero image — replace with a site photo (1600×900)', variant: 'tank', w: 1600, h: 900 }],
  ['assets/img/about.svg', { label: '九譽水處理設備', sub: 'About image — replace with a real photo', variant: 'plant' }],
  ['assets/img/quality.svg', { label: '品質理念', sub: 'Quality — replace with a real photo', variant: 'quality' }],
  ['assets/img/downloads.svg', { label: '產品型錄', sub: 'Downloads — replace with a real photo', variant: 'doc' }],
  ['assets/img/product-diffuser.svg', { label: '細氣泡散氣盤', sub: 'Fine Bubble Disc Diffuser', variant: 'diffuser' }],
  ['assets/img/product-diffuser-2.svg', { label: '散氣盤 EPDM 膜片', sub: 'EPDM membrane detail', variant: 'diffuser' }],
  ['assets/img/product-mixer.svg', { label: '沉水攪拌機', sub: 'Submersible Mixer', variant: 'mixer' }],
  ['assets/img/product-mixer-2.svg', { label: '沉水攪拌機葉輪', sub: 'Mixer impeller', variant: 'mixer' }],
  ['assets/img/product-blower.svg', { label: '離心式鼓風機', sub: 'Hoffman & Lamson Centrifugal Blower', variant: 'blower' }],
  ['assets/img/product-sludge.svg', { label: '污泥脫水機', sub: 'Sludge Dewatering Equipment', variant: 'sludge' }],
  ['assets/img/app-wastewater.svg', { label: '污水處理', sub: 'Wastewater Treatment', variant: 'plant' }],
  ['assets/img/app-aeration.svg', { label: '曝氣系統', sub: 'Aeration System', variant: 'tank' }],
  ['assets/img/app-mixing.svg', { label: '污水攪拌', sub: 'Wastewater Mixing', variant: 'mixer' }],
  ['assets/img/app-industrial.svg', { label: '工業水處理', sub: 'Industrial Water Treatment', variant: 'blower' }],
  ['assets/img/install-1.svg', { label: '安裝方式 1：導桿升降式', sub: 'Guide rail lifting', variant: 'install1' }],
  ['assets/img/install-2.svg', { label: '安裝方式 2：底座固定式', sub: 'Floor mounted base', variant: 'install2' }],
  ['assets/img/install-3.svg', { label: '安裝方式 3：牆面支架式', sub: 'Wall bracket', variant: 'install3' }],
  ['assets/img/install-4.svg', { label: '安裝方式 4：特殊設計', sub: 'Custom design', variant: 'install4' }],
  ['assets/img/og-default.svg', { label: '九譽有限公司 Fine Reputation Co., Ltd.', sub: '專業水處理設備 — Since 1996', variant: 'tank', w: 1200, h: 630 }],
];

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="8" fill="#07331f"/>
  <path d="M24 10c4.6 5.4 7.4 9.6 7.4 13.4A7.4 7.4 0 0 1 24 30.8a7.4 7.4 0 0 1-7.4-7.4C16.6 19.6 19.4 15.4 24 10Z" fill="#00a54e"/>
  <circle cx="15" cy="35" r="2.6" fill="#6fd79b"/>
  <circle cx="24" cy="37" r="3.2" fill="#a5e8c2"/>
  <circle cx="33" cy="35" r="2.6" fill="#6fd79b"/>
</svg>
`;

/* ==========================================================================
   8. 執行
   ========================================================================== */
async function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf8');
  return relPath;
}

async function exists(relPath) {
  try { await fs.access(path.join(ROOT, relPath)); return true; }
  catch { return false; }
}

async function main() {
  const written = [];
  const skipped = [];

  // 圖片佔位 + logo / favicon（已存在的檔案不覆寫，方便換成真實照片）
  for (const [file, opts] of IMAGE_PLACEHOLDERS) {
    if (await exists(file)) { skipped.push(file); continue; }
    written.push(await writeFile(file, placeholderSvg(opts)));
  }
  for (const file of ['assets/img/logo.svg', 'assets/img/favicon.svg']) {
    if (await exists(file)) { skipped.push(file); continue; }
    written.push(await writeFile(file, LOGO_SVG));
  }

  // 頁面
  for (const locale of LOCALES) {
    const pages = [
      buildHome(locale),
      buildAbout(locale),
      buildProductList(locale),
      ...activeProducts.map((p) => buildProductDetail(locale, p)),
      buildApplications(locale),
      buildDownloads(locale),
      buildContact(locale),
    ];
    for (const p of pages) written.push(await writeFile(p.file, p.html));
  }

  written.push(await writeFile('sitemap.xml', buildSitemap()));
  written.push(await writeFile('robots.txt', buildRobots()));

  const pageCount = written.filter((f) => f.endsWith('.html')).length;
  console.log(`✔ 產生完成：${pageCount} 個 HTML 頁面、${written.length} 個檔案`);
  console.log(`  語言：${LOCALES.join(' / ')}    產品：${activeProducts.length} 項    網域：${siteUrl}`);
  if (skipped.length) console.log(`  略過既有圖片 ${skipped.length} 個（不覆寫）`);
}

main().catch((err) => {
  console.error('✖ 產生失敗：', err);
  process.exitCode = 1;
});
