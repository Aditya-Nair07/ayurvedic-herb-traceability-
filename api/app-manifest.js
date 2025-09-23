export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Set content type and caching headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  
  const manifest = {
    "short_name": "BioTrace",
    "name": "BioTrace System",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#3b82f6",
    "background_color": "#ffffff",
    "description": "Blockchain-based botanical traceability system",
    "categories": ["productivity", "business", "utilities"],
    "lang": "en",
    "dir": "ltr",
    "orientation": "portrait-primary",
    "scope": "/",
    "prefer_related_applications": false
  };
  
  res.status(200).json(manifest);
}
