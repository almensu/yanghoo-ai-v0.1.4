/**
 * Script to repair YouTube titles for sources with fallback titles.
 */
import { repairYouTubeTitlesUseCase } from '../../packages/application/src/index.js';

async function main() {
  console.log('--- Repairing YouTube Titles ---');
  try {
    const result = await repairYouTubeTitlesUseCase();
    console.log('--- Repair Summary ---');
    console.log(`Repaired: ${result.repaired.length}`);
    console.log(`Skipped:  ${result.skipped.length}`);
    console.log(`Failed:   ${result.failed.length}`);
    
    if (result.repaired.length > 0) {
      console.log('\nRepaired IDs:');
      result.repaired.forEach(id => console.log(` - ${id}`));
    }
    
    if (result.failed.length > 0) {
      console.log('\nFailed IDs:');
      result.failed.forEach(id => console.log(` - ${id}`));
    }
  } catch (error: any) {
    console.error('Fatal error during repair:', error.message);
    process.exit(1);
  }
}

main();
