/* ==========================================================================
   頁面內容：首頁、公司介紹、應用領域、下載中心
   ========================================================================== */

/* --- 首頁 Hero ---------------------------------------------------------- */
export const hero = {
  image: 'assets/img/hero.svg',
  altZh: '污水處理廠曝氣池與散氣系統',
  altEn: 'Aeration tank and diffuser system in a wastewater treatment plant',
  badgeZh: 'Since 1996',
  badgeEn: 'Since 1996',
  titleZh: ['專業水處理設備', '值得信賴的工程夥伴'],
  titleEn: ['Professional Wastewater', 'Treatment Equipment'],
  subEnZh: 'Professional Wastewater Treatment Equipment',
  subEnEn: 'Aeration · Mixing · Blowers · Sludge Treatment — Since 1996',
  leadZh: '九譽有限公司自 1996 年起專注於污水處理、曝氣、攪拌與鼓風設備，為國內工程公司與海外客戶提供設備供應與選型支援。',
  leadEn: 'Since 1996 Fine Reputation has focused on wastewater treatment, aeration, mixing and blower equipment, supporting engineering contractors in Taiwan and customers overseas.',
  stats: [
    { labelZh: '成立年份', labelEn: 'Established', valueZh: '1996', valueEn: '1996' },
    { labelZh: '自有研發', labelEn: 'In-house R&D', valueZh: '散氣盤 2004 年起', valueEn: 'Diffusers since 2004' },
    { labelZh: '海外市場', labelEn: 'Export markets', valueZh: '東南亞等地', valueEn: 'Southeast Asia and beyond' },
    { labelZh: '產品範圍', labelEn: 'Product range', valueZh: '曝氣／攪拌／鼓風／污泥', valueEn: 'Aeration / Mixing / Blower / Sludge' },
  ],
};

/* --- 首頁：關於九譽（精簡版）------------------------------------------- */
export const aboutBrief = {
  image: 'assets/img/about.svg',
  altZh: '九譽水處理設備應用現場',
  altEn: 'Fine Reputation water treatment equipment on site',
  bodyZh: [
    '九譽有限公司創立於 1996 年，為台灣專業污水處理設備供應商。',
    '公司成立初期主要提供台灣製造之污泥脫水機、鼓風機及曝氣設備予國內工程公司，並將相關產品出口至東南亞市場。',
    '隨著市場與客戶需求增加，九譽陸續引進歐美工業設備與水處理產品，同時投入自有產品研發與製造。',
    '在多年污水處理設備實務經驗基礎上，九譽持續開發兼具產品品質、性能與合理價格之水處理設備。',
  ],
  bodyEn: [
    'Fine Reputation Co., Ltd. was founded in 1996 as a professional supplier of wastewater treatment equipment in Taiwan.',
    'In its early years the company supplied Taiwan-made sludge dewatering machines, blowers and aeration equipment to domestic engineering companies, and exported these products to Southeast Asia.',
    'As market and customer requirements grew, Fine Reputation began importing industrial equipment and water treatment products from Europe and the United States, while also investing in its own product development and manufacturing.',
    'Building on years of hands-on experience with wastewater treatment equipment, the company continues to develop products that balance quality, performance and reasonable cost.',
  ],
};

