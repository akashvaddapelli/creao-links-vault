# 🚀 GitHub Setup - Step by Step

Follow these exact steps to connect your Link Manager to GitHub.

## 📋 Prerequisites

- A GitHub account (free)
- Your Link Manager app running
- 5 minutes of time

---

## Step 1️⃣: Create a GitHub Repository

### 1.1 Go to GitHub
```
🌐 Open: https://github.com
```

### 1.2 Create New Repository
```
1. Click the [+] icon (top-right)
2. Click "New repository"
```

### 1.3 Configure Repository
```
Repository name:     link-manager-backup
Description:         Backup for my Link Manager
Visibility:          🔒 Private (recommended)
Initialize:          ❌ Don't add README
                     ❌ Don't add .gitignore
                     ❌ Don't add license

Click: [Create repository]
```

### 1.4 Repository Created!
```
✅ Your repo: github.com/[your-username]/link-manager-backup
```

---

## Step 2️⃣: Create Personal Access Token

### 2.1 Go to Token Settings
```
🌐 Direct link: https://github.com/settings/tokens/new
Or manually:
  1. Click your profile picture (top-right)
  2. Settings
  3. Developer settings (bottom left)
  4. Personal access tokens
  5. Tokens (classic)
  6. Generate new token (classic)
```

### 2.2 Configure Token
```
Note:                Link Manager Backup
Expiration:          No expiration (or your preference)

Select scopes:
  ✅ repo (Full control of private repositories)
     ✅ repo:status
     ✅ repo_deployment
     ✅ public_repo
     ✅ repo:invite
     ✅ security_events

Leave all other checkboxes unchecked

Scroll down and click: [Generate token]
```

### 2.3 Copy Your Token
```
⚠️  IMPORTANT: Copy the token NOW!

Token format: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Click the [📋 Copy] icon
Paste it somewhere safe temporarily
You won't be able to see it again!
```

---

## Step 3️⃣: Connect Link Manager to GitHub

### 3.1 Open Your Link Manager
```
🌐 Open your deployed Link Manager app
📧 Enter your password to login
```

### 3.2 Click "Connect GitHub"
```
Look for the button in the action row:
[+ Add New Link]  [Connect GitHub]  ←── Click this
```

### 3.3 Fill in the Connection Form

**Form Layout:**
```
┌─────────────────────────────────────────────┐
│ 🔗 Connect to GitHub                        │
├─────────────────────────────────────────────┤
│                                             │
│ Personal Access Token                       │
│ ┌─────────────────────────────────────┐   │
│ │ ghp_xxxxxxxxxxxx (paste here)       │   │
│ └─────────────────────────────────────┘   │
│ Create a token at github.com/settings/...  │
│                                             │
│ GitHub Username/Organization                │
│ ┌─────────────────────────────────────┐   │
│ │ your-username                       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ Repository Name                             │
│ ┌─────────────────────────────────────┐   │
│ │ link-manager-backup                 │   │
│ └─────────────────────────────────────┘   │
│ Your links will be saved to...             │
│                                             │
│              [Cancel]  [🔗 Connect]         │
└─────────────────────────────────────────────┘
```

**What to Enter:**

1. **Personal Access Token:**
   ```
   Paste: ghp_xxxxxxxxxxxx (the token you copied)
   ```

2. **GitHub Username/Organization:**
   ```
   Enter: your-github-username
   Example: akashvaddapelli
   ```

3. **Repository Name:**
   ```
   Enter: link-manager-backup
   (or whatever you named your repo)
   ```

### 3.4 Click "Connect"
```
Click the [🔗 Connect] button

Wait for verification...
✅ "Successfully connected to GitHub!"

The dialog will close automatically
```

---

## Step 4️⃣: Sync Your Links

### 4.1 Verify Connection
```
Look in the top-right corner:
🐙 your-username/link-manager-backup [×]
                                      ↑
                            This shows you're connected!
```

### 4.2 Sync to GitHub
```
Look for the new buttons:
[+ Add New Link]  [Sync to GitHub]  [Restore from GitHub]
                   ↑
            Click this to backup
```

### 4.3 First Sync
```
1. Click [Sync to GitHub]
2. Wait a moment...
3. See success message: "Synced X links to GitHub!"
```

### 4.4 Verify on GitHub
```
1. Go to: github.com/[username]/link-manager-backup
2. You should see a new file: links-backup.json
3. Click on it to view your links!
```

---

## ✅ Success Checklist

Mark each when completed:

- [ ] Created GitHub repository
- [ ] Generated Personal Access Token
- [ ] Copied token to safe place
- [ ] Opened Link Manager app
- [ ] Clicked "Connect GitHub"
- [ ] Filled in all three fields correctly
- [ ] Clicked "Connect" successfully
- [ ] Saw "Successfully connected" message
- [ ] Clicked "Sync to GitHub"
- [ ] Saw "Synced X links" success message
- [ ] Verified `links-backup.json` exists on GitHub

---

## 🎯 What You Now Have

```
✅ Link Manager connected to GitHub
✅ Cloud backup repository (private)
✅ Secure authentication (token)
✅ One-click sync capability
✅ One-click restore capability
✅ Cross-device sync ready
```

---

## 🔄 Daily Usage

### To Backup (Upload):
```
1. Add/edit your links
2. Click [Sync to GitHub]
3. Done! Cloud backup updated
```

### To Restore (Download):
```
1. Open Link Manager on any device
2. Connect to same GitHub repo
3. Click [Restore from GitHub]
4. Confirm
5. Done! All links restored
```

---

## 🆘 Troubleshooting

### Error: "Invalid credentials or repository not found"

**Check:**
- [ ] Token copied correctly (no extra spaces)
- [ ] Username is correct (case-sensitive)
- [ ] Repository name is correct (case-sensitive)
- [ ] Repository exists on GitHub
- [ ] Token has "repo" scope selected

**Solution:**
1. Go back to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Verify your token has "repo" scope
3. If not, delete old token and create new one
4. Disconnect and reconnect in Link Manager

### Error: "Failed to sync"

**Check:**
- [ ] Internet connection working
- [ ] GitHub is accessible
- [ ] Token hasn't been revoked
- [ ] Repository still exists

**Solution:**
1. Check [github.com](https://github.com) is loading
2. Verify repo at github.com/[username]/[repo]
3. Try disconnecting and reconnecting

### Can't Find "Connect GitHub" Button

**Make sure:**
- [ ] You're logged in to Link Manager
- [ ] You entered the correct password
- [ ] Page has fully loaded

**The button location:**
```
Header: Welcome Back [Your Name]
        All your links are safe...

Buttons: [+ Add New Link]  [Connect GitHub]  ← Here!
                            ↑↑↑↑↑↑↑↑↑↑↑↑↑
```

---

## 🎉 Congratulations!

You've successfully connected your Link Manager to GitHub!

**What's Next:**
- Use it regularly (sync weekly)
- Try restoring on another device
- Check your backup on GitHub
- Share the feature with friends (optional)

**Your links are now cloud-backed and safe! 🚀**

---

## 📖 More Help

- **Full Guide:** [GITHUB-SYNC-GUIDE.md](./GITHUB-SYNC-GUIDE.md)
- **Feature Overview:** [WHATS-NEW.md](./WHATS-NEW.md)
- **GitHub Docs:** [docs.github.com](https://docs.github.com)

---

**Happy Syncing! 💾☁️**
