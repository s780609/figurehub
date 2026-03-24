const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/heic",
  "image/heif",
];

const VIDEO_MIMES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/x-matroska",
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  type: "image" | "video";
  /** 可直接嵌入的 URL */
  url: string;
}

/**
 * 從 Google Drive 資料夾共用連結擷取 folder ID
 */
export function extractFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * 從 Google Drive 檔案共用連結擷取 file ID
 */
export function extractFileId(url: string): string | null {
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  return null;
}

/**
 * 直接使用 Google Drive thumbnail URL
 */
export function toImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}

/**
 * Google Drive 影片嵌入 URL（透過 preview endpoint，配合 iframe 使用）
 */
export function toVideoEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * 純前端：用 Google Drive API 列出資料夾內所有圖片與影片
 */
export async function listFolderMedia(
  folderId: string
): Promise<DriveFile[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("未設定 NEXT_PUBLIC_GOOGLE_API_KEY");
  }

  const query = `'${folderId}' in parents and trashed = false`;
  const fields = "files(id,name,mimeType)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100&orderBy=name&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const files: DriveFile[] = [];

  for (const f of data.files ?? []) {
    if (IMAGE_MIMES.includes(f.mimeType)) {
      files.push({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        type: "image",
        url: toImageUrl(f.id),
      });
    } else if (VIDEO_MIMES.includes(f.mimeType)) {
      files.push({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        type: "video",
        url: toVideoEmbedUrl(f.id),
      });
    }
  }

  return files;
}
