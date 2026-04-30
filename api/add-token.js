const axios = require('axios');

export default async function handler(req, res) {
  // --- CONFIG ---
  const GITHUB_TOKEN = 'ISI_GITHUB_TOKEN_KAMU'; 
  const OWNER = 'kaaaoffc';
  const REPO = 'database';
  const PATH = 'tokens.json';
  const URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  // --------------

  // 1. Fitur Ambil Total Token (GET)
  if (req.method === 'GET') {
    try {
      const getFile = await axios.get(URL, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
      const content = Buffer.from(getFile.data.content, 'base64').toString('utf-8');
      const json = JSON.parse(content);
      return res.status(200).json({ total: json.tokens ? json.tokens.length : 0 });
    } catch (e) {
      return res.status(200).json({ total: 0 });
    }
  }

  // 2. Fitur Tambah Token ke GitHub (POST)
  if (req.method === 'POST') {
    const { newToken } = req.body;
    if (!newToken) return res.status(400).json({ error: "Token kosong!" });

    try {
      // Ambil data lama
      const getFile = await axios.get(URL, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
      const sha = getFile.data.sha;
      const content = Buffer.from(getFile.data.content, 'base64').toString('utf-8');
      let json = JSON.parse(content);

      if (!json.tokens) json.tokens = [];
      json.tokens.push(newToken); // Tambah token baru

      // Upload ke GitHub
      const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');
      await axios.put(URL, {
        message: `Add token: ${newToken.substring(0, 8)}...`,
        content: updatedContent,
        sha: sha
      }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
                                  }
