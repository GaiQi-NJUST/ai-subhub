import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const COSTS_FILE = path.join(DATA_DIR, 'costs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PORT = process.env.PORT || 3001;

// 确保数据目录与基础文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 默认 12 位高强度管理员密钥
const DEFAULT_ADMIN_PASSWORD = 'SubHub@2026#Master!';

// 默认成本配置
const DEFAULT_PLAN_COSTS = [
  { planId: 'gpt-plus', planName: 'GPT Plus', brand: 'openai', sellingPrice: 130, costPrice: 110, enabled: true },
  { planId: 'gpt-pro-5x', planName: 'GPT Pro 5x', brand: 'openai', sellingPrice: 669, costPrice: 580, enabled: true },
  { planId: 'gpt-pro-20x', planName: 'GPT Pro 20x', brand: 'openai', sellingPrice: 1099, costPrice: 920, enabled: true },
  { planId: 'claude-pro', planName: 'Claude Pro', brand: 'claude', sellingPrice: 160, costPrice: 115, enabled: true },
  { planId: 'claude-max-5x', planName: 'Claude Max 5x', brand: 'claude', sellingPrice: 710, costPrice: 600, enabled: true },
  { planId: 'claude-max-20x', planName: 'Claude Max 20x', brand: 'claude', sellingPrice: 1500, costPrice: 1250, enabled: true },
];

function readOrders() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
}

