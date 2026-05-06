import { EnglishScenePackSummary } from '@yanghoo/domain';
import { englishScenePackStorage } from '@yanghoo/storage';

export async function listEnglishScenePacksUseCase(): Promise<EnglishScenePackSummary[]> {
  const index = await englishScenePackStorage.readIndex();
  return index.items;
}
