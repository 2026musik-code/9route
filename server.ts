import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { fileURLToPath } from 'url';
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", true);
  app.use(cors());

  app.use(express.json());

  // --- In-Memory DB & State ---

  // --- Real DB State ---
  let usersState = [
    { id: '1', name: "Dedi Supriadi", email: "ceodedi@gmail.com", role: "Admin", plan: "Pro", rpdLimit: 50000 }
  ];
  let apiKeysState = [
    { id: '1', userId: '1', name: 'Production Key', key: 'sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', createdDate: '2023-10-01', lastUsed: '2 mins ago' },
    { id: '2', userId: '1', name: 'Development Key', key: 'sk-z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4', createdDate: '2023-10-15', lastUsed: '3 hours ago' },
  ];
  let userQuotaState: Record<string, any> = {
    '1': {
        used: 12450,
        totalLimit: 50000,
        logs: [
          { id: 1, action: 'Chat Completion', model: 'gemini-3-flash-preview', tokens: 2485, timestamp: new Date().toISOString(), status: 'success' }
        ],
        history: [
            { date: '2023-10-01', tokens: 1200 },
            { date: '2023-10-02', tokens: 3500 },
            { date: '2023-10-03', tokens: 2100 }
        ]
    }
  };
  let settingsState = {
    rpm: 60,
    rpd: 50000,
    enforceApiKey: true,
    logRequests: true
  };

  const API_KEY = "sk-29fa8223c11e1e03-1b921u-9fe190d7";
  const TARGET_URL = "https://api.cloudflaremini.biz.id/v1/chat/completions";

  let modelsCache: any[] = [];
  let isModelsLoaded = false;

  let endpointsCache: any[] = [
    {
      id: "ep-1",
      method: "POST",
      path: "/api/v1/chat/completions",
      description: "Generate text completion from chat messages"
    }
  ];

  const loadModels = async () => {
    try {
      const response = await fetch("https://api.cloudflaremini.biz.id/v1/models", {
        headers: { "Authorization": `Bearer ${API_KEY}` }
      });
      const data = await response.json();
      if (data && data.data) {
        modelsCache = data.data;
        isModelsLoaded = true;
      }
    } catch (e) {
      console.error("Failed to load models initially", e);
    }
  };
  loadModels();

  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const path = req.path;
    // Izinkan rute publik dan user agar tidak terblokir middleware admin
    if (
        path.startsWith('/api/v1/auth') || 
        path.startsWith('/api/v1/chat/completions') || 
        path.startsWith('/api/v1/profile') || 
        path.startsWith('/api/v1/apikeys') ||
        path === '/api/dashboard'
    ) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer admin_token_')) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  
  app.use('/api/v1', authMiddleware);

  // --- API Routes ---
  app.get("/api/v1/models", async (req, res) => {
    if (!isModelsLoaded) {
      await loadModels();
    }
    res.json({
      object: "list",
      data: modelsCache
    });
  });

  app.delete("/api/v1/models/entry", (req, res) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "No ID provided" });
    modelsCache = modelsCache.filter(m => m.id !== id);
    res.json({ success: true, deleted: id });
  });

  app.post("/api/v1/models", express.json(), (req, res) => {
    const { id, owned_by } = req.body;
    if (!id || !owned_by) return res.status(400).json({ error: "Missing fields" });
    const newModel = { id, object: "model", owned_by };
    modelsCache.unshift(newModel);
    res.json({ success: true, data: newModel });
  });

  app.get("/api/v1/endpoints", (req, res) => {
    res.json({ data: endpointsCache });
  });

  app.post("/api/v1/endpoints", express.json(), (req, res) => {
    const { method, path, description } = req.body;
    if (!method || !path) return res.status(400).json({ error: "Missing fields" });
    const newEndpoint = {
      id: "ep-" + Date.now(),
      method: method.toUpperCase(),
      path,
      description: description || ""
    };
    endpointsCache.push(newEndpoint);
    res.json({ success: true, data: newEndpoint });
  });

  app.delete("/api/v1/endpoints/:id", (req, res) => {
    const id = req.params.id;
    endpointsCache = endpointsCache.filter(e => e.id !== id);
    res.json({ success: true, deleted: id });
  });

  app.get("/api/v1/auth/github/url", (req, res) => {
    // We don't have CF envs here, use process.env if provided, or mock it locally
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liIBWSRxMWALRd0m';
    if (!clientId) {
      return res.status(400).json({ error: "missing_config", message: "GITHUB_CLIENT_ID is not set in environment variables." });
    }
    const origin = req.protocol + "://" + req.get("host");
    const redirectUri = `${origin}/api/v1/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    res.json({ url });
  });

  app.get("/api/v1/auth/github/callback", async (req, res) => {
    const code = req.query.code as string;
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liIBWSRxMWALRd0m';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'c0b068a554e17c098025cf9c8df96bce8cc2968f';
    const origin = req.protocol + "://" + req.get("host");

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
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
             return res.status(400).send('Failed to get access token');
        }

        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Local-Server'
            }
        });
        const githubUser: any = await userRes.json();
        
        const emailRes = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Local-Server'
            }
        });
        const emails: any[] = await emailRes.json();
        const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email;
        
        let user = usersState.find((u: any) => u.email === primaryEmail);
        
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
            } as any;
            usersState.push(user as any);
        }

        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage(
                                { type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify({ id: user!.id, name: user!.name, email: user!.email, role: user!.role })} },
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
        res.status(500).send('OAuth callback error');
    }
  });

  app.post("/api/v1/auth/admin", express.json(), (req, res) => {
    const { email, pin } = req.body;
    let ADMIN_PIN = process.env.ADMIN_PIN || '123456';
    let ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ceodedi@gmail.com';

    if (settingsState.adminPin) ADMIN_PIN = settingsState.adminPin;
    if (settingsState.adminEmail) ADMIN_EMAIL = settingsState.adminEmail;

    if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
        let user = usersState.find((u: any) => u.email === email);
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
            } as any;
            usersState.push(user as any);
        } else {
            user.role = 'Admin';
        }
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, token: `admin_token_${user.id}` } });
    } else {
        res.status(401).json({ error: "Email atau PIN tidak valid" });
    }
  });

  app.post("/api/v1/auth/register", express.json(), (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    if (usersState.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "User already exists" });
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
    
    usersState.push(newUser);
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  });

  app.post("/api/v1/auth/login", express.json(), (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = usersState.find((u: any) => u.email === email && (u as any).password === password);
    
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.get("/api/dashboard", (req, res) => {
    res.json({ success: true, data: userQuotaState['1'] });
  });

  app.get("/api/v1/profile", (req, res) => {
    const user = usersState.find(u => u.id === '1') || usersState[0];
    res.json({ success: true, data: { ...user, joinedDate: "October 15, 2023", nextPayment: "November 15, 2023" } });
  });

  app.get("/api/v1/apikeys", (req, res) => {
    res.json({ success: true, data: apiKeysState });
  });

  app.post("/api/v1/apikeys", express.json(), (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const newKey = {
      id: Date.now().toString(),
      userId: '1',
      name,
      key: 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    apiKeysState.unshift(newKey);
    res.json({ success: true, data: newKey });
  });

  app.delete("/api/v1/apikeys/:id", (req, res) => {
    const id = req.params.id;
    apiKeysState = apiKeysState.filter(k => k.id !== id);
    res.json({ success: true });
  });

  app.get("/api/v1/users", (req, res) => {
    res.json({ success: true, data: usersState });
  });
  
  app.put("/api/v1/users/:id", express.json(), (req, res) => {
    const id = req.params.id;
    const { rpdLimit, role, plan } = req.body;
    let user = usersState.find(u => u.id === id);
    if (user) {
      if (rpdLimit !== undefined) user.rpdLimit = rpdLimit;
      if (role !== undefined) user.role = role;
      if (plan !== undefined) user.plan = plan;
      
      if (userQuotaState[id]) {
          userQuotaState[id].totalLimit = user.rpdLimit;
      }
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/v1/settings", (req, res) => {
    res.json({ success: true, data: settingsState });
  });

  app.post("/api/v1/settings", express.json(), (req, res) => {
    settingsState = { ...settingsState, ...req.body };
    res.json({ success: true, data: settingsState });
  });

  app.post("/api/v1/chat/completions", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer sk-")) {
          return res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
      }

      const token = authHeader.split(' ')[1];
      const validKey = apiKeysState.find(k => k.key === token);
      if(!validKey) {
        return res.status(401).json({ error: "Unauthorized: Key not found" });
      }
      
      const userId = validKey.userId;
      if(!userQuotaState[userId]) {
         userQuotaState[userId] = { used: 0, totalLimit: 50000, history: [], logs: [] };
      }
      const quota = userQuotaState[userId];
      
      if(settingsState.enforceApiKey && quota.used >= quota.totalLimit) {
         return res.status(429).json({ error: "Rate limit exceeded" });
      }

      const { messages, model, stream } = req.body;
      
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
      
      const usedTokens = responseData.usage?.total_tokens || 100; // fallback if missing
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
      
      validKey.lastUsed = new Date().toISOString();

      res.status(response.status).json(responseData);
    } catch (error: any) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error proxying request" });
    }
  });


  // --- Vite Middleware (Development) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // --- Static Serving (Production) ---
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
