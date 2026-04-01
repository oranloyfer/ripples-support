import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

function generateTicketNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RP-${date}-${rand}`;
}

export async function POST(req: NextRequest) {
  const db = await ensureDb();
  const body = await req.json();

  const required = [
    "first_name", "last_name", "email", "os_type", "os_version",
    "computer_model", "cpu", "plugin_name", "daw_name", "daw_version", "issue_category", "description",
  ];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const ticketNumber = generateTicketNumber();

  await db.execute({
    sql: `INSERT INTO support_tickets (
      ticket_number, first_name, last_name, email, os_type, os_version,
      computer_model, cpu, uses_rosetta, plugin_name, daw_name, daw_version,
      issue_category, description, screenshot_urls, video_links
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      ticketNumber, body.first_name.trim(), body.last_name.trim(),
      body.email.trim().toLowerCase(), body.os_type, body.os_version,
      body.computer_model.trim(), body.cpu.trim(),
      body.os_type === "macOS" ? (body.uses_rosetta ? 1 : 0) : 0,
      body.plugin_name, body.daw_name, body.daw_version.trim(), body.issue_category,
      body.description.trim(), body.screenshot_urls || null, body.video_links || null,
    ],
  });

  return NextResponse.json({ ticket_number: ticketNumber }, { status: 201 });
}
