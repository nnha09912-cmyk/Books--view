import { NextRequest, NextResponse } from "next/server";
import { getCurrentStudio } from "@/lib/auth";
import { extractDriveFolderId, getDriveFolderName } from "@/lib/google-drive";

/** Lets the create-album form auto-fill the album name from the pasted
 * Drive folder's own name when the studio leaves the name field blank. */
export async function GET(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const link = req.nextUrl.searchParams.get("link");
  if (!link) {
    return NextResponse.json({ error: { message: "Thiếu link" } }, { status: 400 });
  }
  const folderId = extractDriveFolderId(link);
  if (!folderId) {
    return NextResponse.json(
      { error: { message: "Link Google Drive không hợp lệ" } },
      { status: 400 }
    );
  }
  const name = await getDriveFolderName(folderId);
  if (!name) {
    return NextResponse.json(
      { error: { message: "Không lấy được tên folder từ Drive" } },
      { status: 400 }
    );
  }
  return NextResponse.json({ name });
}
