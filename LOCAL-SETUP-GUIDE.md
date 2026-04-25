# 💻 Local Development Setup Guide

Complete guide to set up your Link Manager on your local computer.

---

## 📋 Prerequisites

Before you begin, install these on your local machine:

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`
   - Should show: v18.x.x or higher

2. **npm** (comes with Node.js)
   - Verify: `npm --version`
   - Should show: 8.x.x or higher

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Optional (but Recommended)

4. **Code Editor**
   - VS Code: https://code.visualstudio.com/
   - Or your preferred editor

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Clone the Repository

```bash
# Navigate to your projects folder
cd ~/Projects

# Clone from GitHub (after you've pushed your code)
git clone git@github.com:YOUR_USERNAME/link-manager.git

# Or with HTTPS:
# git clone https://github.com/YOUR_USERNAME/link-manager.git

# Enter the directory
cd link-manager
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages (React, TypeScript, Tailwind, etc.)

**Expected output:** `added XXX packages` (takes ~2-3 minutes)

### Step 3: Configure Your App

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file
nano .env  # or code .env or vim .env
```

**Update these values in `.env`:**
```bash
VITE_APP_PASSWORD=your-secure-password
VITE_USER_NAME=Your Name
```

Save and close the file.

### Step 4: Validate Everything Works

```bash
npm run check:safe
```

**Expected output:** `✓` checks passing (TypeScript + ESLint + Formatting)

### Step 5: Build and Preview

```bash
# Build the production version
npm run build

# Preview the built app
npm run serve
```

**Open in browser:** http://localhost:4173

**Test:**
- Enter your password
- Add a test link
- Edit and delete links
- Copy URLs to clipboard

---

## 🛠️ Development Workflow

### Option 1: Development Server (Not Recommended in E2B)

```bash
npm run dev
```

Opens on http://localhost:3000 with hot-reload.

**Note:** This doesn't work in E2B sandboxes, but works fine on your local machine!

### Option 2: Build + Preview (Works Everywhere)

```bash
# Make changes to code
# ...

# Validate changes
npm run check:safe

# Build
npm run build

# Preview
npm run serve
```

Opens on http://localhost:4173

---

## 📁 Project Structure

```
link-manager/
├── src/
│   ├── routes/
│   │   └── index.tsx          ← Main app code (your UI)
│   ├── components/ui/         ← UI components (buttons, cards, etc.)
│   ├── config.ts              ← App configuration
│   ├── lib/                   ← Utilities and helpers
│   └── sdk/                   ← Database and API integration
├── public/                    ← Static files (favicon, etc.)
├── .env                       ← Your configuration (not in git)
├── .env.example               ← Template (in git)
├── package.json               ← Dependencies and scripts
├── index.html                 ← HTML entry point
└── vite.config.js             ← Build configuration
```

---

## ⚙️ Configuration Files

### Environment Variables (`.env`)

**Location:** `/link-manager/.env`

**Contents:**
```bash
VITE_APP_PASSWORD=your-secure-password
VITE_USER_NAME=Your Name
```

**Important:**
- This file is NOT committed to Git (in `.gitignore`)
- Create it on each machine you work on
- Never share this file publicly

### App Configuration (`src/config.ts`)

**Location:** `/link-manager/src/config.ts`

**What it does:**
- Reads environment variables
- Provides defaults if env vars are missing
- Centralizes all configurable values

**To customize:**
```typescript
export const APP_CONFIG = {
  password: import.meta.env.VITE_APP_PASSWORD || "default-password",
  userName: import.meta.env.VITE_USER_NAME || "Default Name",
  welcomeMessage: "Welcome Back",  // ← Edit this
  tagline: "Your custom tagline",  // ← Edit this
  // ...
} as const;
```

---

## 🎨 Customizing Your App

### Change Password & Name

**Method 1: Edit `.env`** (Recommended)
```bash
VITE_APP_PASSWORD=my-new-password
VITE_USER_NAME=John Doe
```

**Method 2: Edit `src/config.ts`**
```typescript
password: "my-new-password",
userName: "John Doe",
```

After changing, rebuild:
```bash
npm run build
```

### Change Colors

Edit `src/routes/index.tsx`:

**Find:** `bg-blue-600` or `text-blue-600`
**Replace with:** Any Tailwind color

Examples:
- `bg-purple-600` (purple theme)
- `bg-green-600` (green theme)
- `bg-red-600` (red theme)

**Available colors:** red, orange, yellow, green, blue, purple, pink, gray, etc.

### Change Welcome Message

Edit `src/config.ts`:
```typescript
welcomeMessage: "Hello",         // Instead of "Welcome Back"
tagline: "Your personal vault",  // Instead of default
```

### Add Custom Platform Icons

Edit `src/routes/index.tsx`, find `getIconForLink()` function:

```typescript
// Add your own platform detection
if (lowerName.includes("notion")) {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      {/* Your Notion SVG path here */}
    </svg>
  );
}
```

Get SVG icons from: https://simpleicons.org/

---

## 🧪 Testing Your Changes

### Before Committing

Always run this checklist:

```bash
# 1. Validate code
npm run check:safe

