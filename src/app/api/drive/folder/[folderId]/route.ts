import { NextResponse } from "next/server";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "伺服器未設定 Google API Key" },
      { status: 500 }
    );
  }

  const query = `'${folderId}' in parents and trashed = false`;
  const fields = "files(id,name,mimeType)";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100&orderBy=name&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Google Drive API error: ${res.status} ${err}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  const files = (data.files ?? [])
    .filter(
      (f: { mimeType: string }) =>
        IMAGE_MIMES.includes(f.mimeType) || VIDEO_MIMES.includes(f.mimeType)
    )
    .map((f: { id: string; name: string; mimeType: string }) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      type: IMAGE_MIMES.includes(f.mimeType) ? "image" : "video",
      url: IMAGE_MIMES.includes(f.mimeType)
        ? `https://drive.google.com/thumbnail?id=${f.id}&sz=w2000`
        : `https://drive.google.com/file/d/${f.id}/preview`,
    }));

  return NextResponse.json({ files });
}
