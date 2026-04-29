import { AudioAsset, getAudioPath } from '@yanghoo/domain';
import { sourceStorage, mediaStorage, audioStorage } from '@yanghoo/storage';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Use Case: Extract audio from a downloaded media file using ffmpeg.
 */
export async function extractSourceAudioUseCase(sourceId: string): Promise<AudioAsset> {
  console.log(`[UseCase] extractSourceAudioUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const mediaAsset = await mediaStorage.getMedia(sourceId);
  if (!mediaAsset || mediaAsset.status !== 'downloaded' || !mediaAsset.localPath) {
    throw new Error(`Media not downloaded for source: ${sourceId}. Please run download-media first.`);
  }

  const absoluteVideoPath = (mediaStorage as any).resolvePath(mediaAsset.localPath);
  if (!fs.existsSync(absoluteVideoPath)) {
    throw new Error(`Media file not found at ${absoluteVideoPath}`);
  }

  // Define target audio path (always .wav for best MLX compatibility if needed, or .mp3)
  const audioLocalPath = getAudioPath(sourceId, 'wav');
  const absoluteAudioPath = (audioStorage as any).resolvePath(audioLocalPath);
  const audioDir = path.dirname(absoluteAudioPath);

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  try {
    // Check if there is an audio stream
    const probeCmd = `ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "${absoluteVideoPath}"`;
    const audioStreams = execSync(probeCmd).toString().trim();
    
    if (!audioStreams) {
      // Update media manifest with the known silent state
      const updatedMediaAsset = {
        ...mediaAsset,
        hasAudio: false,
        notTranscribableReason: "Media file has no audio stream."
      };
      await mediaStorage.saveMedia(updatedMediaAsset);
      throw new Error(updatedMediaAsset.notTranscribableReason);
    }

    // Explicitly update hasAudio if it was unknown
    if (mediaAsset.hasAudio === undefined) {
      await mediaStorage.saveMedia({
        ...mediaAsset,
        hasAudio: true
      });
    }

    // Command to extract audio and convert to 16kHz mono wav (ideal for Whisper/MLX)
    const cmd = `ffmpeg -y -i "${absoluteVideoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${absoluteAudioPath}"`;
    console.log(`[UseCase] Running: ${cmd}`);
    
    try {
      execSync(cmd, { stdio: 'pipe' });
    } catch (e: any) {
      const stderr = e.stderr?.toString() || e.message;
      throw new Error(`ffmpeg failed: ${stderr}`);
    }

    const stats = fs.statSync(absoluteAudioPath);
    const asset: AudioAsset = {
      sourceId,
      status: 'fetched',
      url: `media://${mediaAsset.localPath}`,
      localPath: audioLocalPath,
      size: stats.size,
      fetchedAt: new Date().toISOString()
    };

    await audioStorage.saveAudio(asset);
    return asset;
  } catch (error: any) {
    console.error(`[UseCase] Audio extraction failed: ${error.message}`);
    const failedAsset: AudioAsset = {
      sourceId,
      status: 'failed'
    };
    await audioStorage.saveAudio(failedAsset);
    throw error;
  }
}
