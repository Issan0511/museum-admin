export type KpiCard = {
  label: string;
  value: number;
  diff: number; // 前年同月比などの増減率（%）
};

export type SimpleRatioItem = {
  label: string;
  value: number;
};

export type ChatThemeRatio = {
  label: string;
  ratio: number; // 0〜1
};

export type OverallChatSummaryData = {
  totalQuestions: number;
  mainThemes: ChatThemeRatio[];
  summary: string;
  actions: string[];
};

export type CraftChatSummaryItem = {
  craft: string;
  volume: number;
  topIntents: ChatThemeRatio[];
  aiSummary: string;
  actions: string[];
};

export type MonthlyDashboardData = {
  monthLabel: string; // "2025年10月" など表示用
  highlights: string[];
  kpiCards: KpiCard[];
  rankingData: SimpleRatioItem[];
  languageData: SimpleRatioItem[];
  ageData: SimpleRatioItem[];
  overallChatSummary: OverallChatSummaryData;
  craftChatSummaries: CraftChatSummaryItem[];
};

export const monthlyDashboardData: Record<string, MonthlyDashboardData> = {
  "2025-10": {
    monthLabel: "2025年10月",
    highlights: [
      "来館者数が前年同月比+12%で過去最高を更新",
      "英語・中国語の閲覧率が上昇し、多言語利用が拡大",
      "AIチャットの質問数増加により、工芸別の関心傾向が明確化",
      "人気テーマ：西陣織、金箔、京焼・清水焼の三つが全体の7割を占める",
    ],
    kpiCards: [
      { label: "来館者数", value: 12840, diff: 12 },
      { label: "Webアクセス数", value: 54210, diff: 9 },
      { label: "AIチャット総質問数", value: 1840, diff: 15 },
    ],
    rankingData: [
      { label: "西陣織", value: 980 },
      { label: "金箔", value: 720 },
      { label: "清水焼", value: 560 },
      { label: "漆芸", value: 410 },
      { label: "竹工芸", value: 350 },
      { label: "京扇子", value: 300 },
      { label: "友禅染", value: 260 },
      { label: "京金具", value: 240 },
      { label: "京人形", value: 200 },
      { label: "京提灯", value: 150 },
    ],
    languageData: [
      { label: "日本語", value: 62 },
      { label: "英語", value: 23 },
      { label: "中国語", value: 10 },
      { label: "韓国語", value: 5 },
    ],
    ageData: [
      { label: "〜20代", value: 18 },
      { label: "30代", value: 27 },
      { label: "40代", value: 24 },
      { label: "50代", value: 20 },
      { label: "60代〜", value: 11 },
    ],
    overallChatSummary: {
      totalQuestions: 1840,
      mainThemes: [
        { label: "工芸の歴史背景", ratio: 0.34 },
        { label: "制作工程", ratio: 0.28 },
        { label: "体験に関する質問", ratio: 0.22 },
        { label: "購入・メンテナンス", ratio: 0.16 },
      ],
      summary:
        "利用者は“物語性の理解”と“制作工程の可視化”を求める傾向が強い。体験の詳細導線を整理することで満足度が上がる見込み。",
      actions: [
        "工芸別の工程説明を強化",
        "体験予約の導線を改善",
        "初心者向けガイドを追加",
      ],
    },
    craftChatSummaries: [
      {
        craft: "西陣織",
        volume: 342,
        topIntents: [
          { label: "技法の歴史/背景", ratio: 0.36 },
          { label: "図案・紋紙の工程", ratio: 0.28 },
          { label: "体験の所要時間", ratio: 0.14 },
        ],
        aiSummary:
          "来訪者は“背景の物語”を求める傾向が強く、図案工程の図解需要が高い。",
        actions: ["工程図を1枚目に固定", "3行サマリ（日英）", "関連展示リンクを追加"],
      },
      {
        craft: "金箔",
        volume: 198,
        topIntents: [
          { label: "材料の入手/購入", ratio: 0.33 },
          { label: "体験予約/料金", ratio: 0.31 },
          { label: "加飾の耐久性/保存", ratio: 0.19 },
        ],
        aiSummary:
          "“購入・体験”系の意図が中心。価格情報を上部にまとめると離脱が抑えられる。",
        actions: ["料金表の固定表示", "予約ボタンの強調", "保存方法Q&Aを追加"],
      },
      {
        craft: "京焼・清水焼",
        volume: 221,
        topIntents: [
          { label: "窯元/工房の違い", ratio: 0.29 },
          { label: "釉薬/焼成温度", ratio: 0.27 },
          { label: "購入場所", ratio: 0.18 },
        ],
        aiSummary:
          "技術要素の深掘りが多く、図表・写真による比較が有効。",
        actions: ["釉薬比較の図表", "用語ツールチップ追加", "工房紹介を上部へ"],
      },
      {
        craft: "蒔絵",
        volume: 187,
        topIntents: [
          { label: "漆・金粉の素材説明", ratio: 0.34 },
          { label: "工程（下地〜研ぎ出し）", ratio: 0.30 },
          { label: "体験可能な技法の違い", ratio: 0.16 },
        ],
        aiSummary:
          "素材・工程に関する“深い理解”を求める利用者が多い。",
        actions: ["工程図の追加", "体験技法比較表", "素材説明の強化"],
      },
      {
        craft: "友禅染",
        volume: 176,
        topIntents: [
          { label: "手描き/型染の違い", ratio: 0.31 },
          { label: "染料・糊置き工程", ratio: 0.27 },
          { label: "体験内容/時間", ratio: 0.18 },
        ],
        aiSummary:
          "“違いを知りたい”需要が高いため、比較図解が有効。",
        actions: ["手描き・型染の図解", "体験工程の明確化", "染料基礎知識を追加"],
      },
    ],
  },
  "2025-11": {
    monthLabel: "2025年11月",
    highlights: [
      "文化の日連休で来館者数が高水準を維持",
      "英語版サイトの直帰率が前月比-4%で改善",
      "工芸体験の予約経路が多様化し、予約フォーム経由が6割に",
      "AIチャットの“ギフト需要”質問が増加し、冬商戦の兆候",
    ],
    kpiCards: [
      { label: "来館者数", value: 13210, diff: 10 },
      { label: "Webアクセス数", value: 56180, diff: 11 },
      { label: "AIチャット総質問数", value: 1965, diff: 17 },
    ],
    rankingData: [
      { label: "西陣織", value: 1020 },
      { label: "京焼・清水焼", value: 690 },
      { label: "金箔", value: 640 },
      { label: "竹工芸", value: 480 },
      { label: "京扇子", value: 420 },
      { label: "蒔絵", value: 360 },
      { label: "友禅染", value: 300 },
      { label: "京金具", value: 260 },
      { label: "京人形", value: 210 },
      { label: "金工", value: 190 },
    ],
    languageData: [
      { label: "日本語", value: 58 },
      { label: "英語", value: 25 },
      { label: "中国語", value: 11 },
      { label: "韓国語", value: 6 },
    ],
    ageData: [
      { label: "〜20代", value: 20 },
      { label: "30代", value: 29 },
      { label: "40代", value: 23 },
      { label: "50代", value: 18 },
      { label: "60代〜", value: 10 },
    ],
    overallChatSummary: {
      totalQuestions: 1965,
      mainThemes: [
        { label: "ギフト・購入相談", ratio: 0.31 },
        { label: "制作工程", ratio: 0.26 },
        { label: "体験予約/料金", ratio: 0.24 },
        { label: "保存・メンテナンス", ratio: 0.19 },
      ],
      summary:
        "冬のギフト需要が高まり、購入相談系の質問が増加。体験予約は価格・空き状況の明確化が求められている。",
      actions: [
        "ギフト向けセット商品の訴求強化",
        "予約フォームに“空き枠カレンダー”を追加",
        "保存・お手入れの動画コンテンツを配置",
      ],
    },
    craftChatSummaries: [
      {
        craft: "西陣織",
        volume: 360,
        topIntents: [
          { label: "柄の由来・意味", ratio: 0.32 },
          { label: "贈答向けおすすめ", ratio: 0.30 },
          { label: "体験の所要時間", ratio: 0.15 },
        ],
        aiSummary:
          "贈答用途の相談が増え、柄の意味を説明するコンテンツの需要が拡大。",
        actions: ["柄の意味紹介カード", "ギフト包装の案内", "体験予約導線を上部に配置"],
      },
      {
        craft: "京焼・清水焼",
        volume: 274,
        topIntents: [
          { label: "窯元ごとの特徴", ratio: 0.31 },
          { label: "ギフトセットの提案", ratio: 0.26 },
          { label: "配送/海外発送", ratio: 0.18 },
        ],
        aiSummary:
          "各窯元の違いを比較したい声が増加。配送オプションの明示で購入意欲が高まる。",
        actions: ["窯元比較表", "ギフト用セットの在庫表示", "海外発送可否の明記"],
      },
      {
        craft: "金箔",
        volume: 226,
        topIntents: [
          { label: "装飾の耐久性", ratio: 0.29 },
          { label: "購入価格/在庫", ratio: 0.27 },
          { label: "体験の持ち物", ratio: 0.17 },
        ],
        aiSummary:
          "購入・体験の具体的な準備情報が求められ、価格・在庫の明確化が離脱防止に有効。",
        actions: ["価格表の更新頻度を上げる", "予約完了メールに持ち物案内", "耐久性Q&Aの拡充"],
      },
      {
        craft: "竹工芸",
        volume: 205,
        topIntents: [
          { label: "体験の難易度", ratio: 0.33 },
          { label: "作品の活用例", ratio: 0.25 },
          { label: "材料の調達", ratio: 0.17 },
        ],
        aiSummary:
          "初心者向けの体験需要が高く、完成後の活用イメージを示すと満足度が上がる。",
        actions: ["難易度別の体験メニュー", "完成作品の利用例紹介", "材料購入リンクを追加"],
      },
      {
        craft: "蒔絵",
        volume: 196,
        topIntents: [
          { label: "体験予約/料金", ratio: 0.34 },
          { label: "技法の違い", ratio: 0.27 },
          { label: "手入れ方法", ratio: 0.16 },
        ],
        aiSummary:
          "料金や所要時間への関心が上昇。基本技法の違いを分かりやすく示すと理解が深まる。",
        actions: ["料金と所要時間をカード化", "技法比較の動画リンク", "メンテナンスガイドの設置"],
      },
    ],
  },
};

export const availableMonths = Object.keys(monthlyDashboardData).sort();

export const getPreviousMonthSlug = (baseDate = new Date()) => {
  const previous = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
  const year = previous.getFullYear();
  const month = String(previous.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const resolveDefaultMonthSlug = (baseDate = new Date()) => {
  const candidate = getPreviousMonthSlug(baseDate);
  if (monthlyDashboardData[candidate]) {
    return candidate;
  }

  const latest = [...availableMonths].sort().at(-1);
  return latest ?? candidate;
};
