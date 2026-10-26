(() => {
  "use strict";

  const STORAGE_KEY = "shanyin-tea-demo-v1";
  const view = document.getElementById("view");
  const siteHeader = document.getElementById("siteHeader");
  const authLayer = document.getElementById("authLayer");
  const authForm = document.getElementById("authForm");
  const authError = document.getElementById("authError");
  const authSubmitText = document.getElementById("authSubmitText");
  const accountMenu = document.getElementById("accountMenu");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const searchOverlay = document.getElementById("searchOverlay");
  const globalSearch = document.getElementById("globalSearch");
  const searchResults = document.getElementById("searchResults");
  const modalLayer = document.getElementById("modalLayer");
  const modalContent = document.getElementById("modalContent");
  const toast = document.getElementById("toast");

  const assets = {
    valley: "./assets/user-tea-valley.jpg",
    landscape1: "./assets/tea-landscape-1.jpg",
    landscape2: "./assets/tea-landscape-2.jpg",
    landscape3: "./assets/tea-landscape-3.jpg",
    landscape4: "./assets/tea-landscape-4.jpg",
    ceremony1: "./assets/tea-ceremony-1.jpg",
    ceremony2: "./assets/tea-ceremony-2.jpg",
    ceremony3: "./assets/tea-ceremony-3.jpg",
    ceremony4: "./assets/tea-ceremony-4.jpg",
    ceremony5: "./assets/tea-ceremony-5.jpg",
    culturePick: "./assets/tea-culture-pick.webp",
    cultureWither: "./assets/tea-culture-wither.webp",
    cultureFixation: "./assets/tea-culture-fixation.webp",
    cultureRolling: "./assets/tea-culture-rolling.jpg",
    cultureRoasting: "./assets/tea-culture-roasting.webp",
    cultureFinished: "./assets/tea-culture-finished.jpg",
    homeSixRealms: "./assets/home-six-realms.webp",
    wuyiNight: "./assets/event-wuyi-night.png",
    jingmaiCommunity: "./assets/event-jingmai-community.png",
    teaSound: "./assets/event-tea-sound.png",
    wildWhiteTea: "./assets/event-wild-white-tea.png"
  };

  const defaultState = {
    session: null,
    favorites: [],
    joinedEvents: [],
    bookings: [],
    selectedRegion: "jingmai",
    teaType: "全部"
  };

  let state = loadState();
  let toastTimer = null;
  let authMode = "login";
  let activeCommunityCity = "全部";
  let activeCommunityType = "全部";
  let activeTeaType = "全部";
  let activeStage = 0;
  let selectedRegionId = state.selectedRegion || "jingmai";
  let selectedBookingSlot = "14:00";

  const stages = [
    {
      key: "pick",
      number: "01",
      name: "采青",
      en: "PLUCKING",
      title: "与春天约定一个清晨",
      description: "茶树新梢在晨露未散时最显鲜活。采茶人依标准取一芽一叶或一芽二三叶，手法轻、动作快，尽量不伤及叶脉。",
      image: assets.culturePick,
      season: "清明前后",
      craft: "提手采 · 一芽一叶",
      focus: "嫩度、匀净与新鲜度"
    },
    {
      key: "wither",
      number: "02",
      name: "萎凋",
      en: "WITHERING",
      title: "让风带走多余的水分",
      description: "鲜叶薄摊于竹筛，在自然风或微弱热风中缓慢失水。叶质由脆转柔，青草气渐退，花香与果香开始显形。",
      image: assets.cultureWither,
      season: "4—10 小时",
      craft: "日光萎凋 · 室内萎凋",
      focus: "温度、湿度与摊叶厚度"
    },
    {
      key: "kill-green",
      number: "03",
      name: "杀青",
      en: "FIXATION",
      title: "以热度定格一片叶的绿",
      description: "高温迅速钝化酶活性，锁住茶叶的色泽与清鲜。锅温、投叶量与翻炒节奏，是一位制茶师经验最直接的表达。",
      image: assets.cultureFixation,
      season: "数分钟之间",
      craft: "炒青 · 蒸青 · 烘青",
      focus: "温度、时间与叶色"
    },
    {
      key: "roll",
      number: "04",
      name: "揉捻",
      en: "ROLLING",
      title: "让香气在掌心里聚拢",
      description: "适度的压力使叶片细胞壁轻微破损，茶汁附着叶面，为后续冲泡的滋味与香气建立基础。轻、重、缓、急皆有尺度。",
      image: assets.cultureRolling,
      season: "15—45 分钟",
      craft: "手工揉捻 · 机械揉捻",
      focus: "条索、叶形与茶汁"
    },
    {
      key: "roast",
      number: "05",
      name: "焙火",
      en: "ROASTING",
      title: "用时间慢慢收住锋芒",
      description: "炭火或电焙以较低温度分阶段进行，带走杂味、稳定品质。轻焙保留花香，重焙带来熟果与焦糖气息。",
      image: assets.cultureRoasting,
      season: "数小时至数月",
      craft: "炭焙 · 电焙 · 足火",
      focus: "火功、退火与陈化"
    },
    {
      key: "cup",
      number: "06",
      name: "成茶",
      en: "TEA",
      title: "在山河之外，再次相遇",
      description: "经过拣剔、筛分与静置，茶叶抵达茶席。投茶、注水、出汤，每一次冲泡，都是对山场与工艺的重新阅读。",
      image: assets.cultureFinished,
      season: "从此刻开始",
      craft: "择器 · 候汤 · 冲泡",
      focus: "香气、汤感与回甘"
    }
  ];

  const teaTypes = ["绿茶", "白茶", "黄茶", "乌龙茶", "红茶", "黑茶", "普洱茶", "花茶"];
  const teaTypeKeys = {
    "绿茶": "green",
    "白茶": "white",
    "黄茶": "yellow",
    "乌龙茶": "oolong",
    "红茶": "red",
    "黑茶": "dark",
    "普洱茶": "puer",
    "花茶": "flower"
  };
  const teaTypeMarks = {
    "绿茶": "鲜",
    "白茶": "白",
    "黄茶": "黄",
    "乌龙茶": "香",
    "红茶": "暖",
    "黑茶": "陈",
    "普洱茶": "山",
    "花茶": "花"
  };

  const regions = [
    {
      id: "jingmai",
      name: "景迈山",
      province: "云南 · 普洱",
      x: 275,
      y: 328,
      types: ["普洱茶", "红茶"],
      description: "古茶林与布朗族村寨相伴而生，林下茶种植方式保留了茶树与森林共生的时间尺度。",
      teas: ["景迈古树生普", "林下晒红", "布朗山熟普"],
      altitude: "1,200—1,600",
      rainfall: "1,650",
      craft: "林下种植",
      flavor: "兰香 · 蜜甜 · 山野气"
    },
    {
      id: "hangzhou",
      name: "西湖龙井",
      province: "浙江 · 杭州",
      x: 481,
      y: 247,
      types: ["绿茶"],
      description: "西湖群山之间，以狮峰、龙井、云栖、虎跑、梅家坞为核心。扁平挺直的茶形与清鲜豆香是它的辨识度。",
      teas: ["狮峰龙井", "梅家坞龙井", "九曲红梅"],
      altitude: "100—420",
      rainfall: "1,390",
      craft: "手工辉锅",
      flavor: "嫩豆香 · 栗香 · 清甘"
    },
    {
      id: "wuyi",
      name: "武夷山",
      province: "福建 · 南平",
      x: 457,
      y: 273,
      types: ["乌龙茶", "红茶"],
      description: "丹霞岩壁与溪谷交错，岩茶在有限的山场里生长。焙火之后，花香、果香与岩骨汤感层层展开。",
      teas: ["慧苑肉桂", "牛栏坑水仙", "正山小种"],
      altitude: "200—800",
      rainfall: "1,900",
      craft: "岩茶炭焙",
      flavor: "桂皮 · 熟果 · 岩韵"
    },
    {
      id: "fenghuang",
      name: "凤凰单丛",
      province: "广东 · 潮州",
      x: 446,
      y: 316,
      types: ["乌龙茶"],
      description: "凤凰山高海拔茶园孕育出丰富香型。单株采制、香型细分，让每一款单丛都有独特的辨识度。",
      teas: ["蜜兰香单丛", "鸭屎香单丛", "芝兰香单丛"],
      altitude: "600—1,300",
      rainfall: "2,100",
      craft: "单株采制",
      flavor: "蜜兰 · 兰花香 · 高山韵"
    },
    {
      id: "anxi",
      name: "安溪铁观音",
      province: "福建 · 泉州",
      x: 460,
      y: 306,
      types: ["乌龙茶"],
      description: "安溪山地土壤与温润气候成就铁观音的兰花香与观音韵。清香、浓香、陈香构成不同时间下的风味表达。",
      teas: ["清香铁观音", "浓香铁观音", "陈香铁观音"],
      altitude: "500—1,000",
      rainfall: "1,780",
      craft: "包揉成型",
      flavor: "兰花香 · 奶香 · 观音韵"
    },
    {
      id: "fuding",
      name: "太姥山",
      province: "福建 · 宁德",
      x: 485,
      y: 275,
      types: ["白茶"],
      description: "白茶核心产区之一，以自然萎凋和低温干燥保留芽叶的细嫩与清甜。老白茶则随时间长出枣香与药香。",
      teas: ["白毫银针", "荒野牡丹", "陈年寿眉"],
      altitude: "300—900",
      rainfall: "1,660",
      craft: "自然萎凋",
      flavor: "毫香 · 花香 · 枣甜"
    },
    {
      id: "huangshan",
      name: "黄山茶区",
      province: "安徽 · 黄山",
      x: 461,
      y: 251,
      types: ["绿茶", "红茶"],
      description: "黄山云雾、花岗岩山地与松林构成茶叶生长的底色。黄山毛峰清雅，祁门红茶则以花果香见长。",
      teas: ["黄山毛峰", "祁门红茶", "太平猴魁"],
      altitude: "300—1,800",
      rainfall: "1,700",
      craft: "烘青 · 工夫红茶",
      flavor: "兰花香 · 果香 · 蜜甜"
    },
    {
      id: "yaan",
      name: "蒙顶雅安",
      province: "四川 · 雅安",
      x: 306,
      y: 250,
      types: ["绿茶", "黑茶"],
      description: "蒙顶山常年多雨多雾，是四川传统名茶产区；雅安藏茶则代表边销黑茶的长期发酵与运输传统。",
      teas: ["蒙顶甘露", "蒙顶石花", "雅安藏茶"],
      altitude: "800—1,450",
      rainfall: "1,800",
      craft: "卷曲烘青 · 渥堆陈化",
      flavor: "嫩香 · 清甜 · 木质陈香"
    },
    {
      id: "liubao",
      name: "六堡茶区",
      province: "广西 · 梧州",
      x: 391,
      y: 313,
      types: ["黑茶"],
      description: "六堡茶以渥堆、陈化和特有的仓储方式形成红浓汤色，常见槟榔香、木香与温润的陈化层次。",
      teas: ["六堡散茶", "六堡茶饼", "陈年六堡"],
      altitude: "100—600",
      rainfall: "1,500",
      craft: "渥堆 · 陈化",
      flavor: "槟榔香 · 木香 · 陈醇"
    },
    {
      id: "junshan",
      name: "君山茶区",
      province: "湖南 · 岳阳",
      x: 409,
      y: 256,
      types: ["黄茶"],
      description: "洞庭湖中的君山岛以君山银针闻名。闷黄工艺让嫩芽少一分青气，多一分清甜与柔和。",
      teas: ["君山银针", "霍山黄芽", "蒙顶黄芽"],
      altitude: "30—800",
      rainfall: "1,400",
      craft: "闷黄 · 轻焙",
      flavor: "嫩甜 · 熟栗 · 清花香"
    },
    {
      id: "xinyang",
      name: "信阳茶区",
      province: "河南 · 信阳",
      x: 419,
      y: 227,
      types: ["绿茶"],
      description: "淮河上游的丘陵与山地为茶树提供较长的生长期。信阳毛尖条索细圆，以嫩栗香和鲜爽感著称。",
      teas: ["信阳毛尖", "信阳红", "固始云雾"],
      altitude: "300—800",
      rainfall: "1,100",
      craft: "生锅 · 熟锅",
      flavor: "嫩栗香 · 鲜醇 · 回甘"
    },
    {
      id: "enshi",
      name: "恩施茶区",
      province: "湖北 · 恩施",
      x: 372,
      y: 247,
      types: ["绿茶"],
      description: "武陵山区多云雾、富硒土壤与垂直气候，共同赋予恩施玉露清鲜、细嫩和明亮的风格。",
      teas: ["恩施玉露", "利川红", "伍家台贡茶"],
      altitude: "500—1,200",
      rainfall: "1,400",
      craft: "蒸青 · 整形",
      flavor: "海苔香 · 清鲜 · 甘润"
    },
    {
      id: "duyun",
      name: "都匀茶区",
      province: "贵州 · 黔南",
      x: 352,
      y: 289,
      types: ["绿茶"],
      description: "苗岭山地云雾充足，都匀毛尖以细卷的条索、清嫩香气和柔和汤感构成贵州绿茶的代表风格。",
      teas: ["都匀毛尖", "湄潭翠芽", "遵义红"],
      altitude: "800—1,400",
      rainfall: "1,300",
      craft: "杀青 · 揉捻 · 搓团",
      flavor: "嫩香 · 粟香 · 鲜甜"
    },
    {
      id: "fuzhou",
      name: "福州花茶",
      province: "福建 · 福州",
      x: 481,
      y: 289,
      types: ["花茶"],
      description: "福州茉莉花茶以茶坯吸收夜间开放的茉莉花香。多次窨制让花香进入茶汤，而不停留在表面。",
      teas: ["茉莉银针", "茉莉大白毫", "茉莉龙珠"],
      altitude: "20—600",
      rainfall: "1,350",
      craft: "窨制 · 通花 · 复火",
      flavor: "茉莉 · 清甜 · 鲜灵"
    },
    {
      id: "nantou",
      name: "南投茶区",
      province: "台湾 · 南投",
      x: 489,
      y: 313,
      types: ["乌龙茶"],
      description: "南投高山茶园昼夜温差明显，冻顶乌龙与高山乌龙以清香、柔顺和清甜回甘展现岛屿山地风土。",
      teas: ["冻顶乌龙", "梨山乌龙", "日月潭红茶"],
      altitude: "600—2,300",
      rainfall: "2,300",
      craft: "轻发酵 · 团揉",
      flavor: "兰花香 · 奶香 · 清甜"
    }
  ];

  const teas = [
    {
      id: "longjing",
      name: "狮峰龙井",
      type: "绿茶",
      origin: "浙江 · 杭州",
      price: 168,
      summary: "嫩豆香与栗香清透，汤感细柔，回甘轻快，是春天的第一封信。",
      tags: ["豆香", "鲜爽", "春茶"],
      temperature: "85℃",
      amount: "3g",
      water: "150ml",
      time: "45s",
      story: "狮峰山场位于西湖群山之间，云雾与漫射光让芽叶保持细嫩。以玻璃杯或薄胎瓷杯冲泡，能看见茶芽在水中舒展。"
    },
    {
      id: "xinyang-maojian",
      name: "信阳毛尖",
      type: "绿茶",
      origin: "河南 · 信阳",
      price: 118,
      summary: "细圆条索带着鲜嫩栗香，入口清爽，回甘收得干净。",
      tags: ["栗香", "鲜爽", "嫩芽"],
      temperature: "80℃",
      amount: "3g",
      water: "150ml",
      time: "40s",
      story: "信阳毛尖讲究细、圆、光、直。水温不宜过高，沿杯壁注水更能保留嫩栗香与清鲜感。"
    },
    {
      id: "rougui",
      name: "慧苑肉桂",
      type: "乌龙茶",
      origin: "福建 · 武夷山",
      price: 238,
      summary: "桂皮辛香与熟果甜交叠，茶汤厚实，尾韵留着清晰的岩骨感。",
      tags: ["岩韵", "肉桂", "焙火"],
      temperature: "100℃",
      amount: "7g",
      water: "110ml",
      time: "12s",
      story: "慧苑坑是武夷岩茶的重要山场。高香与焙火需要时间融合，新茶可稍作退火，再以盖碗快速出汤，感受香气层次。"
    },
    {
      id: "shoumei",
      name: "陈年寿眉",
      type: "白茶",
      origin: "福建 · 福鼎",
      price: 128,
      summary: "枣香、木香与柔甜交织，适合晚间的慢饮，也为茶席留下温度。",
      tags: ["陈香", "枣甜", "温润"],
      temperature: "100℃",
      amount: "5g",
      water: "180ml",
      time: "20s",
      story: "白茶不炒不揉，以自然萎凋与干燥保留时间的痕迹。年份较长的寿眉适合高温冲泡，也可煮饮，香气更加沉稳。"
    },
    {
      id: "baihao-yinzhen",
      name: "白毫银针",
      type: "白茶",
      origin: "福建 · 福鼎",
      price: 288,
      summary: "满披白毫的芽头清甜细润，香气轻，汤感却绵长。",
      tags: ["毫香", "清甜", "芽茶"],
      temperature: "90℃",
      amount: "4g",
      water: "160ml",
      time: "35s",
      story: "白毫银针全由肥壮芽头制成。用稍低水温缓慢润茶，可以更清楚地感受毫香与清甜。"
    },
    {
      id: "junshan-yinzhen",
      name: "君山银针",
      type: "黄茶",
      origin: "湖南 · 岳阳",
      price: 328,
      summary: "轻闷黄带来柔和熟香，嫩芽清甜，汤色明亮。",
      tags: ["嫩甜", "熟栗", "闷黄"],
      temperature: "85℃",
      amount: "3g",
      water: "150ml",
      time: "45s",
      story: "君山银针以芽头肥壮、满披茸毛著称。闷黄是黄茶形成柔和香气与汤感的关键，冲泡时宜轻手快出。"
    },
    {
      id: "dancong",
      name: "蜜兰香单丛",
      type: "乌龙茶",
      origin: "广东 · 潮州",
      price: 198,
      summary: "蜂蜜、兰花与熟果香气高扬，汤感明快，杯底香持久。",
      tags: ["蜜香", "兰香", "高香"],
      temperature: "100℃",
      amount: "6g",
      water: "120ml",
      time: "8s",
      story: "凤凰单丛以单株采制与香型细分闻名。高温快冲能带出清晰的香气，前几泡注意缩短出汤时间，避免苦涩。"
    },
    {
      id: "tieguanyin",
      name: "安溪铁观音",
      type: "乌龙茶",
      origin: "福建 · 泉州",
      price: 158,
      summary: "兰花香气清扬，汤感圆润，回甘里带一点清甜奶香。",
      tags: ["兰花香", "观音韵", "清醇"],
      temperature: "95℃",
      amount: "6g",
      water: "110ml",
      time: "10s",
      story: "铁观音常见清香与浓香两种表达。清香型宜快出汤，减少闷泡，才能保持兰花香与轻快回甘。"
    },
    {
      id: "zhengshan",
      name: "正山小种",
      type: "红茶",
      origin: "福建 · 武夷山",
      price: 168,
      summary: "松烟、桂圆与花果甜香温暖交叠，汤感柔顺。",
      tags: ["松烟", "桂圆香", "温润"],
      temperature: "95℃",
      amount: "4g",
      water: "150ml",
      time: "15s",
      story: "正山小种的核心产区位于武夷山桐木关。传统松烟香需要与茶汤的甜润平衡，不宜只追求浓重烟味。"
    },
    {
      id: "qimen",
      name: "祁门红茶",
      type: "红茶",
      origin: "安徽 · 黄山",
      price: 188,
      summary: "似花似果的祁门香清雅，汤色红亮，滋味细醇。",
      tags: ["祁门香", "花果香", "细醇"],
      temperature: "90℃",
      amount: "4g",
      water: "150ml",
      time: "18s",
      story: "祁门红茶的香气常被形容为花、果、蜜交织。避免沸水久闷，能让细腻香气更完整地留在杯中。"
    },
    {
      id: "liubao",
      name: "陈年六堡",
      type: "黑茶",
      origin: "广西 · 梧州",
      price: 198,
      summary: "陈香、木香与槟榔香层层展开，汤感稠滑而温润。",
      tags: ["槟榔香", "陈醇", "木香"],
      temperature: "100℃",
      amount: "6g",
      water: "150ml",
      time: "15s",
      story: "六堡茶经过渥堆与陈化，仓储环境会显著影响它的香气。醒茶后用沸水快冲，逐渐延长出汤时间。"
    },
    {
      id: "anhua",
      name: "安化茯砖",
      type: "黑茶",
      origin: "湖南 · 益阳",
      price: 138,
      summary: "菌花香、木质香与柔和甜感并存，适合煮饮慢品。",
      tags: ["茯香", "木香", "醇厚"],
      temperature: "100℃",
      amount: "7g",
      water: "220ml",
      time: "20s",
      story: "茯砖茶的“金花”来自特定发酵过程。紧压茶先醒茶，后续可用盖碗冲泡或转入煮饮，体会陈香变化。"
    },
    {
      id: "jasmine",
      name: "福州茉莉银针",
      type: "花茶",
      origin: "福建 · 福州",
      price: 98,
      summary: "鲜灵茉莉香落在清甜茶汤里，轻盈、明净，适合午后独饮。",
      tags: ["茉莉", "清甜", "窨制"],
      temperature: "90℃",
      amount: "4g",
      water: "180ml",
      time: "50s",
      story: "福州茉莉花茶以茶吸花香、花增茶味，窨制次数决定香气的层次。冲泡时不必久闷，让清甜与花香自然展开。"
    },
    {
      id: "puer",
      name: "景迈山生普",
      type: "普洱茶",
      origin: "云南 · 景迈山",
      price: 268,
      summary: "兰香清远，山野气细而长，汤感由轻快渐转柔厚。",
      tags: ["兰香", "山野气", "古树"],
      temperature: "100℃",
      amount: "7g",
      water: "130ml",
      time: "10s",
      story: "景迈山古茶林与森林共生，林下茶保留了丰富生态语境。新茶清新，陈化后更显蜜甜与木香，适合在时间中慢慢记录变化。"
    }
  ];

  const events = [
    {
      id: "wuyi-night",
      title: "武夷岩茶夜席：听一场岩韵",
      city: "南平",
      type: "茶席",
      date: "10月25日 · 19:30",
      seats: "余 4 席",
      price: "¥128",
      image: assets.wuyiNight,
      host: "木山茶室",
      description: "以一泡慧苑肉桂开场，在炭火与夜色之间，感受岩茶从香气到汤感的层层变化。"
    },
    {
      id: "jingmai-walk",
      title: "景迈山共学：走进古茶林",
      city: "普洱",
      type: "山场",
      date: "11月2日 · 08:00",
      seats: "余 8 席",
      price: "¥268",
      image: assets.jingmaiCommunity,
      host: "山隐寻茶队",
      description: "跟随本地向导走进林下古茶林，认识茶树、伴生植物与村寨之间的关系。"
    },
    {
      id: "longjing-brew",
      title: "一杯龙井的春天",
      city: "杭州",
      type: "品鉴",
      date: "10月27日 · 14:00",
      seats: "余 6 席",
      price: "¥98",
      image: assets.landscape3,
      host: "西湖茶事所",
      description: "从狮峰、梅家坞到九曲红梅，比较三款杭州茶在不同温度下的香气与汤感。"
    },
    {
      id: "tea-sound",
      title: "茶与声音：一场安静的相遇",
      city: "上海",
      type: "雅集",
      date: "11月8日 · 15:00",
      seats: "余 12 席",
      price: "¥168",
      image: assets.teaSound,
      host: "听松茶社",
      description: "用一盏老白茶配一段环境声音，把注意力重新放回呼吸、水温与杯沿的触碰。"
    },
    {
      id: "fuding-white",
      title: "荒野白茶品鉴与时间",
      city: "宁德",
      type: "品鉴",
      date: "11月16日 · 10:30",
      seats: "余 5 席",
      price: "¥138",
      image: assets.wildWhiteTea,
      host: "太姥山茶书房",
      description: "对比新白茶与不同年份寿眉，记录香气、汤色与身体感受随时间发生的变化。"
    },
    {
      id: "dancong-lab",
      title: "凤凰单丛香气实验室",
      city: "潮州",
      type: "茶课",
      date: "11月22日 · 19:00",
      seats: "余 3 席",
      price: "¥188",
      image: assets.ceremony2,
      host: "凤凰单丛研习社",
      description: "用闻香、啜茶和记录，建立属于自己的单丛香型坐标。"
    }
  ];

  const articles = [
    {
      id: "one-tea-time",
      title: "从一盏茶读懂东方时间",
      category: "茶事随笔",
      read: "8 分钟",
      image: assets.ceremony2,
      excerpt: "茶的滋味从来不是静止的。水温改变香气，时间改变汤感，器物也在悄然参与。",
      body: [
        "一盏茶里有两种时间。一种是钟表可以计量的时间：水温、浸泡、出汤；另一种是身体感知的时间：香气抵达鼻尖，茶汤滑过舌面，回甘在喉咙后方缓缓展开。",
        "当我们把冲泡拆成几个简单动作，茶的复杂度并不会消失，反而更容易被看见。选择适合的器皿，准备一壶清水，给茶叶留出舒展的空间。",
        "不必急着辨认所有香气。先感受热汽、杯沿的温度和第一口的质地，再记录第二泡、第三泡的细微变化。久而久之，你会拥有自己的茶叶语言。"
      ]
    },
    {
      id: "yancha",
      title: "岩茶为什么讲究“退火”",
      category: "工艺知识",
      read: "6 分钟",
      image: assets.landscape2,
      excerpt: "焙火之后不宜急着喝。时间会带走火气，也会把香气和汤感重新安排。",
      body: [
        "武夷岩茶经过焙火，香气与滋味会在最初的一段时间里显得紧绷。所谓退火，并不是一种加工步骤，而是茶叶在静置中与空气缓慢交换的过程。",
        "轻火茶通常较快恢复，足火茶则需要更长时间。保存环境以干燥、避光、无异味为要，不必频繁开封。",
        "退火的时间没有唯一答案。与其追逐一个标准数字，不如隔几周冲一泡，记录香气从火功走向花果与木质的过程。"
      ]
    },
    {
      id: "mountain",
      title: "山场如何成为一杯茶的底色",
      category: "山场档案",
      read: "9 分钟",
      image: assets.valley,
      excerpt: "海拔、朝向、土壤、云雾与伴生植物共同塑造茶叶，也被称为“风土”。",
      body: [
        "山场不是一个单一的景点，而是一组长期条件。它包含海拔、坡度、土壤、日照与周围的植物群落，也包含一代代茶农与土地相处的方法。",
        "景迈山的林下茶强调茶树与森林共生；西湖龙井的群山提供漫射光；武夷山丹霞地形让茶树在岩隙间生长。它们共同构成了不同茶叶的底色。",
        "记录山场，不是给风味排序，而是理解每一种茶为何成为自己。"
      ]
    },
    {
      id: "beginner",
      title: "新手的第一套茶器，不必很多",
      category: "入门指南",
      read: "5 分钟",
      image: assets.ceremony3,
      excerpt: "一只盖碗、一只公道杯、两只小杯和一把烧水壶，足够开启你的第一场茶事。",
      body: [
        "茶器的作用是服务茶叶，而非制造门槛。盖碗方便观察茶叶舒展和香气变化，公道杯帮助均匀茶汤，小杯则让温度更适口。",
        "材质上可以从薄胎瓷开始，导热稳定、容易清洁，也不容易改变茶味。容量不必太大，100至130毫升的盖碗适合一至三人。",
        "先把手上的茶泡好，再根据习惯逐步添置器物。每一次使用顺手，才是选购的真实理由。"
      ]
    },
    {
      id: "jasmine",
      title: "茉莉花茶的香，是如何“窨”进去的",
      category: "非遗工艺",
      read: "7 分钟",
      image: assets.ceremony4,
      excerpt: "花与茶彼此交换香气，经过多次窨制、通花与干燥，花香最终留在茶里。",
      body: [
        "窨制是茶坯与新鲜茉莉花共同呼吸的过程。花在夜间开放、释放香气，茶叶则吸收水分与花香。",
        "窨制结束后还要完成通花、起花、复火等步骤。高品质花茶追求花香入汤，而不是只在干茶表面停留。",
        "一杯好的茉莉花茶，茶底仍然应该清楚，香气鲜活而不腻。"
      ]
    },
    {
      id: "tea-data",
      title: "把茶喝成一张数据图",
      category: "数字茶事",
      read: "4 分钟",
      image: assets.landscape4,
      excerpt: "记录水温、克数、时间和风味，积累属于你的冲泡数据库。",
      body: [
        "数据不是为了把感受标准化，而是帮助我们回看偏好。相同的茶，在不同水温和时间下会呈现不同的香气与汤感。",
        "记录项目不必复杂：日期、茶样、器皿、水温、投茶量、每泡时间，以及一句最直接的感受。",
        "三周之后回看记录，你会发现自己偏爱的并不只是一个茶种，而是一种具体的呈现方式。"
      ]
    }
  ];

  const searchIndex = [
    { title: "首页", desc: "回到山隐茶事首页", route: "home", icon: "home" },
    { title: "茶之六境", desc: "从采青到成茶的文化与工艺", route: "culture", icon: "leaf" },
    { title: "山河茶图", desc: "探索景迈山、武夷山与西湖龙井", route: "regions", icon: "map" },
    { title: "数据图谱", desc: "六大茶类、风味雷达与产区趋势", route: "audit", icon: "chart" },
    { title: "AI 茶事顾问", desc: "根据场景获得一杯茶的冲泡建议", route: "ai", icon: "spark" },
    { title: "茶友社区", desc: "茶席、山场与品鉴活动", route: "community", icon: "users" },
    { title: "茶集与知识", desc: "精选茶样与冲泡卡片", route: "collection", icon: "cup" },
    { title: "茶席体验", desc: "预约一场线下茶事", route: "experience", icon: "calendar" },
    { title: "我的茶库", desc: "收藏、预约与最近浏览", route: "profile", icon: "user" },
    { title: "关于山隐", desc: "了解山隐茶事的内容准则", route: "about", icon: "mountain" },
    ...regions.map((item) => ({ title: item.name, desc: `${item.province} · ${item.flavor}`, route: "regions", icon: "location", target: item.id })),
    ...teas.map((item) => ({ title: item.name, desc: `${item.type} · ${item.origin}`, route: "collection", icon: "cup" })),
    ...articles.map((item) => ({ title: item.title, desc: `${item.category} · ${item.read}`, route: "articles", icon: "message", target: item.id }))
  ];

  const aiRules = [
    {
      test: /睡|夜|安静|放松|焦躁|晚间/,
      tea: "陈年寿眉",
      temperature: "100℃",
      amount: "5g",
      water: "180ml",
      time: "20s",
      culture: "白茶不炒不揉，自然萎凋，陈化后常显枣香与木质香。",
      note: "晚间更适合少量、淡饮。若你对咖啡因敏感，可缩短浸泡或选择更淡的出汤，并避免在临睡前饮用。"
    },
    {
      test: /冷|暖|胃|冬天|温和|甜/,
      tea: "正山小种",
      temperature: "95℃",
      amount: "4g",
      water: "150ml",
      time: "15s",
      culture: "正山小种以松烟与花果香见长，传统产区位于武夷山桐木关一带。",
      note: "它的甜润与烟香适合慢饮。空腹时建议搭配少量茶点，避免浓茶给身体带来不适。"
    },
    {
      test: /清新|提神|早上|春天|花|清爽/,
      tea: "狮峰龙井",
      temperature: "85℃",
      amount: "3g",
      water: "150ml",
      time: "45s",
      culture: "西湖龙井以扁平挺直的叶形和嫩豆香闻名，明前茶尤为清鲜。",
      note: "不要用持续沸腾的水直接冲嫩芽，先让水面安静下来，再沿杯壁注水，香气会更舒展。"
    },
    {
      test: /岩|浓|烟|焙|肉桂|厚重/,
      tea: "慧苑肉桂",
      temperature: "100℃",
      amount: "7g",
      water: "110ml",
      time: "12s",
      culture: "武夷岩茶讲究山场与火功，肉桂带有辨识度很高的桂皮辛香。",
      note: "第一泡醒茶后快速出汤，随后每泡只做小幅延时，能更完整地感受岩韵。"
    },
    {
      test: /花|香|单丛|甜/,
      tea: "蜜兰香单丛",
      temperature: "100℃",
      amount: "6g",
      water: "120ml",
      time: "8s",
      culture: "凤凰单丛以单株采制和香型细分闻名，蜜兰香兼具蜜甜与兰花香。",
      note: "高香茶前几泡宜快，水温要足够高。闻香时可先闻盖香，再感受杯底留下的余香。"
    },
    {
      test: /新|入门|简单|第一次|不会|推荐/,
      tea: "福州茉莉银针",
      temperature: "90℃",
      amount: "4g",
      water: "180ml",
      time: "50s",
      culture: "福州茉莉花茶以窨制让茶坯吸收花香，是花香入汤而非简单拼配。",
      note: "茉莉银针香气清晰、口感柔和，适合作为入门选择。用普通玻璃杯也能轻松冲泡。"
    }
  ];

  const teaBrewGuides = {
    "绿茶": { temperature: "80–85℃", amount: "3g / 150ml", time: "30–45秒", vessel: "玻璃杯或薄胎瓷", note: "嫩芽茶通常不需要洗茶，沿杯壁注水，避免高温直冲造成苦涩。" },
    "白茶": { temperature: "新茶 90℃ / 老茶 100℃", amount: "4–5g / 160–180ml", time: "20–35秒", vessel: "盖碗或玻璃杯", note: "银针与嫩白茶水温低一些；寿眉等较粗老白茶可提高水温，并逐步延长出汤。" },
    "黄茶": { temperature: "85℃", amount: "3g / 150ml", time: "40–50秒", vessel: "玻璃杯或薄胎瓷", note: "轻手注水，不宜长时间闷泡，以保留柔和熟香与嫩甜。" },
    "乌龙茶": { temperature: "95–100℃", amount: "6–7g / 100–120ml", time: "8–15秒", vessel: "盖碗或小壶", note: "高香乌龙前几泡要快出汤，之后每泡小幅延时，避免香气被闷钝。" },
    "红茶": { temperature: "90–95℃", amount: "4g / 150ml", time: "15–20秒", vessel: "盖碗或瓷壶", note: "用沸水久泡容易放大涩感，花果香细的红茶尤其适合稍低水温。" },
    "黑茶": { temperature: "100℃", amount: "6–7g / 150ml", time: "10–20秒", vessel: "盖碗、紫砂壶或煮茶器", note: "紧压茶可先快速润茶一次，再正式冲泡；后续也可转入煮饮。" },
    "普洱茶": { temperature: "100℃", amount: "7g / 130ml", time: "8–12秒", vessel: "盖碗或紫砂壶", note: "生普首泡可快速润茶，前几泡快出汤，再根据汤感逐泡延时。" },
    "花茶": { temperature: "85–90℃", amount: "4g / 180ml", time: "45–60秒", vessel: "玻璃杯或瓷壶", note: "花香型茶不宜久闷，出汤后及时分离茶叶，香气会更清透。" }
  };

  const teaAliases = {
    "longjing": ["龙井", "狮峰龙井"],
    "xinyang-maojian": ["信阳毛尖", "毛尖"],
    "rougui": ["肉桂", "慧苑肉桂"],
    "shoumei": ["寿眉", "陈年寿眉"],
    "baihao-yinzhen": ["白毫银针"],
    "junshan-yinzhen": ["君山银针"],
    "dancong": ["单丛", "蜜兰香", "凤凰单丛"],
    "tieguanyin": ["铁观音", "安溪铁观音"],
    "zhengshan": ["正山小种", "小种红茶"],
    "qimen": ["祁门红茶", "祁门", "祁红"],
    "liubao": ["六堡", "陈年六堡"],
    "anhua": ["茯砖", "安化茯砖", "金花茶"],
    "jasmine": ["茉莉银针", "茉莉花茶"],
    "puer": ["景迈山生普", "生普", "景迈山"]
  };

  const teaTypeAliases = {
    "绿茶": ["绿茶"],
    "白茶": ["白茶"],
    "黄茶": ["黄茶"],
    "乌龙茶": ["乌龙茶", "乌龙"],
    "红茶": ["红茶"],
    "黑茶": ["黑茶"],
    "普洱茶": ["普洱茶", "普洱"],
    "花茶": ["花茶"]
  };

  const aiKnowledgeTopics = [
    {
      priority: true,
      test: /咖啡因|失眠|睡不着|空腹|胃不舒服|孕妇|副作用|功效|健康/,
      render: () => `
        <strong>关于饮茶与身体感受</strong>
        <p>茶中含有咖啡因等成分，不同茶类、投茶量和浸泡时间都会影响一杯茶的浓淡。对咖啡因敏感的人，可以缩短首泡时间、减少投茶量，并避免在临睡前饮用浓茶。</p>
        <p style="margin:8px 0 0">空腹饮浓茶若引起不适，应先停止并搭配少量食物。茶适合作为日常饮品，但不能替代医疗建议；孕期、服药期间或有特殊健康状况时，请以专业意见为准。</p>
      `
    },
    {
      priority: true,
      test: /洗茶|醒茶|润茶|第一泡.*倒|倒掉第一泡/,
      render: () => `
        <strong>洗茶不是所有茶都必须做</strong>
        <ul>
          <li><b>嫩绿茶、黄茶、白毫银针：</b>通常不必洗茶，直接冲泡更能保留鲜爽与毫香。</li>
          <li><b>乌龙茶、紧压茶、陈年茶：</b>可以做一次 3–5 秒的快速润茶，帮助茶叶舒展；时间不宜过长。</li>
          <li><b>“洗去农残”不是可靠理由：</b>短时间冲水不能替代原料与检测标准，选择来源清楚的茶叶更重要。</li>
        </ul>
        <p class="ai-answer-note">润茶水一般倒掉；是否润茶最终取决于茶类、形态和个人风味偏好。</p>
      `
    },
    {
      priority: true,
      test: /保存|存放|储存|储藏|受潮|冰箱|保质期|开封后|收纳/,
      render: () => `
        <strong>茶叶保存的四个关键词</strong>
        <p>密封、避光、阴凉、无异味。取茶后尽快封口，不要把茶和香料、咖啡或清洁用品放在一起。</p>
        <ul>
          <li><b>绿茶与清香型乌龙：</b>短期密封冷藏，长期可冷冻；取出后先回温再开封，防止冷凝水受潮。</li>
          <li><b>红茶、花茶：</b>常温密封避光保存，花香型茶尤其要远离高温与异味。</li>
          <li><b>白茶、黑茶、普洱：</b>需要缓慢陈化时，可放在干燥、洁净、避光且通风适度的环境，避免密封在潮湿处。</li>
        </ul>
        <p class="ai-answer-note">一旦出现明显霉味、潮湿结块或异常酸味，不建议继续饮用。</p>
      `
    },
    {
      priority: true,
      test: /绿茶.*红茶|红茶.*绿茶|茶类.*区别|区别.*茶|有什么不同|发酵程度|六大茶类|有哪些茶类|茶类有哪些|茶怎么分类|茶叶分类/,
      render: () => `
        <strong>茶类差异主要来自加工方式</strong>
        <ul>
          <li><b>绿茶：</b>杀青后不发酵，清鲜、嫩香。</li>
          <li><b>白茶：</b>自然萎凋与干燥，清甜，陈放后转为枣香与木香。</li>
          <li><b>黄茶：</b>增加轻闷黄，柔和、熟香。</li>
          <li><b>乌龙茶：</b>部分氧化与做青，花香、熟果香层次丰富。</li>
          <li><b>红茶：</b>充分氧化，甜香、花果香与醇和汤感更突出。</li>
          <li><b>黑茶、普洱：</b>经渥堆或后发酵，陈香、木质香与厚滑感更明显。</li>
          <li><b>花茶：</b>以窨制让茶坯吸收花香，强调花香入汤。</li>
        </ul>
        <p class="ai-answer-note">茶类不是简单按颜色排序；原料嫩度、加工与仓储共同决定风味。</p>
      `
    },
    {
      priority: true,
      test: /太苦|苦涩|发涩|太浓|不好喝|发酸|涩口/,
      render: () => `
        <strong>先降低浓度，再判断茶味</strong>
        <ol class="ai-answer-list">
          <li><b>缩短出汤：</b>下一次提前 5–10 秒倒出，尤其注意不要让茶汤在器中久留。</li>
          <li><b>减少投茶：</b>每次减少约 1g，或增加水量，先找到不涩的浓度。</li>
          <li><b>降低水温：</b>嫩绿茶可降到 80–85℃；红茶与部分乌龙也不必持续沸腾。</li>
          <li><b>检查茶汤是否分离：</b>盖碗或壶里留水会持续浸泡，后几泡容易突然变苦。</li>
        </ol>
        <p class="ai-answer-note">一次只调整一个变量，才能判断变化来自水温、投茶量还是出汤时间。</p>
      `
    },
    {
      priority: true,
      test: /茶具|盖碗|紫砂|玻璃杯|公道杯|茶壶|器皿|用什么杯/,
      render: () => `
        <strong>新手茶器不必很多</strong>
        <p>一只 100–130ml 的薄胎瓷盖碗、一只公道杯、两只小杯和一把烧水壶，已经可以完成大多数茶的冲泡。</p>
        <ul>
          <li><b>绿茶、黄茶：</b>玻璃杯便于观察芽叶，也容易控制嫩茶温度。</li>
          <li><b>乌龙、普洱、黑茶：</b>盖碗更便于快出汤；紫砂壶适合部分熟茶与陈茶，但香气细节不如盖碗直观。</li>
          <li><b>红茶、花茶：</b>瓷壶或盖碗都可以，瓷质不吸香，日常更容易比较不同茶样。</li>
        </ul>
      `
    },
    {
      test: /步骤|流程|怎么泡|如何泡|怎样泡|怎么冲|如何冲|冲泡方法/,
      render: () => `
        <strong>泡茶的基本步骤</strong>
        <p>先控制好水温、投茶量、注水方式和出汤时间。下面以盖碗或玻璃杯为例：</p>
        <ol class="ai-answer-list">
          <li><b>备器烧水：</b>准备洁净茶器。水沸后根据茶类静置降温。</li>
          <li><b>温杯：</b>用热水温热杯壁后倒掉，茶叶不易骤冷。</li>
          <li><b>投茶：</b>从约 3–5g 茶配 150ml 水开始，再按茶类调整。</li>
          <li><b>注水：</b>沿器壁缓慢注水，嫩芽茶不要用急流直冲叶片。</li>
          <li><b>出汤：</b>到达设定时间后一次倒尽，不要留茶汤继续浸泡茶叶。</li>
          <li><b>续泡：</b>第二泡起每次小幅延时，并把上一泡的浓淡作为下一泡依据。</li>
        </ol>
        <p class="ai-answer-note">绿茶约 80–85℃、乌龙与陈茶通常接近 95–100℃。告诉我具体茶名，我可以给出更准确的水温、克数和首泡时间。</p>
      `
    },
    {
      test: /水温|几度|多少度|水开|开水|沸水/,
      render: () => `
        <strong>泡茶水温速查</strong>
        <ul>
          <li><b>绿茶：</b>80–85℃；细嫩芽茶可取 80℃附近。</li>
          <li><b>黄茶：</b>约 85℃。</li>
          <li><b>白茶：</b>新茶约 90℃，老白茶与寿眉可用 95–100℃。</li>
          <li><b>乌龙茶：</b>95–100℃，高香茶也需要足够热度。</li>
          <li><b>红茶：</b>90–95℃，细嫩红茶不必持续沸腾。</li>
          <li><b>黑茶、普洱：</b>100℃，紧压茶可先快速润茶。</li>
          <li><b>花茶：</b>85–90℃，避免高温久闷。</li>
        </ul>
        <p class="ai-answer-note">没有温度计时，水沸后开盖静置约 1–2 分钟，通常接近 90–95℃。</p>
      `
    },
    {
      test: /投茶|几克|多少克|茶水比|比例|出汤|泡多久|闷多久|多久出汤/,
      render: () => `
        <strong>投茶量与出汤时间</strong>
        <p>日常可先用约 <b>1:50</b> 的茶水比作为起点，例如 3g 茶配 150ml 水。之后根据茶类和口味调整。</p>
        <ul>
          <li><b>绿茶、黄茶：</b>3g / 150ml，首泡约 30–50 秒。</li>
          <li><b>白茶：</b>4–5g / 160–180ml，首泡约 20–35 秒。</li>
          <li><b>乌龙茶：</b>6–7g / 100–120ml，首泡约 8–15 秒。</li>
          <li><b>红茶：</b>4g / 150ml，首泡约 15–20 秒。</li>
          <li><b>黑茶、普洱：</b>6–7g / 130–150ml，首泡约 10–20 秒。</li>
        </ul>
        <p class="ai-answer-note">这些是起始值，不是硬性标准。茶汤过浓就缩短时间或减少投茶量。</p>
      `
    }
  ];

  const routeMeta = {
    home: ["首页", "山隐茶事"],
    culture: ["茶文化", "茶之六境 · 山隐茶事"],
    regions: ["山河茶图", "山河茶图 · 山隐茶事"],
    audit: ["数据图谱", "数据图谱 · 山隐茶事"],
    ai: ["AI 茶事", "AI 茶事顾问 · 山隐茶事"],
    community: ["茶友社区", "茶友社区 · 山隐茶事"],
    collection: ["茶集", "茶集与知识 · 山隐茶事"],
    experience: ["茶席体验", "茶席体验 · 山隐茶事"],
    articles: ["茶事文章", "茶事文章 · 山隐茶事"],
    profile: ["我的茶库", "我的茶库 · 山隐茶事"],
    about: ["关于山隐", "关于山隐 · 山隐茶事"]
  };

  function icon(name, className = "") {
    return `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  }

  function loadState() {
    try {
      return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentRoute() {
    const route = location.hash.replace(/^#\/?/, "").split("?")[0];
    return routeMeta[route] ? route : "home";
  }

  function pageShell(content, className = "page-dark") {
    return `<div class="page ${className}">${content}</div>`;
  }

  function sectionHead(kicker, title, desc, link = "") {
    return `
      <div class="section-head reveal">
        <div>
          <p class="kicker">${kicker}</p>
          <h2 class="section-title">${title}</h2>
          ${desc ? `<p class="section-desc">${desc}</p>` : ""}
        </div>
        ${link ? `<a class="text-link" href="${link.href}">${link.label}${icon("arrow")}</a>` : ""}
      </div>`;
  }

  function pageHome() {
    return pageShell(`
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-inner">
          <div class="hero-copy reveal">
            <p class="eyebrow">东方茶文化生活志</p>
            <h1>一盏茶，<br><em>见山河。</em></h1>
            <p class="hero-lead">从山场、工艺到一杯茶汤，在真实数据与东方审美之间，找到属于你的茶。</p>
            <div class="hero-actions">
              <a class="button button-gold" href="#/ai">开启今日茶事 ${icon("spark")}</a>
              <a class="button button-outline" href="#/culture">探索茶文化 ${icon("play")}</a>
            </div>
            <div class="hero-stats">
              <div class="hero-stat"><strong>24</strong><span>核心茶区</span></div>
              <div class="hero-stat"><strong>127</strong><span>茶样档案</span></div>
              <div class="hero-stat"><strong>42</strong><span>制茶师故事</span></div>
            </div>
          </div>
        </div>
        <div class="scroll-marker"><span>向下探索</span><i></i></div>
      </section>
      <section class="intro-strip">
        <div class="container">
          <div class="intro-item">${icon("mountain")}<div><strong>真实山场</strong><span>从地理与人出发</span></div></div>
          <div class="intro-item">${icon("hand")}<div><strong>手艺档案</strong><span>记录每一步制茶工序</span></div></div>
          <div class="intro-item">${icon("chart")}<div><strong>数据品鉴</strong><span>让风味可以被回看</span></div></div>
          <div class="intro-item">${icon("spark")}<div><strong>AI 茶事</strong><span>为当下场景给出方案</span></div></div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${sectionHead("EXPLORE", "从山河深处，走近一杯茶", "沿着山场、工艺与人物三条线索，阅读茶文化在当代生活中的真实样貌。", { href: "#/culture", label: "进入文化专题" })}
          <div class="feature-grid reveal stagger">
            <a class="feature-card" href="#/culture">
              <img src="${assets.homeSixRealms}" alt="茶农在茶园中采摘嫩叶">
              <div class="feature-card-copy"><small>核心文化 · 茶之六境</small><h3>从一片叶子，到一盏茶</h3><p>采青、萎凋、杀青、揉捻、焙火、成茶，逐层阅读工艺如何塑造风味。</p></div>
            </a>
            <a class="feature-card" href="#/regions">
              <img src="${assets.landscape4}" alt="层叠茶园与山地">
              <div class="feature-card-copy"><small>山河茶图 · 真实风土</small><h3>茶在山河之间</h3><p>在产区地图中探索海拔、雨量与代表茶样。</p></div>
            </a>
            <a class="feature-card archive-feature" href="#/articles">
              <span class="quote-mark">“</span>
              <q>茶不是答案，它只是让人重新感到时间的尺度。</q>
              <div class="quote-meta">山隐编辑室 · 茶事随笔</div>
            </a>
          </div>
        </div>
      </section>
      <section class="section light-section" style="background:var(--paper);color:var(--ink)">
        <div class="container">
          ${sectionHead("CURATED FOR TODAY", "今天，想喝一杯怎样的茶？", "告诉 AI 你的心情、场景与偏好，获得一杯茶及一套可以直接执行的冲泡方案。", { href: "#/ai", label: "开始问茶" })}
          <div class="feature-grid reveal">
            <a class="feature-card" href="#/ai"><img src="${assets.ceremony2}" alt="茶汤与茶器"><div class="feature-card-copy"><small>AI 茶事顾问</small><h3>从一句需求开始</h3><p>今晚想安静一点，还是一杯茶唤醒清晨？</p></div></a>
            <a class="feature-card" href="#/community" style="min-height:300px"><img src="${assets.ceremony3}" alt="茶室空间"><div class="feature-card-copy"><small>茶友社区</small><h3>和一席人，共饮一壶茶</h3><p>查看本周茶席与山场共学。</p></div></a>
            <a class="feature-card" href="#/experience" style="min-height:300px"><img src="${assets.landscape2}" alt="武夷山茶园"><div class="feature-card-copy"><small>茶席体验</small><h3>把茶事放进真实的时间里</h3><p>预约一场有主理人、有场景的茶席。</p></div></a>
          </div>
        </div>
      </section>
    `);
  }

  function pageCulture() {
    return pageShell(`
      <header class="culture-page-head">
        <div class="container reveal">
          <p class="kicker">TEA CULTURE · 茶之六境</p>
          <h1 class="page-title">一片叶的<br>六次转身</h1>
          <p class="page-lead">工艺不是把味道固定下来，而是在每一次水分、温度与压力变化中，让茶叶更接近它本来的样子。</p>
          <div class="culture-meta">
            <span>${icon("calendar")} 核心专题</span>
            <span>${icon("clock")} 阅读约 8 分钟</span>
            <span>${icon("leaf")} 工艺与风味档案</span>
          </div>
        </div>
      </header>
      <section class="section" style="padding-top:24px">
        <div class="container">
          <div class="culture-stage-layout reveal">
            <div class="stage-menu" id="stageMenu"></div>
            <div class="stage-visual" id="stageVisual"></div>
            <aside class="stage-detail" id="stageDetail"></aside>
          </div>
        </div>
      </section>
      <section class="section light-section" style="background:var(--paper);color:var(--ink)">
        <div class="container">
          ${sectionHead("BEYOND THE CUP", "一杯茶的背后，是人与土地的耐心", "工艺之外，还有山场、季节与茶人日复一日的经验。")}
          <div class="story-grid reveal">
            <article class="story-card"><span class="story-number">01 / 山场</span><h3>风土不是标签，<br>而是一组真实条件。</h3><p>海拔、朝向、土壤与云雾共同构成茶叶的生长环境。它们不直接等于好喝，却为风味提供了最初的语法。</p><a class="text-link" href="#/regions" style="color:#4b6950;margin-top:25px">打开山河茶图 ${icon("arrow")}</a></article>
            <article class="story-card dark"><span class="story-number">02 / 时间</span><h3>让茶在时间里<br>慢慢完成自己。</h3><p>白茶陈化、岩茶退火、生普转化，每种茶都有自己的时间尺度。</p><a class="text-link" href="#/articles" style="margin-top:25px">阅读茶事文章 ${icon("arrow")}</a></article>
          </div>
        </div>
      </section>
    `);
  }

  function pageRegions() {
    return pageShell(`
      <header class="page-main">
        <div class="container reveal">
          <p class="kicker">ORIGIN ATLAS · 山河茶图</p>
          <h1 class="page-title">茶树生长之处，<br>山河各有回答。</h1>
          <p class="page-lead">从绿茶到花茶，沿一张简化的中国茶区图，比较海拔、雨量、代表茶样与风味线索。这里不是排行榜，而是一张理解风土的入口。</p>
        </div>
      </header>
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="region-layout">
            <div class="region-map-card reveal">
              <div class="region-map-head">
                <div>
                  <span class="map-index">CHINA TEA ATLAS</span>
                  <strong>${regions.length} 个代表茶区</strong>
                </div>
                <p>选择地图圆点<br>阅读茶区档案</p>
              </div>
              <div class="map-legend" aria-label="茶类图例">
                ${teaTypes.map((type) => `<span class="tea-type-${teaTypeKeys[type]}"><i></i>${type}</span>`).join("")}
              </div>
              ${chinaMapMarkup()}
              <div class="region-map-foot">
                <span>中国茶区简化示意图 · 非精确行政边界</span>
                <span>${icon("location")} 已收录 ${teaTypes.length} 个茶类</span>
              </div>
              <div class="region-shortcuts" aria-label="茶区快捷索引">
                ${regions.map((region) => `<button class="${region.id === selectedRegionId ? "active" : ""}" data-region="${region.id}" aria-label="查看${region.name}"><i class="tea-type-${teaTypeKeys[region.types[0]]}"></i>${region.name}</button>`).join("")}
              </div>
            </div>
            <aside id="regionInfo" class="reveal"></aside>
          </div>
        </div>
      </section>
    `);
  }

  function chinaMapMarkup() {
    const spots = regions.map((region) => `
      <g class="region-spot tea-type-${teaTypeKeys[region.types[0]]} ${region.id === selectedRegionId ? "active" : ""}" data-region="${region.id}" transform="translate(${region.x} ${region.y})" role="button" tabindex="0" aria-label="${region.name}，${region.types.join("、")}">
        <circle class="halo" r="16"></circle>
        <circle class="dot" r="4.6"></circle>
        <text class="map-label" x="11" y="4">${region.name}</text>
      </g>`).join("");
    return `<svg class="region-map" viewBox="0 0 650 390" role="img" aria-labelledby="mapTitle mapDesc">
      <title id="mapTitle">中国主要茶区简化地图</title>
      <desc id="mapDesc">地图标注景迈山、西湖龙井、武夷山、凤凰单丛、安溪铁观音、太姥山、黄山、蒙顶雅安、六堡、君山、信阳、恩施、都匀、福州与南投等代表茶区。</desc>
      <path class="china-outline" d="M372 372.3 L363.7 369.1 L363.4 360.2 L368.4 355.5 L379.6 352.5 L385.4 352.8 L387.7 356.8 L383.2 361.3 L380.9 367.3 L372 372.3 Z M74.1 121.2 L73.2 115.2 L80.2 112.5 L71.1 94.5 L91.3 90.3 L96.5 88 L103.8 69.4 L124.1 72.8 L129.7 68.1 L130.2 57.7 L138.7 56.7 L146.5 49.8 L150.5 48.9 L153.1 56.2 L161.7 61.7 L176.3 65.6 L183.3 74 L179.4 86.1 L183 90.6 L195.2 92.4 L208.9 93.9 L221.2 100.3 L227.5 101.5 L232.2 111.1 L238.2 117.3 L249.4 117 L270.5 119.3 L284 117.9 L294.1 119.4 L309.2 125.8 L321.5 125.8 L326 129 L337.9 123.4 L354.4 119.8 L369.7 119.4 L381.6 115.7 L388.9 110.2 L396.1 106.7 L394.4 103.2 L391.2 99.2 L396.5 92.5 L402.2 93.5 L412.7 95.6 L422.9 90.1 L438.4 86 L445.9 79.2 L453.1 76.2 L467.9 74.8 L476 76 L477.1 72.3 L467.8 65 L459.7 61.7 L451.8 65.5 L441.8 63.9 L436 65.2 L433.3 61 L440.6 50.6 L445.5 42.8 L457.8 46.7 L472.1 40.1 L472 35.5 L481.3 24.5 L486.9 21.2 L486.8 15.4 L481.2 13 L489.6 7.8 L502.3 5.9 L515.8 5.6 L531.1 8.7 L540.1 12.6 L546.4 23 L550.2 27.5 L553.7 33.9 L557.5 44.1 L575.3 47.4 L587.3 54.8 L591.5 64.6 L607 64.6 L615.8 60.5 L632.7 57.4 L627.3 66.8 L623.3 70.6 L619.9 82 L613 92.1 L600.6 90.3 L591.9 93.9 L594.5 102.8 L593.1 115.1 L587.9 115.4 L587.9 120.7 L581.3 114.6 L577.3 120.4 L561.5 124.9 L563.1 130.3 L554.3 130 L549.5 126.7 L542.5 134.1 L531.2 139.7 L522.9 146.3 L508.6 149.4 L501.1 154.2 L490.2 157.1 L495.6 152.2 L493.4 148.2 L501.5 141.2 L496.1 135.8 L487.2 139.4 L475.7 146.7 L469.4 153.4 L459.4 153.9 L454.2 158.7 L459.6 165.8 L468 167.5 L468.3 172.1 L476.4 175.2 L487.8 167.7 L496.9 171.8 L503.5 172.1 L505.1 177.5 L490.7 180.4 L485.9 186 L476 191.3 L470.7 198.5 L481.7 204.3 L485.7 214.5 L491.9 224 L498.9 232 L498.7 239.7 L492.3 242.6 L494.7 248.1 L500.7 251.3 L499.2 259.8 L496.6 268.1 L490.9 269 L483.4 280.2 L475.2 293.9 L465.7 306.3 L451.7 315.9 L437.5 324.7 L426 325.9 L419.8 330.5 L416.2 327.1 L410.5 332.3 L396.2 337.5 L385.4 339.1 L381.9 350.1 L376.3 350.7 L373.6 343.1 L376 339.1 L362.3 335.8 L357.5 337.5 L347.2 334.8 L342.4 330.5 L344 324.5 L334.7 322.6 L329.8 318.7 L321.1 324.3 L311.1 325.5 L303 325.4 L297.5 328 L292.3 329.5 L293.8 341.4 L288.4 341.1 L287.4 338.7 L287.1 334.4 L279.6 337.4 L275.2 335.5 L267.7 331.6 L270.6 322.9 L264.2 320.9 L261.7 311.3 L251 313.1 L252.2 300.7 L261.9 292 L262.3 283.5 L262 275.5 L257.5 273 L254.1 266.9 L248.1 267.7 L237.1 266.1 L240.6 261.8 L235.8 255.3 L228.5 259.7 L220 257.1 L208.2 263.7 L198.9 271.5 L190.7 272.8 L186.2 270 L180.9 269.7 L173.6 267.3 L168.1 270 L161.3 277.7 L160.4 269.5 L154.2 271.7 L142.3 270.7 L130.8 268.3 L122.5 263.7 L114.6 261.7 L111.2 256.7 L105.4 255.2 L95.1 248.4 L87 245.2 L82.7 247.7 L68.6 240.4 L58.5 233.8 L55.7 222.4 L63 223.8 L63.3 218.5 L59.3 213.1 L60.3 204.7 L49.3 192.5 L32.6 188.3 L29.5 180.3 L22 175.4 L20.2 172.4 L18.7 166.5 L19 162.5 L12.8 160.1 L9.5 161.1 L6.9 151.5 L9.8 149.1 L8.4 146.7 L18.1 141.8 L25.2 139.8 L36 141.1 L39.8 134.5 L52.9 133.3 L56.5 129.1 L72.6 123.5 L74.1 121.2 Z"/>
      <path class="china-outline" d="M497.5 307.9 L491.4 324.6 L486.7 333.1 L481.6 324.3 L480.5 316.6 L486.5 306.4 L494.6 298.5 L499.3 301.6 L497.5 307.9 Z"/>
      ${spots}
    </svg>`;
  }

  function renderRegionInfo() {
    const box = document.getElementById("regionInfo");
    if (!box) return;
    const region = regions.find((item) => item.id === selectedRegionId) || regions[0];
    box.innerHTML = `
      <div class="region-info tea-type-${teaTypeKeys[region.types[0]]}">
        <div class="region-info-head">
          <span class="region-stamp tea-type-${teaTypeKeys[region.types[0]]}">${teaTypeMarks[region.types[0]]}</span>
          <div>
            <p class="region-overline">${region.province}</p>
            <h2>${region.name}</h2>
          </div>
        </div>
        <div class="region-types">${region.types.map((type) => `<span class="tea-type-${teaTypeKeys[type]}">${type}</span>`).join("")}</div>
        <p class="region-description">${region.description}</p>
        <div class="region-metrics">
          <div class="region-metric"><strong>${region.altitude}</strong><span>海拔 / 米</span></div>
          <div class="region-metric"><strong>${region.rainfall}</strong><span>年降水 / mm</span></div>
          <div class="region-metric"><strong>${region.teas.length}</strong><span>代表茶样</span></div>
        </div>
        <div class="region-facts">
          <div><span>风味线索</span><strong>${region.flavor}</strong></div>
          <div><span>工艺关键词</span><strong>${region.craft}</strong></div>
        </div>
        <p class="region-sample-label">代表茶样</p>
        <div class="region-tags">${region.teas.map((tea) => `<span class="region-tag">${tea}</span>`).join("")}</div>
        <div class="region-actions">
          <a class="button button-gold" href="#/collection">查看相关茶样 ${icon("arrow")}</a>
          <a class="button button-outline" href="#/experience">寻找附近茶席</a>
        </div>
      </div>`;
  }

  function pageData() {
    return pageShell(`
      <header class="page-main">
        <div class="container reveal">
          <p class="kicker">TEA IN NUMBERS · 数据图谱</p>
          <h1 class="page-title">用数据，读懂一杯茶的层次。</h1>
          <p class="page-lead">从风味维度到产区趋势，用可视化记录茶文化的复杂性。数据是观察的起点，不是答案。</p>
          <div class="category-pills" id="teaTypeFilters" style="margin-top:30px">
            ${["全部", ...teaTypes].map((type) => `<button class="category-pill ${type === activeTeaType ? "active" : ""}" data-tea-type="${type}">${type}</button>`).join("")}
          </div>
        </div>
      </header>
      <section class="section" style="padding-top:12px">
        <div class="container data-grid reveal">
          <article class="dashboard-card metric-card"><div>${icon("map")}<strong id="regionCount">${regions.length}</strong><span>核心茶区样本</span><div class="delta">覆盖 ${new Set(regions.map((region) => region.province)).size} 个地区</div></div></article>
          <article class="dashboard-card metric-card"><div>${icon("leaf")}<strong id="sampleCount">${teas.length}</strong><span>茶样档案</span><div class="delta">覆盖 ${teaTypes.length} 个茶类</div></div></article>
          <article class="dashboard-card metric-card"><div>${icon("users")}<strong>42</strong><span>制茶师故事</span><div class="delta">持续走访中</div></div></article>
          <article class="dashboard-card metric-card"><div>${icon("clock")}<strong>1,860</strong><span>冲泡记录</span><div class="delta">平均记录 3.2 泡</div></article>
          <article class="dashboard-card radar-card">
            <h3>风味雷达 · <span id="radarTeaName">全部茶类</span></h3>
            ${radarMarkup([82, 68, 74, 56, 71])}
          </article>
          <article class="dashboard-card chart-card">
            <div class="chart-head"><h3>近十二节气 · 品鉴偏好</h3><div class="chart-legend"><span><i></i>香气</span><span><i class="green"></i>汤感</span></div></div>
            <svg class="trend-svg" viewBox="0 0 760 260" aria-label="品鉴偏好趋势">
              ${[40,80,120,160,200,240].map((y)=>`<line class="trend-grid-line" x1="0" x2="760" y1="${y}" y2="${y}"/>`).join("")}
              <path class="trend-area" d="M0 210C70 197 74 145 139 151s88-76 159-42 83-38 145-45 83 23 143-13 93-9 174-18V260H0Z"/>
              <path class="trend-line" d="M0 210C70 197 74 145 139 151s88-76 159-42 83-38 145-45 83 23 143-13 93-9 174-18"/>
              <path class="trend-line second" d="M0 230C72 205 98 199 153 210s80-13 146-20 89 23 153-10 102 6 154-24 80-2 154-18"/>
            </svg>
          </article>
          <article class="dashboard-card ranking-card">
            <h3>本周茶类检索</h3>
            <ol>
              <li><b>01</b><span>乌龙茶</span><span class="rank-bar"><i style="--width:88%"></i></span></li>
              <li><b>02</b><span>白茶</span><span class="rank-bar"><i style="--width:71%"></i></span></li>
              <li><b>03</b><span>绿茶</span><span class="rank-bar"><i style="--width:63%"></i></span></li>
              <li><b>04</b><span>普洱茶</span><span class="rank-bar"><i style="--width:51%"></i></span></li>
            </ol>
          </article>
          <article class="dashboard-card season-distribution">
            <h3>冲泡时段分布</h3>
            <div class="distribution-bars">
              <span style="--height:38%" data-label="清晨"></span><span style="--height:72%" data-label="上午"></span><span style="--height:62%" data-label="午后"></span><span style="--height:91%" data-label="傍晚"></span><span style="--height:55%" data-label="夜间"></span>
            </div>
          </article>
        </div>
      </section>
    `);
  }

  function radarMarkup(values) {
    const labels = ["香气", "甜度", "汤感", "回甘", "山场"];
    const center = { x: 190, y: 140 };
    const radius = 105;
    const angles = [-90, -18, 54, 126, 198].map((value) => (value * Math.PI) / 180);
    const point = (angle, value) => `${center.x + Math.cos(angle) * radius * (value / 100)},${center.y + Math.sin(angle) * radius * (value / 100)}`;
    const rings = [0.35, 0.7, 1].map((scale) => {
      const points = angles.map((angle) => `${center.x + Math.cos(angle) * radius * scale},${center.y + Math.sin(angle) * radius * scale}`).join(" ");
      return `<polygon class="radar-grid-line" points="${points}"/>`;
    }).join("");
    const axes = angles.map((angle) => `<line class="radar-grid-line" x1="${center.x}" y1="${center.y}" x2="${center.x + Math.cos(angle) * radius}" y2="${center.y + Math.sin(angle) * radius}"/>`).join("");
    const shape = values.map((value, index) => point(angles[index], value)).join(" ");
    const points = values.map((value, index) => {
      const [cx, cy] = point(angles[index], value).split(",");
      return `<circle class="radar-point" cx="${cx}" cy="${cy}" r="3.5"/>`;
    }).join("");
    const labelsMarkup = labels.map((label, index) => {
      const x = center.x + Math.cos(angles[index]) * (radius + 25);
      const y = center.y + Math.sin(angles[index]) * (radius + 25);
      return `<text class="radar-label" x="${x}" y="${y}" text-anchor="middle">${label}</text>`;
    }).join("");
    return `<svg viewBox="0 0 380 280" aria-label="风味雷达">${rings}${axes}<polygon class="radar-fill-shape" points="${shape}"/>${points}${labelsMarkup}</svg>`;
  }

  function pageAi() {
    return pageShell(`
      <header class="page-main" style="padding-bottom:48px">
        <div class="container reveal">
          <p class="kicker">AI TEA CONCIERGE · 本地茶事引擎</p>
          <h1 class="page-title">说出此刻，<br>让一杯茶回应你。</h1>
          <p class="page-lead">AI 茶事顾问会先判断你在问冲泡步骤、茶水参数、茶类知识还是选茶，再给出对应回答。所有内容均在本机生成，不需要密钥。</p>
        </div>
      </header>
      <section class="section" style="padding-top:12px">
        <div class="container ai-layout">
          <div class="chat-shell reveal">
            <div class="chat-header">
              <span class="ai-avatar">${icon("spark")}</span>
              <div><strong>山隐 · 茶事顾问</strong><span>冲泡、茶类与存储知识库</span></div>
              <span class="status"><i></i>在线</span>
            </div>
            <div class="chat-log" id="chatLog">
              <div class="chat-message ai">
                <span class="message-avatar">${icon("leaf")}</span>
                <div class="message-bubble">你好，我是山隐茶事顾问。你可以问我泡茶步骤、水温与投茶量、茶类区别、保存方法，或告诉我此刻的场景，我会给出对应的冲泡建议。</div>
              </div>
            </div>
            <div class="quick-prompts">
              <button data-prompt="泡茶的步骤">泡茶步骤</button>
              <button data-prompt="今晚想喝一杯安静、温柔的茶">今晚想安静一点</button>
              <button data-prompt="早上想要清爽提神">清晨需要一杯清茶</button>
              <button data-prompt="我喜欢有花香的乌龙茶">寻找花香乌龙</button>
              <button data-prompt="我是新手，想泡一杯简单好喝的茶">第一次泡茶</button>
            </div>
            <form class="chat-compose" id="chatForm">
              <button type="button" aria-label="语音输入">${icon("mic")}</button>
              <textarea id="chatInput" rows="1" placeholder="告诉 AI 你此刻的茶事需求……"></textarea>
              <button class="send-button" type="submit" aria-label="发送">${icon("send")}</button>
            </form>
          </div>
          <aside class="ai-side reveal">
            <article class="ai-card">
              <p class="kicker" style="margin-bottom:10px">CURRENT RECIPE</p>
              <h3>今晚的温润一盏</h3>
              <p>陈年寿眉 · 高温慢出汤，适合在晚间留一点安静的时间。</p>
              <div class="ai-recipe">
                <div>${icon("thermometer")}<strong>95℃</strong><span>水温</span></div>
                <div>${icon("scale")}<strong>5g</strong><span>投茶</span></div>
                <div>${icon("drop")}<strong>180ml</strong><span>注水</span></div>
                <div>${icon("clock")}<strong>20s</strong><span>出汤</span></div>
              </div>
            </article>
            <article class="ai-card">
              <h3>一杯茶的四步</h3>
              <div class="ritual-timeline">
                <div class="ritual-row"><span>${icon("drop")}</span>温器醒茶，让茶叶先与热气相遇</div>
                <div class="ritual-row"><span>${icon("thermometer")}</span>沿杯壁注水，避免直冲叶片</div>
                <div class="ritual-row"><span>${icon("clock")}</span>短暂静置，观察茶汤颜色变化</div>
                <div class="ritual-row"><span>${icon("cup")}</span>分汤入杯，先闻香，再慢慢啜饮</div>
              </div>
            </article>
            <div class="ai-disclaimer">AI 建议用于茶文化体验与冲泡参考，不构成医疗、营养或健康建议。若你对咖啡因敏感，请根据自身情况调整投茶量与饮用时间。</div>
          </aside>
        </div>
      </section>
    `);
  }

  function pageCommunity() {
    return pageShell(`
      <header class="page-main">
        <div class="container reveal">
          <p class="kicker">TEA FRIENDS · 茶友社区</p>
          <h1 class="page-title">一席人，一壶茶，<br>让相遇自然发生。</h1>
          <p class="page-lead">城市茶席、山场共学与风味实验室。所有活动均为主理人发布，收藏喜欢的茶事，再留一个席位给自己。</p>
        </div>
      </header>
      <section class="section" style="padding-top:12px">
        <div class="container">
          <div class="filter-toolbar reveal">
            <div class="category-pills" id="cityFilters">
              ${["全部","杭州","上海","南平","普洱","宁德","潮州"].map((city)=>`<button class="category-pill ${city===activeCommunityCity?"active":""}" data-community-city="${city}">${city}</button>`).join("")}
            </div>
            <div class="select-shell">
              <select id="communityTypeFilter">
                ${["全部","茶席","山场","品鉴","雅集","茶课"].map((type)=>`<option ${type===activeCommunityType?"selected":""}>${type}</option>`).join("")}
              </select>
              ${icon("chevron-down")}
            </div>
          </div>
          <div class="event-grid" id="eventGrid"></div>
          <div class="community-aside reveal">
            <div class="community-banner">${icon("users")}<div><strong>发起一场自己的茶席</strong><span>填写主题与场景，让同城茶友找到你。</span></div><button class="button button-outline" data-create-event style="margin-left:auto">发起茶事</button></div>
            <div class="community-banner" style="background:var(--paper);color:var(--ink);border-color:rgba(22,48,32,.12)">${icon("map")}<div><strong>附近正在发生</strong><span>打开城市地图，发现步行可到的茶空间。</span></div><a class="button button-ink" href="#/regions" style="margin-left:auto">查看茶图</a></div>
          </div>
        </div>
      </section>
    `);
  }

  function pageCollection() {
    return pageShell(`
      <header class="page-main collection-header">
        <div class="container reveal">
          <p class="kicker">CURATED TEA · 茶集</p>
          <h1 class="page-title">挑一泡茶，<br>把山河带进日常。</h1>
          <p class="page-lead">以绿茶、白茶、黄茶、乌龙茶、红茶、黑茶、普洱茶与花茶为完整目录，只记录真实产地、清楚工艺和可以复现的冲泡方法。</p>
          <div class="collection-taxonomy">
            ${teaTypes.map((type, index) => `<span class="tea-type-${teaTypeKeys[type]}"><b>${String(index + 1).padStart(2, "0")}</b>${type}</span>`).join("")}
          </div>
        </div>
      </header>
      <section class="section">
        <div class="container">
          <div class="filter-toolbar reveal">
            <div class="category-pills" id="teaFilters">
              ${["全部", ...teaTypes].map((type)=>`<button class="category-pill ${type===activeTeaType?"active":""}" data-tea-filter="${type}">${type}</button>`).join("")}
            </div>
            <span class="muted" style="margin-left:auto;font-size:11px" id="teaResultCount"></span>
          </div>
          <div class="tea-grid" id="teaGrid"></div>
        </div>
      </section>
    `, "page-dark");
  }

  function pageExperience() {
    return pageShell(`
      <section class="experience-hero">
        <div class="experience-hero-bg"></div>
        <div class="container">
          <div class="experience-copy reveal">
            <p class="kicker">TEA CEREMONY · 深秋限定</p>
            <h1>在武夷山，<br>等一场茶席。</h1>
            <p>从暮色到月上，用一炉炭火、一泡岩茶与几位新朋友，把时间安放在山风与杯盏之间。主理人将带你完成温器、候汤、闻香与品饮。</p>
            <div class="experience-tags"><span>${icon("location")} 福建 · 武夷山</span><span>${icon("clock")} 约 2.5 小时</span><span>${icon("users")} 限 8 人</span></div>
            <div class="experience-tags"><span>岩茶品鉴</span><span>炭火煮水</span><span>山场分享</span><span>茶点搭配</span></div>
          </div>
          <aside class="booking-card reveal">
            <div class="booking-head"><span class="calendar-icon">${icon("calendar")}</span><div><strong>岩骨花香 · 夜茶席</strong><span>10 月 26 日 · 周日</span></div></div>
            <div class="booking-slots" id="bookingSlots">
              ${["14:00","17:30","19:30"].map((slot)=>`<button data-booking-slot="${slot}" class="${slot===selectedBookingSlot?"active":""}">${slot}</button>`).join("")}
            </div>
            <div class="booking-seats"><span>剩余席位</span><span class="seat-dots">${Array.from({length:8},(_,i)=>`<i class="${i<5?"":"empty"}"></i>`).join("")}</span></div>
            <div class="booking-price"><div><span>每位体验价</span><strong>¥188</strong></div><span>含茶点与茶席记录</span></div>
            <button class="button button-gold" data-confirm-booking="岩骨花香 · 夜茶席">预约这一席 ${icon("arrow")}</button>
          </aside>
        </div>
      </section>
      <section class="section light-section" style="background:var(--paper);color:var(--ink)">
        <div class="container">
          ${sectionHead("THE RITUAL", "让每个动作都有来处", "茶席不是表演，而是一种把注意力重新放回当下的方式。")}
          <div class="ritual-grid reveal">
            <article class="ritual-card"><span class="num">01</span><h3>候汤</h3><p>炭火慢慢煮沸山泉水，听水声从细响转为松风。</p></article>
            <article class="ritual-card"><span class="num">02</span><h3>温器</h3><p>以热水唤醒盖碗与茶杯，也让茶席先有温度。</p></article>
            <article class="ritual-card"><span class="num">03</span><h3>闻香</h3><p>从干茶、盖香到杯底，记录香气如何变化。</p></article>
            <article class="ritual-card"><span class="num">04</span><h3>共饮</h3><p>请同席的人先举杯，让一杯茶成为交流的开始。</p></article>
          </div>
        </div>
      </section>
    `);
  }

  function pageArticles() {
    const featured = articles[0];
    return pageShell(`
      <header class="page-main" style="background:var(--paper);color:var(--ink);padding-bottom:58px">
        <div class="container reveal">
          <p class="kicker">TEA JOURNAL · 茶事文章</p>
          <h1 class="page-title">阅读一杯茶，<br>也阅读时间。</h1>
          <p class="page-lead">从工艺、山场到器物与生活，以清楚的文章建立属于你的茶知识地图。</p>
        </div>
      </header>
      <section class="section light-section" style="background:var(--paper);color:var(--ink);padding-top:16px">
        <div class="container">
          <article class="article-feature reveal">
            <div class="article-feature-image"><img src="${featured.image}" alt="${featured.title}"></div>
            <div class="article-feature-copy"><p class="kicker">FEATURED · 编辑推荐</p><h2>${featured.title}</h2><p>${featured.excerpt}</p><button class="button button-gold" data-open-article="${featured.id}">开始阅读 ${icon("arrow")}</button></div>
          </article>
          <div class="section-head reveal" style="margin-top:72px"><div><p class="kicker">RECENT STORIES</p><h2 class="section-title">近期文章</h2></div></div>
          <div class="article-grid reveal">
            ${articles.slice(1).map((article)=>`
              <article class="article-card"><div class="article-image"><img src="${article.image}" alt="${article.title}"></div><div class="article-body"><div class="article-meta"><span>${article.category}</span><span>${article.read}</span></div><h2>${article.title}</h2><p>${article.excerpt}</p><button class="text-link" data-open-article="${article.id}" style="border:0;background:none;padding:0">继续阅读 ${icon("arrow")}</button></div></article>
            `).join("")}
          </div>
        </div>
      </section>
    `, "page-light");
  }

  function pageProfile() {
    const name = state.session?.name || "山隐茶客";
    return pageShell(`
      <header class="page-main">
        <div class="container reveal">
          <p class="kicker">MY TEA LIBRARY · 个人茶库</p>
          <h1 class="page-title">把每一杯喜欢，<br>收进自己的茶库。</h1>
        </div>
      </header>
      <section class="section" style="padding-top:0">
        <div class="container profile-grid">
          <aside class="profile-card reveal">
            <div class="profile-avatar">${name.slice(0,1)}</div>
            <h1>${escapeHtml(name)}</h1>
            <p class="profile-rank">观茶者 · 初阶</p>
            <p>${state.session?.guest ? "你正在以游客身份浏览，收藏会保存在当前浏览器。" : "你的茶事偏好与收藏保存在当前浏览器。"}</p>
            <div class="profile-tabs" id="profileTabs">
              <button class="active" data-profile-tab="overview">${icon("chart")} 茶事概览</button>
              <button data-profile-tab="favorites">${icon("bookmark")} 我的收藏</button>
              <button data-profile-tab="bookings">${icon("calendar")} 我的预约</button>
            </div>
          </aside>
          <section class="profile-content reveal" id="profileContent"></section>
        </div>
      </section>
    `);
  }

  function pageAbout() {
    return pageShell(`
      <section class="about-hero">
        <div class="container reveal">
          <p class="kicker">ABOUT SHANYIN · 关于山隐</p>
          <h1>我们相信，<br>茶文化可以自然抵达日常。</h1>
          <p>山隐茶事是一份开放的茶文化视觉提案：以真实山场为起点，以清楚的知识、可执行的冲泡方法，以及有温度的社区关系，让茶不再只是被仰望的传统。</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${sectionHead("OUR PRINCIPLES", "我们如何理解一杯好茶", "不以玄虚制造门槛，不用单一标准定义好喝。")}
          <div class="value-grid reveal">
            <article class="value-card">${icon("mountain")}<h3>尊重山场</h3><p>每款茶都尽量注明真实产区、海拔与代表性工艺，不用模糊的“古树”叙事替代事实。</p></article>
            <article class="value-card">${icon("hand")}<h3>记录手艺</h3><p>把采摘、萎凋、杀青、揉捻和焙火讲清楚，让制茶师的经验成为可以被理解的知识。</p></article>
            <article class="value-card">${icon("chart")}<h3>让数据可读</h3><p>可视化用于建立比较，不用于制造权威。每个人的味觉经验都值得被记录。</p></article>
            <article class="value-card">${icon("spark")}<h3>审慎使用 AI</h3><p>AI 只提供茶文化与冲泡参考，对健康、医疗与功效问题保持边界，并鼓励回到真实茶汤。</p></article>
          </div>
        </div>
      </section>
      <section class="section light-section" style="background:var(--paper);color:var(--ink)">
        <div class="container story-grid reveal">
          <article class="story-card"><span class="story-number">内容准则</span><h3>先有事实，<br>再有诗。</h3><p>山场、工艺、茶样与冲泡参数尽量给出可追溯来源。文学性的表达可以传递感受，但不能替代事实。</p></article>
          <article class="story-card dark"><span class="story-number">图片来源</span><h3>真实照片，<br>可见出处。</h3><p>演示图片来自用户提供的茶山照片、Pixabay 与 Rawpixel 公共领域素材，用于网页视觉设计与交互展示。</p></article>
        </div>
      </section>
    `);
  }

  function render() {
    const route = currentRoute();
    selectedRegionId = state.selectedRegion || "jingmai";
    document.title = (routeMeta[route]?.[1] || routeMeta.home[1]);
    const templates = {
      home: pageHome,
      culture: pageCulture,
      regions: pageRegions,
      audit: pageData,
      ai: pageAi,
      community: pageCommunity,
      collection: pageCollection,
      experience: pageExperience,
      articles: pageArticles,
      profile: pageProfile,
      about: pageAbout
    };
    view.innerHTML = templates[route]();
    siteHeader.classList.toggle("is-light", route === "articles");
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === route || (route === "audit" && link.dataset.nav === "regions"));
    });
    bindRoute(route);
    optimizeImages();
    initReveal();
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.documentElement.style.removeProperty("scroll-behavior"));
    document.getElementById("mobileDrawer").classList.remove("open");
    document.getElementById("mobileDrawer").setAttribute("aria-hidden", "true");
  }

  function bindRoute(route) {
    if (route === "culture") bindCulture();
    if (route === "regions") bindRegions();
    if (route === "audit") bindData();
    if (route === "ai") bindAi();
    if (route === "community") {
      renderEvents();
      bindCommunity();
    }
    if (route === "collection") {
      renderTeaGrid();
      bindCollection();
    }
    if (route === "experience") bindExperience();
    if (route === "profile") renderProfile("overview");
  }

  function bindCulture() {
    renderStage(activeStage);
    document.querySelectorAll("[data-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        activeStage = Number(button.dataset.stage);
        renderStage(activeStage);
      });
    });
  }

  function renderStage(index) {
    const stage = stages[index];
    const menu = document.getElementById("stageMenu");
    const visual = document.getElementById("stageVisual");
    const detail = document.getElementById("stageDetail");
    if (!menu || !visual || !detail) return;
    menu.innerHTML = stages.map((item, itemIndex) => `<button data-stage="${itemIndex}" class="${itemIndex === index ? "active" : ""}"><span>${item.number} · ${item.en}</span><strong>${item.name}</strong></button>`).join("");
    visual.innerHTML = `<img src="${stage.image}" alt="${stage.name}工艺"><div class="stage-visual-label"><small class="eyebrow">${stage.en}</small><h3>${stage.title}</h3><p>${stage.description}</p></div>`;
    detail.innerHTML = `<span class="large-index">${stage.number}</span><h3>${stage.name}</h3><p>${stage.description}</p><dl><div><dt>时间线索</dt><dd>${stage.season}</dd></div><div><dt>工艺方式</dt><dd>${stage.craft}</dd></div><div><dt>关注重点</dt><dd>${stage.focus}</dd></div></dl>`;
    document.querySelectorAll("[data-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        activeStage = Number(button.dataset.stage);
        renderStage(activeStage);
      });
    });
  }

  function bindRegions() {
    renderRegionInfo();
    document.querySelectorAll("[data-region]").forEach((spot) => {
      const select = () => {
        selectedRegionId = spot.dataset.region;
        state.selectedRegion = selectedRegionId;
        saveState();
        document.querySelectorAll("[data-region]").forEach((item) => item.classList.toggle("active", item.dataset.region === selectedRegionId));
        renderRegionInfo();
      };
      spot.addEventListener("click", select);
      spot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });
  }

  function bindData() {
    document.querySelectorAll("[data-tea-type]").forEach((button) => {
      button.addEventListener("click", () => {
        activeTeaType = button.dataset.teaType;
        document.querySelectorAll("[data-tea-type]").forEach((item) => item.classList.toggle("active", item === button));
        const profiles = {
          "全部": [82, 68, 74, 56, 71],
          "绿茶": [72, 46, 58, 64, 69],
          "白茶": [61, 74, 67, 71, 62],
          "黄茶": [67, 58, 72, 62, 59],
          "乌龙茶": [91, 67, 86, 78, 84],
          "红茶": [76, 82, 88, 73, 66],
          "黑茶": [54, 69, 91, 76, 87],
          "花茶": [88, 79, 59, 63, 51],
          "普洱茶": [79, 72, 92, 81, 89]
        };
        const values = profiles[activeTeaType] || profiles["全部"];
        document.querySelector(".radar-card").innerHTML = `<h3>风味雷达 · <span>${activeTeaType}</span></h3>${radarMarkup(values)}`;
        const matchingRegions = activeTeaType === "全部" ? regions : regions.filter((region) => region.types.includes(activeTeaType));
        const matchingTeas = activeTeaType === "全部" ? teas : teas.filter((tea) => tea.type === activeTeaType);
        document.getElementById("regionCount").textContent = String(matchingRegions.length);
        document.getElementById("sampleCount").textContent = String(matchingTeas.length);
      });
    });
  }

  function bindAi() {
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    chatForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const prompt = chatInput.value.trim();
      if (!prompt) return;
      chatInput.value = "";
      sendAiPrompt(prompt);
    });
    chatInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
      }
    });
    document.querySelectorAll("[data-prompt]").forEach((button) => {
      button.addEventListener("click", () => sendAiPrompt(button.dataset.prompt));
    });
  }

  function sendAiPrompt(prompt) {
    const log = document.getElementById("chatLog");
    if (!log) return;
    log.insertAdjacentHTML("beforeend", `<div class="chat-message user"><span class="message-avatar">${icon("user")}</span><div class="message-bubble">${escapeHtml(prompt)}</div></div>`);
    const typing = document.createElement("div");
    typing.className = "chat-message ai";
    typing.innerHTML = `<span class="message-avatar">${icon("leaf")}</span><div class="message-bubble typing"><i></i><i></i><i></i></div>`;
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    const reply = createAiReply(prompt);
    window.setTimeout(() => {
      typing.remove();
      log.insertAdjacentHTML("beforeend", `<div class="chat-message ai"><span class="message-avatar">${icon("leaf")}</span><div class="message-bubble">${reply.html}</div></div>`);
      log.scrollTop = log.scrollHeight;
    }, 650);
  }

  function findMentionedTea(prompt) {
    return teas.find((tea) => {
      const names = [tea.name, ...(teaAliases[tea.id] || [])];
      return names.some((name) => prompt.includes(name));
    });
  }

  function findMentionedTeaType(prompt) {
    return teaTypes.find((type) => teaTypeAliases[type].some((alias) => prompt.includes(alias)));
  }

  function createTeaBrewReply(tea, heading = `${tea.name}的冲泡建议`) {
    const guide = teaBrewGuides[tea.type];
    return {
      tea: tea.name,
      html: `
        <strong>${heading}</strong>
        <p style="margin:8px 0 0">${tea.type} · ${tea.origin}。${tea.summary}</p>
        <div class="mini-brew">
          <span>${icon("thermometer")}${tea.temperature}</span>
          <span>${icon("scale")}${tea.amount}</span>
          <span>${icon("drop")}${tea.water}</span>
          <span>${icon("clock")}${tea.time}</span>
        </div>
        <ol class="ai-answer-list">
          <li><b>温杯投茶：</b>先温热器皿，再投入 ${tea.amount}。茶器可选${guide.vessel}。</li>
          <li><b>注水出汤：</b>用约 ${tea.temperature} 的水沿器壁注水，首泡约 ${tea.time} 后一次倒尽。</li>
          <li><b>续泡调整：</b>第二泡起小幅延时；若茶汤偏浓，优先缩短时间，再考虑减少投茶。</li>
        </ol>
        <p class="ai-answer-note">${guide.note}</p>
        <p style="margin:9px 0 0">${tea.story}</p>
        <button class="text-link" data-save-ai-recipe="${tea.name}" style="margin-top:10px;border:0;background:none;padding:0">收藏这份冲泡方案 ${icon("bookmark")}</button>
      `
    };
  }

  function createAiReply(prompt) {
    const promptText = prompt.replace(/\s+/g, "");
    const priorityGuide = aiKnowledgeTopics.find((item) => item.priority && item.test.test(promptText));
    if (priorityGuide) return { tea: null, html: priorityGuide.render() };

    const mentionedTea = findMentionedTea(promptText);
    if (mentionedTea) return createTeaBrewReply(mentionedTea);

    const mentionedType = findMentionedTeaType(promptText);
    if (mentionedType) {
      const sample = teas.find((tea) => tea.type === mentionedType) || teas[0];
      return createTeaBrewReply(sample, `${mentionedType}的冲泡参考 · ${sample.name}`);
    }

    const generalGuide = aiKnowledgeTopics.find((item) => !item.priority && item.test.test(promptText));
    if (generalGuide) return { tea: null, html: generalGuide.render() };

    const rule = aiRules.find((item) => item.test.test(promptText));
    if (rule) {
      return {
        tea: rule.tea,
        html: `
          <strong>为此刻，推荐 ${rule.tea}</strong>
          <p style="margin:8px 0 0">${rule.culture}</p>
          <div class="mini-brew">
            <span>${icon("thermometer")}${rule.temperature}</span>
            <span>${icon("scale")}${rule.amount}</span>
            <span>${icon("drop")}${rule.water}</span>
            <span>${icon("clock")}${rule.time}</span>
          </div>
          <p style="margin:10px 0 0">${rule.note}</p>
          <button class="text-link" data-save-ai-recipe="${rule.tea}" style="margin-top:10px;border:0;background:none;padding:0">收藏这份冲泡方案 ${icon("bookmark")}</button>
        `
      };
    }

    return {
      tea: null,
      html: `
        <strong>我还需要一点更明确的线索</strong>
        <p style="margin:8px 0 0">你可以直接问冲泡方法、茶水参数、某种茶的特点或保存方式，也可以描述此刻的场景让我推荐。</p>
        <ul>
          <li>“泡茶的步骤”</li>
          <li>“龙井怎么泡”</li>
          <li>“白茶要洗茶吗”</li>
          <li>“晚上想喝一杯温和的茶”</li>
        </ul>
      `
    };
  }

  function renderEvents() {
    const grid = document.getElementById("eventGrid");
    if (!grid) return;
    const filtered = events.filter((event) => {
      const cityOk = activeCommunityCity === "全部" || event.city === activeCommunityCity;
      const typeOk = activeCommunityType === "全部" || event.type === activeCommunityType;
      return cityOk && typeOk;
    });
    grid.innerHTML = filtered.length
      ? filtered.map((event) => {
          const saved = state.favorites.includes(`event:${event.id}`);
          const joined = state.joinedEvents.includes(event.id);
          return `<article class="event-card reveal visible">
            <div class="event-card-image"><img src="${event.image}" alt="${event.title}"><span class="event-status">${joined ? "已加入" : event.seats}</span><button class="event-save ${saved ? "saved" : ""}" data-save-event="${event.id}" aria-label="收藏活动">${icon("heart")}</button></div>
            <div class="event-body"><h3>${event.title}</h3><p>${event.description}</p><div class="event-info-row"><span>${icon("location")}${event.city}</span><span>${icon("calendar")}${event.date}</span></div><div class="event-actions"><button class="button button-outline" data-open-event="${event.id}">${joined ? "查看茶席" : "了解详情"}</button><button class="button button-gold" data-join-event="${event.id}">${joined ? "已加入" : "加入茶席"}</button></div></div>
          </article>`;
        }).join("")
      : `<div class="empty-state" style="grid-column:1/-1">${icon("search")}<strong>暂未找到符合条件的茶事</strong><span>换一个城市或活动类型试试。</span></div>`;
  }

  function bindCommunity() {
    document.querySelectorAll("[data-community-city]").forEach((button) => {
      button.addEventListener("click", () => {
        activeCommunityCity = button.dataset.communityCity;
        document.querySelectorAll("[data-community-city]").forEach((item) => item.classList.toggle("active", item === button));
        renderEvents();
      });
    });
    document.getElementById("communityTypeFilter")?.addEventListener("change", (event) => {
      activeCommunityType = event.target.value;
      renderEvents();
    });
  }

  function renderTeaGrid() {
    const grid = document.getElementById("teaGrid");
    if (!grid) return;
    const filtered = activeTeaType === "全部" ? teas : teas.filter((tea) => tea.type === activeTeaType);
    document.getElementById("teaResultCount").textContent = `共 ${filtered.length} 款 · ${teaTypes.length} 个茶类`;
    grid.innerHTML = filtered.length
      ? filtered.map((tea) => {
          const saved = state.favorites.includes(`tea:${tea.id}`);
          const typeKey = teaTypeKeys[tea.type];
          return `<article class="tea-card tea-type-${typeKey} reveal visible">
            <div class="tea-card-head">
              <span class="tea-card-type">${tea.type}</span>
              <span class="tea-card-origin">${tea.origin}</span>
            </div>
            <div class="tea-card-main">
              <span class="tea-card-mark" aria-hidden="true">${teaTypeMarks[tea.type]}</span>
              <div>
                <h3>${tea.name}</h3>
                <p>${tea.summary}</p>
              </div>
            </div>
            <div class="tea-tags">${tea.tags.map((tag)=>`<span>${tag}</span>`).join("")}</div>
            <div class="tea-brew-profile">
              <span>${icon("thermometer")}<b>${tea.temperature}</b></span>
              <span>${icon("scale")}<b>${tea.amount}</b></span>
              <span>${icon("drop")}<b>${tea.water}</b></span>
              <span>${icon("clock")}<b>${tea.time}</b></span>
            </div>
            <div class="tea-footer"><span class="tea-price">¥${tea.price} / 50g</span><button data-save-tea="${tea.id}" aria-label="收藏茶样">${icon(saved ? "heart" : "bookmark")}</button></div>
            <button class="button button-outline button-wide tea-detail-button" data-open-tea="${tea.id}">查看风味卡 ${icon("arrow")}</button>
          </article>`;
        }).join("")
      : `<div class="empty-state" style="grid-column:1/-1">${icon("leaf")}<strong>这一茶类正在整理</strong><span>浏览其他茶类，或回到全部茶样。</span></div>`;
  }

  function bindCollection() {
    document.querySelectorAll("[data-tea-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeTeaType = button.dataset.teaFilter;
        document.querySelectorAll("[data-tea-filter]").forEach((item) => item.classList.toggle("active", item === button));
        renderTeaGrid();
      });
    });
  }

  function bindExperience() {
    document.querySelectorAll("[data-booking-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedBookingSlot = button.dataset.bookingSlot;
        document.querySelectorAll("[data-booking-slot]").forEach((item) => item.classList.toggle("active", item === button));
      });
    });
  }

  function renderProfile(tab = "overview") {
    const container = document.getElementById("profileContent");
    if (!container) return;
    document.querySelectorAll("[data-profile-tab]").forEach((button) => button.classList.toggle("active", button.dataset.profileTab === tab));
    if (tab === "favorites") {
      const favoriteTeas = teas.filter((tea) => state.favorites.includes(`tea:${tea.id}`));
      const favoriteEvents = events.filter((event) => state.favorites.includes(`event:${event.id}`));
      const items = [
        ...favoriteTeas.map((tea) => ({ image: "", icon: "leaf", title: tea.name, meta: `${tea.type} · ${tea.origin}` })),
        ...favoriteEvents.map((event) => ({ image: event.image, icon: "calendar", title: event.title, meta: `${event.city} · ${event.date}` }))
      ];
      container.innerHTML = `<h2>我的收藏</h2><p class="section-desc">喜欢的茶样与茶席会保存在当前浏览器中。</p>${items.length ? `<div class="saved-list">${items.map((item)=>`<div class="saved-item">${item.image ? `<img src="${item.image}" alt="">` : `<span class="saved-icon">${icon(item.icon)}</span>`}<div><strong>${item.title}</strong><span>${item.meta}</span></div>${icon("bookmark")}</div>`).join("")}</div>` : emptyState("还没有收藏", "在茶集或社区中保存喜欢的内容。")}`;
    } else if (tab === "bookings") {
      container.innerHTML = `<h2>我的预约</h2><p class="section-desc">这里记录演示预约状态，不会占用真实席位。</p>${state.bookings.length ? `<div class="saved-list">${state.bookings.map((booking)=>`<div class="saved-item"><img src="${assets.landscape2}" alt=""><div><strong>${booking.title}</strong><span>${booking.date} · ${booking.slot}</span></div>${icon("check")}</div>`).join("")}</div>` : emptyState("还没有预约茶席", "去体验页选择一场喜欢的茶席。")}`;
    } else {
      container.innerHTML = `
        <h2>茶事概览</h2>
        <p class="section-desc">把收藏、冲泡方案和线下茶席放在同一处，慢慢形成你自己的喝茶方式。</p>
        <div class="profile-stat-row">
          <div class="profile-stat"><strong>${state.favorites.length}</strong><span>收藏内容</span></div>
          <div class="profile-stat"><strong>${state.bookings.length}</strong><span>茶席预约</span></div>
          <div class="profile-stat"><strong>${state.joinedEvents.length}</strong><span>加入茶事</span></div>
        </div>
        <div class="saved-list" style="margin-top:36px">
          <div class="saved-item"><img src="${assets.landscape3}" alt=""><div><strong>今日推荐 · 狮峰龙井</strong><span>基于你的浏览偏好与当前时段</span></div><a href="#/collection">${icon("arrow")}</a></div>
          <div class="saved-item"><img src="${assets.valley}" alt=""><div><strong>山河茶图 · 景迈山</strong><span>你最近查看的茶区</span></div><a href="#/regions">${icon("arrow")}</a></div>
        </div>
        <div class="community-banner" style="margin-top:24px">${icon("spark")}<div><strong>继续问茶</strong><span>告诉 AI 你今晚想喝什么。</span></div><a class="button button-gold" href="#/ai" style="margin-left:auto">打开 AI 茶事</a></div>`;
    }
    document.querySelectorAll("[data-profile-tab]").forEach((button) => {
      button.onclick = () => renderProfile(button.dataset.profileTab);
    });
  }

  function emptyState(title, text) {
    return `<div class="empty-state">${icon("leaf")}<strong>${title}</strong><span>${text}</span></div>`;
  }

  function initReveal() {
    const elements = document.querySelectorAll(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((el, index) => {
      if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", index % 6);
      observer.observe(el);
    });
  }

  function optimizeImages() {
    document.querySelectorAll("#view img").forEach((image, index) => {
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.fetchPriority = index === 0 ? "high" : "low";
    });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function startSession(name, guest = false) {
    state.session = { name: name || "山隐茶客", guest, startedAt: new Date().toISOString() };
    saveState();
    updateIdentity();
    authLayer.classList.add("hidden");
    authLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    showToast(guest ? "已进入游客漫游模式" : "欢迎回到山隐茶事");
  }

  function updateIdentity() {
    const name = state.session?.name || "山隐茶客";
    document.getElementById("avatarInitial").textContent = name.slice(0, 1);
    document.getElementById("menuAvatarInitial").textContent = name.slice(0, 1);
    document.getElementById("menuUserName").textContent = name;
  }

  function switchAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-register-only]").forEach((element) => {
      element.hidden = mode !== "register";
    });
    authSubmitText.textContent = mode === "register" ? "创建我的茶库" : "进入山隐";
    document.getElementById("authPassword").autocomplete = mode === "register" ? "new-password" : "current-password";
    authError.textContent = "";
  }

  function initAuth() {
    if (state.session) {
      authLayer.classList.add("hidden");
      authLayer.setAttribute("aria-hidden", "true");
      updateIdentity();
    } else {
      document.body.classList.add("locked");
      updateIdentity();
    }
    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => switchAuthMode(button.dataset.authMode));
    });
    document.querySelector(".reveal-password")?.addEventListener("click", () => {
      const input = document.getElementById("authPassword");
      input.type = input.type === "password" ? "text" : "password";
    });
    authForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const phone = document.getElementById("authPhone").value.trim();
      const password = document.getElementById("authPassword").value;
      const name = document.getElementById("authName").value.trim();
      const agree = document.getElementById("authAgree").checked;
      if (!/^1\d{10}$/.test(phone)) {
        authError.textContent = "请输入 11 位演示手机号，例如 13800138000。";
        return;
      }
      if (password.length < 6) {
        authError.textContent = "密码至少需要 6 位。";
        return;
      }
      if (!agree) {
        authError.textContent = "请先同意用户协议与隐私说明。";
        return;
      }
      startSession(authMode === "register" ? name || "新茶友" : "山隐茶客");
    });
    document.getElementById("guestEnter").addEventListener("click", () => startSession("游客茶客", true));
    document.querySelectorAll(".social-login button").forEach((button) => {
      button.addEventListener("click", () => startSession(button.getAttribute("aria-label") === "游客浏览" ? "游客茶客" : "山隐茶客", button.getAttribute("aria-label") === "游客浏览"));
    });
  }

  function initHeader() {
    const more = document.querySelector(".nav-more");
    more?.querySelector("button")?.addEventListener("click", (event) => {
      event.stopPropagation();
      more.classList.toggle("open");
      more.querySelector("button").setAttribute("aria-expanded", String(more.classList.contains("open")));
    });
    document.addEventListener("click", (event) => {
      if (!more?.contains(event.target)) more?.classList.remove("open");
      if (!accountMenu.contains(event.target) && !document.getElementById("avatarButton").contains(event.target)) {
        accountMenu.classList.remove("open");
      }
    });
    document.getElementById("avatarButton").addEventListener("click", (event) => {
      event.stopPropagation();
      accountMenu.classList.toggle("open");
    });
    document.getElementById("logoutButton").addEventListener("click", () => {
      state.session = null;
      saveState();
      accountMenu.classList.remove("open");
      authLayer.classList.remove("hidden");
      authLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      switchAuthMode("login");
    });
    document.getElementById("mobileMenuButton").addEventListener("click", () => {
      mobileDrawer.classList.add("open");
      mobileDrawer.setAttribute("aria-hidden", "false");
    });
    document.getElementById("closeMobileMenu").addEventListener("click", () => {
      mobileDrawer.classList.remove("open");
      mobileDrawer.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll(".mobile-drawer a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        mobileDrawer.setAttribute("aria-hidden", "true");
      });
    });
    document.getElementById("aiFloating").addEventListener("click", () => {
      location.hash = "#/ai";
    });
  }

  function initSearch() {
    const open = () => {
      searchOverlay.classList.add("open");
      searchOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      window.setTimeout(() => globalSearch.focus(), 50);
      runSearch("");
    };
    const close = () => {
      searchOverlay.classList.remove("open");
      searchOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("locked");
      globalSearch.value = "";
    };
    document.querySelector(".search-trigger").addEventListener("click", open);
    document.getElementById("closeSearch").addEventListener("click", close);
    document.getElementById("searchOverlay").addEventListener("click", (event) => {
      if (event.target.id === "searchOverlay") close();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
      if (event.key === "Escape") {
        close();
        closeModal();
      }
    });
    globalSearch.addEventListener("input", () => runSearch(globalSearch.value));
    searchResults.addEventListener("click", (event) => {
      const button = event.target.closest("[data-search-route]");
      if (!button) return;
      close();
      location.hash = `#/${button.dataset.searchRoute}`;
      const target = button.dataset.searchTarget;
      if (target) {
        window.setTimeout(() => {
          if (button.dataset.searchRoute === "regions") {
            const spot = document.querySelector(`[data-region="${target}"]`);
            spot?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
          }
          if (button.dataset.searchRoute === "articles") openArticle(target);
        }, 80);
      }
    });
  }

  function runSearch(query) {
    const normalized = query.trim().toLowerCase();
    const matches = searchIndex.filter((item) => !normalized || `${item.title}${item.desc}`.toLowerCase().includes(normalized)).slice(0, 9);
    searchResults.innerHTML = matches.length
      ? matches.map((item) => `<button class="search-result" data-search-route="${item.route}" data-search-target="${item.target || ""}"><span>${icon(item.icon)}</span><div><strong>${item.title}</strong><small>${item.desc}</small></div>${icon("arrow")}</button>`).join("")
      : `<div class="empty-state">${icon("search")}<strong>没有找到相关结果</strong><span>试试茶类、产区或文章主题。</span></div>`;
  }

  function openModal(html) {
    modalContent.innerHTML = html;
    modalLayer.classList.add("open");
    modalLayer.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    modalLayer.querySelector(".modal-close")?.focus();
  }

  function closeModal() {
    modalLayer.classList.remove("open");
    modalLayer.setAttribute("aria-hidden", "true");
    if (!searchOverlay.classList.contains("open") && authLayer.classList.contains("hidden")) {
      document.body.classList.remove("locked");
    }
  }

  function openTea(id) {
    const tea = teas.find((item) => item.id === id);
    if (!tea) return;
    const saved = state.favorites.includes(`tea:${tea.id}`);
    const typeKey = teaTypeKeys[tea.type];
    openModal(`
      <div class="tea-modal-head tea-type-${typeKey}">
        <span>${teaTypeMarks[tea.type]}</span>
        <div><p class="kicker">${tea.type} · ${tea.origin}</p><h2>${tea.name}</h2></div>
      </div>
      <p>${tea.summary}</p>
      <div class="ai-recipe">
        <div>${icon("thermometer")}<strong>${tea.temperature}</strong><span>水温</span></div>
        <div>${icon("scale")}<strong>${tea.amount}</strong><span>投茶</span></div>
        <div>${icon("drop")}<strong>${tea.water}</strong><span>注水</span></div>
        <div>${icon("clock")}<strong>${tea.time}</strong><span>首泡</span></div>
      </div>
      <div class="modal-details"><div>风味关键词<strong>${tea.tags.join(" · ")}</strong></div><div>参考价格<strong>¥${tea.price} / 50g</strong></div></div>
      <p style="margin-top:22px">${tea.story}</p>
      <div class="modal-actions"><button class="button button-gold" data-modal-save-tea="${tea.id}">${saved ? "已收藏" : "收藏这款茶"} ${icon("bookmark")}</button><a class="button button-outline" href="#/ai" data-close-modal>让 AI 帮我冲泡</a></div>
    `);
  }

  function openEvent(id) {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    const joined = state.joinedEvents.includes(id);
    openModal(`
      <img class="modal-image" src="${event.image}" alt="${event.title}">
      <p class="kicker">${event.type} · ${event.city}</p>
      <h2>${event.title}</h2>
      <p>${event.description}</p>
      <div class="modal-details"><div>时间<strong>${event.date}</strong></div><div>主理人<strong>${event.host}</strong></div><div>席位<strong>${joined ? "你已加入" : event.seats}</strong></div><div>体验价<strong>${event.price}</strong></div></div>
      <div class="modal-actions"><button class="button button-gold" data-modal-join-event="${event.id}">${joined ? "已加入茶席" : "加入这场茶席"}</button><button class="button button-outline" data-modal-save-event="${event.id}">收藏活动 ${icon("heart")}</button></div>
    `);
  }

  function openArticle(id) {
    const article = articles.find((item) => item.id === id);
    if (!article) return;
    openModal(`
      <img class="modal-image" src="${article.image}" alt="${article.title}">
      <p class="kicker">${article.category} · ${article.read}</p>
      <h2>${article.title}</h2>
      ${article.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      <div class="modal-actions"><button class="button button-gold" data-modal-save-event="article:${article.id}">收藏文章 ${icon("bookmark")}</button><a class="button button-outline" href="#/ai" data-close-modal>问 AI 一个茶问题</a></div>
    `);
  }

  function toggleFavorite(key) {
    if (state.favorites.includes(key)) {
      state.favorites = state.favorites.filter((item) => item !== key);
      showToast("已从收藏中移除");
    } else {
      state.favorites.push(key);
      showToast("已收藏到我的茶库");
    }
    saveState();
  }

  function toggleEventJoin(id) {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    if (state.joinedEvents.includes(id)) {
      state.joinedEvents = state.joinedEvents.filter((item) => item !== id);
      showToast("已退出这场茶事");
    } else {
      state.joinedEvents.push(id);
      showToast(`已加入「${event.title}」`);
    }
    saveState();
    renderEvents();
    if (modalLayer.classList.contains("open")) openEvent(id);
  }

  function confirmBooking(title) {
    const exists = state.bookings.some((booking) => booking.title === title && booking.slot === selectedBookingSlot);
    if (!exists) {
      state.bookings.push({ title, slot: selectedBookingSlot, date: "10月26日", created: new Date().toISOString() });
      saveState();
      showToast(`已预约 ${selectedBookingSlot} 茶席`);
    } else {
      showToast("这个场次已经在你的预约中");
    }
    openModal(`<p class="kicker">预约成功 · 演示模式</p><h2>${title}</h2><p>你的茶席时间已经记录到「我的茶库」。这是前端演示，不会产生真实订单或支付。</p><div class="modal-details"><div>日期<strong>10月26日 · 周日</strong></div><div>场次<strong>${selectedBookingSlot}</strong></div><div>地点<strong>武夷山 · 山隐茶室</strong></div><div>人数<strong>1 人</strong></div></div><div class="modal-actions"><a class="button button-gold" href="#/profile" data-close-modal>查看我的预约 ${icon("arrow")}</a><a class="button button-outline" href="#/community">继续逛茶友社区</a></div>`);
  }

  function initGlobalDelegates() {
    document.addEventListener("click", (event) => {
      const saveTea = event.target.closest("[data-save-tea], [data-modal-save-tea]");
      if (saveTea) {
        const id = saveTea.dataset.saveTea || saveTea.dataset.modalSaveTea;
        toggleFavorite(`tea:${id}`);
        if (currentRoute() === "collection") renderTeaGrid();
        if (saveTea.dataset.modalSaveTea) openTea(id);
      }
      const openTeaButton = event.target.closest("[data-open-tea]");
      if (openTeaButton) openTea(openTeaButton.dataset.openTea);
      const openEventButton = event.target.closest("[data-open-event]");
      if (openEventButton) openEvent(openEventButton.dataset.openEvent);
      const joinEvent = event.target.closest("[data-join-event], [data-modal-join-event]");
      if (joinEvent) toggleEventJoin(joinEvent.dataset.joinEvent || joinEvent.dataset.modalJoinEvent);
      const saveEvent = event.target.closest("[data-save-event], [data-modal-save-event]");
      if (saveEvent) {
        const id = saveEvent.dataset.saveEvent || saveEvent.dataset.modalSaveEvent;
        toggleFavorite(`event:${id}`);
        if (currentRoute() === "community") renderEvents();
      }
      const openArticleButton = event.target.closest("[data-open-article]");
      if (openArticleButton) openArticle(openArticleButton.dataset.openArticle);
      const saveAi = event.target.closest("[data-save-ai-recipe]");
      if (saveAi) {
        toggleFavorite(`recipe:${saveAi.dataset.saveAiRecipe}`);
        saveAi.textContent = "已收藏";
      }
      const confirmBookingButton = event.target.closest("[data-confirm-booking]");
      if (confirmBookingButton) confirmBooking(confirmBookingButton.dataset.confirmBooking);
      if (event.target.closest("[data-close-modal]")) closeModal();
      const createEvent = event.target.closest("[data-create-event]");
      if (createEvent) {
        openModal(`<p class="kicker">发起茶事</p><h2>把一席茶放进城市里</h2><p>填写主题、时间与地点，即可创建一场茶席。此页面为交互演示，表单暂不提交到后端。</p><div class="profile-stat-row"><div class="profile-stat"><strong>01</strong><span>选择主题</span></div><div class="profile-stat"><strong>02</strong><span>设置席位</span></div><div class="profile-stat"><strong>03</strong><span>邀请茶友</span></div></div><div class="modal-actions"><button class="button button-gold" data-demo-create>创建演示茶席</button></div>`);
      }
      if (event.target.closest("[data-demo-create]")) {
        closeModal();
        showToast("已生成茶席草稿（演示）");
      }
    });
    window.addEventListener("hashchange", () => {
      closeModal();
      render();
    });
  }

  function init() {
    initAuth();
    initHeader();
    initSearch();
    initGlobalDelegates();
    updateIdentity();
    render();
  }

  init();
})();
