# Link Manager - Quick Reference Guide

## See Your Links Right Now

### Option 1: Use the Application (Easiest)
1. Open your Link Manager application in a browser
2. Enter your password
3. All your links appear in the card grid
4. Click any card to expand and see options

### Option 2: Check Database Status
```typescript
import { LinkORM } from './src/sdk/database/orm/orm_link';

const linkORM = LinkORM.getInstance();
const links = await linkORM.getAllLink();

console.log(`You have ${links.length} link(s)`);
```

## Where Your Links Are Stored

- **Service**: Creao DataStore (cloud database)
- **API**: `https://api-production.creao.ai`
- **ORM Class**: `src/sdk/database/orm/orm_link.ts`

## Link Data Structure

```typescript
{
  id: "unique-id",                    // Auto-generated
  display_name: "My Link Name",       // What you entered
  url: "https://example.com",         // The actual URL
  create_time: "1708123456",          // Unix timestamp
  update_time: "1708123456",          // Unix timestamp
  data_creator: "user-id",            // Who created it
  data_updater: "user-id"             // Who last updated it
}
```

## Common Operations

### Get All Links
```typescript
const linkORM = LinkORM.getInstance();
const allLinks = await linkORM.getAllLink();
```

### Add a Link
```typescript
const result = await linkORM.insertLink([{
  display_name: "Google",
  url: "https://google.com"
} as LinkModel]);
```

### Update a Link
```typescript
await linkORM.setLinkById(linkId, {
  ...existingLink,
  display_name: "Updated Name",
  url: "https://new-url.com"
});
```

### Delete a Link
```typescript
await linkORM.deleteLinkById(linkId);
```

### Find Links by Creator
```typescript
const userLinks = await linkORM.getLinkByDataCreator(userId);
```

## Application Files

| File | What It Does |
|------|-------------|
| `src/routes/index.tsx` | Main UI for managing links |
| `src/sdk/database/orm/orm_link.ts` | Database operations |
| `src/sdk/database/orm/client.ts` | API communication |
| `index.html` | HTML entry point (customize title/meta) |
| `src/config.ts` | App configuration |

## Features in the UI

- **Add Links**: "Add New Link" button
- **View Links**: Card grid with icons for recognized platforms (YouTube, GitHub, Twitter, etc.)
- **Expand Details**: Click any card to see full URL and action buttons
- **Copy URL**: One-click copy to clipboard
- **Edit**: Change name or URL
- **Delete**: Remove links (with confirmation)
- **Password Protection**: Secure access to your links

## Is Your Database Empty?

If you see "No links yet" in the app, your database is empty.

**That's normal if:**
- You just created the Link Manager
- You haven't added any links yet
- All links were deleted

**To populate it:**
Click "Add New Link" and enter:
1. A name (e.g., "Google")
2. A URL (e.g., "https://google.com")

## Supported Platforms

The app recognizes these platforms and shows their logos:
- YouTube
- GitHub
- Twitter/X
- Instagram
- LinkedIn
- Facebook
- Generic links (generic link icon)

## Need Help?

**See all stored links:**
```typescript
const orm = LinkORM.getInstance();
orm.getAllLink().then(links => console.table(links));
```

**Check database status:**
```typescript
const orm = LinkORM.getInstance();
orm.getAllLink().then(links =>
  console.log(links.length === 0 ? 'Empty' : `${links.length} links`)
);
```

**Full documentation:**
See `LINK_STORAGE_SUMMARY.md` for complete details.
