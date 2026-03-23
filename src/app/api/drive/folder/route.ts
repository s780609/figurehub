import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { extractFolderId, listFolderMedia } from "@/lib/gdrive";

export async function POST(req: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { folderUrl } = await req.json();

  const folderId = extractFolderId(folderUrl);
  if (!folderId) {
    return NextResponse.json(
      { error: "無法從連結中擷取資料夾 ID，請確認是 Google Drive 資料夾連結" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "你的_GOOGLE_API_KEY") {
    return NextResponse.json(
      { error: "尚未設定 GOOGLE_API_KEY，請在 .env.local 中設定" },
      { status: 500 }
    );
  }

  try {
    const files = await listFolderMedia(folderId, apiKey);
    return NextResponse.json({ files, folderId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知錯誤";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
