import type { Plan } from '../types';

export const PLANS: Plan[] = [
  // OpenAI 套餐
  {
    id: 'gpt-plus',
    name: 'GPT Plus',
    brand: 'openai',
    price: 130,
    officialPriceUSD: 20,
    quotaInfo: '每 5 小时额度自动刷新',
    description: '支持最新 GPT-6-Astra、GPT-5.6-Sol 等顶级模型，日常工作学习高性价比首选。',
    badge: '日常爆款 · 极高性价比',
    highlight: true,
    suitedFor: '个人日常办公、文献查阅、代码辅助、学生与科研人员',
    features: [
      '官方正版手动直充（支持开通录屏凭证）',
      '支持最新 GPT-6-Astra / GPT-5.6-Sol 旗舰模型',
      '支持 GPT-5.6 Terra / GPT-5.6-Luna 矩阵',
      '支持最新 GPT-Image-2.5 旗舰生图与高级数据分析',
      '专属自定义 GPTs 应用生态无限使用',
      '完全无需提供账号密码，向日葵/ToDesk 远程直充',
      '提供 30 天售后保障与技术咨询'
    ]
  },
  {
    id: 'gpt-pro-5x',
    name: 'GPT Pro 5x',
    brand: 'openai',
    price: 669,
    officialPriceUSD: 100,
    quotaInfo: 'Plus 的 5 倍使用额度',
    description: '适合轻度高频开发者与创作者，畅享 GPT-6-Astra 与 GPT-5.6 全系 5 倍充沛额度。',
    badge: '进阶高频',
    highlight: false,
    suitedFor: '自媒体批量生产、全栈开发者日常密集 Code Review、小微工作室',
    features: [
      '官方正规渠道直充，无降级封号风险',
      '享有相当于标准 Plus 500% 的充沛额度',
      '全天候畅享 GPT-6-Astra、GPT-5.6-Sol、Terra 与 Luna',
      '支持 GPT-Image-2.5 极速高清商业绘图',
      '高峰期极速响应通道，大容量长上下文推理不限流',
      '远程桌面透明操作，密码全程由您亲自输入',
      '提供 30 天质保服务'
    ]
  },
  {
    id: 'gpt-pro-20x',
    name: 'GPT Pro 20x',
    brand: 'openai',
    price: 1099,
    officialPriceUSD: 200,
    quotaInfo: 'Plus 的 20 倍超大额度',
    description: '重度用户首选顶配旗舰版，顶格 20 倍澎湃算力，全天候肆意挥洒 GPT-6-Astra。',
    badge: '顶配算力 · 开发者首选',
    highlight: false,
    suitedFor: '重度 AI 工作流全自动化、企业高管、核心技术架构师',
    features: [
      'Plus 20 倍澎湃算力上限，高强度连续调用不锁额度',
      '顶格支持 GPT-6-Astra / GPT-5.6-Sol / Terra / Luna 旗舰模型',
      '顶格配额 GPT-Image-2.5 高保真文生图极速渲染',
      '无限制体验 OpenAI 最强长程思考力与最新实验特性',
      '官方 200 美元原版会员代缴直充',
      '向日葵/ToDesk 远程直连操作，全程可开录屏留证',
      '30 天长效售后保障，一对一专人对接'
    ]
  },

  // Claude 套餐
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    brand: 'claude',
    price: 160,
    officialPriceUSD: 20,
    quotaInfo: '5 倍免费版用量 & 优先访问权',
    description: '基础会员，擅长长文深度分析与精细代码，全面支持 Sonnet 5 与 Opus 5 模型。',
    badge: '人文深度 · 文档利器',
    highlight: true,
    suitedFor: '长文案创作、法律与学术论文润色、长代码重构排查',
    features: [
      '全面支持最新 Sonnet 5 与 Opus 5 顶级思考模型',
      '支持 200K Tokens 超长上下文超大文件一次性投喂',
      'Projects 项目工作区与自建私有知识库功能',
      '远程一对一协助直充，绝不索要账号密码',
      '建议确认好日本/美国纯净住宅网络环境',
      '提供 30 天正品售后与解疑服务'
    ]
  },
  {
    id: 'claude-max-5x',
    name: 'Claude Max 5x',
    brand: 'claude',
    price: 710,
    officialPriceUSD: 100,
    quotaInfo: 'Pro 的 5 倍高额度 · 独享 Fable',
    description: '中等使用量版本，支持 Sonnet 5、Opus 5，并独享 Fable 5 & Fable 5.1 深度推理模型。',
    badge: '中度专业版',
    highlight: false,
    suitedFor: '独立开发者、咨询顾问、分析师、深度文献研究员',
    features: [
      '官方 100 美元原版套餐合规直缴',
      '全面支持 Sonnet 5、Opus 5 顶级旗舰模型',
      '独享解锁 Fable 5 & Fable 5.1 高级深度推理模型',
      '5 倍于 Claude Pro 的超高对话与代码调用额度',
      '高峰期享有最高级别免排队高速算力通道',
      '远程操作全程透明，密码 100% 由您亲自输入',
      '30 天售后保障支持'
    ]
  },
  {
    id: 'claude-max-20x',
    name: 'Claude Max 20x',
    brand: 'claude',
    price: 1500,
    officialPriceUSD: 200,
    quotaInfo: 'Pro 的 20 倍海量额度 · 独享 Fable',
    description: '高额度旗舰版，顶格畅享 Sonnet 5、Opus 5 及 Fable 5 & Fable 5.1，适合高频调用与团队协同。',
    badge: '企业/团队级顶配',
    highlight: false,
    suitedFor: '团队协同账号、重度代码生成工作流、高频大文件处理专家',
    features: [
      '官方 200 美元原版套餐，顶格 20 倍海量额度配额',
      '全面支持 Sonnet 5、Opus 5 及 Fable 5 & Fable 5.1 顶级模型',
      '支持海量上下文长文本高频交互与多任务并发处理',
      '支持全程向日葵/ToDesk 远程协助充值',
      '支持录屏留痕，拒绝任何黑产 Access Token 违规风险',
      '专属客服优先响应与 30 天售后兜底'
    ]
  }
];
