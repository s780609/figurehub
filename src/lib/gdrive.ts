/**
 * 將 Google Drive 共用連結轉換為可直接嵌入的 URL
 *
 * 支援格式：
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 *
 * 轉換為：
 * - 圖片：https://lh3.googleusercontent.com/d/FILE_ID
 * - 影片：https://drive.google.com/file/d/FILE_ID/preview
 */
export function getGDriveImageUrl(shareUrl: string): string {
  const fileId = extractFileId(shareUrl);
  if (!fileId) return shareUrl; // 不是 GDrive 連結，原樣回傳
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function getGDriveVideoEmbedUrl(shareUrl: string): string {
  const fileId = extractFileId(shareUrl);
  if (!fileId) return shareUrl;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function extractFileId(url: string): string | null {
  // 格式: /file/d/FILE_ID/
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  // 格式: ?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  return null;
}
