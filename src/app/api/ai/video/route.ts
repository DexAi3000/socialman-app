import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { GAPGPT_API_KEY, GAPGPT_BASE_URL } from '@/lib/gapgpt';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let prompt = '';
    let length = 5;
    let resolution = '720';
    let uploadedImageBuffer: Buffer | null = null;
    let uploadedImageExt = 'png';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      prompt = (form.get('prompt') as string) || '';
      length = Number(form.get('length')) || 5;
      resolution = (form.get('resolution') as string) || '720';
      const file = form.get('image') as File | null;
      if (file && typeof file.arrayBuffer === 'function') {
        const bytes = await file.arrayBuffer();
        if (bytes.byteLength > 0) {
          uploadedImageBuffer = Buffer.from(bytes);
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            uploadedImageExt = ext === 'jpeg' ? 'jpg' : ext;
          }
        }
      }
    } else {
      const json = await request.json();
      prompt = json.prompt || '';
      length = Number(json.length) || 5;
      resolution = json.resolution || '720';
    }

    if (!prompt.trim() && !uploadedImageBuffer) {
      return NextResponse.json(
        { error: 'توضیحات ویدیو (Prompt) یا تصویر الزامی است.' },
        { status: 400 }
      );
    }

    // Ensure storage directory
    const outputDir = path.join(process.cwd(), 'public', 'generated-videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const imagePath = path.join(outputDir, `frame-${timestamp}.${uploadedImageExt}`);
    const videoFileName = `video-${timestamp}.mp4`;
    const videoPath = path.join(outputDir, videoFileName);

    let imageUrl = '';

    // Step 1: Obtain the image (either from upload or GapGPT AI Image Generation)
    if (uploadedImageBuffer) {
      fs.writeFileSync(imagePath, uploadedImageBuffer);
      imageUrl = `/socialman/generated-videos/frame-${timestamp}.${uploadedImageExt}`;
    } else {
      // Call GapGPT Image API (gpt-image-1-mini - fast, high quality, cost-effective)
      try {
        const gapGptRes = await fetch(`${GAPGPT_BASE_URL.replace(/\/+$/, '')}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GAPGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1-mini',
            prompt: prompt,
            size: '1024x1024',
          }),
        });

        if (gapGptRes.ok) {
          const data = await gapGptRes.json();
          const remoteUrl = data?.data?.[0]?.url;
          if (remoteUrl) {
            const downloadRes = await fetch(remoteUrl);
            if (downloadRes.ok) {
              const buf = Buffer.from(await downloadRes.arrayBuffer());
              fs.writeFileSync(imagePath, buf);
              imageUrl = `/socialman/generated-videos/frame-${timestamp}.${uploadedImageExt}`;
            }
          }
        }
      } catch (aiErr) {
        console.error('GapGPT image generation error:', aiErr);
      }

      // If AI image generation was blocked or failed, create a stylized graphic frame using ffmpeg
      if (!fs.existsSync(imagePath)) {
        // Fallback to generating a canvas image or color card
        const safeText = prompt.slice(0, 50).replace(/["'\\]/g, '');
        try {
          await execPromise(
            `ffmpeg -y -f lavfi -i color=c=0x1e293b:s=1280x720:d=1 -frames:v 1 "${imagePath}"`
          );
          imageUrl = `/socialman/generated-videos/frame-${timestamp}.${uploadedImageExt}`;
        } catch {
          // ignore
        }
      }
    }

    // Step 2: Render video with ffmpeg matching user length and resolution
    // Resolutions:
    // 480 -> 854x480
    // 720 -> 1280x720
    // 1080 -> 1920x1080
    const resMap: Record<string, { w: number; h: number }> = {
      '480': { w: 854, h: 480 },
      '720': { w: 1280, h: 720 },
      '1080': { w: 1920, h: 1080 },
    };
    const targetRes = resMap[resolution] || resMap['720'];
    const safeDuration = Math.min(Math.max(length, 1), 10);
    const fps = 25;
    const totalFrames = safeDuration * fps;

    if (fs.existsSync(imagePath)) {
      try {
        const zoomStep = (0.15 / totalFrames).toFixed(5);
        const filterStr = `scale=${targetRes.w}:${targetRes.h}:force_original_aspect_ratio=increase,crop=${targetRes.w}:${targetRes.h},zoompan=z='min(zoom+${zoomStep},1.15)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${targetRes.w}x${targetRes.h}:fps=${fps}`;

        const ffmpegCmd = `ffmpeg -y -loop 1 -i "${imagePath}" -c:v libx264 -t ${safeDuration} -pix_fmt yuv420p -vf "${filterStr}" "${videoPath}"`;
        await execPromise(ffmpegCmd);
      } catch (ffmpegErr) {
        console.error('ffmpeg rendering error, using fast fallback:', ffmpegErr);
        // Fast static loop fallback if zoompan complex filter fails
        await execPromise(
          `ffmpeg -y -loop 1 -i "${imagePath}" -c:v libx264 -t ${safeDuration} -pix_fmt yuv420p -vf "scale=${targetRes.w}:${targetRes.h}" "${videoPath}"`
        );
      }
    }

    const videoUrl = fs.existsSync(videoPath)
      ? `/socialman/generated-videos/${videoFileName}`
      : '';

    return NextResponse.json({
      success: true,
      videoUrl,
      imageUrl,
      prompt,
      length: safeDuration,
      resolution,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'خطایی در تولید ویدیو رخ داد: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
