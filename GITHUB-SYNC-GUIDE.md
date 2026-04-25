# 🔄 GitHub Sync Guide

Your Link Manager now includes GitHub integration to backup and sync your links to a GitHub repository!

## 🎯 Features

✅ **Backup to GitHub** - Save all your links to a GitHub repository
✅ **Restore from GitHub** - Restore your links from any device
✅ **Automatic Sync** - One-click sync to keep your backup updated
✅ **Secure** - Uses GitHub Personal Access Tokens
✅ **Cross-Device** - Access your links from anywhere

## 🚀 Setup (5 minutes)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **+** icon → **New repository**
3. Name it (e.g., `link-manager-backup`)
4. Make it **Private** (recommended) or Public
5. Click **Create repository**

### Step 2: Create a Personal Access Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: `Link Manager`
4. Select expiration: **No expiration** (or your preference)
5. Check the **repo** scope (this gives full repository access)
6. Scroll down and click **Generate token**
7. **IMPORTANT:** Copy the token (starts with `ghp_`) - you won't see it again!

### Step 3: Connect in Link Manager

1. Open your Link Manager app
2. Click the **Connect GitHub** button
3. Fill in the form:
   - **Personal Access Token**: Paste the token you copied (ghp_...)
   - **GitHub Username**: Your GitHub username (e.g., `akashvaddapelli`)
   - **Repository Name**: The repo you created (e.g., `link-manager-backup`)
4. Click **Connect**

✅ Done! You're now connected to GitHub.

## 📤 Syncing Your Links

### Upload (Backup) to GitHub

1. Click the **Sync to GitHub** button
2. Your links are instantly backed up!
3. A file called `links-backup.json` will be created in your repository

### Download (Restore) from GitHub

1. Click the **Restore from GitHub** button
2. Confirm the action (this will replace your current links)
3. Your links are restored from the backup!

## 🔐 Security Best Practices

### Keep Your Token Safe

- ✅ **Never share** your Personal Access Token
- ✅ **Never commit** your token to a public repository
- ✅ The token is stored in your browser's localStorage (local only)
- ✅ Use a **private repository** for sensitive links

### Token Permissions

- The token only needs **repo** scope
- This gives read/write access to your repositories
- You can revoke the token anytime at [GitHub Settings](https://github.com/settings/tokens)

## 📋 How It Works

### What Gets Saved?

When you sync to GitHub, a file called `links-backup.json` is created with:

```json
{
  "links": [
    {
      "id": "link_123456_abc",
      "url": "https://example.com",
      "display_name": "Example Site",
      "create_time": "1703000000",
      "update_time": "1703000000"
    }
  ],
  "lastSync": "2025-12-27T20:00:00.000Z",
  "totalLinks": 1
}
```

### Where Is It Saved?

- Repository: `github.com/[your-username]/[your-repo]`
- File path: `links-backup.json` (in the root)
- Branch: `main` (default)

### What Happens on Sync?

1. **First Sync**: Creates `links-backup.json` in your repo
2. **Subsequent Syncs**: Updates the file with your current links
3. **Commit Message**: Automatically generated (e.g., "Update links backup - 25 links")

## 🔄 Use Cases

### 1. Regular Backups

- Click **Sync to GitHub** once a week/month
- Keeps a cloud backup of all your links
- Protected by GitHub's infrastructure

### 2. Multi-Device Access

**On Device A:**
1. Add/edit links
2. Click **Sync to GitHub**

**On Device B:**
1. Click **Restore from GitHub**
2. Your links are now synced!

### 3. Disaster Recovery

- Lost your links? Computer crashed?
- Just click **Restore from GitHub**
- All your links are back!

### 4. Version Control

- Every sync creates a new commit in GitHub
- You can see the history of changes
- Revert to old versions if needed

## 🛠️ Managing Your Connection

### Check Connection Status

When connected, you'll see a badge in the top-right:
```
[GitHub Icon] username/repo [X]
```

### Disconnect from GitHub

1. Click the badge in the top-right
2. Or disconnect to enter new credentials
3. Your local links remain untouched

### Reconnect

1. Click **Connect GitHub** again
2. Enter the same or different repository
3. Previous backups remain in the old repo

## ❓ Troubleshooting

### "Invalid credentials or repository not found"

**Solutions:**
- ✅ Check your token is copied correctly
- ✅ Ensure the repository exists
- ✅ Verify your username is correct
- ✅ Make sure the token has **repo** scope
- ✅ If token expired, create a new one

### "Failed to sync"

**Solutions:**
- ✅ Check your internet connection
- ✅ Verify the repository still exists
- ✅ Check if the token is still valid
- ✅ Try disconnecting and reconnecting

### "Failed to restore"

**Solutions:**
- ✅ Ensure you've synced at least once before
- ✅ Check the file `links-backup.json` exists in your repo
- ✅ Verify your token has read permissions

### Token Expired

If your token expires:
1. Go to [GitHub Tokens](https://github.com/settings/tokens)
2. Create a new token (same steps as setup)
3. Disconnect and reconnect with the new token

## 🔍 Advanced Usage

### Custom File Path

By default, links are saved to `links-backup.json` in the root. To change this:

Edit `src/lib/github-sync.ts`:
```typescript
const DEFAULT_FILE_PATH = "backups/links.json"; // your custom path
```

### Different Branch

By default, uses `main` branch. To change:

Edit `src/lib/github-sync.ts`:
```typescript
const DEFAULT_BRANCH = "backup"; // your custom branch
```

### Manual Backup

You can also manually download `links-backup.json` from your GitHub repo:
1. Go to your repository
2. Click on `links-backup.json`
3. Click **Raw** or **Download**

## 📊 GitHub Repository View

After syncing, visit your repository:
```
https://github.com/[username]/[repo]
```

You'll see:
- `links-backup.json` - Your backup file
- Commit history - All your syncs
- File contents - View your links as JSON

## 🎯 Best Practices

### Regular Syncs

- ✅ Sync after adding important links
- ✅ Sync before clearing browser data
- ✅ Set a reminder to sync weekly/monthly

### Repository Management

- ✅ Use a **private** repository for sensitive links
- ✅ Add a README.md to explain what it's for
- ✅ Never share your repository if it's private

### Token Management

- ✅ Create tokens with **minimal permissions** (only repo)
- ✅ Set expiration dates for security
- ✅ Revoke old tokens when creating new ones
- ✅ Never commit tokens to code

## 🆘 Need Help?

### GitHub Resources

- [GitHub Tokens Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Repository Help](https://docs.github.com/en/repositories)

### Common Questions

**Q: Can I sync to multiple repositories?**
A: Yes! Disconnect and reconnect with different repo details.

**Q: What if I delete the repository?**
A: Your local links are safe. Just create a new repo and reconnect.

**Q: Can others see my links?**
A: Only if your repository is public. Use private repos for privacy.

**Q: How often should I sync?**
A: After significant changes, or at least weekly for safety.

**Q: Can I edit links-backup.json manually?**
A: Yes! Edit the JSON file in GitHub, then restore to apply changes.

## 🎉 You're All Set!

Your Link Manager is now connected to GitHub and ready to sync. Your links are safer than ever with cloud backup!

---

**Quick Reference:**
- Backup → Click **Sync to GitHub**
- Restore → Click **Restore from GitHub**
- Disconnect → Click badge in top-right
- Reconnect → Click **Connect GitHub**

**Happy Syncing! 🚀**
