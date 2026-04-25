# Link Manager - Database Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Link Manager Application (React)               │ │
│  │  • Displays all links in a card grid                   │ │
│  │  • Password protected                                  │ │
│  │  • Shows icons for recognized platforms                │ │
│  │  • Handles add/edit/delete operations                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS with JWT Auth
                       │
┌──────────────────────┴──────────────────────────────────────┐
│         Creao Cloud Service (Remote Database)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   API: https://api-production.creao.ai                 │ │
│  │   Endpoints:                                           │ │
│  │   • /data/store/v1/all (GET all links)                 │ │
│  │   • /data/store/v1/insert (ADD link)                   │ │
│  │   • /data/store/v1/set (UPDATE link)                   │ │
│  │   • /data/store/v1/delete (REMOVE link)                │ │
│  │   • /data/store/v1/list (QUERY with filters)           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          DataStore Database                            │ │
│  │  Table: "link" (Namespace: 01987547fc6c72ecb453bd2...)  │ │
│  │  Records: LinkModel documents                          │ │
│  │  • id (primary key)                                    │ │
│  │  • display_name (searchable index)                     │ │
│  │  • url                                                 │ │
│  │  • create_time (indexed)                               │ │
│  │  • update_time                                         │ │
│  │  • data_creator (indexed)                              │ │
│  │  • data_updater (indexed)                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Reading All Links

```
User Opens App
      │
      ▼
Login with Password (src/routes/index.tsx:241-250)
      │
      ▼
useQuery Hook Activated (src/routes/index.tsx:107-112)
      │
      ├─► queryKey: "links"
      │
      ├─► queryFn: async () => {
      │     return await linkORM.getAllLink();
      │   }
      │
      ▼
LinkORM.getInstance() (orm_link.ts:66-72)
      │
      ▼
LinkORM.getAllLink() (orm_link.ts:117-129)
      │
      ├─► client.all({
      │     id: entityId,
      │     namespace: namespace,
      │     name: "link",
      │     version: entityVersion,
      │     task: taskId,
      │     format: { structured: true }
      │   })
      │
      ▼
DataStoreClient.request() (client.ts:67-92)
      │
      ├─► Makes HTTPS POST to:
      │     https://api-production.creao.ai/data/store/v1/all
      │
      ├─► Headers:
      │     - Authorization: Bearer <JWT_TOKEN>
      │     - Content-Type: application/json
      │
      ├─► Timeout: 30 seconds
      │
      ▼
Creao API Server Processes Request
      │
      ├─► Authenticates JWT token
      ├─► Queries database
      ├─► Returns all LinkModel records
      │
      ▼
Response Received
      │
      ├─► Status: 200 OK
      ├─► Body: { data: { values: [...] } }
      │
      ▼
resultToData() Conversion (orm_link.ts:616-634)
      │
      ├─► Maps raw API response to LinkModel[]
      ├─► Handles both structured and serialized formats
      ├─► Filters out null values
      │
      ▼
Links Rendered in UI
      │
      ├─► Card grid (src/routes/index.tsx:374-461)
      ├─► Icons based on display_name
      ├─► Click to expand details
      ├─► Action buttons: Copy, Edit, Delete
      │
      ▼
Display Complete ✓
```

## Component Architecture

```
src/
├── routes/
│   └── index.tsx                    ← Main application UI
│       ├── State management
│       ├── Link CRUD operations
│       ├── Password authentication
│       └── Card grid rendering
│
├── sdk/
│   └── database/
│       └── orm/
│           ├── orm_link.ts          ← LinkORM class
│           │   ├── getAllLink()
│           │   ├── insertLink()
│           │   ├── setLinkById()
│           │   ├── deleteLinkById()
│           │   └── listLink()
│           │
│           ├── client.ts            ← API communication
│           │   ├── DataStoreClient (singleton)
│           │   └── HTTP request handling
│           │
│           └── common.ts            ← Type definitions
│               ├── DataType enum
│               ├── LinkModel interface
│               └── Request/Response types
│
├── lib/
│   ├── auth-integration.ts          ← JWT authentication
│   └── utils.ts                     ← Helper functions
│
├── components/
│   └── ui/                          ← shadcn/ui components
│       ├── Button
│       ├── Card
│       ├── Dialog
│       ├── Input
│       └── ...
│
└── config.ts                        ← App configuration
    └── password, userName, etc.
```

## Link Lifecycle

### 1. Creating a Link
```
User Input
  │
  ├─► Display Name: "Google"
  └─► URL: "https://google.com"
      │
      ▼
Validation (src/routes/index.tsx:156-163)
      │
      ├─► Check name is not empty
      └─► Check URL is not empty
      │
      ▼
insertLink() Mutation (src/routes/index.tsx:115-130)
      │
      ├─► linkORM.insertLink([
      │     { url, display_name }
      │   ])
      │
      ▼
Backend Processing
      │
      ├─► Generate unique ID
      ├─► Set data_creator = current_user_id
      ├─► Set create_time = current_timestamp
      ├─► Store in database
      ├─► Return complete LinkModel with all fields
      │
      ▼
Query Invalidation
      │
      ├─► queryClient.invalidateQueries({ queryKey: ["links"] })
      │
      ▼
Re-fetch All Links
      │
      ▼
UI Updates with New Link ✓
```

