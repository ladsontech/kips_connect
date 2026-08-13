export interface CompressionResult {
  file: File;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImage(
  imageFile: File,
  maxWidth = 1600,
  quality = 0.78
): Promise<CompressionResult> {
  if (!imageFile.type.startsWith('image/')) {
    return {
      file: imageFile,
      originalSizeKb: Math.round(imageFile.size / 1024),
      compressedSizeKb: Math.round(imageFile.size / 1024),
    };
  }

  const bitmap = await createImageBitmap(imageFile);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to initialize image compression canvas.');
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Image compression failed.'));
        }
      },
      'image/jpeg',
      quality
    );
  });

  const compressedFile = new File(
    [blob],
    imageFile.name.replace(/\.[a-z0-9]+$/i, '.jpg'),
    { type: 'image/jpeg', lastModified: Date.now() }
  );

  return {
    file: compressedFile,
    originalSizeKb: Math.round(imageFile.size / 1024),
    compressedSizeKb: Math.round(compressedFile.size / 1024),
  };
}
