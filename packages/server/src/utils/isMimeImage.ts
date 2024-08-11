const supportedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml", // SVG images (vector graphics)
];

export const isMimeImage = (mimeType: string) => {
  return supportedImageTypes.includes(mimeType);
};