### 2. Updating a Link
```
User Clicks Edit Button (src/routes/index.tsx:165-170)
      │
      ├─► setEditingLink(link)
      ├─► setEditLinkName(link.display_name)
      └─► setEditLinkUrl(link.url)
      │
      ▼
Edit Dialog Opens
      │
      ├─► User modifies name and/or URL
      │
      ▼
User Clicks Update (src/routes/index.tsx:172-180)
      │
      ├─► Validation check
      │
      ▼
setLinkById() Mutation
      │
      ├─► linkORM.setLinkById(id, {
      │     ...existingLink,
      │     display_name: newName,
      │     url: newUrl
      │   })
      │
      ▼
Backend Processing
      │
      ├─► Locate record by ID
      ├─► Update fields (name, URL)
      ├─► Set data_updater = current_user_id
      ├─► Set update_time = current_timestamp
      ├─► Preserve id, data_creator, create_time
      ├─► Store updated record
      ├─► Return updated LinkModel
      │
      ▼
Query Invalidation & Re-fetch
      │
      ▼
UI Updates with Edited Link ✓
```

### 3. Deleting a Link
```
User Clicks Delete Button (src/routes/index.tsx:182-186)
      │
      ├─► Confirmation dialog: "Are you sure?"
      │
      ▼
User Confirms
      │
      ├─► deleteLinkMutation.mutate(linkId)
      │
      ▼
deleteLinkById() Call
      │
      ├─► linkORM.deleteLinkById(id)
      │
      ▼
Backend Processing
      │
      ├─► Locate record by ID
      ├─► Delete from database
      ├─► Return void (no response body)
      │
      ▼
Query Invalidation
      │
      ├─► queryClient.invalidateQueries({ queryKey: ["links"] })
      │
      ▼
Re-fetch All Links (excluding deleted one)
      │
      ▼
UI Updates (Link Removed) ✓
```

## Database Indexes

The LinkORM supports queries on these indexed fields:

```
Primary Index:
├─► id (get by primary key)

Single Field Indexes:
├─► data_creator (find links by creator)
├─► data_updater (find links by updater)

Composite Indexes:
├─► (create_time, data_creator)
└─► (data_creator, display_name)
```

## Security & Authentication

```
Request Flow:
│
├─► Browser has JWT token (from login)
│
├─► LinkORM calls DataStoreClient
│
├─► DataStoreClient uses authApi.post()
│   ├─► authApi adds Authorization header
│   ├─► Token included as: "Bearer <JWT>"
│   └─► All requests authenticated
│
├─► Creao API validates token
│   ├─► Verifies signature
│   ├─► Checks expiration
│   ├─► Validates user permissions
│   └─► Returns 401 if invalid
│
├─► Response encrypted in transit (HTTPS)
│
└─► Data only visible to authenticated user
```

## Performance Characteristics

```
Operation           │ Network │ Database │ Total   │ Notes
────────────────────┼─────────┼──────────┼─────────┼──────────────
Get All Links       │ ~100ms  │ ~50ms    │ ~200ms  │ Query cache 5min
Get Single Link     │ ~100ms  │ ~10ms    │ ~150ms  │
Add Link            │ ~150ms  │ ~100ms   │ ~300ms  │ Validation included
Update Link         │ ~150ms  │ ~100ms   │ ~300ms  │ Preserve id only
Delete Link         │ ~100ms  │ ~50ms    │ ~200ms  │ Confirm required
Advanced Query      │ ~150ms  │ ~100ms   │ ~400ms  │ With filtering
────────────────────┴─────────┴──────────┴─────────┴──────────────
```

## Error Handling

```
Request to Creao API
      │
      ├─► Network timeout (30 seconds)
      │   └─► Error: "Request timeout after 30 seconds"
      │
      ├─► Invalid JWT token
      │   └─► Error: 401 Unauthorized
      │       └─► User should re-authenticate
      │
      ├─► Malformed request
      │   └─► Error: 400 Bad Request
      │
      ├─► Server error
      │   └─► Error: 5xx Server Error
      │       └─► Retry with exponential backoff
      │
      └─► Success
          └─► Process response normally
```

## Singleton Pattern

The LinkORM uses a singleton pattern to ensure only one instance:

```typescript
class LinkORM {
  private static instance: LinkORM | null = null;

  public static getInstance(): LinkORM {
    if (!LinkORM.instance) {
      LinkORM.instance = new LinkORM();
    }
    return LinkORM.instance;
  }
}

// Usage:
const orm1 = LinkORM.getInstance(); // Creates instance
const orm2 = LinkORM.getInstance(); // Returns same instance
console.log(orm1 === orm2); // true
```

This ensures:
- Single client connection
- Consistent state
- Memory efficient
- Thread-safe operations
