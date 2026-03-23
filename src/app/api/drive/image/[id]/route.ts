import { NextRequest, NextResponse } from "next/server";

/**
 * 代理 Google Drive 圖片，解決 302 redirect + CORS 問題
 * GET /api/drive/image/{fileId}
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await params;

  const driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;

  try {
    const res = await fetch(driveUrl, {
      redirect: "follow",
      headers: {
        // 不帶 Referer，避免 Google 擋
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}
