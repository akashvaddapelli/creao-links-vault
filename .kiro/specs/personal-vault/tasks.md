# Implementation Plan: Personal Vault

## Overview

Evolve the existing localStorage-based link manager into a full-featured encrypted digital vault. Tasks are ordered: foundation (crypto, data layer, auth) → core features (CRUD, editors, viewers) → advanced features (search, OCR, offline, 2FA, backup) → polish (PWA, settings, audit log, migration).

## Tasks

- [ ] 1. Install dependencies and scaffold vault directory structure
  - Add to `package.json`: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-code`, `fuse.js`, `tesseract.js`, `idb`, `otpauth`, `workbox-window`, `vite-plugin-pwa`, `react-dropzone`, `@tanstack/react-virtual`, `fast-check`
  - Create directory skeleton: `src/routes/vault/`, `src/routes/collections/`, `src/routes/search/`, `src/routes/settings/`, `src/routes/audit/`, `src/components/vault/viewers/`, `src/components/vault/editors/`, `src/lib/vault/`, `src/stores/`, `src/hooks/`
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 9.4_

- [ ] 2. Define core TypeScript types and data models
  - Create `src/lib/vault/types.ts` with `VaultItem`, `LinkData`, `NoteData`, `PasswordData`, `FileData`, `Collection`, `Tag`, `AuditLogEntry`, `VaultSettings`, `SyncQueueEntry`, `SearchableItem` interfaces
  - _Requirements: 1.1, 1.2, 3.1, 4.2, 11.1_

- [ ] 3. Implement encryption library
  - [ ] 3.1 Implement `src/lib/vault/crypto.ts` with `deriveKey` (PBKDF2-SHA256, 100k iterations), `encryptField` (AES-256-GCM, random 12-byte IV, base64 output), and `decryptField`
    - _Requirements: 7.1, 8.1, 8.2, 8.3_

  - [ ]* 3.2 Write property test: encryption round-trip preserves plaintext (Property 5)
    - **Property 5: Encryption round-trip preserves plaintext**
    - Use `fc.string({ minLength: 1 })` for arbitrary plaintexts; derive a test key once; assert `decryptField(encryptField(p)) === p`
    - **Validates: Requirements 8.4, 3.2**

  - [ ]* 3.3 Write property test: ciphertext never equals plaintext (Property 6)
    - **Property 6: Encrypted ciphertext is never equal to plaintext**
    - Use `fc.string({ minLength: 1 })`; assert ciphertext ≠ plaintext and ciphertext is valid base64
    - **Validates: Requirements 8.1, 8.2, 3.2**

- [ ] 4. Implement password generator
  - [ ] 4.1 Implement `src/lib/vault/password-generator.ts` with `generatePassword(config)` using `crypto.getRandomValues`; support length 8–64 and configurable charset (uppercase, lowercase, digits, symbols)
    - _Requirements: 3.6, 3.7_

  - [ ]* 4.2 Write property test: generator satisfies length and charset constraints (Property 7)
    - **Property 7: Password generator satisfies length and charset constraints**
    - Use `fc.record({ length: fc.integer({ min: 8, max: 64 }), charset: fc.subarray([...]) })`; assert output length equals config length and every character is in the charset
    - **Validates: Requirements 3.6**

- [ ] 5. Implement IndexedDB store
  - Implement `src/lib/vault/idb-store.ts` using `idb`; define `VaultDB` schema with stores: `vault_items` (indexes: `by_collection`, `by_type`), `collections`, `tags`, `audit_log`, `settings`, `sync_queue`
  - Export typed CRUD helpers: `vaultItemsStore`, `collectionsStore`, `tagsStore`, `auditLogStore`, `settingsStore`, `syncQueueStore`
  - _Requirements: 9.1, 9.5, 11.3_

- [ ] 6. Implement vault item CRUD operations
  - [ ] 6.1 Implement `createVaultItem`, `updateVaultItem`, `deleteVaultItem`, `listVaultItems`, `getVaultItem` in `src/lib/vault/idb-store.ts`; `createVaultItem` generates UUID, sets `createdAt = updatedAt = Date.now()`; `updateVaultItem` sets `updatedAt = Date.now()`
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 6.2 Write property test: item creation populates all required fields (Property 1)
    - **Property 1: VaultItem creation populates all required fields**
    - Use `fc.record({ type: fc.constantFrom('link','note','password','image','document','file'), title: fc.string({ minLength: 1 }) })`; assert non-empty unique id, correct type/title, and `createdAt === updatedAt`
    - **Validates: Requirements 1.2**

  - [ ]* 6.3 Write property test: item update preserves identity and advances timestamp (Property 2)
    - **Property 2: VaultItem update preserves identity and advances timestamp**
    - Assert `id` and `type` unchanged, updated fields match payload, `updatedAt >= original.updatedAt`
    - **Validates: Requirements 1.3**

  - [ ]* 6.4 Write property test: item delete removes item from store (Property 3)
    - **Property 3: VaultItem delete removes item from store**
    - Insert then delete then list; assert result set does not contain the deleted item's id
    - **Validates: Requirements 1.4**

- [ ] 7. Implement Zustand stores
  - Implement `src/stores/vault-store.ts`: session state (`encryptionKey: CryptoKey | null`, `isLocked`, `currentCollectionId`, `viewPreference`, `failedAttempts`, `lockUntil`)
  - Implement `src/stores/search-store.ts`: `query`, `results`, `setQuery`, `setResults`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.5_

- [ ] 8. Implement DataStore ORM wrappers for vault models
  - Create `src/lib/vault/datastore.ts` with typed wrappers around `DataStoreClient` for `vault_items`, `collections`, `tags`, `audit_log`, `settings`, `auth_meta` namespaced under `personal-vault`
  - Implement `syncToDataStore(item)` and `fetchFromDataStore()` helpers that write/read ciphertext fields
  - _Requirements: 1.2, 1.3, 1.4, 7.6, 8.1, 8.2_

- [ ] 9. Implement authentication and session management
  - [ ] 9.1 Implement unlock flow in `src/lib/vault/auth.ts`: `unlockVault(password)` derives key via `deriveKey`, verifies against stored salt from DataStore `auth_meta`, sets key in vault-store; `lockVault()` clears key from store
    - _Requirements: 7.1, 7.5, 7.6_

  - [ ] 9.2 Implement failed-attempt counter and 15-minute lockout: increment `failedAttempts` on wrong password; when counter reaches 5, set `lockUntil = Date.now() + 15 * 60 * 1000`
    - _Requirements: 7.2, 7.3_

  - [ ]* 9.3 Write property test: failed login increments attempt counter (Property 12)
    - **Property 12: Failed login increments attempt counter**
    - Use `fc.string()` for incorrect passwords; assert counter increments by exactly 1 per failed attempt when below 5
    - **Validates: Requirements 7.2**

  - [ ] 9.4 Implement auto-lock timer in `src/hooks/useAutoLock.ts`: reset timer on any user interaction event; call `lockVault()` when timer fires
    - _Requirements: 7.4_

- [ ] 10. Implement audit log
  - [ ] 10.1 Implement `src/lib/vault/audit.ts` with `recordAuditEvent(eventType, itemTitle?)`: encrypts `itemTitle` with current `Encryption_Key`, writes entry to `auditLogStore` and DataStore; implement `getAuditLog()` returning entries sorted descending by `timestamp`
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ]* 10.2 Write property test: audit log records every specified event type (Property 15)
    - **Property 15: Audit log records every specified event type**
    - Use `fc.constantFrom('session_start','session_end','item_created','item_updated','item_deleted','login_failed','backup_exported')`; assert exactly one new entry with matching `eventType` after each operation
    - **Validates: Requirements 11.1**

  - [ ]* 10.3 Write property test: audit log display order is reverse chronological (Property 16)
    - **Property 16: Audit log display order is reverse chronological**
    - Use `fc.array(fc.record({ timestamp: fc.integer() }), { minLength: 2 })`; assert `entries[i].timestamp >= entries[i+1].timestamp` for all valid indices
    - **Validates: Requirements 11.2**

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement React Query hooks and offline-aware query functions
  - Create `src/hooks/useVaultItems.ts`: React Query wrapper with custom `queryFn` that reads from IndexedDB when `!navigator.onLine`, otherwise fetches from DataStore; `mutationFn` writes to IDB optimistically then enqueues DataStore sync
  - Create `src/hooks/useEncryption.ts`: returns `encryptionKey` from vault-store; throws if vault is locked
  - Create `src/hooks/useOfflineStatus.ts`: subscribes to `window` `online`/`offline` events; returns `isOnline` boolean
  - _Requirements: 9.1, 9.5_

- [ ] 13. Implement sync queue
  - Implement `src/lib/vault/sync-queue.ts`: `enqueue(operation, model, payload)` writes to `sync_queue` IDB store; `flushQueue()` iterates pending entries, calls DataStore, marks synced or increments `retryCount`; export `processSyncQueue()` for service worker to call
  - _Requirements: 9.5_

- [ ] 14. Build VaultLayout and navigation shell
  - Create `src/components/vault/VaultLayout.tsx`: two-panel layout (Sidebar + MainPanel) using existing shadcn `Sidebar` primitives; wire TanStack Router `<Outlet />`
  - Create `src/components/vault/Sidebar.tsx`: `CollectionList`, `TagCloud`, `QuickActions` sections; clicking a collection updates `vault-store.currentCollectionId`
  - Create `src/components/vault/OfflineBanner.tsx`: subscribes to `useOfflineStatus`; renders dismissible banner when offline
  - Create `src/routes/lock.tsx`: lock screen with password input form; calls `unlockVault`; shows failed-attempt count and lockout countdown
  - _Requirements: 7.1, 7.2, 7.3, 9.2, 9.5_

- [ ] 15. Implement virtual item grid and list
  - Create `src/components/vault/VirtualItemGrid.tsx` and `VirtualItemList.tsx` using `@tanstack/react-virtual`; accept `VirtualItemGridProps`; render item cards with title, type badge, favorite star, and action buttons
  - Create `src/routes/vault/index.tsx`: main vault view; uses `useVaultItems` hook; renders `VirtualItemGrid` or `VirtualItemList` based on `vault-store.viewPreference`
  - _Requirements: 1.1, 6.3, 9.2, 9.3_

- [ ] 16. Implement item viewers
  - Create `src/components/vault/viewers/LinkViewer.tsx`: renders URL as clickable link with favicon; copy-to-clipboard button
  - Create `src/components/vault/viewers/NoteViewer.tsx`: renders TipTap JSON as formatted HTML using TipTap read-only editor
  - Create `src/components/vault/viewers/PasswordViewer.tsx`: masked display by default; "Reveal" button decrypts and shows for 30 s then re-masks; "Copy Password" copies decrypted value without displaying; accepts `PasswordViewerProps`
  - Create `src/components/vault/viewers/FileViewer.tsx`: download link + file name/size display
  - Create `src/components/vault/viewers/ImageViewer.tsx`: inline `<img>` preview
  - Create `src/routes/vault/$itemId.tsx`: loads item by id, renders appropriate viewer
  - _Requirements: 2.4, 2.5, 3.3, 3.4, 3.5, 4.3_

- [ ] 17. Implement item editors
  - [ ] 17.1 Create `src/components/vault/editors/NoteEditor.tsx`: TipTap editor with Bold, Italic, Underline, Heading, BulletList, OrderedList, Code extensions; `onSave` serializes to TipTap JSON string; "Private" toggle sets `isPrivate`
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ]* 17.2 Write property test: note content serialization round-trip (Property 8)
    - **Property 8: Note content serialization round-trip**
    - Use `fc.record(...)` for valid TipTap JSON documents; assert `JSON.parse(JSON.stringify(doc))` is structurally equivalent to original
    - **Validates: Requirements 4.2, 4.4, 4.5**

  - [ ] 17.3 Create `src/components/vault/editors/PasswordEditor.tsx`: form with service name, username, password (with generator button), URL, notes fields; integrates `generatePassword`
    - _Requirements: 3.1, 3.6, 3.7_

  - [ ] 17.4 Create `src/components/vault/editors/LinkEditor.tsx`: form with URL and title fields; validates URL format
    - _Requirements: 1.1, 1.2_

  - [ ] 17.5 Create `src/components/vault/editors/FileUploadZone.tsx` using `react-dropzone`; validates file size ≤ 100 MB before upload; shows progress indicator during upload; accepts `FileUploadZoneProps`
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ]* 17.6 Write property test: file size validation accepts valid and rejects oversized files (Property 4)
    - **Property 4: File size validation accepts valid and rejects oversized files**
    - Use `fc.integer({ min: 0 })` for file sizes; assert validator accepts iff size ≤ 104,857,600 bytes
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 17.7 Create `src/routes/vault/new.$type.tsx`: create-item route; renders appropriate editor based on `$type` param; on save calls `createVaultItem`, encrypts sensitive fields, writes to IDB + DataStore, records audit event
    - _Requirements: 1.2, 8.1, 8.2, 11.1_

- [ ] 18. Implement collections and tags management
  - [ ] 18.1 Create `src/routes/collections/index.tsx`: list collections; create/rename/delete actions; delete calls `deleteCollection` which reassigns items to `uncategorized`
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 18.2 Write property test: collection deletion preserves all items under Uncategorized (Property 9)
    - **Property 9: Collection deletion preserves all items under Uncategorized**
    - Use `fc.array(fc.record(...))` for items in a collection; assert after deletion all items have `collectionId === 'uncategorized'` and total count unchanged
    - **Validates: Requirements 5.2**

  - [ ] 18.3 Implement tag filtering: `filterByTag(items, tag)` returns items whose `tags` array contains the tag; wire to `TagCloud` click handler in Sidebar
    - _Requirements: 5.3, 5.4_

  - [ ]* 18.4 Write property test: tag filter returns exactly the tagged items (Property 10)
    - **Property 10: Tag filter returns exactly the tagged items**
    - Use `fc.array(fc.record({ tags: fc.array(fc.string()) }))` and `fc.string()` for tag label; assert filter returns exactly items whose tags include the label
    - **Validates: Requirements 5.4**

- [ ] 19. Implement full-text search
  - [ ] 19.1 Implement `src/lib/vault/search-index.ts`: `buildSearchIndex(items: SearchableItem[])` returns a `Fuse` instance with configured weights (title 0.4, textContent 0.3, tags 0.2, collectionName 0.1), threshold 0.3, `includeMatches: true`
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 19.2 Write property test: search index finds items by any indexed field (Property 11)
    - **Property 11: Search index finds items by any indexed field**
    - Use `fc.record({ title: fc.string({ minLength: 2 }), ... })`; build index from single item; search for substring of each field; assert item appears in results
    - **Validates: Requirements 6.2**

  - [ ] 19.3 Create `src/hooks/useSearch.ts`: debounces query 300 ms; calls `fuseIndex.search(query)`; updates `search-store.results`; returns empty array when query is empty
    - _Requirements: 6.1, 6.3_

  - [ ] 19.4 Create `src/components/vault/SearchBar.tsx`: controlled input wired to `useSearch`; renders match highlights using Fuse `includeMatches` metadata
    - _Requirements: 6.1, 6.4_

  - [ ] 19.5 Create `src/routes/search/index.tsx`: renders `SearchBar` + `VirtualItemList` of `search-store.results`
    - _Requirements: 6.1, 6.2_

- [ ] 20. Implement OCR pipeline
  - Implement `src/lib/vault/ocr.ts`: `runOcr(imageUrl: string): Promise<string>` loads Tesseract.js worker on demand, calls `recognize(imageUrl)`, returns extracted text; silently returns `undefined` on failure
  - After image upload in `FileUploadZone`, call `runOcr` in background, update `FileData.ocrText` in IDB, rebuild Fuse index
  - _Requirements: 6.2_

- [ ] 21. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Implement 2FA (TOTP)
  - Implement `src/lib/vault/totp.ts`: `enrollTotp()` generates secret via `otpauth`, encrypts with `Encryption_Key`, stores in `VaultSettings.totpSecret`; `verifyTotp(code)` decrypts secret, validates code; wire to settings UI and post-unlock flow
  - _Requirements: 7.1_

- [ ] 23. Implement password change with re-encryption
  - Implement `changePassword(oldPassword, newPassword)` in `src/lib/vault/auth.ts`: verifies old password, derives new key, re-encrypts all `PasswordData.passwordCiphertext`, private `NoteData.content`, `AuditLogEntry.itemTitleCiphertext`, and `VaultSettings.totpSecret` fields; updates salt in DataStore
  - _Requirements: 7.7, 12.4_

  - [ ]* 23.1 Write property test: password change re-encrypts all encrypted fields (Property 13)
    - **Property 13: Password change re-encrypts all encrypted fields**
    - Use `fc.array(...)` for encrypted items; after `changePassword`, assert every encrypted field decrypts with new key and fails with old key
    - **Validates: Requirements 7.7**

- [ ] 24. Implement backup export and import
  - [ ] 24.1 Implement `src/lib/vault/backup.ts`: `exportVault(key)` serializes all items/collections/tags/settings to JSON, encrypts with AES-256-GCM, triggers browser download as `.vault` file; `importVault(file, password)` decrypts, validates schema, upserts all records into IDB + DataStore; records `backup_exported` audit event on export
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1_

  - [ ]* 24.2 Write property test: vault export/import round-trip preserves state (Property 14)
    - **Property 14: Vault export/import round-trip preserves state**
    - Use `fc.record(...)` for full vault state; assert after export+import every item, collection, and tag is present with equal field values
    - **Validates: Requirements 10.1, 10.5**

  - [ ] 24.3 Create `BackupDialog` component in `src/components/vault/BackupDialog.tsx`: export button + import file picker; shows error on wrong password during import
    - _Requirements: 10.3, 10.4_

- [ ] 25. Implement settings
  - [ ] 25.1 Create `src/routes/settings/index.tsx` and `src/components/vault/SettingsSheet.tsx`: controls for auto-lock timeout (5/15/30/60/Never), theme toggle (light/dark/system), default view (grid/list), 2FA enrollment, change password
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

  - [ ] 25.2 Implement `src/lib/vault/settings.ts`: `saveSettings(settings)` persists to IDB + DataStore; `loadSettings()` reads from IDB with DataStore fallback
    - _Requirements: 12.3_

  - [ ]* 25.3 Write property test: settings persist and restore correctly (Property 17)
    - **Property 17: Settings persist and restore correctly**
    - Use `fc.record({ autoLockMinutes: fc.constantFrom(5,15,30,60,null), theme: fc.constantFrom('light','dark','system'), defaultView: fc.constantFrom('grid','list'), twoFactorEnabled: fc.boolean() })`; assert `loadSettings(saveSettings(s))` deeply equals `s`
    - **Validates: Requirements 12.3**

- [ ] 26. Implement localStorage migration
  - Implement `src/lib/vault/migration.ts`: `migrateFromLocalStorage(encryptionKey)` reads `akash_links_v1`, converts each `LinkModel` to a `VaultItem` of type `link`, inserts into IDB + DataStore, then removes the localStorage key; gate on `settings.migrationComplete` flag
  - Call `migrateFromLocalStorage` in the unlock flow after key derivation succeeds
  - _Requirements: 1.5, 1.6_

- [ ] 27. Implement audit log viewer
  - Create `src/routes/audit/index.tsx` and `src/components/vault/AuditLogDrawer.tsx`: calls `getAuditLog()`, decrypts `itemTitleCiphertext` fields, renders table with event type, timestamp, and item title columns in reverse chronological order
  - _Requirements: 11.1, 11.2, 11.4_

- [ ] 28. Set up PWA and service worker
  - Configure `vite-plugin-pwa` in `vite.config.js` with precache for app shell and Workbox `StaleWhileRevalidate` for DataStore API reads
  - Update `public/manifest.json` with vault name, `start_url: /vault`, `display: standalone`, theme colors, and icon references
  - Register service worker in `src/main.tsx` using `workbox-window`; handle registration failure with one-time warning toast
  - Implement `src/lib/vault/sync-queue.ts` Background Sync handler in the service worker to flush `sync_queue` on reconnect
  - _Requirements: 9.4, 9.5_

- [ ] 29. Wire all routes into TanStack Router
  - Create route files: `src/routes/vault/index.tsx` (already done), `src/routes/vault/$itemId.tsx`, `src/routes/vault/new.$type.tsx`, `src/routes/collections/index.tsx`, `src/routes/search/index.tsx`, `src/routes/settings/index.tsx`, `src/routes/audit/index.tsx`, `src/routes/lock.tsx`
  - Update root route to redirect `/` → `/vault`; wrap all vault routes in auth guard that redirects to `/lock` when `isLocked`
  - _Requirements: 7.1, 7.4, 7.5_

- [ ] 30. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` and validate the 17 correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
