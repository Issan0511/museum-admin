export type AdminKpiMonthlyRow = {
  month: string;
  totalVisitors: number;
  newMembers: number;
  giftShopRevenue: number;
  satisfactionScore: number;
  channelBreakdown: { channel: string; visitors: number }[];
  exhibitionHighlights: string[];
};

export type AdminChatAggregatesMonthlyRow = {
  month: string;
  craft: string;
  totalConversations: number;
  avgResponseTimeSeconds: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topTopics: string[];
};

export type AdminChatSummaryRow = {
  date: string;
  craft: string;
  summary: string;
  recommendation: string;
  metadata: {
    trendingQuestions: string[];
    needsEscalation: boolean;
    notes: string;
  };
};

type RawKpiRow = {
  month: string;
  total_visitors: string;
  new_members: string;
  gift_shop_revenue: string;
  satisfaction_score: string;
  channel_breakdown: string;
  exhibition_highlights: string;
};

type RawChatAggregateRow = {
  month: string;
  craft: string;
  total_conversations: string;
  avg_response_time_seconds: string;
  sentiment: string;
  top_topics: string;
};

type RawChatSummaryRow = {
  date: string;
  craft: string;
  summary: string;
  recommendation: string;
  metadata: string;
};

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON field", value, error);
    return fallback;
  }
}

const rawAdminKpiMonthly: RawKpiRow[] = [
  {
    month: "2024-01",
    total_visitors: "12480",
    new_members: "365",
    gift_shop_revenue: "18250",
    satisfaction_score: "4.6",
    channel_breakdown:
      '[{"channel":"Onsite","visitors":8450},{"channel":"Online","visitors":4030}]',
    exhibition_highlights: '["Impressionist Revival","Sound & Light"]',
  },
  {
    month: "2024-02",
    total_visitors: "11890",
    new_members: "342",
    gift_shop_revenue: "17540",
    satisfaction_score: "4.5",
    channel_breakdown:
      '[{"channel":"Onsite","visitors":7920},{"channel":"Online","visitors":3970}]',
    exhibition_highlights: '["Textile Journeys","Renaissance Sketches"]',
  },
  {
    month: "2024-03",
    total_visitors: "13140",
    new_members: "402",
    gift_shop_revenue: "19480",
    satisfaction_score: "4.7",
    channel_breakdown:
      '[{"channel":"Onsite","visitors":8760},{"channel":"Online","visitors":4380}]',
    exhibition_highlights: '["Contemporary Ceramics","Digital Futures"]',
  },
];

const rawAdminChatAggregatesMonthly: RawChatAggregateRow[] = [
  {
    month: "2024-01",
    craft: "Textiles",
    total_conversations: "245",
    avg_response_time_seconds: "32",
    sentiment:
      '{"positive":68,"neutral":24,"negative":8}',
    top_topics: '["Weaving classes","Dye workshops","Membership"]',
  },
  {
    month: "2024-02",
    craft: "Textiles",
    total_conversations: "230",
    avg_response_time_seconds: "30",
    sentiment:
      '{"positive":70,"neutral":20,"negative":10}',
    top_topics: '["Loom maintenance","Seasonal exhibits","Gift shop"]',
  },
  {
    month: "2024-01",
    craft: "Woodworking",
    total_conversations: "180",
    avg_response_time_seconds: "45",
    sentiment:
      '{"positive":60,"neutral":28,"negative":12}',
    top_topics: '["Carving demos","Tool safety","Commission requests"]',
  },
  {
    month: "2024-02",
    craft: "Woodworking",
    total_conversations: "192",
    avg_response_time_seconds: "41",
    sentiment:
      '{"positive":64,"neutral":26,"negative":10}',
    top_topics: '["Workshop availability","Youth programs","Membership"]',
  },
  {
    month: "2024-03",
    craft: "Metalwork",
    total_conversations: "205",
    avg_response_time_seconds: "38",
    sentiment:
      '{"positive":66,"neutral":23,"negative":11}',
    top_topics: '["Forge tours","Safety gear","Special exhibits"]',
  },
];

const rawAdminChatSummaries: RawChatSummaryRow[] = [
  {
    date: "2024-03-01",
    craft: "Textiles",
    summary:
      "Visitors are eager for hands-on weaving experiences and ask for advanced class schedules.",
    recommendation:
      "Add an intermediate weaving track and surface the waitlist link more prominently.",
    metadata:
      '{"trendingQuestions":["Do you provide looms?","Are there drop-in sessions?"],"needsEscalation":false,"notes":"Collaborate with retail to bundle starter kits."}',
  },
  {
    date: "2024-03-05",
    craft: "Woodworking",
    summary:
      "Most chats revolve around safety requirements and custom commission lead times.",
    recommendation:
      "Publish a safety checklist PDF and create a request form outlining average timelines.",
    metadata:
      '{"trendingQuestions":["Do I need prior experience?","How long for a custom table?"],"needsEscalation":true,"notes":"Coordinate with facilities about weekend classes."}',
  },
  {
    date: "2024-03-08",
    craft: "Metalwork",
    summary:
      "Guests ask about forge demonstrations and purchasing small metal pieces.",
    recommendation:
      "Schedule additional demo slots and feature local artist merchandise online.",
    metadata:
      '{"trendingQuestions":["Can I watch the forge?","Do you sell jewelry?"],"needsEscalation":false,"notes":"Plan a collaborative event with jewelry designers."}',
  },
];

export const adminKpiMonthly: AdminKpiMonthlyRow[] = rawAdminKpiMonthly.map(
  (row) => ({
    month: row.month,
    totalVisitors: Number(row.total_visitors),
    newMembers: Number(row.new_members),
    giftShopRevenue: Number(row.gift_shop_revenue),
    satisfactionScore: Number(row.satisfaction_score),
    channelBreakdown: parseJsonField(row.channel_breakdown, [] as { channel: string; visitors: number }[]),
    exhibitionHighlights: parseJsonField(row.exhibition_highlights, [] as string[]),
  })
);

export const adminChatAggregatesMonthly: AdminChatAggregatesMonthlyRow[] =
  rawAdminChatAggregatesMonthly.map((row) => ({
    month: row.month,
    craft: row.craft,
    totalConversations: Number(row.total_conversations),
    avgResponseTimeSeconds: Number(row.avg_response_time_seconds),
    sentiment: parseJsonField(row.sentiment, {
      positive: 0,
      neutral: 0,
      negative: 0,
    }),
    topTopics: parseJsonField(row.top_topics, [] as string[]),
  }));

export const adminChatSummaries: AdminChatSummaryRow[] = rawAdminChatSummaries.map(
  (row) => ({
    date: row.date,
    craft: row.craft,
    summary: row.summary,
    recommendation: row.recommendation,
    metadata: parseJsonField(row.metadata, {
      trendingQuestions: [],
      needsEscalation: false,
      notes: "",
    }),
  })
);
