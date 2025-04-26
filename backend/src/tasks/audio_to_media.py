#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 针对播客类节目转换成视频

import ffmpeg
import argparse
import sys
import os

def get_audio_duration(audio_path):
    """Get the duration of the audio file in seconds."""
    try:
        probe = ffmpeg.probe(audio_path)
        stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
        if stream is None:
            print(f"Error: Could not find audio stream in {audio_path}", file=sys.stderr)
            return None
        return float(stream['duration'])
    except ffmpeg.Error as e:
        print(f"Error probing audio file {audio_path}: {e.stderr.decode()}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"An unexpected error occurred while probing audio: {e}", file=sys.stderr)
        return None


def create_video_from_audio_image(
    image_path: str,
    audio_path: str,
    output_path: str,
    width: int = 1920,
    height: int = 1080,
    video_codec: str = 'libx264',
    audio_codec: str = 'aac',
    pixel_format: str = 'yuv420p',
    background_color: str = 'black'
):
    """
    Creates a video file by combining a static image and an audio file.

    The image is scaled to fit within the specified dimensions while maintaining
    aspect ratio, and then centered with padding. The video duration matches
    the audio duration.

    Args:
        image_path: Path to the input image file.
        audio_path: Path to the input audio file.
        output_path: Path for the output video file.
        width: Width of the output video (default: 1920).
        height: Height of the output video (default: 1080).
        video_codec: Video codec to use (default: 'libx264').
        audio_codec: Audio codec to use (default: 'aac').
        pixel_format: Pixel format for the video (default: 'yuv420p').
        background_color: Background color for padding (default: 'black').
    """
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found at {audio_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Input image: {image_path}")
    print(f"Input audio: {audio_path}")
    print(f"Output video: {output_path}")
    print(f"Resolution: {width}x{height}")

    try:
        # Input streams
        in_image = ffmpeg.input(image_path, loop=1, framerate=1) # Low framerate for static image
        in_audio = ffmpeg.input(audio_path)

        # Get audio duration to explicitly set video duration (more reliable than -shortest sometimes)
        # duration = get_audio_duration(audio_path)
        # if duration is None:
        #     print("Could not get audio duration, relying on -shortest.", file=sys.stderr)
        #     duration_opts = {'shortest': None} # Use -shortest as fallback
        # else:
        #     duration_opts = {'t': duration}
        # Using -shortest is generally simpler if it works reliably for your ffmpeg version/inputs
        duration_opts = {'shortest': None}


        # Video processing: scale and pad
        video = in_image.filter(
            'scale',
            w=f'min(iw,{width})',
            h=f'min(ih,{height})',
            force_original_aspect_ratio='decrease'
        ).filter(
            'pad',
            w=width,
            h=height,
            x='(ow-iw)/2',
            y='(oh-ih)/2',
            color=background_color
        )

        # Output stream configuration
        (
            ffmpeg
            .output(
                video,                       # Video stream comes from the filtergraph
                in_audio.audio,              # Audio stream comes directly from the audio input
                output_path,
                vcodec=video_codec,
                acodec=audio_codec,
                pix_fmt=pixel_format,
                **duration_opts              # Ensure video duration matches audio
            )
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Successfully created video: {output_path}")

    except ffmpeg.Error as e:
        print('ffmpeg stdout:', e.stdout.decode(), file=sys.stderr)
        print('ffmpeg stderr:', e.stderr.decode(), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Combine an image and audio file into a video.')
    parser.add_argument('image_file', help='Path to the input image file (e.g., thumbnail.jpg)')
    parser.add_argument('audio_file', help='Path to the input audio file (e.g., audio.wav)')
    parser.add_argument('output_file', help='Path for the output video file (e.g., video_best.mp4)')
    parser.add_argument('--width', type=int, default=1920, help='Output video width (default: 1920)')
    parser.add_argument('--height', type=int, default=1080, help='Output video height (default: 1080)')
    parser.add_argument('--vcodec', type=str, default='libx264', help='Video codec (default: libx264)')
    parser.add_argument('--acodec', type=str, default='aac', help='Audio codec (default: aac)')
    parser.add_argument('--pix_fmt', type=str, default='yuv420p', help='Pixel format (default: yuv420p)')
    parser.add_argument('--bg_color', type=str, default='black', help='Background color for padding (default: black)')

    args = parser.parse_args()

    create_video_from_audio_image(
        image_path=args.image_file,
        audio_path=args.audio_file,
        output_path=args.output_file,
        width=args.width,
        height=args.height,
        video_codec=args.vcodec,
        audio_codec=args.acodec,
        pixel_format=args.pix_fmt,
        background_color=args.bg_color
    )