import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await ensureDb();
  const { id } = await params;

  const result = await db.execute({
    sql: "SELECT ticket_number, first_name, email, plugin_name, issue_category, description, status, created_at FROM support_tickets WHERE ticket_number = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const ticket = result.rows[0];

  const replies = await db.execute({
    sql: "SELECT author, message, created_at FROM support_replies WHERE ticket_id = (SELECT id FROM support_tickets WHERE ticket_number = ?) AND author_type = 'admin' ORDER BY created_at ASC",
    args: [id],
  });

  return NextResponse.json({ ...ticket, replies: replies.rows });
}
