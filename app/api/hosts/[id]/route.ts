import { NextRequest, NextResponse } from "next/server";
import { deleteHost } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteHost(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/hosts/[id]]", err);
    return NextResponse.json({ error: "Failed to delete host" }, { status: 500 });
  }
}
