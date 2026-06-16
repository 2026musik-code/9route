import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  Apimini: any; // KVNamespace
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

const getKV = async (c: any, key: string, defaultVal: any) => {
  try {
    const val = await c.env.Apimini.get(key, 'json');
    return val || defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const putKV = async (c: any, key: string, val: any) => {
  try {
    await c.env.Apimini.put(key, JSON.stringify(val));
  } catch (e) {
    console.error("KV Put Error", e);
  }
};

const API_KEY = "sk-29fa8223c11e1e03-1b921u-9fe190d7";
const TARGET_URL = "https://api.cloudflaremini.biz.id/v1/chat/completions";

const api = app.basePath('/api');

// --- Models ---
api.get('/v1/models', async (c) => {
  let modelsCache = await getKV(c, 'models', []);
  if (modelsCache.length === 0) {
    try {
      const response = await fetch("https://api.cloudflaremini.biz.id/v1/models", {
        headers: { "Authorization": `Bearer ${API_KEY}` }
      });
      const data: any = await response.json();
      if (data && data.data) {
        modelsCache = data.data;
        await putKV(c, 'models', modelsCache);
      }
    } catch (e) {
      console.error("Failed to load models");
    }
  }
  return c.json({ object: "list", data: modelsCache });
});

api.delete('/v1/models/entry', async (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: "No ID provided" }, 400);
  let modelsCache = await getKV(c, 'models', []);
  modelsCache = modelsCache.filter((m: any) => m.id !== id);
  await putKV(c, 'models', modelsCache);
  return c.json({ success: true, deleted: id });
});

api.post('/v1/models', async (c) => {
  const { id, owned_by } = await c.req.json();
  if (!id || !owned_by) return c.json({ error: "Missing fields" }, 400);
  let modelsCache = await getKV(c, 'models', []);
  const newModel = { id, object: "model", owned_by };
  modelsCache.unshift(newModel);
  await putKV(c, 'models', modelsCache);
  return c.json({ success: true, data: newModel });
});

// --- Endpoints ---
api.get('/v1/endpoints', async (c) => {
    const eps = await getKV(c, 'endpoints', [{ id: "ep-1", method: "POST", path: "/api/v1/chat/completions" }]);
    return c.json({ data: eps });
});
api.post('/v1/endpoints', async (c) => {
    let eps = await getKV(c, 'endpoints', []);
    const { method, path, description } = await c.req.json();
    const newEndpoint = { id: "ep-" + Date.now(), method: method.toUpperCase(), path, description: description || "" };
    eps.push(newEndpoint);
    await putKV(c, 'endpoints', eps);
    return c.json({ success: true, data: newEndpoint });
});
api.delete('/v1/endpoints/:id', async (c) => {
    const id = c.req.param('id');
    let eps = await getKV(c, 'endpoints', []);
    eps = eps.filter((e: any) => e.id !== id);
    await putKV(c, 'endpoints', eps);
    return c.json({ success: true });
});

// --- Settings ---
api.get('/v1/settings', async (c) => {
    const settings = await getKV(c, 'settings', { rpm: 60, rpd: 50000, enforceApiKey: true, logRequests: true });
    return c.json({ success: true, data: settings });
});
api.post('/v1/settings', async (c) => {
    let settings = await getKV(c, 'settings', { rpm: 60, rpd: 50000, enforceApiKey: true, logRequests: true });
    const body = await c.req.json();
    settings = { ...settings, ...body };
    await putKV(c, 'settings', settings);
    return c.json({ success: true, data: settings });
});

// --- Users ---
api.get('/v1/users', async (c) => {
    const users = await getKV(c, 'users', [{ id: '1', name: "Dedi Supriadi", email: "ceodedi@gmail.com", role: "Admin", plan: "Pro", rpdLimit: 50000 }]);
    return c.json({ success: true, data: users });
});
api.put('/v1/users/:id', async (c) => {
    const id = c.req.param('id');
    let users = await getKV(c, 'users', []);
    const body = await c.req.json();
    users = users.map((u: any) => {
        if(u.id === id) {
             return { ...u, ...body };
        }
        return u;
    });
    
    // Also update totalLimit in quota if rpdLimit changed
    if (body.rpdLimit) {
        let quota = await getKV(c, `quota_${id}`, { used: 0, totalLimit: body.rpdLimit, history: [], logs: [] });
        quota.totalLimit = body.rpdLimit;
        await putKV(c, `quota_${id}`, quota);
    }
    
    await putKV(c, 'users', users);
    return c.json({ success: true });
});

