# ClimbSEO Discord Bot - Render Deployment Guide

## 🚀 Quick Deploy to Render (FREE)

### Step 1: Prepare Your Repository

1. Make sure all changes are committed to GitHub:
```bash
git add .
git commit -m "Add Render support with HTTP server"
git push
```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `WillLehmann04/climb-seo-manager`
4. Configure:
   - **Name**: `climb-seo-manager`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables

In the Render dashboard, add these environment variables:

```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id
GUILD_ID=your_guild_id
GITHUB_REPO=THHamiltonSmith/seo-tool
NODE_ENV=production
```

### Step 4: Deploy!

Click **"Create Web Service"** and Render will automatically deploy your bot!

## 🔍 How It Works

The bot now runs a lightweight HTTP server on port 3000 (or whatever Render assigns) alongside the Discord bot. This satisfies Render's requirement that free web services must bind to a port.

### Health Check Endpoints

- `GET /` - Bot status with uptime and guild count
- `GET /health` - Simple health check

## 📊 Monitoring

After deployment:
- Check logs in Render dashboard
- Visit your app URL (e.g., `https://climb-seo-manager.onrender.com`) to see bot status
- Bot will auto-restart if it crashes

## ⚠️ Important Notes

1. **Free tier sleeps after 15 minutes of inactivity**
   - First request after sleep takes ~30 seconds to wake up
   - Use UptimeRobot (free) to ping your URL every 5 minutes to keep it awake

2. **Free tier limitations**:
   - 750 hours/month (enough for 24/7 with one project)
   - Sleeps after inactivity
   - 512MB RAM

## 🔄 Alternative Free Hosts (No HTTP Server Needed)

If you prefer NOT to use the HTTP server workaround:

### Railway.app
- Supports background workers
- Free tier: $5 credit/month
- No port binding required

### Fly.io
- Free tier available
- Better for long-running processes
- No port binding required

Would you like instructions for any of these?

## 🆘 Troubleshooting

**Bot not responding?**
- Check Render logs for errors
- Verify environment variables are set correctly
- Make sure bot has proper Discord permissions

**Service keeps sleeping?**
- Use [UptimeRobot](https://uptimerobot.com/) to ping your URL every 5 minutes

**Build failing?**
- Check Node.js version (use LTS: 18 or 20)
- Verify `package.json` is valid
- Check build logs for specific errors


