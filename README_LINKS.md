# Link Manager - Complete Documentation Index

This guide answers your question: **Where are all my links that I added to the Link Manager application?**

## Quick Answer

Your links are stored in a **Creao Cloud DataStore database**. To view them:

1. **Open your Link Manager application** in a web browser
2. **Enter your password** when prompted
3. **All your links appear** in a card grid layout
4. **Click any card** to expand and see the full URL, copy it, edit it, or delete it

## Documentation Files

### For Users (Non-Technical)
- **`CHECK_YOUR_LINKS.txt`** - Simple guide on how to view and manage your links
- **`QUICK_REFERENCE.md`** - Quick reference with common operations and syntax

### For Developers
- **`LINK_STORAGE_SUMMARY.md`** - Complete technical overview of storage, architecture, and APIs
- **`DATABASE_ARCHITECTURE.md`** - Visual diagrams of system design and data flow
- **`LINKS_INSPECTION_GUIDE.md`** - How to inspect database programmatically

### Reference Scripts
- **`query-links.ts`** - TypeScript script to retrieve all links
- **`query-links.js`** - JavaScript version of the query script
- **`inspect-links.html`** - HTML reference page for database inspection

## Quick Navigation

### I Want To...

**View my stored links**
→ Open the Link Manager application in your browser

**Add a new link**
→ Click "Add New Link" button in the app

**Edit an existing link**
→ Click any link card to expand, then click "Edit"

**Delete a link**
→ Click any link card to expand, then click "Delete"

**Copy a link URL**
→ Click any link card to expand, then click the copy icon

**Check if database is empty**
→ Read `CHECK_YOUR_LINKS.txt` > Method 2

**Query links programmatically**
→ Read `LINK_STORAGE_SUMMARY.md` > "Accessing Your Links" > "Method 2"

**Understand the system architecture**
→ Read `DATABASE_ARCHITECTURE.md`

**Find API endpoints and details**
→ Read `LINK_STORAGE_SUMMARY.md` > "Database Architecture"

## Key Information

### Database
- **Type**: Cloud-based DataStore (Creao)
- **API**: https://api-production.creao.ai
- **Authentication**: JWT tokens (automatic)
- **Access**: Through LinkORM class in `src/sdk/database/orm/orm_link.ts`

### Link Data Fields
Each link record contains:
- `id` - Unique identifier (auto-generated)
- `display_name` - The name you gave the link
- `url` - The actual web address
- `create_time` - When it was created (Unix timestamp)
- `update_time` - When it was last updated
- `data_creator` - User ID who created it (read-only)
- `data_updater` - User ID who last updated it (read-only)

### Application Files
- **Main UI**: `src/routes/index.tsx`
- **ORM Class**: `src/sdk/database/orm/orm_link.ts`
- **API Client**: `src/sdk/database/orm/client.ts`
- **Type Definitions**: `src/sdk/database/orm/common.ts`

## Operations Available

### Read (Query) Operations
```
getAllLink()                    // Get all links
getLinkById(id)                 // Get specific link
getLinkByDataCreator(userId)    // Get links by creator
listLink(filter, sort, page)    // Advanced query
```

### Write (Modify) Operations
```
insertLink(data)                // Add new link
setLinkById(id, data)           // Update link
deleteLinkById(id)              // Delete link
deleteLink ByIDs(ids)           // Batch delete
```

## File Locations

```
/home/user/vite-template/

Documentation:
├── README_LINKS.md                      ← You are here
├── CHECK_YOUR_LINKS.txt                 ← Start here for simple guide
├── QUICK_REFERENCE.md                   ← Syntax reference
├── LINK_STORAGE_SUMMARY.md              ← Complete technical guide
├── DATABASE_ARCHITECTURE.md             ← System design
├── LINKS_INSPECTION_GUIDE.md            ← Programmatic access

Reference Scripts:
├── query-links.ts                       ← TypeScript query example
├── query-links.js                       ← JavaScript query example
└── inspect-links.html                   ← HTML reference page

Application Code:
└── src/
    ├── routes/index.tsx                 ← Main UI
    └── sdk/database/orm/
        ├── orm_link.ts                  ← LinkORM class
        ├── client.ts                    ← API client
        └── common.ts                    ← Types
```

## Platform Support

The application recognizes these platforms and shows their logos:
- YouTube
- GitHub
- Twitter/X
- Instagram
- LinkedIn
- Facebook
- Generic links (default icon)

## Security

- All data is encrypted in transit (HTTPS)
- Authentication via JWT tokens
- Password-protected application access
- Data only visible to authenticated user
- Database operations timeout after 30 seconds

## Troubleshooting

**Q: Database appears empty but I added links before**
A: This shouldn't happen. Check that:
   - You're logged in with correct password
   - Application can reach api-production.creao.ai
   - Your browser console shows no errors

**Q: Can't add a new link**
A: Make sure:
   - Link name is not empty
   - URL is a valid web address
   - You have internet connection

**Q: Want to backup links**
A: Use the programmatic method (Method 2 in CHECK_YOUR_LINKS.txt) to export all links to JSON

## Getting Help

1. **Quick answer**: See `CHECK_YOUR_LINKS.txt`
2. **Code examples**: See `QUICK_REFERENCE.md`
3. **Complete guide**: See `LINK_STORAGE_SUMMARY.md`
4. **Architecture details**: See `DATABASE_ARCHITECTURE.md`
5. **Programmatic access**: See `LINKS_INSPECTION_GUIDE.md`

## Next Steps

1. **Immediate**: Open your Link Manager application and view your links
2. **Management**: Add, edit, or delete links through the UI
3. **Advanced**: Use the ORM class programmatically for batch operations
4. **Integration**: Embed link management in other parts of your application

---

**Document Created**: February 18, 2026
**Application**: Link Manager (React + Creao DataStore)
**Version**: Production Ready