// --- API Keys ---
api.get('/v1/apikeys', async (c) => {
    const keys = await getKV(c, 'apikeys', [{ id: '1', userId: '1', name: 'Production Key', key: 'sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', createdDate: '2023-10-01', lastUsed: '2 mins ago' }]);
    return c.json({ success: true, data: keys });
});
api.post('/v1/apikeys', async (c) => {
    const { name, userId } = await c.req.json(); 
    let keys = await getKV(c, 'apikeys', []);
    const newKey = {
        id: Date.now().toString(),
        userId: userId || '1',
        name,
        key: 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdDate: new Date().toISOString().split('T')[0],
        lastUsed: 'Never'
    };
    keys.unshift(newKey);
    await putKV(c, 'apikeys', keys);
    return c.json({ success: true, data: newKey });
});
api.delete('/v1/apikeys/:id', async (c) => {
    const id = c.req.param('id');
    let keys = await getKV(c, 'apikeys', []);
    keys = keys.filter((k: any) => k.id !== id);
    await putKV(c, 'apikeys', keys);
    return c.json({ success: true });
});

// --- Profile & Dashboard ---
api.get('/v1/profile', async (c) => {
    const users = await getKV(c, 'users', [{ id: '1', name: "Dedi Supriadi", email: "ceodedi@gmail.com", role: "Admin", plan: "Pro", joinedDate: "October 15, 2023" }]);
    return c.json({ success: true, data: users[0] || users[0] });
});

api.get('/dashboard', async (c) => {
    const quota = await getKV(c, 'quota_1', { used: 12450, totalLimit: 50000, history: [{ date: '2023-10-01', tokens: 1200 }], logs: [] });
    return c.json({ success: true, data: quota });
});

api.post('/v1/chat/completions', async (c) => {
  try {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith("Bearer sk-")) {
      return c.json({ error: "Unauthorized: Invalid or missing API Key" }, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const keys = await getKV(c, 'apikeys', [{ id: '1', userId: '1', name: 'Production Key', key: 'sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' }]);
    const validKey = keys.find((k:any) => k.key === token);
    
    if(!validKey) {
        return c.json({ error: "Unauthorized: Key not found" }, 401);
    }
    
    const userId = validKey.userId;
    const users = await getKV(c, 'users', [{ id: '1', rpdLimit: 50000 }]);
    const user = users.find((u:any) => u.id === userId);
    const limit = user ? user.rpdLimit : 50000;
    
    let quota = await getKV(c, `quota_${userId}`, { used: 0, totalLimit: limit, history: [], logs: [] });

    // Verify limit
    if (quota.used >= quota.totalLimit) {
        return c.json({ error: "Rate limit exceeded. Check your plan." }, 429);
    }

    const body = await c.req.json();
    const { messages, model, stream } = body;
    
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: model || "gc/gemini-3-flash-preview",
        stream: !!stream,
        messages: messages
      })
    });

    const responseData: any = await response.json();
    
    const usedTokens = responseData.usage?.total_tokens || 100;
    quota.used += usedTokens;
    quota.logs.unshift({
      id: Date.now(),
      action: 'Chat Completion',
      model: model || "gc/gemini-3-flash-preview",
      tokens: usedTokens,
      timestamp: new Date().toISOString(),
      status: response.ok ? 'success' : 'error'
    });

    const today = new Date().toISOString().split('T')[0];
    const todayHistory = quota.history.find((h:any) => h.date === today);
    if (todayHistory) {
      todayHistory.tokens += usedTokens;
    } else {
      quota.history.push({ date: today, tokens: usedTokens });
    }

    await putKV(c, `quota_${userId}`, quota);
    
    validKey.lastUsed = new Date().toISOString();
    await putKV(c, 'apikeys', keys);

    return c.json(responseData, response.status as any);
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return c.json({ error: "Internal Server Error proxying request" }, 500);
  }
});

export default app;
