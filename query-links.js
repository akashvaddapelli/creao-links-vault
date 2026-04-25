const { LinkORM } = require('./src/sdk/database/orm/orm_link');

async function getAllLinks() {
  try {
    const linkORM = LinkORM.getInstance();
    const links = await linkORM.getAllLink();

    console.log('\n========================================');
    console.log('LINK MANAGER DATABASE QUERY RESULTS');
    console.log('========================================\n');

    if (links.length === 0) {
      console.log('No links found in the database.');
      console.log('The Link Manager database is empty.\n');
    } else {
      console.log('Total Links: ' + links.length + '\n');

      links.forEach((link, index) => {
        console.log('Link ' + (index + 1) + ':');
        console.log('  ID: ' + link.id);
        console.log('  Display Name: ' + link.display_name);
        console.log('  URL: ' + link.url);
        console.log('  Created: ' + new Date(parseInt(link.create_time) * 1000).toLocaleString());
        console.log('  Updated: ' + new Date(parseInt(link.update_time) * 1000).toLocaleString());
        console.log('  Creator: ' + link.data_creator);
        console.log('  Last Updater: ' + link.data_updater);
        console.log('');
      });
    }

    console.log('========================================\n');
  } catch (error) {
    console.error('Error retrieving links:', error);
    process.exit(1);
  }
}

getAllLinks();
