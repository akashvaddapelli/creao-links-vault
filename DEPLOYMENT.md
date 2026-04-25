# Link Manager - Deployment Guide

This guide will help you deploy your personal Link Manager application.

## 🎯 Quick Start

Your Link Manager is ready to deploy! Follow these steps to get it running.

## 📋 Pre-Deployment Checklist

### 1. Customize Your Settings

**Update Password** (Currently: `9014094534.v`)
- Open `src/routes/index.tsx`
- Find line 24: `const CORRECT_PASSWORD = "9014094534.v";`
- Change to your own secure password

**Update Your Name** (Currently: `Akash Vaddapelli`)
- Open `src/routes/index.tsx`
- Find line 305: `<h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back Akash Vaddapelli</h1>`
- Replace "Akash Vaddapelli" with your name

**Update Page Title & Description**
- Title already set to: "Link Manager - Personal Link Organization"
- Description already set to: "Personal link management application..."
- These are in `index.html` (lines 10 and 14) - modify if desired

### 2. Test Locally

```bash
# Install dependencies (if not already done)
npm install

# Run type checking and linting
npm run check:safe

# Build for production
npm run build
```

### 3. Preview Your Build

```bash
# Preview the production build locally
npm run serve
```

Open the URL shown (usually http://localhost:4173) to test your application.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Link to your Vercel account
   - Accept default settings
   - Your app will be deployed and you'll get a URL

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify (Free)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your app**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy
   ```

4. **Production Deployment**
   ```bash
   netlify deploy --prod
   ```

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Update vite.config.ts** - Add base path:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: Custom Server

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure your web server** to serve the `dist/index.html` for all routes

## 🔐 Security Recommendations

### Change Your Password

**Current password:** `9014094534.v`

**To change it:**
1. Open `src/routes/index.tsx`
2. Find line 24: `const CORRECT_PASSWORD = "9014094534.v";`
3. Replace with a strong password
4. Rebuild and redeploy

**Better Security (Future Enhancement):**
For production use, consider:
- Using environment variables for the password
- Implementing backend authentication
- Adding rate limiting for password attempts
- Using a proper authentication service (Auth0, Clerk, Firebase Auth)

## 🛠️ Configuration Files

### Database
- Your database is already configured and production-ready
- ORM files in `src/sdk/database/orm/` handle all data operations
- No additional database setup required

### API
- API endpoint: `https://api-production.creao.ai`
- Authentication via JWT (auto-configured)
- All setup in `src/sdk/database/orm/client.ts`

## 📱 Features Available

- ✅ Password-protected access
- ✅ Add new links with custom names
- ✅ Edit existing links
- ✅ Delete links
- ✅ Copy URLs to clipboard
- ✅ Platform-specific icons (YouTube, GitHub, Twitter, Instagram, etc.)
- ✅ Responsive design (works on mobile & desktop)
- ✅ Search and organize links

## 🔄 Updating Your App

After making changes:

1. **Test locally**
   ```bash
   npm run check:safe
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Redeploy** using your chosen method above

## 🆘 Troubleshooting

### Build fails
- Run `npm run check:safe` to see errors
- Fix TypeScript and ESLint issues
- Common issues:
  - Missing imports
  - Type errors
  - Unused variables

### Password not working
- Check `src/routes/index.tsx` line 24
- Ensure password matches exactly (case-sensitive)

### Links not saving
- Check browser console for errors
- Ensure you're authenticated
- Verify internet connection (app needs API access)

### Copy functionality not working
- Some browsers require HTTPS for clipboard API
- The app includes fallback methods
- Deploy to HTTPS hosting (Vercel/Netlify provide this free)

## 📊 Current Configuration

- **Framework:** React 19 + TypeScript
- **Routing:** TanStack Router
- **State Management:** TanStack Query
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React + Custom SVG icons
- **Database:** Creao Platform ORM
- **Build Tool:** Vite

## 🎨 Customization Ideas

### Change Colors
- Edit `src/routes/index.tsx`
- Find class names like `bg-blue-600`, `text-blue-600`
- Replace with your preferred Tailwind color

### Add More Platform Icons
- Find `getIconForLink()` function in `src/routes/index.tsx` (line 26)
- Add more `if` conditions for other platforms
- Use SVG from [Simple Icons](https://simpleicons.org/)

### Change Welcome Message
- Line 305: `Welcome Back Akash Vaddapelli`
- Line 306: `All your links are safe and secured...Here!`

## 📝 Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

### Backup Your Data
Your links are stored in the Creao Platform database. To export:
- Open browser DevTools (F12)
- Go to Application > IndexedDB
- Or use the app to manually copy important links

## 🎉 You're Ready!

Your Link Manager is fully configured and ready to deploy. Choose a deployment option above and get started!

---

**Need Help?**
- Check the main README.md for project details
- Review CLAUDE.md for development guidelines
- Check the browser console for errors
