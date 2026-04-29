import { sourceStorage, mediaStorage } from '@yanghoo/storage';

/**
 * Use Case: Delete a source card and all its local assets.
 */
export async function deleteSourceUseCase(sourceId: string): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }> {
  console.log(`[UseCase] deleteSourceUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  // 1. Delete all generated assets using the 'generated' scope
  const assetDeletion = await mediaStorage.deleteAssets(sourceId, 'generated');

  // 2. Delete the record.json file and attempt to clean up directory
  const recordDeletion = await sourceStorage.deleteSource(sourceId);

  return {
    deleted: [...assetDeletion.deleted, ...recordDeletion.deleted],
    skipped: [...assetDeletion.skipped, ...recordDeletion.skipped],
    failed: [...assetDeletion.failed, ...recordDeletion.failed]
  };
}
