# 九譽有限公司官網（純靜態 HTML）

Fine Reputation Co., Ltd. 企業官網 — 企業形象 + 產品型錄 + 詢價入口。

- **純靜態**：輸出只有 HTML / CSS / JS / 圖片，沒有資料庫、沒有後台、沒有執行環境需求。
- **可直接預覽**：所有連結都是相對路徑，雙擊 `index.html` 就能在瀏覽器看到完整網站。
- **可直接上線**：整個目錄丟到任何虛擬主機、Nginx、Apache、GitHub Pages、Cloudflare Pages 皆可。
- **內容在程式碼裡維護**：全站文字與產品資料集中在 `tools/data/`，改完執行一行指令重新產生 HTML。

---

## 目錄結構

```
九譽/
├─ index.html              首頁（繁中）
├─ about.html              關於九譽
├─ applications.html       應用領域
├─ downloads.html          技術資料／型錄下載
├─ contact.html            聯絡我們 + 詢價表單
├─ products/
│  ├─ index.html           產品中心（分類篩選 + 搜尋）
│  ├─ fine-bubble-disc-diffuser.html
│  ├─ submersible-mixer.html
│  ├─ centrifugal-blower.html
│  └─ sludge-dewatering-equipment.html
├─ en/                     英文版（結構與上方完全對應）
├─ assets/
│  ├─ css/style.css        全站樣式
│  ├─ js/main.js           選單、篩選、搜尋、表單（原生 JS，無套件）
│  └─ img/                 圖片（目前為佔位 SVG，可直接換成實拍照片）
├─ downloads/              PDF 型錄放這裡
├─ sitemap.xml             自動產生
├─ robots.txt             自動產生
└─ tools/                  ★ 內容來源與產生器（不會上傳到網站也沒關係）
   ├─ build.mjs
   └─ data/
      ├─ site.mjs          公司資料、導覽、分類、介面文案、表單文案
      ├─ products.mjs      產品資料
      └─ content.mjs       首頁／關於／應用領域／下載中心內容
```

---

## 如何修改內容

### 方式 A：改資料 + 重新產生（建議）

中英文兩版共 20 頁的 header、footer、導覽都是同一份模板產生的，改一次即可全站生效。

```bash
node tools/build.mjs
```

需要 Node.js 18 以上（不需要 `npm install`，沒有任何依賴套件）。

| 想改什麼 | 改哪個檔案 |
| --- | --- |
| 電話、地址、Email、統編、網域 | `tools/data/site.mjs` → `company` / `siteUrl` |
| 導覽選單、產品分類 | `tools/data/site.mjs` → `nav` / `categories` |
| 按鈕與欄位文字（中英） | `tools/data/site.mjs` → `ui` / `formText` |
| 產品名稱、規格、型號表、特色、安裝方式、PDF | `tools/data/products.mjs` |
| 首頁 Hero、公司簡介、發展歷程、核心價值、應用領域 | `tools/data/content.mjs` |
| 版面與配色 | `assets/css/style.css` |
| 互動行為 | `assets/js/main.js` |

### 方式 B：直接改 HTML

產生出來的就是普通 HTML，用編輯器改任何一頁都可以。
但要注意：**之後再執行 `node tools/build.mjs` 會覆寫這些 HTML**。
如果決定之後都手改 HTML，把 `tools/` 整個刪掉即可，網站照樣運作。

---

## 新增一項產品

在 `tools/data/products.mjs` 的 `products` 陣列加一筆，最少要有：

```js
{
  slug: 'rotary-screen',            // 網址 → /products/rotary-screen.html
  category: 'other',                // 對應 site.mjs 的 categories[].slug
  status: 'active',                 // 'inactive' 則完全不輸出（等同下架）
  featured: false,                  // true 會出現在首頁「產品精選」
  sortOrder: 50,
  nameZh: '轉筒式篩網', nameEn: 'Rotary Screen',
  cover: 'assets/img/product-screen.svg',
  gallery: ['assets/img/product-screen.svg'],
  shortZh: '一句話簡介…', shortEn: 'One-line summary…',
  descZh: ['段落一', '段落二'], descEn: ['Paragraph 1', 'Paragraph 2'],
  features: [{ titleZh:'', titleEn:'', bodyZh:'', bodyEn:'' }],
  specList: [{ labelZh:'', labelEn:'', valueZh:'', valueEn:'' }],
  specTable: null,                  // 多型號時填入 { columns, rows }
  applicationsZh: [], applicationsEn: [],
  installation: [],
  files: [],
  seoTitleZh: '', seoTitleEn: '', seoDescZh: '', seoDescEn: '',
}
```

執行 `node tools/build.mjs` 後，中英文產品頁、產品列表、sitemap、相關產品區塊都會自動更新。

---

## 上線前要處理的三件事

### 1. 網域

`tools/data/site.mjs` 第一行的 `siteUrl` 改成實際網域，重新產生。
這個值用於 `canonical`、`hreflang`、`og:url` 與 `sitemap.xml`。

### 2. 詢價表單的收件方式

靜態網站本身無法處理表單送出，目前的預設行為是**開啟使用者的郵件軟體並帶入填寫內容**（`mailto:`），這在沒有後端的情況下可正常運作。

若要改成直接收信 / 進後台，在 `tools/data/site.mjs` 設定 endpoint：

```js
export const inquiry = {
  endpoint: 'https://formspree.io/f/xxxxxxx',   // 或 Web3Forms、自建 API
  mailto: company.email,
};
```