# 2. Build
npm run build

# 3. Preview
npm run serve
```

**Manual Testing:**
- [ ] Password login works
- [ ] Can add new links
- [ ] Can edit links
- [ ] Can delete links
- [ ] Can copy URLs
- [ ] Icons display correctly
- [ ] Responsive on mobile (resize browser)

### Run Tests

```bash
npm test
```

---

## 🔄 Git Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create a feature branch (optional)
git checkout -b feature/my-feature

# 3. Make changes
# ... edit files ...

# 4. Validate
npm run check:safe

# 5. Stage changes
git add .

# 6. Commit
git commit -m "Add feature: description"

# 7. Push
git push origin feature/my-feature

# 8. Create Pull Request on GitHub (if using branches)
# Or merge to main and push
```

### Quick Commit to Main

```bash
# After making changes:
npm run check:safe
git add .
git commit -m "Update: description of changes"
git push origin main
```

---

## 🚀 Deploy Your Changes

### Deploy to Vercel

```bash
# One-time setup
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# One-time setup
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Auto-Deploy from GitHub

**Vercel:**
1. Connect GitHub repo at https://vercel.com/new
2. Every push to `main` auto-deploys

**Netlify:**
1. Connect GitHub repo at https://app.netlify.com/start
2. Every push to `main` auto-deploys

---

## 📦 NPM Scripts Reference

```bash
# Development (local machine only)
npm run dev          # Start dev server (http://localhost:3000)

# Production Build
npm run build        # Build for production
npm run serve        # Preview production build

# Code Quality
npm run check:safe   # TypeScript + ESLint + Format (use this!)
npm run format       # Format code with Biome
npm run lint:radix   # Check Radix UI components

# Testing
npm test             # Run tests
npm run test:smoke   # Run smoke tests
```

---

## 🆘 Troubleshooting

### "Cannot find module" error

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Port 4173 already in use"

**Solution:**
```bash
# Kill the process using the port
lsof -ti:4173 | xargs kill -9

# Or use a different port
npm run serve -- --port 4174
```

### "Permission denied" error

**Solution:**
```bash
# Fix file permissions
chmod +x ./bin/*.sh
```

### Build errors after pulling changes

**Solution:**
```bash
# Update dependencies
npm install

# Clear cache and rebuild
rm -rf dist
npm run build
```

### TypeScript errors

**Solution:**
```bash
# Check what's wrong
npm run check:safe

# Fix the errors shown
# Then rebuild
npm run build
```

---

## 🔐 Security Checklist

- [ ] `.env` file exists and has your password
- [ ] `.env` is in `.gitignore` (it is by default)
- [ ] Never commit `.env` to Git
- [ ] Use strong password in `.env`
- [ ] Keep dependencies updated: `npm update`

---

## 🎯 Quick Reference Commands

**Setup:**
```bash
git clone <url>
cd link-manager
npm install
cp .env.example .env
nano .env
```

**Development:**
```bash
npm run check:safe    # Validate
npm run build         # Build
npm run serve         # Preview
```

**Git:**
```bash
git status            # Check status
git add .             # Stage all
git commit -m "msg"   # Commit
git push origin main  # Push
```

**Deploy:**
```bash
vercel --prod         # Deploy to Vercel
netlify deploy --prod # Deploy to Netlify
```

---

## 📚 Additional Resources

**Documentation:**
- `START-HERE.md` - Main entry point
- `QUICKSTART.md` - Quick deployment
- `DEPLOYMENT.md` - All deployment options
- `GIT-REPOSITORY-SETUP.md` - Git setup guide

**External:**
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
- Vite: https://vitejs.dev/

---

## 🎉 You're Ready!

Your local development environment is set up. Start building!

**Next steps:**
1. Make changes to `src/routes/index.tsx`
2. Run `npm run check:safe` to validate
3. Run `npm run build` and `npm run serve` to preview
4. Commit and push your changes
5. Deploy to Vercel or Netlify

**Happy coding! 🚀**
