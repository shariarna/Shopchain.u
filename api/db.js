const REMOTE_DB_URL = 'https://extendsclass.com/api/json-storage/bin/febfbaa';

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from local/localtunnel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const dbRes = await fetch(REMOTE_DB_URL + '?nocache=' + Date.now());
      const dbData = await dbRes.json();
      return res.status(200).json(dbData);
    } 
    
    if (req.method === 'POST') {
      const putRes = await fetch(REMOTE_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      });
      const putData = await putRes.json();
      return res.status(200).json(putData);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error("Backend DB Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