/* --- 公司發展歷程 ------------------------------------------------------- */
export const milestones = [
  {
    year: '1996',
    titleZh: '九譽有限公司成立',
    titleEn: 'Fine Reputation established',
    bodyZh: '成立初期主要提供台灣製造之水處理設備給國內工程公司，並開始拓展東南亞市場。',
    bodyEn: 'The company started by supplying Taiwan-made water treatment equipment to domestic engineering companies, and began developing the Southeast Asian market.',
    listZh: ['污泥脫水機', '鼓風機', '曝氣設備'],
    listEn: ['Sludge dewatering machines', 'Blowers', 'Aeration equipment'],
  },
  {
    year: '後續發展',
    yearEn: 'Following years',
    titleZh: '引進歐美水處理設備',
    titleEn: 'Importing equipment from Europe and the US',
    bodyZh: '陸續引進歐美工業先進國家的水處理設備與相關產品，擴大可供應的設備範圍。',
    bodyEn: 'The company progressively introduced water treatment equipment and related products from advanced industrial countries in Europe and the United States, broadening its supply range.',
    listZh: [],
    listEn: [],
  },
  {
    year: '2004',
    titleZh: '投入散氣盤研發與生產',
    titleEn: 'Diffuser R&D and production begins',
    bodyZh: '開始投入散氣盤相關產品的研發及生產，研發團隊背景涵蓋多個專業領域。',
    bodyEn: 'Development and production of disc diffusers started, with a team covering several professional fields.',
    listZh: ['化學工程', '機械工程', '模具製作', '污水處理設備實務經驗'],
    listEn: ['Chemical engineering', 'Mechanical engineering', 'Mould making', 'Hands-on wastewater equipment experience'],
  },
  {
    year: '2004–2010',
    titleZh: '持續測試與改善',
    titleEn: 'Continuous testing and improvement',
    bodyZh: '在六年間持續進行材料與性能驗證，並依實際用戶回饋修改產品。',
    bodyEn: 'Over six years the product was validated for materials and performance, and revised according to real user feedback.',
    listZh: ['膜片材料測試', '散氣性能改善', '結構修改', '實際用戶測試', '使用者意見回饋'],
    listEn: ['Membrane material testing', 'Diffusion performance improvement', 'Structural revision', 'Field testing with users', 'User feedback'],
  },
  {
    year: '2010',
    titleZh: '散氣盤產品成熟並大量出口',
    titleEn: 'Diffuser matured and exported in volume',
    bodyZh: '散氣盤產品逐步成熟，開始大量出口東南亞市場，並取得海外回購訂單。',
    bodyEn: 'The diffuser design matured and began to be exported to Southeast Asia in volume, earning repeat orders from overseas customers.',
    listZh: [],
    listEn: [],
  },
];

/* --- 公司核心價值 ------------------------------------------------------- */
export const values = [
  {
    titleZh: '專業經驗',
    titleEn: 'Proven experience',
    bodyZh: 'Since 1996，累積多年水處理設備相關經驗，熟悉國內工程與海外市場需求。',
    bodyEn: 'Since 1996 we have accumulated years of experience with water treatment equipment, covering both domestic engineering projects and overseas markets.',
  },
  {
    titleZh: '技術整合',
    titleEn: 'Integrated expertise',
    bodyZh: '團隊背景涵蓋化工、機械、模具製作及水處理設備應用，能從設計端到現場端討論需求。',
    bodyEn: 'Our team spans chemical engineering, mechanical engineering, mould making and water treatment applications — from design office to site.',
  },
  {
    titleZh: '穩定品質',
    titleEn: 'Consistent quality',
    bodyZh: '持續透過產品測試與實際客戶使用回饋改善產品，而非僅依賴單次設計定案。',
    bodyEn: 'Products are improved continuously through testing and real customer feedback, rather than being frozen after a single design round.',
  },
  {
    titleZh: '合理成本',
    titleEn: 'Reasonable cost',
    bodyZh: '在產品性能、品質與市場價格之間取得平衡，協助客戶控制專案整體成本。',
    bodyEn: 'We balance performance, quality and market price to help customers control overall project cost.',
  },
];

/* --- 品質理念 ----------------------------------------------------------- */
export const quality = {
  bodyZh: [
    '九譽的產品開發方式來自實務：先在真實的污水處理現場使用，再依使用者回饋修改設計。散氣盤從 2004 年投入研發到 2010 年成熟，即是經過六年的膜片材料測試、散氣性能改善與結構修改。',
    '我們認為水處理設備的價值在於長期穩定運轉，而不只是出廠時的規格數字。因此在選型階段，我們會希望先了解現場條件——池體尺寸、水質、運轉時間與維護條件，再建議適合的設備配置。',
  ],
  bodyEn: [
    'Our product development comes from practice: equipment is used on real wastewater treatment sites first, then revised according to user feedback. The disc diffuser took six years — from R&D in 2004 to a mature design in 2010 — of membrane material testing, diffusion performance improvement and structural revision.',
    'We believe the value of water treatment equipment lies in stable long-term operation, not only in the specification sheet at the factory gate. During selection we therefore prefer to understand the site first — tank dimensions, water quality, operating hours and maintenance conditions — before recommending a configuration.',
  ],
};

