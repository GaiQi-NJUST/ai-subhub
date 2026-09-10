import type { AirportRecommendation } from '../types';

export const SITE_CONFIG = {
  title: 'AI 会员官方直充服务站',
  subTitle: '长期稳定 · 价格透明 · 远程直充 · 0 密码泄露 · 30天售后保障',
  
  // 客服与支付信息
  service: {
    wechat: 'February41',
    wechatName: '時(*琪)',
    wechatQr: './wechat-qr.jpg',
    alipay: '18143178588',
    alipayName: '盖琪(*琪)',
    alipayQr: './alipay-qr.jpg',
    hours: '工作日 19:00 ~ 24:00',
    hoursTip: '服务时间内秒回消息，一对一远程协助；非工作时间预约次日 19:00 起优先安排',
    startHour: 19,
    endHour: 24,
  },

  // 远程软件
  remoteSoftware: [
    {
      name: '向日葵远程控制 (推荐)',
      url: 'https://sunlogin.oray.com/download',
      desc: '支持免安装绿色运行，快捷生成识别码与验证码，安全性高。',
      badge: '首选免安装'
    },
    {
      name: 'ToDesk 远程桌面',
      url: 'https://www.todesk.com/download.html',
      desc: '轻量高效，跨平台兼容 Windows 与 macOS 系统。',
      badge: '稳定流畅'
    }
  ],

  // 科学上网工具介绍
  networkTool: {
    name: 'Clash Verge Rev',
    githubUrl: 'https://github.com/clash-verge-rev/clash-verge-rev',
    desc: '基于 Clash 内核的现代图形化代理客户端，负责管理订阅节点与规则分流。',
    defaultProxyPort: '127.0.0.1:7897',
    steps: [
      {
        step: 1,
        title: '打开系统代理',
        desc: '在 Clash Verge 左侧导航进入「设置」页面，将【系统代理】总开关保持开启状态。'
      },
      {
        step: 2,
        title: '导入订阅链接',
        desc: '在魔法网站控制台复制订阅链接，切换至 Clash Verge 的「订阅」页面，粘贴并点击保存下载。'
      },
      {
        step: 3,
        title: '选择纯净节点',
        desc: '切换至「代理」面板，建议选择延迟低且稳定的节点（推荐日本/美国住宅或常用原生节点）。'
      },
      {
        step: 4,
        title: '开启 Tun 虚拟网卡模式',
        desc: '如果网页加载受阻，可右键客户端图标「以管理员身份运行」，在设置中开启「Tun 虚拟网卡模式」，接管全局网络流量。'
      },
      {
        step: 5,
        title: '本地默认端口确认',
        desc: '客户端默认监听混合代理端口为 127.0.0.1:7897，确保没有与其他本地服务冲突。'
      }
    ]
  },

  // 推荐机场
  airports: [
    {
      name: '狗狗加速',
      url: 'https://www.dginv.click/#/register?code=y5T730K',
      feeNote: '注意：此站点订阅需额外加手续费 6.9 元',
      desc: '支持一键快速导入 Clash Verge，节点分布广，节点更新及时。',
      badge: '备选节点 1'
    },
    {
      name: 'NanoCloud',
      url: 'https://edu.360buyimg.men/auth/register?code=U3gS8Fyj',
      feeNote: '按需选购对应流量套餐',
      desc: '性价比较高的日常加速站点，提供高速直连与专线中转。',
      badge: '备选节点 2'
    }
  ] as AirportRecommendation[]
};
