import { sourceStorage } from '@yanghoo/storage';

/**
 * Use Case: Delete a source card and all its local assets.
 */
export async function deleteSourceUseCase(sourceId: string): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }> {
  console.log(`[UseCase] deleteSourceUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  return sourceStorage.deleteSource(sourceId);
}
