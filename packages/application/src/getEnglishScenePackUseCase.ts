import { EnglishScenePack } from '@yanghoo/domain';
import { englishScenePackStorage } from '@yanghoo/storage';

export async function getEnglishScenePackUseCase(packId: string): Promise<EnglishScenePack | null> {
  return await englishScenePackStorage.readPack(packId);
}
