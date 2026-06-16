fetch("http://127.0.0.1:3000/api/v1/chat/completions", {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-mock'
  },
  body: JSON.stringify({
    model: 'gc/gemini-3-flash-preview',
    stream: false,
    messages: [{ role: 'user', content: 'Halo' }]
  })
}).then(r => r.text()).then(t => console.log("RES:", t)).catch(e => console.error("ERR:", e));