/* --- 應用領域 ----------------------------------------------------------- */
export const applications = [
  {
    slug: 'wastewater-treatment',
    nameZh: '污水處理',
    nameEn: 'Wastewater Treatment',
    image: 'assets/img/app-wastewater.svg',
    summaryZh: '從曝氣、攪拌到污泥脫水，提供污水處理流程中的主要設備與選型建議。',
    summaryEn: 'Equipment and selection support across the treatment process — from aeration and mixing to sludge dewatering.',
    bodyZh: '都市污水與工業廢水處理廠的生物處理單元，通常同時需要穩定的供氣、均勻的攪拌，以及後段的污泥減量設備。九譽可依處理流程與現場條件，協助評估曝氣、攪拌與污泥處理設備的組合。',
    bodyEn: 'Biological treatment units in municipal and industrial plants normally need reliable air supply, uniform mixing and sludge reduction downstream. We help evaluate the combination of aeration, mixing and sludge equipment based on the process and site conditions.',
    products: ['fine-bubble-disc-diffuser', 'submersible-mixer', 'sludge-dewatering-equipment'],
  },
  {
    slug: 'aeration-system',
    nameZh: '曝氣系統',
    nameEn: 'Aeration System',
    image: 'assets/img/app-aeration.svg',
    summaryZh: '細氣泡散氣盤搭配離心式鼓風機，兼顧氧氣傳遞效率與曝氣能耗。',
    summaryEn: 'Fine bubble diffusers matched with centrifugal blowers, balancing oxygen transfer efficiency against energy use.',
    bodyZh: '曝氣是污水處理廠最主要的耗電單元之一。提高散氣設備的氧氣傳遞效率，可降低所需空氣量，進而減少鼓風機的耗電。九譽提供散氣盤與鼓風設備，可依曝氣池尺寸、水深與需氧量評估配置。',
    bodyEn: 'Aeration is one of the largest electricity consumers in a treatment plant. Raising the oxygen transfer efficiency of the diffusers lowers the air volume required, which in turn reduces blower power. We supply both diffusers and blowers, and can evaluate the configuration against tank size, water depth and oxygen demand.',
    products: ['fine-bubble-disc-diffuser', 'centrifugal-blower'],
  },
  {
    slug: 'mixing',
    nameZh: '污水攪拌',
    nameEn: 'Wastewater Mixing',
    image: 'assets/img/app-mixing.svg',
    summaryZh: '沉水攪拌機用於防止沉澱、污水均質與槽內水流循環。',
    summaryEn: 'Submersible mixers for sedimentation prevention, homogenisation and in-tank flow circulation.',
    bodyZh: '缺氧槽、調節池與污泥儲槽若缺乏足夠的攪拌，容易造成固體沉澱、濃度不均與處理效率下降。沉水攪拌機可依池型與水深選擇功率、葉輪直徑與安裝方式，維持槽內流場。',
    bodyEn: 'Without adequate mixing, anoxic tanks, equalisation basins and sludge holding tanks suffer from solids settling, uneven concentration and reduced treatment efficiency. Submersible mixers are selected by power, impeller diameter and mounting arrangement to maintain the flow pattern.',
    products: ['submersible-mixer'],
  },
  {
    slug: 'industrial-water',
    nameZh: '工業水處理',
    nameEn: 'Industrial Water Treatment',
    image: 'assets/img/app-industrial.svg',
    summaryZh: '工廠製程廢水與污泥處理，依水質與處理量規劃設備。',
    summaryEn: 'Process wastewater and sludge handling in factories, planned around water quality and throughput.',
    bodyZh: '工業廢水的水質與水量變化通常較大，設備需具備一定的運轉餘裕與耐用性。九譽的鼓風設備與污泥處理設備可用於製程廢水處理系統，並可搭配曝氣與攪拌設備規劃整體配置。',
    bodyEn: 'Industrial effluent typically varies more in quality and flow, so equipment needs operating margin and durability. Our blowers and sludge equipment serve process wastewater systems and can be planned together with aeration and mixing equipment.',
    products: ['centrifugal-blower', 'sludge-dewatering-equipment', 'submersible-mixer'],
  },
];

/**
 * 下載中心的額外文件（產品型錄由 products.mjs 的 files 欄位自動帶入）
 * category 對應 site.mjs 的 categories[].slug，或 'company' 代表公司文件
 */
export const extraDownloads = [
  {
    titleZh: '九譽有限公司公司簡介',
    titleEn: 'Fine Reputation Company Profile',
    category: 'company',
    path: 'downloads/company-profile.pdf',
    language: 'multi',
    version: '',
    size: '',
    date: '',
    available: false,
  },
];
