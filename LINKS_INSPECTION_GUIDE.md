# Link Manager Database Inspection Guide

## Summary

The Link Manager application stores links in a Creao DataStore database. All links are accessed through the `LinkORM` class located at `/home/user/vite-template/src/sdk/database/orm/orm_link.ts`.

## How to View Your Stored Links

Since the application uses a remote Creao backend API (api-production.creao.ai), the links are stored in the cloud database and can be accessed through:

### Method 1: Using the Application UI
Simply visit the Link Manager application in your browser. The application will automatically load all stored links when you authenticate with the correct password.

**In the application, you can:**
- View all links in a card grid layout
- Click any link card to expand and see:
  - Full URL with clickable link
  - Copy button to copy the URL
  - Edit button to modify the link
  - Delete button to remove the link

### Method 2: Programmatic Access (TypeScript/JavaScript)

To query all links programmatically:

```typescript
import { LinkORM, type LinkModel } from './src/sdk/database/orm/orm_link';

const linkORM = LinkORM.getInstance();
const allLinks = await linkORM.getAllLink();

// allLinks will be an array of LinkModel objects
allLinks.forEach(link => {
  console.log(`${link.display_name}: ${link.url}`);
});
```

## Link Data Structure

Each link stored in the database has the following properties:

```typescript
interface LinkModel {
  id: string;                // Unique identifier (auto-generated)
  url: string;              // The actual URL/link
  display_name: string;     // The name to display for this link
  data_creator: string;     // User ID who created the link (read-only)
  data_updater: string;     // User ID who last updated the link (read-only)
  create_time: string;      // Creation timestamp in 10-digit format (read-only)
  update_time: string;      // Last update timestamp in 10-digit format (read-only)
}
```

## Database Operations Available

The LinkORM provides the following operations:

### Read Operations
- `getAllLink()` - Retrieve all links
- `getLinkById(id)` - Get a specific link by ID
- `getLinkByDataCreator(userId)` - Get all links created by a user
- `listLink(filter?, sort?, paginate?)` - Advanced filtering and pagination

### Write Operations
- `insertLink(data)` - Add new links
- `setLinkById(id, data)` - Update an existing link
- `deleteLinkById(id)` - Delete a specific link
- `deleteLinkByIDs(ids)` - Batch delete multiple links

### Admin Operations
- `purgeAllLink()` - Delete all links (use with caution!)

## Checking if Database is Empty

To check if there are any links stored:

```typescript
const linkORM = LinkORM.getInstance();
const links = await linkORM.getAllLink();

if (links.length === 0) {
  console.log('No links stored in the database');
} else {
  console.log(`${links.length} link(s) found`);
}
```

## Current State

To see your current stored links, use the Link Manager application in your browser:

1. Navigate to the application URL
2. Enter the password when prompted
3. All your stored links will appear in the main grid

The application fetches links using the query key "links" which calls `linkORM.getAllLink()` automatically.

## API Integration

The application connects to:
- **API Host**: https://api-production.creao.ai
- **DataStore Endpoint**: `/data/store/v1/all` (for retrieving all records)
- **Authentication**: JWT tokens integrated through `authApi`

All requests are made with a 30-second timeout and proper error handling.
