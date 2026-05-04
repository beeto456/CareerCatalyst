import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Proxy URL Content
  app.get("/api/proxy-url", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      // Basic fetch with headers to mimic a browser
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'max-age=0',
          'Sec-Ch-Ua': '"Not A(BA;DR";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive'
        },
        timeout: 15000, // 15s timeout
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept anything less than 500 so we can handle 403 ourselves
      });
      
      if (response.status !== 200) {
        throw new Error(`Target site returned status ${response.status}`);
      }

      res.send(response.data);
    } catch (error: any) {
      const status = error.response?.status || (error.message.includes('status') ? parseInt(error.message.match(/\d+/)?.[0] || '500') : 500);
      const message = error.response?.statusText || error.message || "Internal Server Error";
      
      console.error(`Error proxying URL (${url}):`, {
        status,
        message
      });

      // Send a clean JSON error response
      res.status(status === 200 ? 500 : status).json({ 
        error: "Failed to fetch URL content",
        details: status === 403 ? "Forbidden: This website block automated access (common for Indeed/LinkedIn). Please use the 'Text' tab to paste the job description directly." : message,
        statusCode: status
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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
