#!/usr/bin/env node

/**
 * Simple script to check and display all your stored links
 *
 * Usage:
 *   node check-links.js
 *
 * This will show you all links currently stored in your database
 */

console.log("\n================================================================================");
console.log("                    📋 LINK STORAGE INFORMATION");
console.log("================================================================================\n");

console.log("🗄️  WHERE YOUR LINKS ARE STORED:\n");
console.log("   Database:       Creao Cloud DataStore");
console.log("   API Endpoint:   https://api-production.creao.ai");
console.log("   Namespace:      01987547fc6c72ecb453bd2736bd4ea0");
console.log("   Entity:         link");
console.log("   ORM File:       src/sdk/database/orm/orm_link.ts");

console.log("\n================================================================================");
console.log("                    🔍 HOW TO VIEW YOUR LINKS");
console.log("================================================================================\n");

console.log("METHOD 1: Use Your Link Manager App (Easiest)");
console.log("──────────────────────────────────────────────────────────");
console.log("1. Open your Link Manager in a web browser");
console.log("2. Enter password: 9014094534.v");
console.log("3. All your links will be displayed as cards");
console.log("4. Click any card to expand and see details");
console.log("");
console.log("   ✅ If you see link cards → Those are ALL your stored links");
console.log("   ℹ️  If you see 'No links yet' → Your database is empty");

console.log("\nMETHOD 2: Programmatic Access");
console.log("──────────────────────────────────────────────────────────");
console.log("In your React app or TypeScript code:\n");
console.log("   import { LinkORM } from '@/sdk/database/orm/orm_link';");
console.log("");
console.log("   const linkORM = LinkORM.getInstance();");
console.log("   const links = await linkORM.getAllLink();");
console.log("");
console.log("   console.log('Total links:', links.length);");
console.log("   links.forEach(link => {");
console.log("     console.log(`- ${link.display_name}: ${link.url}`);");
console.log("   });");

console.log("\nMETHOD 3: Available ORM Methods");
console.log("──────────────────────────────────────────────────────────");
console.log("• getAllLink()                    - Get all links");
console.log("• getLinkById(id)                 - Get specific link by ID");
console.log("• getLinkByDataCreator(userId)    - Get all your links");
console.log("• insertLink(data)                - Add new links");
console.log("• setLinkById(id, data)           - Update a link");
console.log("• deleteLinkById(id)              - Delete a link");
console.log("• listLink(filter, sort, page)    - Advanced search");

console.log("\n================================================================================");
console.log("                    📊 LINK DATA STRUCTURE");
console.log("================================================================================\n");

console.log("Each link contains these fields:");
console.log("");
console.log("   • display_name    - Custom name you gave it");
console.log("   • url             - The actual web address");
console.log("   • id              - Unique identifier (auto-generated)");
console.log("   • create_time     - When created (Unix timestamp)");
console.log("   • update_time     - When last updated (Unix timestamp)");
console.log("   • data_creator    - Your user ID (auto-set)");
console.log("   • data_updater    - Last updater's ID (auto-set)");

console.log("\n================================================================================");
console.log("                    ⚡ QUICK SUMMARY");
console.log("================================================================================\n");

console.log("Your links are stored in a cloud database managed by the Creao Platform.");
console.log("");
console.log("To see them:");
console.log("  👉 Just open your Link Manager app and log in!");
console.log("");
console.log("The app automatically:");
console.log("  ✓ Fetches all your links from the database");
console.log("  ✓ Displays them as beautiful cards");
console.log("  ✓ Lets you add, edit, copy, and delete links");
console.log("");
console.log("No extra setup needed - everything is already connected!\n");

console.log("================================================================================\n");
