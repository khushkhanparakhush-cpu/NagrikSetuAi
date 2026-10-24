/**
 * NagrikSetu AI - Client-side Image Optimization Utility
 * Shrinks raw camera/gallery uploads (often 5-15MB) to crisp web-ready JPEG (~150-250KB)
 * using HTML5 Canvas, ensuring instant upload speed and minimal network latency
 * while retaining high detail for Gemini multimodal civic analysis.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
}

export async function optimizeImageDataUrl(
  dataUrl: string,
  options: OptimizeImageOptions = {}
): Promise<{ dataUrl: string; originalSizeKb: number; optimizedSizeKb: number; mimeType: string }> {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.82 } = options;

  const originalSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

  return new Promise((resolve) => {
    // If it's not an image data URL, return as is
    if (!dataUrl.startsWith('data:image/')) {
      resolve({
        dataUrl,
        originalSizeKb,
        optimizedSizeKb: originalSizeKb,
        mimeType: 'image/jpeg'
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Only downscale if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          dataUrl,
          originalSizeKb,
          optimizedSizeKb: originalSizeKb,
          mimeType: 'image/jpeg'
        });
        return;
      }

      // Fill with white background in case of transparent PNG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw downscaled image with high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const optimizedSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

      resolve({
        dataUrl: optimizedDataUrl,
        originalSizeKb,
        optimizedSizeKb,
        mimeType: 'image/jpeg'
      });
    };

    img.onerror = () => {
      // Fallback gracefully to original if decoding fails
      resolve({
        dataUrl,
        originalSizeKb,
        optimizedSizeKb: originalSizeKb,
        mimeType: 'image/jpeg'
      });
    };

    img.src = dataUrl;
  });
}
