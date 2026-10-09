# 🌐 WorldPulse — Real-Time Global News App

## 🚀 Deploy for Free (Vercel)

### Step 1 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2 — Deploy
```bash
cd news-app
vercel
```
Follow the prompts (sign up with GitHub/Google, it's free).

### Step 3 — Set your API key as an environment variable
In the Vercel dashboard → your project → Settings → Environment Variables, add:
```
NAME:  NEWS_API_KEY
VALUE: 1dc629f61e2a4fffb7b1bbbabf712d3e
```
Then redeploy:
```bash
vercel --prod
```

That's it. Your app is live at a `*.vercel.app` URL, completely free, with real live news.

---

## 💻 Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

## How It Works
- **Local**: Frontend calls NewsAPI.org directly (free plan allows localhost)
- **Deployed**: Frontend calls `/api/news` → Vercel serverless function → NewsAPI.org
  - The API key is stored as a Vercel env variable, never exposed to the browser
  - This bypasses NewsAPI's free plan domain restriction legally

## ✨ Features
- Live news from 150,000+ worldwide sources
- Auto-rotating hero with 5 top stories
- Breaking news ticker
- 7 categories: Top Stories, Tech, Business, Science, Health, Sports, Entertainment
- Full-text search with debounce
- Article modal
- Auto-refresh every 5 minutes
- Fully responsive dark theme UI
