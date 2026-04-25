import { LinkORM, type LinkModel } from './src/sdk/database/orm/orm_link';

async function getAllLinks() {
  try {
    console.log('\n========================================');
    console.log('LINK MANAGER DATABASE QUERY RESULTS');
    console.log('========================================\n');

    const linkORM = LinkORM.getInstance();
    const links: LinkModel[] = await linkORM.getAllLink();

    if (links.length === 0) {
      console.log('STATUS: No links found in the database');
      console.log('The Link Manager database is currently empty.\n');
    } else {
      console.log(`STATUS: Found ${links.length} link(s) in the database\n`);
      console.log('LINKS SUMMARY:');
      console.log('-------------------------------------------\n');

      links.forEach((link, index) => {
        const createdDate = new Date(parseInt(link.create_time) * 1000);
        const updatedDate = new Date(parseInt(link.update_time) * 1000);

        console.log(`LINK ${index + 1}:`);
        console.log(`  Display Name: ${link.display_name}`);
        console.log(`  URL: ${link.url}`);
        console.log(`  ID: ${link.id}`);
        console.log(`  Created: ${createdDate.toLocaleString()}`);
        console.log(`  Updated: ${updatedDate.toLocaleString()}`);
        console.log(`  Creator ID: ${link.data_creator}`);
        console.log(`  Last Updater ID: ${link.data_updater}`);
        console.log('');
      });

      console.log('========================================');
      console.log(`Total: ${links.length} link(s) stored\n`);
    }
  } catch (error) {
    console.error('ERROR: Failed to retrieve links from database');
    console.error('Details:', error);
    process.exit(1);
  }
}

getAllLinks();
