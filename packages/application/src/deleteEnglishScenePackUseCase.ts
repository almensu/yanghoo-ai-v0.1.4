import { englishScenePackStorage } from '@yanghoo/storage';

export async function deleteEnglishScenePackUseCase(packId: string): Promise<boolean> {
  const deleted = await englishScenePackStorage.deletePack(packId);
  if (!deleted) return false;

  const indexFile = await englishScenePackStorage.readIndex();
  indexFile.items = indexFile.items.filter(i => i.id !== packId);
  indexFile.updatedAt = new Date().toISOString();
  await englishScenePackStorage.writeIndex(indexFile);

  return true;
}
