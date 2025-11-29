# 🔧 Quick Fix: Connection Refused

## ⚠️ Important: Correct Port

**The app runs on port 9001, NOT 9000!**

- ✅ Correct: `http://localhost:9001`
- ❌ Wrong: `http://localhost:9000`

---

## 🚀 Restart Dev Server

### Option 1: Quick Restart (Recommended)
```bash
cd /Users/arhansubasi/lumina/lumina/ui
DISABLE_HTTPS=true pnpm dev-server
```

### Option 2: Background Process
The server has been started in the background. Check if it's running:
```bash
# Check if server is running
lsof -ti:9001

# View logs
tail -f /tmp/ui-dev-server.log

# Kill if needed
pkill -f "webpack|dev-server"
```

---

## 🔍 Troubleshooting

### 1. Port Already in Use
```bash
# Kill process on port 9001
lsof -ti:9001 | xargs kill -9

# Then restart
cd ui && DISABLE_HTTPS=true pnpm dev-server
```

### 2. Check Server Status
```bash
# Check if server is listening
netstat -an | grep 9001

# Or
lsof -i:9001
```

### 3. View Server Logs
```bash
# If running in background
tail -f /tmp/ui-dev-server.log

# Or check the terminal where you started it
```

---

## ✅ Expected Output

When server starts successfully, you should see:
```
[webpack-dev-server] Project is running at:
[webpack-dev-server] Loopback: http://localhost:9001/
```

---

## 🌐 Access URLs

- **Main UI**: http://localhost:9001
- **3D View**: http://localhost:9001/graph/3d/public
- **API**: http://localhost:3000 (if API is running)

---

## 📝 Notes

- Server runs on **port 9001** (not 9000)
- Use `DISABLE_HTTPS=true` to avoid SSL issues
- If stuck on loading, check browser console for errors
- Make sure API is also running on port 3000

