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
 * 透過後端 API route 列出資料夾內所有圖片與影片（API Key 不暴露給前端）
 */
export async function listFolderMedia(
  folderId: string
): Promise<DriveFile[]> {
  const res = await fetch(`/api/drive/folder/${folderId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.files ?? [];
}
