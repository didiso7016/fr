/* ==========================================================================
   產品資料（全站唯一來源）
   --------------------------------------------------------------------------
   欄位說明
     slug        產品網址（/products/<slug>.html），請勿隨意更動以免影響 SEO
     category    對應 site.mjs 的 categories[].slug
     status      'active' 顯示於前台；'inactive' 完全不輸出
     featured    true 會出現在首頁「產品精選」
     specList    單值規格 → 產品頁右側「產品規格」欄位
     specTable   多型號規格表 → 可左右滑動的表格
     installation 安裝方式圖文
     files       PDF 型錄；available:false 時按鈕變為「來信索取」

   ⚠ 標記 TODO 的欄位為原廠型錄尚未提供的數據，請補實際值後重新產生網站。
   ========================================================================== */

export const products = [
  /* ---------------------------------------------------------------- 曝氣 */
  {
    slug: 'fine-bubble-disc-diffuser',
    category: 'aeration',
    status: 'active',
    featured: true,
    sortOrder: 10,
    nameZh: '細氣泡散氣盤',
    nameEn: 'Fine Bubble Disc Diffuser',
    brand: '九譽 Fine Reputation',
    model: '',
    models: ['EPDM 單膜片', 'EPDM 雙膜片'],
    cover: 'assets/img/product-diffuser.svg',
    gallery: [
      'assets/img/product-diffuser.svg',
      'assets/img/product-diffuser-2.svg',
    ],
    shortZh: '九譽自行研發生產的細氣泡散氣盤，EPDM 膜片可形成 1–3 mm 細氣泡，有效提升氧氣傳遞效率並降低曝氣能耗。',
    shortEn: 'In-house developed fine bubble disc diffuser. The EPDM membrane produces 1–3 mm bubbles for higher oxygen transfer efficiency and lower aeration energy.',
    descZh: [
      '九譽自 2004 年開始投入散氣盤相關產品的研發與生產，研發團隊具備化學工程、機械工程、模具製作及污水處理設備實務背景。',
      '2004 至 2010 年間，產品持續進行膜片材料測試、散氣性能改善、結構修改，並透過實際用戶測試與使用者意見回饋逐步調整。2010 年產品成熟後開始大量出口東南亞市場，並取得海外回購訂單。',
    ],
    descEn: [
      'Fine Reputation began developing and manufacturing disc diffusers in 2004, with a team covering chemical engineering, mechanical engineering, mould making and hands-on wastewater equipment experience.',
      'Between 2004 and 2010 the product went through continuous membrane material testing, diffusion performance improvement, structural revision and field testing with real users. After the design matured in 2010 it has been exported to Southeast Asia in volume, with repeat orders from overseas customers.',
    ],
    features: [
      {
        titleZh: '高氧氣傳遞效率',
        titleEn: 'High oxygen transfer efficiency',
        bodyZh: 'EPDM 膜片均勻配置大量氣孔，曝氣時可形成約 1–3 mm 的細小氣泡，提高氣液接觸面積與氧氣傳遞效率。',
        bodyEn: 'A large number of evenly distributed perforations on the EPDM membrane form fine bubbles of roughly 1–3 mm, increasing the gas–liquid contact area and oxygen transfer efficiency.',
      },
      {
        titleZh: '節能',
        titleEn: 'Energy saving',
        bodyZh: '透過提高氧氣傳遞效率降低曝氣所需空氣量，有助降低鼓風設備能耗。',
        bodyEn: 'Higher oxygen transfer efficiency reduces the air volume required for aeration, which lowers blower energy consumption.',
      },
      {
        titleZh: '防止逆流',
        titleEn: 'Backflow prevention',
        bodyZh: '雙膜片式散氣盤包含逆止設計，停止供氣時可降低污水逆流進入配管的風險。',
        bodyEn: 'The dual-membrane version includes a non-return design that reduces the risk of wastewater flowing back into the air piping when the air supply stops.',
      },
      {
        titleZh: '使用壽命',
        titleEn: 'Service life',
        bodyZh: 'EPDM 膜片具彈性、抗變形能力與較低壓損；膜片採用成型製程，厚度較為均勻。',
        bodyEn: 'The EPDM membrane offers elasticity, resistance to deformation and low pressure loss. A moulded production process keeps the membrane thickness uniform.',
      },
    ],
    specList: [
      { labelZh: '膜片材質', labelEn: 'Membrane material', valueZh: 'EPDM（可依需求選用其他膜片材料）', valueEn: 'EPDM (other membrane materials available on request)' },
      { labelZh: '氣泡尺寸', labelEn: 'Bubble size', valueZh: '約 1–3 mm', valueEn: 'Approx. 1–3 mm' },
      { labelZh: '散氣盤型式', labelEn: 'Diffuser type', valueZh: '單膜片式 / 雙膜片式（含逆止設計）', valueEn: 'Single membrane / dual membrane (with non-return design)' },
      // TODO 以下欄位請依原廠型錄填入實際數值
      { labelZh: '散氣盤直徑', labelEn: 'Disc diameter', valueZh: '請洽詢', valueEn: 'Please enquire' },
      { labelZh: '單體風量', labelEn: 'Air flow per unit', valueZh: '請洽詢', valueEn: 'Please enquire' },
      { labelZh: '氧氣傳遞效率', labelEn: 'Oxygen transfer efficiency', valueZh: '請洽詢', valueEn: 'Please enquire' },
      { labelZh: '壓力損失', labelEn: 'Pressure loss', valueZh: '請洽詢', valueEn: 'Please enquire' },
      { labelZh: '連接方式', labelEn: 'Connection type', valueZh: '請洽詢', valueEn: 'Please enquire' },
      { labelZh: '操作溫度', labelEn: 'Operating temperature', valueZh: '請洽詢', valueEn: 'Please enquire' },
    ],
    specTable: null,
    applicationsZh: [
      '都市污水處理廠曝氣池',
      '工業廢水處理曝氣系統',
      '活性污泥法生物處理槽',
      '調節池、曝氣沉砂池',
      '既有曝氣系統汰換與效率改善',
    ],
    applicationsEn: [
      'Aeration tanks in municipal wastewater treatment plants',
      'Aeration systems for industrial wastewater treatment',
      'Activated sludge biological treatment tanks',
      'Equalisation basins and aerated grit chambers',
      'Retrofit and efficiency upgrade of existing aeration systems',
    ],
    installation: [],
    files: [
      {
        titleZh: '細氣泡散氣盤產品型錄',
        titleEn: 'Fine Bubble Disc Diffuser Catalogue',
        path: 'downloads/fine-bubble-disc-diffuser.pdf',
        language: 'multi',
        version: '',
        size: '',
        date: '',
        available: false, // 將 PDF 放入 /downloads 後改為 true
      },
    ],
    seoTitleZh: '細氣泡散氣盤 | EPDM 膜片散氣盤',
    seoTitleEn: 'Fine Bubble Disc Diffuser | EPDM Membrane Diffuser',
    seoDescZh: '九譽自行研發生產的 EPDM 細氣泡散氣盤，氣泡約 1–3 mm，具高氧氣傳遞效率、節能與雙膜片逆止設計，適用污水處理曝氣池。',
    seoDescEn: 'EPDM fine bubble disc diffuser developed and produced by Fine Reputation. 1–3 mm bubbles, high oxygen transfer efficiency, energy saving and a dual-membrane non-return design.',
  },

  /* ---------------------------------------------------------------- 攪拌 */
  {
    slug: 'submersible-mixer',
    category: 'mixing',
    status: 'active',
    featured: true,
    sortOrder: 20,
    nameZh: '沉水攪拌機',
    nameEn: 'Submersible Mixer',
    brand: '九譽 Fine Reputation',
    model: 'PJ / PJM 系列',
    models: ['PJ 系列', 'PJM 系列'],
    cover: 'assets/img/product-mixer.svg',
    gallery: [
      'assets/img/product-mixer.svg',
      'assets/img/product-mixer-2.svg',
    ],
    shortZh: 'PJ / PJM 系列沉水攪拌機，適用於污水處理系統的水體與污泥攪拌、防止沉澱、污水均質與水流循環，並可依現場條件選擇安裝方式。',
    shortEn: 'PJ / PJM series submersible mixers for liquid and sludge agitation, sedimentation prevention, homogenisation and flow circulation, with installation options to suit site conditions.',
    descZh: [
      '沉水攪拌機適用於污水處理系統中的水體攪拌、污泥攪拌、防止沉澱、污水均質與水流循環，是生物處理槽、調節池與污泥儲槽常見的設備。',
      '產品具有不同馬力、轉速、葉輪直徑與安裝方式，可依使用環境與槽體條件選配；特殊現場條件亦可依需求設計安裝方式。',
    ],
    descEn: [
      'Submersible mixers are used in wastewater treatment systems for liquid agitation, sludge agitation, sedimentation prevention, homogenisation and flow circulation — common duties in biological tanks, equalisation basins and sludge holding tanks.',
      'The range covers different power ratings, speeds, impeller diameters and mounting arrangements, selected according to the tank and site conditions. Special installation arrangements can be designed on request.',
    ],
    features: [
      {
        titleZh: '型號涵蓋範圍廣',
        titleEn: 'Wide model coverage',
        bodyZh: 'PJ 與 PJM 系列提供不同功率、極數、葉輪直徑與轉速組合，可依槽體尺寸與攪拌需求選型。',
        bodyEn: 'The PJ and PJM series cover a range of power ratings, pole numbers, impeller diameters and speeds to match tank size and mixing requirements.',
      },
      {
        titleZh: '防止污泥沉澱',
        titleEn: 'Prevents sludge settling',
        bodyZh: '持續的水流循環可避免懸浮固體沉澱堆積，維持槽內濃度均勻。',
        bodyEn: 'Continuous flow circulation prevents suspended solids from settling and keeps concentration uniform inside the tank.',
      },
      {
        titleZh: '沉水式設計',
        titleEn: 'Submersible design',
        bodyZh: '整機沉入水中運轉，不需另設機房空間，運轉噪音低。',
        bodyEn: 'The complete unit operates submerged — no separate machine room is required and running noise is low.',
      },
      {
        titleZh: '安裝方式可選',
        titleEn: 'Flexible installation',
        bodyZh: '提供多種安裝方式，可依池型、水深與維修條件選擇，並可依使用者需求進行特殊設計。',
        bodyEn: 'Several mounting arrangements are available to suit tank geometry, water depth and maintenance access, with custom designs available on request.',
      },
    ],
    specList: [
      { labelZh: '產品系列', labelEn: 'Series', valueZh: 'PJ 系列 / PJM 系列', valueEn: 'PJ series / PJM series' },
      { labelZh: '型號編碼', labelEn: 'Model code', valueZh: 'PJ〔功率 kW〕/〔極數〕-〔葉輪直徑 mm〕-〔轉速 rpm〕', valueEn: 'PJ[power kW]/[poles]-[impeller Ø mm]-[speed rpm]' },
      { labelZh: '安裝方式', labelEn: 'Installation', valueZh: '共 4 種標準安裝方式，另可特殊設計', valueEn: '4 standard arrangements, custom design available' },
      { labelZh: '適用', labelEn: 'Duty', valueZh: '水體攪拌、污泥攪拌、防止沉澱、污水均質、水流循環', valueEn: 'Liquid mixing, sludge mixing, anti-sedimentation, homogenisation, circulation' },
    ],
    /* 功率／極數／葉輪直徑／轉速 由型號編碼對應；推力與重量請依原廠型錄補入（TODO） */
    specTable: {
      captionZh: '規格依原廠型錄，下表為 PJ 系列常見型號；PJM 系列型號請來信索取完整型錄。',
      captionEn: 'PJ series common models. Please request the full catalogue for the complete PJM series list.',
      columns: [
        { zh: '型號', en: 'Model' },
        { zh: '功率 (kW)', en: 'Power (kW)' },
        { zh: '極數', en: 'Poles' },
        { zh: '葉輪直徑 (mm)', en: 'Impeller Ø (mm)' },
        { zh: '轉速 (rpm)', en: 'Speed (rpm)' },
        { zh: '推力 (N)', en: 'Thrust (N)' },
        { zh: '重量 (kg)', en: 'Weight (kg)' },
      ],
      rows: [
        ['PJ0.37/6-220-980', '0.37', '6P', '220', '980', '—', '—'],
        ['PJ0.55/4-220-1450', '0.55', '4P', '220', '1450', '—', '—'],
        ['PJ0.85/8-260-740', '0.85', '8P', '260', '740', '—', '—'],
        ['PJ1.5/6-260-980', '1.5', '6P', '260', '980', '—', '—'],
        ['PJ2.2/8-400-740', '2.2', '8P', '400', '740', '—', '—'],
        ['PJ4/6-320-980', '4.0', '6P', '320', '980', '—', '—'],
      ],
    },
    applicationsZh: [
      '生物處理槽（曝氣槽、缺氧槽、厭氧槽）',
      '污水調節池、均質池',
      '污泥儲存槽、濃縮槽',
      '工業廢水處理系統',
      '需防止固體沉澱之水池',
    ],
    applicationsEn: [
      'Biological treatment tanks (aerobic, anoxic, anaerobic)',
      'Equalisation and homogenisation basins',
      'Sludge holding and thickening tanks',
      'Industrial wastewater treatment systems',
      'Any basin where solids settling must be prevented',
    ],
    installation: [
      {
        titleZh: '安裝方式 1：導桿升降式',
        titleEn: 'Arrangement 1: Guide rail lifting',
        bodyZh: '沿導桿升降定位，不需放空池水即可吊出維修，適用深槽與需定期保養的場合。',
        bodyEn: 'The mixer is raised and lowered along a guide rail, allowing removal for maintenance without emptying the tank. Suitable for deep tanks and regular servicing.',
        image: 'assets/img/install-1.svg',
      },
      {
        titleZh: '安裝方式 2：底座固定式',
        titleEn: 'Arrangement 2: Floor mounted base',
        bodyZh: '固定於池底基座，角度固定後運轉穩定，適用水深較淺且攪拌方向固定的池型。',
        bodyEn: 'Fixed to a base on the tank floor. Once the angle is set, operation is stable — suitable for shallower tanks with a fixed mixing direction.',
        image: 'assets/img/install-2.svg',
      },
      {
        titleZh: '安裝方式 3：牆面支架式',
        titleEn: 'Arrangement 3: Wall bracket',
        bodyZh: '以支架固定於池壁，可調整水平與俯仰角度，便於控制池內流場方向。',
        bodyEn: 'Mounted on a wall bracket with adjustable horizontal and tilt angles, making the flow pattern inside the tank easier to control.',
        image: 'assets/img/install-3.svg',
      },
      {
        titleZh: '安裝方式 4：特殊設計安裝',
        titleEn: 'Arrangement 4: Custom design',
        bodyZh: '針對特殊池型、既有結構或改建工程，可依使用者現場條件與需求設計專屬安裝方式。',
        bodyEn: 'For unusual tank geometries, existing structures or retrofit projects, a dedicated mounting arrangement can be designed to suit the site.',
        image: 'assets/img/install-4.svg',
      },
    ],
    files: [
      {
        titleZh: '沉水攪拌機產品型錄（PJ / PJM 系列）',
        titleEn: 'Submersible Mixer Catalogue (PJ / PJM series)',
        path: 'downloads/submersible-mixer.pdf',
        language: 'multi',
        version: '',
        size: '',
        date: '',
        available: false,
      },
    ],
    seoTitleZh: '沉水攪拌機 PJ / PJM 系列 | 污水池攪拌設備',
    seoTitleEn: 'Submersible Mixer PJ / PJM Series | Wastewater Mixing',
    seoDescZh: 'PJ / PJM 系列沉水攪拌機，適用污水處理水體攪拌、污泥攪拌、防止沉澱與水流循環，提供多種功率、葉輪直徑與 4 種安裝方式。',
    seoDescEn: 'PJ / PJM series submersible mixers for wastewater agitation, sludge mixing, anti-sedimentation and flow circulation. Multiple power ratings, impeller sizes and four installation arrangements.',
  },

  /* ---------------------------------------------------------------- 鼓風 */
  {
    slug: 'centrifugal-blower',
    category: 'blower',
    status: 'active',
    featured: true,
    sortOrder: 30,
    nameZh: '離心式鼓風機／抽風機',
    nameEn: 'Centrifugal Blower & Exhauster',
    brand: 'Hoffman & Lamson',
    model: '',
    models: ['Centrifugal Blower', 'Exhauster'],
    cover: 'assets/img/product-blower.svg',
    gallery: ['assets/img/product-blower.svg'],
    shortZh: '九譽代理 Hoffman & Lamson 離心式鼓風機與抽風設備，適用於污水處理曝氣供氣及各類工業鼓風、抽風系統。',
    shortEn: 'Hoffman & Lamson centrifugal blowers and exhausters supplied by Fine Reputation — for wastewater aeration air supply and industrial air handling systems.',
    descZh: [
      '九譽自成立初期即引進歐美工業先進國家的水處理設備與相關產品，其中包含 Hoffman 與 Lamson 品牌的離心式鼓風機與抽風設備。',
      '此類產品以機械結構、材料、製造品質為基礎，強調長期運轉的耐用性、穩定性與效率，適用於污水處理廠曝氣供氣，以及各類工業鼓風與抽風應用。',
    ],
    descEn: [
      'Since its early years Fine Reputation has imported water treatment equipment from Europe and the United States, including Hoffman and Lamson centrifugal blowers and exhausters.',
      'These products are built around mechanical structure, materials and manufacturing quality, with the emphasis on durability, stability and efficiency in long-term operation — for aeration air supply in treatment plants as well as general industrial blowing and exhausting duties.',
    ],
    features: [
      {
        titleZh: '機械結構與材料',
        titleEn: 'Mechanical structure and materials',
        bodyZh: '原廠以扎實的機械結構設計與材料選用為產品基礎，確保長期運轉下的結構穩定。',
        bodyEn: 'Solid mechanical design and material selection form the basis of the product, keeping the structure stable over long service periods.',
      },
      {
        titleZh: '製造品質',
        titleEn: 'Manufacturing quality',
        bodyZh: 'Hoffman 與 Lamson 為歐美工業品牌，具備成熟的製造與品質管理流程。',
        bodyEn: 'Hoffman and Lamson are established industrial brands with mature manufacturing and quality management processes.',
      },
      {
        titleZh: '耐用性與穩定性',
        titleEn: 'Durability and stability',
        bodyZh: '適合 24 小時連續運轉的污水處理與工業製程環境。',
        bodyEn: 'Suited to the continuous 24-hour duty found in wastewater treatment and industrial process environments.',
      },
      {
        titleZh: '運轉效率',
        titleEn: 'Operating efficiency',
        bodyZh: '離心式結構於設計工作點具良好效率，有助降低長期用電成本。',
        bodyEn: 'The centrifugal design offers good efficiency at its duty point, helping reduce long-term electricity cost.',
      },
    ],
    specList: [
      { labelZh: '品牌', labelEn: 'Brand', valueZh: 'Hoffman / Lamson', valueEn: 'Hoffman / Lamson' },
      { labelZh: '產品類型', labelEn: 'Product type', valueZh: '離心式鼓風機（Centrifugal Blower）、抽風機（Exhauster）', valueEn: 'Centrifugal Blower, Exhauster' },
      { labelZh: '應用', labelEn: 'Application', valueZh: '污水處理曝氣供氣、工業鼓風／抽風系統', valueEn: 'Wastewater aeration air supply, industrial blowing / exhausting' },
      // TODO 風量、風壓、馬達功率等請依原廠型錄與選型表補入
      { labelZh: '風量／風壓', labelEn: 'Air flow / pressure', valueZh: '依機型與選型，請洽詢', valueEn: 'Depends on model selection — please enquire' },
      { labelZh: '馬達功率', labelEn: 'Motor power', valueZh: '依機型與選型，請洽詢', valueEn: 'Depends on model selection — please enquire' },
    ],
    specTable: null,
    applicationsZh: [
      '污水處理廠曝氣池供氣',
      '工業製程鼓風供氣',
      '氣體輸送與抽風系統',
      '集塵、通風設備',
    ],
    applicationsEn: [
      'Aeration air supply for wastewater treatment plants',
      'Process air supply in industrial plants',
      'Gas conveying and exhaust systems',
      'Dust collection and ventilation systems',
    ],
    installation: [],
    files: [
      {
        titleZh: 'Hoffman & Lamson 離心式鼓風機型錄',
        titleEn: 'Hoffman & Lamson Centrifugal Blower Catalogue',
        path: 'downloads/hoffman-lamson-centrifugal-blower.pdf',
        language: 'en',
        version: '',
        size: '',
        date: '',
        available: false,
      },
    ],
    seoTitleZh: 'Hoffman & Lamson 離心式鼓風機 | 工業鼓風抽風設備',
    seoTitleEn: 'Hoffman & Lamson Centrifugal Blower & Exhauster',
    seoDescZh: '九譽提供 Hoffman & Lamson 離心式鼓風機與抽風設備，強調機械結構、製造品質、耐用性與運轉效率，適用污水處理曝氣與工業鼓風系統。',
    seoDescEn: 'Hoffman & Lamson centrifugal blowers and exhausters from Fine Reputation — mechanical quality, durability and operating efficiency for aeration and industrial air systems.',
  },

  /* ---------------------------------------------------------------- 污泥 */
  {
    slug: 'sludge-dewatering-equipment',
    category: 'sludge',
    status: 'active',
    featured: false,
    sortOrder: 40,
    nameZh: '污泥脫水機',
    nameEn: 'Sludge Dewatering Equipment',
    brand: '',
    model: '',
    models: [],
    cover: 'assets/img/product-sludge.svg',
    gallery: ['assets/img/product-sludge.svg'],
    shortZh: '污泥脫水設備為九譽自 1996 年成立初期即提供的產品之一，用於降低污泥含水率、減少污泥體積與後續清運處理成本。',
    shortEn: 'Sludge dewatering equipment has been part of the Fine Reputation product range since the company was founded in 1996 — reducing sludge water content, volume and disposal cost.',
    descZh: [
      '九譽成立初期即提供台灣製造之污泥脫水機給國內工程公司，並將相關產品出口至東南亞市場，累積了污水處理設備的實務經驗。',
      '污泥脫水設備的選型需依污泥種類、進料濃度、處理量與要求含水率決定，歡迎提供現場條件與污泥性質，由本公司協助評估。',
    ],
    descEn: [
      'In its early years Fine Reputation supplied Taiwan-made sludge dewatering machines to domestic engineering companies and exported them to Southeast Asia, building up practical experience in wastewater treatment equipment.',
      'Selection depends on sludge type, feed concentration, throughput and the required cake dryness. Please send us your site conditions and sludge characteristics and we will help evaluate a suitable configuration.',
    ],
    features: [
      {
        titleZh: '降低污泥體積',
        titleEn: 'Reduced sludge volume',
        bodyZh: '脫水後污泥含水率下降，可明顯減少污泥體積與清運次數。',
        bodyEn: 'Lower water content after dewatering significantly reduces sludge volume and haulage frequency.',
      },
      {
        titleZh: '降低處理成本',
        titleEn: 'Lower disposal cost',
        bodyZh: '污泥減量可直接降低後續委外清運與處理費用。',
        bodyEn: 'Volume reduction directly lowers outsourced haulage and disposal charges.',
      },
      {
        titleZh: '依污泥性質選型',
        titleEn: 'Selection by sludge type',
        bodyZh: '依污泥種類、進料濃度與處理量評估適合的脫水方式與機型。',
        bodyEn: 'The dewatering method and model are evaluated against sludge type, feed concentration and throughput.',
      },
    ],
    specList: [
      // TODO 現行銷售機型確認後，補入處理能力、含水率、馬達功率、尺寸與重量
      { labelZh: '處理能力', labelEn: 'Capacity', valueZh: '依機型，請洽詢', valueEn: 'Depends on model — please enquire' },
      { labelZh: '適用污泥種類', labelEn: 'Sludge type', valueZh: '生物污泥、化學污泥等，請提供污泥性質', valueEn: 'Biological, chemical sludge and others — please advise characteristics' },
      { labelZh: '脫水後含水率', labelEn: 'Cake water content', valueZh: '依污泥性質與機型，請洽詢', valueEn: 'Depends on sludge and model — please enquire' },
      { labelZh: '馬達功率／尺寸／重量', labelEn: 'Motor / dimensions / weight', valueZh: '依機型，請洽詢', valueEn: 'Depends on model — please enquire' },
    ],
    specTable: null,
    applicationsZh: [
      '都市污水處理廠污泥處理',
      '工業廢水處理廠污泥減量',
      '食品、化工等製程污泥處理',
    ],
    applicationsEn: [
      'Sludge handling in municipal wastewater treatment plants',
      'Sludge reduction in industrial wastewater plants',
      'Process sludge from food, chemical and similar industries',
    ],
    installation: [],
    files: [],
    seoTitleZh: '污泥脫水機 | 污泥處理設備',
    seoTitleEn: 'Sludge Dewatering Equipment',
    seoDescZh: '九譽自 1996 年起提供污泥脫水設備，協助降低污泥含水率與體積，減少後續清運與處理成本；歡迎提供污泥性質與處理量洽詢選型。',
    seoDescEn: 'Sludge dewatering equipment supplied by Fine Reputation since 1996 — reducing sludge water content, volume and disposal cost. Contact us with your sludge data for selection support.',
  },
];