設定後表單會以 `POST FormData` 非同步送出，成功顯示「感謝您的詢問，我們將盡快與您聯絡。」，失敗提示改用電話。
表單已內建：必填驗證、Email 格式驗證、蜜罐（honeypot）欄位防機器人。
若服務商支援 Turnstile / reCAPTCHA，可在該服務端開啟。

### 3. 圖片與 PDF

`assets/img/` 目前是**藍圖風格的佔位 SVG**（含中文標籤），目的是讓版面先成立。
換成真實照片的方式：把同名檔案換成 `.webp` / `.jpg`，然後在資料檔中更新副檔名即可，例如

```js
cover: 'assets/img/product-mixer.webp',
```

建議尺寸：Hero 1600×900、產品圖 4:3（如 1200×900）、OG 圖 1200×630。
格式建議 WebP 或 AVIF，並保留原圖備份。所有 `<img>` 已設定 `width`/`height` 與 `loading="lazy"`（Hero 為 `fetchpriority="high"`），可避免版面跳動。

PDF 型錄：檔案放進 `downloads/`，然後在 `products.mjs` 對應的 `files` 項目把 `available` 改成 `true`，並補上 `version` / `size` / `date`：

```js
files: [{
  titleZh: '沉水攪拌機產品型錄', titleEn: 'Submersible Mixer Catalogue',
  path: 'downloads/submersible-mixer.pdf',
  language: 'multi', version: '2024.10', size: '3.2 MB', date: '2024-10-01',
  available: true,
}],
```

`available: false` 時，按鈕會自動變成「型錄準備中，請來信索取」並連到詢價表單，不會出現壞連結。

---

## 已實作的規格對照

| SA 項目 | 狀態 |
| --- | --- |
| 中／英雙語，切換時停留在同一頁 | ✅ `/products/x.html` ↔ `/en/products/x.html` |
| 語意化導覽（不再用圖片按鈕） | ✅ 純文字 `<nav>` + 桌機 hover 下拉 + 手機 Hamburger |
| 產品分類 → 列表 → 詳細頁 | ✅ 分類以篩選呈現（見下方說明） |
| 產品分類 Filter + 搜尋 | ✅ 靜態卡片 + 前端篩選，支援 `?cat=` `?q=` 深層連結 |
| 搜尋範圍：名稱／型號／說明／分類 | ✅ 例：搜 `PJM`、`PJ0.37`、`散氣` 都找得到 |
| 每個產品獨立網址、無 `?id=` | ✅ `/products/fine-bubble-disc-diffuser.html` |
| SEO Title / Meta Description / OG / Canonical | ✅ 每頁可獨立設定 |
| hreflang、sitemap.xml、robots.txt | ✅ 自動產生 |
| 結構化資料 | ✅ Organization / Product / BreadcrumbList / ItemList |
| PDF 僅作型錄下載，不當產品頁 | ✅ 規格與安裝方式都做成網頁內容 |
| 安裝方式做成圖文 | ✅ 沉水攪拌機 4 種安裝方式 |
| 規格表手機可左右滑動 | ✅ |
| 詢價 CTA + 快速詢價帶入產品 | ✅ 產品頁「詢問此產品」帶入產品名稱／型號／類型 |
| 響應式 1200 / 768 斷點 | ✅ |
| 下載中心統一管理 + 分類篩選 | ✅ |

### 與 SA 的兩處差異（刻意）

1. **產品分類沒有各自獨立頁面**
   SA 規劃 `/products/{category}` 與 `/products/{product}` 兩層。目前 4 項產品的情況下，分類頁內容會過於單薄，因此改為「產品列表 + 分類篩選」，並讓分類連結可被索引（`/products/?cat=aeration`）。
   產品數量成長後要補上獨立分類頁，在 `build.mjs` 增加一個 `buildCategory()` 即可，資料結構已經支援。

2. **沒有後台 CMS**
   依需求改為在程式碼維護資料。SA 的資料模型（`status`、`sortOrder`、`seo_*`、`gallery`、`download_files` 等欄位）已對應到 `products.mjs` 的欄位，未來若要接後台，資料形狀不需重新設計。

---

## 待補資料（`products.mjs` 內已標 `TODO`）

下列欄位目前填「請洽詢」或 `—`，因為公開型錄沒有明確數據，需要公司提供後補上：

- 散氣盤：散氣盤直徑、單體風量、氧氣傳遞效率、壓力損失、連接方式、操作溫度
- 沉水攪拌機：各型號的**推力**與**重量**；**PJM 系列完整型號表**
  （功率／極數／葉輪直徑／轉速已依型號編碼 `PJ[kW]/[極數]-[葉輪Ø]-[rpm]` 對應）
- 沉水攪拌機 4 種安裝方式的名稱與說明：目前依常見安裝型式撰寫，**請對照原廠型錄確認**
- 離心式鼓風機：風量、風壓、馬達功率選型範圍
- 污泥脫水機：現行銷售機型、處理能力、含水率、馬達功率、尺寸、重量

---

## 部署

把除了 `tools/` 與 `README.md` 以外的所有檔案上傳到網站根目錄即可（`tools/` 上傳也不影響運作，只是沒必要）。

建議伺服器設定：

- 預設首頁包含 `index.html`
- 啟用 gzip / brotli 壓縮
- `assets/` 設定長期快取（例如 `Cache-Control: public, max-age=31536000`），HTML 設定短快取
- 強制 HTTPS，`www` 與非 `www` 擇一並 301 轉址（避免與 canonical 衝突）
- 404 頁面可自行加 `404.html`
