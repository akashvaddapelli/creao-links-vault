# 🔄 Git Repository Setup Guide

Complete guide to get your Link Manager codebase into GitHub and set up for local development.

---

## ✅ Current Status

**Git Repository:** ✅ Initialized
**Initial Commit:** ✅ Created (150 files, 34,081 lines)
**Branch:** `main`
**Ready to Push:** ✅ Yes

---

## 🚀 Push to GitHub (2 Methods)

### Method 1: SSH (Recommended - More Secure)

#### Step 1: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `link-manager` (or any name you prefer)
3. **Description:** `Personal Link Manager - Secure, beautiful link organization app`
4. **Visibility:** Private (recommended) or Public
5. **DO NOT** check "Initialize with README" (you already have code)
6. **Click:** "Create repository"

#### Step 2: Add Remote

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin git@github.com:YOUR_USERNAME/link-manager.git

# Example:
# git remote add origin git@github.com:akashvaddapelli/link-manager.git
```

#### Step 3: Generate SSH Key (if you don't have one)

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "akashvaddapelli@gmail.com" -f ~/.ssh/id_ed25519_github -N ""

# Display your public key
cat ~/.ssh/id_ed25519_github.pub
```

#### Step 4: Add SSH Key to GitHub

1. **Copy the output** from the previous command (starts with `ssh-ed25519`)
2. **Go to:** https://github.com/settings/ssh/new
3. **Title:** `Link Manager - E2B Sandbox`
4. **Key:** Paste your public key
5. **Click:** "Add SSH key"

#### Step 5: Test SSH Connection

```bash
ssh -T git@github.com -i ~/.ssh/id_ed25519_github
```

You should see: `Hi YOUR_USERNAME! You've successfully authenticated...`

#### Step 6: Push to GitHub

```bash
git push -u origin main
```

**Done!** Your code is now on GitHub.

---

### Method 2: HTTPS (Simpler, but requires token)

#### Step 1: Create GitHub Repository

(Same as Method 1, Step 1 above)

#### Step 2: Generate Personal Access Token

1. **Go to:** https://github.com/settings/tokens/new
2. **Note:** `Link Manager - E2B Sandbox`
3. **Expiration:** 90 days (or as needed)
4. **Select scopes:**
   - ✅ `repo` (all repo permissions)
