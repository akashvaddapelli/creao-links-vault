# 🔗 Personal Link Manager

A secure, beautiful, and easy-to-use link management application built specifically for personal use.

![Link Manager](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue)

## 📸 Features

- 🔐 **Password Protected** - Secure access to your links
- 📝 **Easy Management** - Add, edit, and delete links effortlessly
- 🎨 **Platform Icons** - Auto-detects major platforms (YouTube, GitHub, Twitter, etc.)
- 📋 **One-Click Copy** - Copy URLs to clipboard instantly
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast** - Built with modern React and optimized for performance
- 🎯 **Clean UI** - Beautiful, intuitive interface

## 🚀 Quick Deploy

**3 Simple Steps:**

1. **Customize** - Update your name and password in `src/config.ts`
2. **Build** - Run `npm run build`
3. **Deploy** - Deploy to Vercel/Netlify (free)

**Detailed Instructions:** See [QUICKSTART.md](./QUICKSTART.md)

## 📁 Project Structure

```
vite-template/
├── src/
│   ├── routes/
│   │   └── index.tsx          # Main app (your link manager UI)
│   ├── components/ui/         # Reusable UI components (40+)
│   ├── sdk/database/orm/      # Database layer (production-ready)
│   └── config.ts              # ⚙️ YOUR CONFIGURATION FILE
├── index.html                 # Page title and meta
├── .env.example              # Environment variables template
├── QUICKSTART.md             # 5-minute deployment guide
├── DEPLOYMENT.md             # Detailed deployment options
└── package.json              # Dependencies and scripts
```

## ⚙️ Configuration

### Update Your Information

Edit `src/config.ts`:

```typescript
export const APP_CONFIG = {
  password: "your-secure-password",    // ⚠️ CHANGE THIS!
  userName: "Your Name",               // Your name here
  welcomeMessage: "Welcome Back",
  tagline: "All your links are safe and secured...Here!",
} as const;
```

### Or Use Environment Variables

Create `.env`:

```bash
VITE_APP_PASSWORD=your-secure-password
VITE_USER_NAME=Your Name
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Validate code (TypeScript + ESLint)
npm run check:safe

# Build for production
npm run build

# Preview build locally
npm run serve
```

## 🌐 Deployment Options

| Platform | Cost | Difficulty | Deploy Time |
|----------|------|------------|-------------|
| **Vercel** | Free | ⭐ Easy | 2 min |
| **Netlify** | Free | ⭐ Easy | 2 min |
| **GitHub Pages** | Free | ⭐⭐ Medium | 5 min |
| **Custom Server** | Varies | ⭐⭐⭐ Hard | 10+ min |

**Recommended:** Vercel or Netlify (easiest, free, automatic HTTPS)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

## 📊 Tech Stack

**Frontend:**
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide Icons** - Modern icon library

**State Management:**
- **TanStack Query** - Powerful data fetching and caching
- **TanStack Router** - Type-safe routing

**Build Tools:**
- **Vite** - Fast build tool and dev server
- **Rolldown** - Next-gen bundler

**Database:**
- **Creao Platform ORM** - Production-ready database layer
- **Automatic Sync** - Changes sync to cloud database

## 🔒 Security Features

- ✅ Password-protected access
- ✅ Client-side password validation
- ✅ No data exposed without authentication
- ✅ HTTPS on all major deployment platforms
- ✅ Secure API communication with JWT

**⚠️ Important:** Change the default password before deploying!

## 🎨 Supported Platform Icons

Auto-detected icons for:
- YouTube (red logo)
- GitHub (black logo)
- Twitter/X (blue logo)
- Instagram (pink/purple logo)
- LinkedIn (blue logo)
- Facebook (blue logo)
- Generic link icon (for others)

Want to add more? See the customization guide in [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📱 Usage

1. **Access** - Open your deployed URL
2. **Login** - Enter your password
3. **Add** - Click "Add New Link" to create entries
4. **View** - Click any link card to expand details
5. **Copy** - Click the copy icon to copy URLs
6. **Edit** - Click "Edit" to modify links
7. **Delete** - Click "Delete" to remove links

## 🔄 Updating

After making changes:

```bash
# 1. Validate
npm run check:safe

# 2. Build
npm run build

# 3. Redeploy
vercel --prod    # or your deployment command
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get deployed in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide with all options
- **[CLAUDE.md](./CLAUDE.md)** - Developer guidelines and architecture

## 🎯 Current Status

✅ **Production Ready**
- All features implemented and tested
- Database schema configured
- API integration complete
- TypeScript validation passing
- Build successful
- Ready to deploy

## 💡 Future Enhancements (Optional)

Consider adding:
- 🔍 Search functionality
- 🏷️ Tags/categories for links
- 📊 Usage analytics
- 🔄 Import/export links
- 🌙 Dark mode
- 🔐 Backend authentication (OAuth, etc.)
- 📱 PWA support (offline access)

## 🆘 Troubleshooting

**Build fails?**
```bash
npm run check:safe  # See what's wrong
```

**Password not working?**
- Check `src/config.ts` or `.env`
- Rebuild after changes
- Password is case-sensitive

**Links not saving?**
- Check browser console (F12)
- Ensure internet connection
- Verify you're logged in

**Copy not working?**
- Deploy to HTTPS (Vercel/Netlify)
- App has fallback methods built-in

More help: [DEPLOYMENT.md](./DEPLOYMENT.md) Troubleshooting section

## 📄 License

This is your personal project - use it however you want!

## 🙏 Built With

- React Team for React 19
- Tailwind Labs for Tailwind CSS
- shadcn for UI components
- TanStack for Query and Router
- Creao Platform for database infrastructure

---

**Ready to deploy?** → See [QUICKSTART.md](./QUICKSTART.md)

**Questions?** → See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Enjoy your new Link Manager! 🎉**
