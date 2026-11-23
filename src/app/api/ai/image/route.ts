import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GAPGPT_API_KEY, GAPGPT_BASE_URL } from '@/lib/gapgpt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style = 'realistic', aspectRatio = 'square' } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'لطفاً توضیحات تصویر (پرامپت) را وارد کنید.' },
        { status: 400 }
      );
    }

    // Enhance prompt based on style
    const styleModifiers: Record<string, string> = {
      realistic: ', photorealistic, high quality photography, 8k resolution, professional studio lighting, detailed',
      cartoon: ', cute 3D Pixar style, vivid colors, smooth rendering, character design, charming',
      digital_art: ', trending on Artstation, highly detailed digital illustration, vibrant, artistic masterpiece',
      minimal: ', minimal modern composition, clean solid background, commercial product photography, elegant',
    };

    const finalPrompt = `${prompt.trim()}${styleModifiers[style] || ''}`;

    // Size mapping based on aspect ratio
    const sizeMap: Record<string, string> = {
      square: '1024x1024',
      portrait: '1024x1024', // Most economic image models natively generate 1024x1024
      landscape: '1024x1024',
    };

    const targetSize = sizeMap[aspectRatio] || '1024x1024';

    // Call GapGPT Image Generations API
    const gapGptRes = await fetch(`${GAPGPT_BASE_URL.replace(/\/+$/, '')}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GAPGPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt: finalPrompt,
        size: targetSize,
      }),
    });

    if (!gapGptRes.ok) {
      const errorText = await gapGptRes.text();
      console.error('GapGPT Image API error:', gapGptRes.status, errorText);
      return NextResponse.json(
        { error: 'سرویس هوش مصنوعی با خطا مواجه شد. لطفاً چند لحظه بعد تلاش کنید.' },
        { status: 502 }
      );
    }

    const data = await gapGptRes.json();
    const remoteUrl = data?.data?.[0]?.url;

    if (!remoteUrl) {
      return NextResponse.json(
        { error: 'تصویری از هوش مصنوعی دریافت نشد.' },
        { status: 500 }
      );
    }

    // Save image locally in public/generated-images/ for fast, reliable serving
    const outputDir = path.join(process.cwd(), 'public', 'generated-images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `ai-img-${Date.now()}.png`;
    const localFilePath = path.join(outputDir, filename);

    try {
      const imageFetch = await fetch(remoteUrl);
      if (imageFetch.ok) {
        const buffer = Buffer.from(await imageFetch.arrayBuffer());
        fs.writeFileSync(localFilePath, buffer);
      }
    } catch (saveErr) {
      console.error('Error caching image locally, falling back to remote url:', saveErr);
    }

    const localUrl = fs.existsSync(localFilePath)
      ? `/socialman/generated-images/${filename}`
      : remoteUrl;

    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
      prompt,
      style,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error in image generation route:', error);
    return NextResponse.json(
      { error: 'خطای سیستمی: ' + (error?.message || 'نامشخص') },
      { status: 500 }
    );
  }
}
