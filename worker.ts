import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  Apimini: any; // KVNamespace
  ASSETS: any; // Fetcher
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PIN?: string;
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

// --- Auth ---
api.get('/v1/auth/github/url', (c) => {
    const clientId = c.env.GITHUB_CLIENT_ID || 'Ov23liIBWSRxMWALRd0m';
    if (!clientId) {
        return c.json({ error: "missing_config", message: "GITHUB_CLIENT_ID is not configured in Cloudflare Workers." }, 400);
    }
    // Use the origin from the request or fallback to dev URL
    const origin = new URL(c.req.url).origin;
    const redirectUri = `${origin}/api/v1/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    return c.json({ url });
});

api.get('/v1/auth/github/callback', async (c) => {
    const code = c.req.query('code');
    const clientId = c.env.GITHUB_CLIENT_ID || 'Ov23liIBWSRxMWALRd0m';
    const clientSecret = c.env.GITHUB_CLIENT_SECRET || 'c0b068a554e17c098025cf9c8df96bce8cc2968f';
    // Use the origin from the request
    const origin = new URL(c.req.url).origin;
    
    if (!code) {
        return c.text('No code provided', 400);
    }

    try {
        // Exchange code for access token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: `${origin}/api/v1/auth/github/callback`
            })
        });
        
        const tokenData: any = await tokenRes.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
             return c.text('Failed to get access token', 400);
        }

        // Get user data
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Cloudflare-Worker'
            }
        });
        const githubUser: any = await userRes.json();
        
        // Get user email
        const emailRes = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Cloudflare-Worker'
            }
        });
        const emails: any[] = await emailRes.json();
        const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email;
        
        // Find or create user
        let users = await getKV(c, 'users', []);
        let user = users.find((u: any) => u.email === primaryEmail);
        
        if (!user) {
            user = {
                id: Date.now().toString(),
                name: githubUser.name || githubUser.login,
                email: primaryEmail,
                password: 'oauth-user', 
                role: 'User',
                plan: 'Free',
                rpdLimit: 50000,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
            users.push(user);
            await putKV(c, 'users', users);
        }

        // Return HTML script to close popup and send postMessage with user data
        return c.html(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage(
                                { type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })} },
                                '*'
                            );
                            window.close();
                        } else {
                            window.location.href = '/';
                        }
                    </script>
                    <p>Authentication successful. This window should close automatically...</p>
                </body>
            </html>
        `);
    } catch (e) {
        return c.text('OAuth callback error', 500);
    }
});

api.post('/v1/auth/admin', async (c) => {
    const { email, pin } = await c.req.json();
    const ADMIN_PIN = c.env.ADMIN_PIN || '123456';
    const ADMIN_EMAIL = c.env.ADMIN_EMAIL || 'ceodedi@gmail.com';

    if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
        let users = await getKV(c, 'users', []);
        let user = users.find((u: any) => u.email === email);
        if (!user) {
            user = {
                id: Date.now().toString(),
                name: "Administrator",
                email: email,
                password: 'admin-password',
                role: 'Admin',
                plan: 'Pro',
                rpdLimit: 999999,
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
            users.push(user);
            await putKV(c, 'users', users);
        } else {
            user.role = 'Admin';
            await putKV(c, 'users', users);
        }
        return c.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
        return c.json({ error: "Email atau PIN tidak valid" }, 401);
    }
});

api.post('/v1/auth/register', async (c) => {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) return c.json({ error: "Missing fields" }, 400);

    let users = await getKV(c, 'users', []);
    
    if (users.find((u: any) => u.email === email)) {
        return c.json({ error: "User already exists" }, 400);
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, hash this!
        role: email === 'ceodedi@gmail.com' ? 'Admin' : 'User',
        plan: 'Free',
        rpdLimit: 50000,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    
    users.push(newUser);
    await putKV(c, 'users', users);
    
    return c.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

api.post('/v1/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Missing fields" }, 400);

    let users = await getKV(c, 'users', []);
    
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
        return c.json({ error: "Invalid credentials" }, 401);
    }
    
    return c.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- API Keys ---
api.get('/v1/apikeys', async (c) => {
    const userId = c.req.header('x-user-id') || '1';
    const keys = await getKV(c, 'apikeys', []);
    const userKeys = keys.filter((k: any) => k.userId === userId);
    return c.json({ success: true, data: userKeys });
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
    const userId = c.req.header('x-user-id');
    const users = await getKV(c, 'users', [{ id: '1', name: "Dedi Supriadi", email: "ceodedi@gmail.com", role: "Admin", plan: "Pro", joinedDate: "October 15, 2023" }]);
    const user = users.find((u: any) => u.id === userId) || users[0];
    return c.json({ success: true, data: user });
});

api.get('/dashboard', async (c) => {
    const userId = c.req.header('x-user-id') || '1';
    const quota = await getKV(c, `quota_${userId}`, { used: 0, totalLimit: 50000, history: [], logs: [] });
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

// React SPA Fallback: Any route not matching /api/* should serve index.html
app.get('*', async (c) => {
  // Try to fetch the index.html from the ASSETS binding
  try {
     return await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url), c.req.raw));
  } catch (e) {
     return c.text('Not Found', 404);
  }
});

export default app;