function readCosts() {
  try {
    if (fs.existsSync(COSTS_FILE)) {
      const raw = fs.readFileSync(COSTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading costs file:', err);
  }
  return DEFAULT_PLAN_COSTS;
}

function writeCosts(costs) {
  try {
    fs.writeFileSync(COSTS_FILE, JSON.stringify(costs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing costs file:', err);
  }
}

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return {
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    wechat: 'February41',
    wechatName: '時(*琪)',
    alipay: '18143178588',
    alipayName: '盖琪(*琪)',
    isOnline: true,
  };
}

function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

// 订单单号算法解码器 (Node 端)
function decodeOrderNumber(orderId) {
  const trimmed = (orderId || '').trim().toUpperCase();
  const parts = trimmed.split('-');
  const isSmart = parts.length >= 6 && parts[0] === 'ORD';

  const PLAN_NAMES = {
    PLUS: { brand: 'openai', name: 'GPT Plus', price: 130, usd: 20, models: ['GPT-6-Astra', 'GPT-5.6-Sol', 'GPT-5.6 Terra', 'GPT-5.6-Luna', 'GPT-Image-2.5'] },
    P5X: { brand: 'openai', name: 'GPT Pro 5x', price: 669, usd: 100, models: ['GPT-6-Astra', 'GPT-5.6-Sol', 'GPT-5.6 Terra', 'GPT-5.6-Luna', 'GPT-Image-2.5'] },
    P20: { brand: 'openai', name: 'GPT Pro 20x', price: 1099, usd: 200, models: ['GPT-6-Astra', 'GPT-5.6-Sol', 'GPT-5.6 Terra', 'GPT-5.6-Luna', 'GPT-Image-2.5'] },
    CPR: { brand: 'claude', name: 'Claude Pro', price: 160, usd: 20, models: ['Sonnet 5', 'Opus 5'] },
    M5X: { brand: 'claude', name: 'Claude Max 5x', price: 710, usd: 100, models: ['Sonnet 5', 'Opus 5', 'Fable 5 (Max独享)', 'Fable 5.1 (Max独享)'] },
    M20: { brand: 'claude', name: 'Claude Max 20x', price: 1500, usd: 200, models: ['Sonnet 5', 'Opus 5', 'Fable 5 (Max独享)', 'Fable 5.1 (Max独享)'] },
  };

  const orders = readOrders();
  const matched = orders.find(o => o.id && o.id.toUpperCase() === trimmed);

  if (!isSmart) {
    if (matched) {
      return {
        id: matched.id,
        isValidFormat: true,
        brand: matched.brand,
        brandName: matched.brand === 'openai' ? 'OpenAI 官方' : 'Anthropic Claude 官方',
        planName: matched.planName,
        price: matched.price,
        orderTimeText: matched.createdAt,
        contactHint: matched.contactValue,
        fullOrder: matched,
      };
    }
    return {
      id: orderId,
      isValidFormat: false,
      brandName: '未知平台',
      planName: '未识别格式单号',
      price: 0,
      orderTimeText: '无法解析',
      contactHint: '未知',
    };
  }

  const brandCode = parts[1]; // OAI / CLD
  const planCode = parts[2];  // PLUS / P5X / P20 / CPR / M5X / M20
  const timeCode = parts[3];  // YYMMDDHHmm
  const contactSuffix = parts[4];

  const planInfo = PLAN_NAMES[planCode] || {
    brand: brandCode === 'CLD' ? 'claude' : 'openai',
    name: planCode,
    price: 0,
    usd: 0,
    models: []
  };

  let parsedTime = '未知时间';
  if (timeCode && timeCode.length === 10) {
    const y = '20' + timeCode.slice(0, 2);
    const m = timeCode.slice(2, 4);
    const d = timeCode.slice(4, 6);
    const h = timeCode.slice(6, 8);
    const min = timeCode.slice(8, 10);
    parsedTime = `${y}-${m}-${d} ${h}:${min}:00`;
  }

  return {
    id: trimmed,
    isValidFormat: true,
    brand: planInfo.brand,
    brandName: planInfo.brand === 'openai' ? 'OpenAI 官方' : 'Anthropic Claude 官方',
    planName: planInfo.name,
    price: planInfo.price,
    officialPriceUSD: planInfo.usd,
    models: planInfo.models,
    orderTimeText: matched ? matched.createdAt : parsedTime,
    contactHint: matched ? `${matched.contactValue} (${matched.contactType})` : `后缀: ...${contactSuffix}`,
    fullOrder: matched,
  };
}

// 极简高性能 HTTP 服务
const server = http.createServer(async (req, res) => {
  // CORS 支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // JSON 解析辅助
  const getBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });

  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // 1. GET /api/health
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(200, { status: 'ok', serverTime: new Date().toISOString() });
  }

  // 2. GET /api/orders (获取所有订单)
  if (pathname === '/api/orders' && req.method === 'GET') {
    const orders = readOrders();
    return sendJSON(200, { success: true, count: orders.length, data: orders });
  }

  // 3. POST /api/orders (客户下单上报)
  if (pathname === '/api/orders' && req.method === 'POST') {
    const newOrder = await getBody();
    if (!newOrder.id) {
      return sendJSON(400, { success: false, message: 'Missing order ID' });
    }
    const orders = readOrders();
    const filtered = orders.filter(o => o.id !== newOrder.id);
    const updated = [newOrder, ...filtered];
    writeOrders(updated);
    return sendJSON(201, { success: true, message: 'Order recorded', data: newOrder });
  }

  // 4. POST /api/orders/decode (根据单号逆向解析)
  if (pathname === '/api/orders/decode' && req.method === 'POST') {
    const { orderId } = await getBody();
    if (!orderId) {
      return sendJSON(400, { success: false, message: 'orderId is required' });
    }
    const decoded = decodeOrderNumber(orderId);
    return sendJSON(200, { success: true, data: decoded });
  }

  // 5. GET /api/orders/:id (按单号精确查询)
  if (pathname.startsWith('/api/orders/') && !pathname.includes('/status') && req.method === 'GET') {
    const id = pathname.replace('/api/orders/', '');
    const orders = readOrders();
    const found = orders.find(o => o.id && o.id.toLowerCase() === id.toLowerCase());
    if (found) {
      return sendJSON(200, { success: true, data: found });
    }
    const decoded = decodeOrderNumber(id);
    return sendJSON(200, { success: true, data: decoded, fallback: true });
  }

  // 6. PATCH /api/orders/:id/status (店主修改订单状态)
  if (pathname.includes('/status') && req.method === 'PATCH') {
    const parts = pathname.split('/');
    const id = parts[3];
    const { status } = await getBody();
    const orders = readOrders();
    const target = orders.find(o => o.id === id);
    if (!target) {
      return sendJSON(404, { success: false, message: 'Order not found in database' });
    }
    target.status = status;
    writeOrders(orders);
    return sendJSON(200, { success: true, message: 'Status updated', data: target });
  }

  // 7. GET /api/costs (获取成本配置)
  if (pathname === '/api/costs' && req.method === 'GET') {
    const costs = readCosts();
    return sendJSON(200, { success: true, data: costs });
  }

  // 8. POST /api/costs (店主保存成本配置)
  if (pathname === '/api/costs' && req.method === 'POST') {
    const newCosts = await getBody();
    if (!Array.isArray(newCosts)) {
      return sendJSON(400, { success: false, message: 'Invalid costs data format' });
    }
    writeCosts(newCosts);
    return sendJSON(200, { success: true, message: 'Costs saved', data: newCosts });
  }

  // 9. GET /api/settings (获取店铺与安全配置)
  if (pathname === '/api/settings' && req.method === 'GET') {
    const settings = readSettings();
    const safeSettings = { ...settings };
    delete safeSettings.adminPassword; // 不向前端明文暴露
    return sendJSON(200, { success: true, data: safeSettings });
  }

  // 10. POST /api/settings (保存店铺配置)
  if (pathname === '/api/settings' && req.method === 'POST') {
    const body = await getBody();
    const current = readSettings();
    const updated = {
      ...current,
      wechat: body.wechat || current.wechat,
      wechatName: body.wechatName || current.wechatName,
      alipay: body.alipay || current.alipay,
      alipayName: body.alipayName || current.alipayName,
      isOnline: body.isOnline !== undefined ? body.isOnline : current.isOnline,
    };
    writeSettings(updated);
    return sendJSON(200, { success: true, message: 'Shop settings updated', data: updated });
  }

  // 11. POST /api/auth/verify (后台管理口令验证)
  if (pathname === '/api/auth/verify' && req.method === 'POST') {
    const { password } = await getBody();
    const settings = readSettings();
    const expected = settings.adminPassword || DEFAULT_ADMIN_PASSWORD;
    if (password === expected) {
      return sendJSON(200, { success: true, message: 'Authenticated' });
    }
    return sendJSON(401, { success: false, message: 'Invalid password' });
  }

  // 12. POST /api/auth/change-password (店主修改高强度管理口令)
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    const { oldPassword, newPassword } = await getBody();
    const settings = readSettings();
    const expected = settings.adminPassword || DEFAULT_ADMIN_PASSWORD;
    if (oldPassword !== expected) {
      return sendJSON(401, { success: false, message: '原口令校验失败' });
    }
    if (!newPassword || newPassword.length < 8) {
      return sendJSON(400, { success: false, message: '新密码长度至少需要8位以上' });
    }
    settings.adminPassword = newPassword;
    writeSettings(settings);
    return sendJSON(200, { success: true, message: '口令修改成功' });
  }

  // 默认 404
  return sendJSON(404, { success: false, message: 'API Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`[AI-SubHub Backend] Running at http://localhost:${PORT}`);
});
