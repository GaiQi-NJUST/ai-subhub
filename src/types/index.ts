export type BrandType = 'openai' | 'claude';

export interface Plan {
  id: string;
  name: string;
  brand: BrandType;
  price: number;
  officialPriceUSD: number;
  quotaInfo: string;
  description: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  suitedFor: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  planId: string;
  planName: string;
  brand: BrandType;
  price: number;
  contactType: 'wechat' | 'phone' | 'email';
  contactValue: string;
  remoteTool: 'sunlogin' | 'todesk';
  osType: 'windows' | 'macos';
  note?: string;
  paymentMethod: 'wechat' | 'alipay';
  status: OrderStatus;
  createdAt: string;
  userId?: string;          // 绑定的登录用户 ID
  userAccount?: string;     // 绑定的登录用户账号 (手机/邮箱)
}

export interface UserProfile {
  id: string;
  account: string;          // 手机号或邮箱
  accountType: 'phone' | 'email';
  nickname?: string;        // 用户自定义昵称
  createdAt: string;        // 注册时间
  savedContact?: string;    // 上次使用的联系方式 (微信号)
  savedRemoteTool?: 'sunlogin' | 'todesk'; // 上次使用的远程协助软件
  savedOsType?: 'windows' | 'macos';       // 上次使用的操作系统
}

export interface FaqItem {
  question: string;
  answer: string;
  tag?: string;
}

export interface AirportRecommendation {
  name: string;
  url: string;
  feeNote?: string;
  desc: string;
  badge?: string;
}

export interface PlanCostConfig {
  planId: string;
  planName: string;
  brand: BrandType;
  sellingPrice: number;
  costPrice: number; // 店主进货卡池成本
  enabled: boolean;
}

export interface FinanceSummary {
  totalRevenue: number;     // 总营收 (元)
  totalCost: number;        // 总成本 (元)
  netProfit: number;        // 净利润 (元)
  profitMargin: number;     // 综合利润率 (%)
  totalOrders: number;      // 总订单数
  completedOrders: number;  // 已完成订单数
  pendingRevenue: number;   // 待履约金额 (元)
}

export interface ShopSettings {
  wechat: string;
  wechatName: string;
  alipay: string;
  alipayName: string;
  isOnline: boolean;
  notice?: string;
}
