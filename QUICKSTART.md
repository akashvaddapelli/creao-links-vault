# 🚀 Quick Start - Personal Link Manager

Your Link Manager application is ready for personal use! Follow these simple steps.

## ⚡ Immediate Deployment (3 Steps)

### Step 1: Personalize Your App

**Option A: Using Environment Variables (Recommended)**

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update:
   ```bash
   VITE_APP_PASSWORD=your-secure-password-here
   VITE_USER_NAME=Your Name
   ```

**Option B: Direct Edit**

Edit `src/config.ts`:
```typescript
export const APP_CONFIG = {
  password: "your-secure-password",
  userName: "Your Name",
  welcomeMessage: "Welcome Back",
  tagline: "All your links are safe and secured...Here!",
  // ... rest stays the same
} as const;
```

### Step 2: Test Locally

```bash
# Install dependencies (if needed)
npm install

# Validate the code
npm run check:safe

# Build for production
npm run build
```

### Step 3: Deploy

**Vercel (Easiest - 2 minutes):**
```bash
npm install -g vercel
vercel
```
✅ Done! You'll get a live URL.

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Other Options:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for GitHub Pages, custom servers, etc.

## 🎯 Current Features

- ✅ **Password Protection** - Secure access with custom password
- ✅ **Add Links** - Store URLs with custom names
- ✅ **Edit Links** - Update names and URLs anytime
- ✅ **Delete Links** - Remove unwanted links
- ✅ **Copy to Clipboard** - One-click URL copying
- ✅ **Platform Icons** - Auto-detects YouTube, GitHub, Twitter, Instagram, LinkedIn, Facebook
- ✅ **Responsive Design** - Works on all devices
- ✅ **Beautiful UI** - Modern, clean interface

## 🔐 Security

**Current Password:** `9014094534.v`

**IMPORTANT:** Change this before deploying!

Two ways to change:

1. **Environment Variable** (Recommended):
   - Add `VITE_APP_PASSWORD=your-password` to `.env`
   - Rebuild and deploy

2. **Direct Edit**:
   - Edit `src/config.ts`
   - Change `password` value
   - Rebuild and deploy

## 📱 How to Use

1. **Access Your App** - Open the deployed URL
2. **Enter Password** - Use the password you set
3. **Add Links** - Click "Add New Link" button
4. **Manage Links** - Click any link card to expand and see options
5. **Copy URLs** - Click the copy icon to copy URLs to clipboard

## 🎨 Customization

### Change Your Name
Edit `src/config.ts`:
```typescript
userName: "Your Name Here",
```

### Change Welcome Message
Edit `src/config.ts`:
```typescript
welcomeMessage: "Hello",  // or "Welcome", "Hi", etc.
tagline: "Your custom tagline here",
```

### Change Colors
Edit `src/routes/index.tsx` - find and replace color classes:
- `bg-blue-600` → `bg-purple-600` (or any Tailwind color)
- `text-blue-600` → `text-purple-600`

### Add More Platform Icons
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🛠️ Files You Created

1. **`.env.example`** - Environment variable template
2. **`src/config.ts`** - Centralized configuration
3. **`DEPLOYMENT.md`** - Detailed deployment guide
4. **`QUICKSTART.md`** - This quick start guide (you can delete this after deployment)

## ✅ What's Already Done

- ✅ Database schema configured
- ✅ Production-ready ORM setup
- ✅ API integration complete
- ✅ All CRUD operations working
- ✅ Copy functionality with fallbacks
- ✅ Password protection implemented
- ✅ Responsive design
- ✅ TypeScript validation passing

## 🔄 Make Changes Later

1. Edit files locally
2. Run `npm run check:safe` to validate
3. Run `npm run build` to build
4. Redeploy using your chosen method

## 📚 Documentation

- **Quick Start** - This file
- **Deployment Guide** - [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Development Guide** - [CLAUDE.md](./CLAUDE.md)
- **Project Overview** - [README.md](./README.md)

## 🆘 Need Help?

Check these resources in order:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Troubleshooting section
2. Browser console (F12) - Check for errors
3. Build output - Read error messages

## 🎉 You're All Set!

Your Link Manager is ready to deploy. Choose a deployment option and enjoy your personal link organizer!

---

**Time to Deploy:** ~5 minutes
**Difficulty:** Easy
**Cost:** Free (on Vercel/Netlify)