5. **Click:** "Generate token"
6. **Copy the token** (you won't see it again!)

#### Step 3: Add Remote and Push

```bash
# Replace YOUR_USERNAME and YOUR_TOKEN
git remote add origin https://github.com/YOUR_USERNAME/link-manager.git

# Push (use your token as password)
git push -u origin main
```

**Username:** Your GitHub username
**Password:** Paste your Personal Access Token

**Done!** Your code is on GitHub.

---

## 💻 Clone to Your Local Machine

Once your code is on GitHub, clone it to your local computer:

### On Your Local Computer

```bash
# Navigate to where you want the project
cd ~/Projects  # or any directory you prefer

# Clone the repository
git clone git@github.com:YOUR_USERNAME/link-manager.git

# Or with HTTPS:
# git clone https://github.com/YOUR_USERNAME/link-manager.git

# Enter the directory
cd link-manager

# Install dependencies
npm install

# Create your .env file
cp .env.example .env

# Edit .env with your password and name
nano .env  # or use your preferred editor
```

---

## 🛠️ Local Development Setup

### Prerequisites

Make sure you have installed:
- **Node.js** (v18 or higher) - https://nodejs.org/
- **npm** (comes with Node.js)
- **Git** - https://git-scm.com/

### Setup Steps

1. **Clone the repository** (see above)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your app**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit with your details
   # Update VITE_APP_PASSWORD and VITE_USER_NAME
   ```

4. **Validate the code**
   ```bash
   npm run check:safe
   ```

5. **Build the app**
   ```bash
   npm run build
   ```

6. **Preview locally**
   ```bash
   npm run serve
   ```

   Open http://localhost:4173 in your browser

---

## 🔄 Daily Development Workflow

### Making Changes

```bash
# 1. Make sure you're on the main branch
git checkout main

# 2. Pull latest changes (if working from multiple locations)
git pull origin main

# 3. Make your changes to the code
# ... edit files ...

# 4. Validate your changes
npm run check:safe

# 5. Stage your changes
git add .

# 6. Commit with a descriptive message
git commit -m "Add new feature: description here"

# 7. Push to GitHub
git push origin main
```

### Creating a Feature Branch (Optional, Recommended)

```bash
# Create and switch to a new branch
git checkout -b feature/new-feature-name

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add new feature"

# Push the branch
git push -u origin feature/new-feature-name

# Create a Pull Request on GitHub
# Merge when ready, then delete branch
```

---

## 📦 Repository Contents

Your repository includes:

**Application Code:**
- `src/` - React application source code
- `public/` - Static assets
- `index.html` - HTML entry point

**Configuration:**
- `.env.example` - Environment variable template
- `src/config.ts` - App configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration

**Documentation:**
- `START-HERE.md` - Main entry point
- `QUICKSTART.md` - Quick deployment guide
- `DEPLOYMENT.md` - Detailed deployment guide
- `CHECKLIST.md` - Pre-deployment checklist
- And 20+ more helpful guides!

**Development Tools:**
- `.gitignore` - Git ignore rules
- `biome.json` - Code formatter config
- `eslint.config.js` - Linting configuration

---

## 🔐 Security Best Practices

### Environment Variables

**Never commit `.env` to Git!** It's already in `.gitignore`.

**What's safe to commit:**
- ✅ `.env.example` (template with no real values)
- ✅ `src/config.ts` (uses env vars, no hardcoded secrets)

**What to NEVER commit:**
- ❌ `.env` (contains your password)
- ❌ Any file with real credentials
- ❌ API keys or tokens

### Password Security

Your `.env` file contains:
```bash
VITE_APP_PASSWORD=pass.word.admin.mode
VITE_USER_NAME=Akash Vaddapelli
```

**This is NOT committed to GitHub** (protected by `.gitignore`)

On each machine, create your own `.env` file:
```bash
cp .env.example .env
# Then edit with your values
```

---

## 🌐 Deploy from GitHub

Once your code is on GitHub, you can deploy directly:

### Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_APP_PASSWORD` = your password
   - `VITE_USER_NAME` = your name
4. Click "Deploy"

### Netlify

1. Go to https://app.netlify.com/start
2. Connect to GitHub
3. Select your repository
4. Add environment variables in Build settings
5. Click "Deploy"

Both platforms auto-deploy on every push to `main`!

---

## 🔄 Sync Between E2B and Local

### From E2B to GitHub to Local

```bash
# In E2B sandbox (where you are now):
git push origin main

# On your local machine:
git pull origin main
```

### From Local to GitHub to E2B

```bash
# On your local machine:
git add .
git commit -m "Your changes"
git push origin main

# In E2B sandbox:
git pull origin main
```

---

## 📊 Repository Statistics

**Current Commit:**
- Files: 150
- Lines: 34,081
- Branch: main
- Commit message: "Initial commit: Personal Link Manager Application"

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"

**Solution:** Your SSH key isn't set up correctly.

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "akashvaddapelli@gmail.com"

# Add to GitHub: https://github.com/settings/ssh/new
cat ~/.ssh/id_ed25519.pub
```

### "Repository not found"

**Solution:** Check the remote URL.

```bash
# View current remote
git remote -v

# Update if wrong
git remote set-url origin git@github.com:YOUR_USERNAME/link-manager.git
```

### "Updates were rejected"

**Solution:** Pull changes first.

```bash
git pull origin main --rebase
git push origin main
```

### "Cannot find module" after cloning

**Solution:** Install dependencies.

```bash
npm install
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Pull latest changes
git pull origin main

# Push your changes
git push origin main

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout main

# View remote URL
git remote -v

# Update remote URL
git remote set-url origin NEW_URL
```

### Development Commands

```bash
# Install dependencies
npm install

# Validate code
npm run check:safe

# Build for production
npm run build

# Preview build
npm run serve

# Run tests
npm test
```

---

## 📝 Next Steps

1. **Create GitHub repository** (if not done)
2. **Add remote** to this Git repo
3. **Push to GitHub**
4. **Clone to local machine**
5. **Set up .env on local**
6. **Start developing!**

---

## 📚 Additional Resources

- **GitHub Docs:** https://docs.github.com/
- **Git Basics:** https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **Deployment Guides:** See `DEPLOYMENT.md`
- **Quick Start:** See `QUICKSTART.md`

---

**Your Link Manager is ready to be shared with the world! 🚀**
