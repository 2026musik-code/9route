const API_KEY = 'sk-29fa8223c11e1e03-1b921u-9fe190d7';
fetch('https://api.cloudflaremini.biz.id/v1/models', { headers: { 'Authorization': 'Bearer ' + API_KEY } })
.then(r=>r.json()).then(console.log).catch(console.error);
