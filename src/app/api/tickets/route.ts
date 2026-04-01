import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

function generateTicketNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RP-${date}-${rand}`;
}

async function sendConfirmationEmail(
  email: string, firstName: string, ticketNumber: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Skip if not configured

  const statusUrl = `https://ripples-support.vercel.app/status/${ticketNumber}`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "RIPPLES Audio Support <support@ripples-music.com>",
        to: [email],
        subject: `[${ticketNumber}] We received your support request`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0D0F14; color: #EEE2CC; padding: 32px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="font-size: 20px; margin: 0; color: #EEE2CC;">RIPPLES Audio Support</h1>
            </div>
            <p style="color: #ccc;">Hi ${firstName},</p>
            <p style="color: #ccc;">Thank you for contacting RIPPLES Audio Support! We've received your request and will get back to you as soon as possible.</p>
            <div style="background: #1A1E28; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">Your Ticket Number</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; font-family: monospace; color: #9D391E;">${ticketNumber}</p>
            </div>
            <p style="color: #ccc;">You can check the status of your ticket anytime at:</p>
            <p><a href="${statusUrl}" style="color: #9D391E; text-decoration: underline;">${statusUrl}</a></p>
            <p style="color: #888; font-size: 12px; margin-top: 32px; border-top: 1px solid #222; padding-top: 16px;">We typically respond within 24 hours. Please don't reply to this email — use the status page above to follow up.</p>
            <p style="color: #888; font-size: 12px;">— The RIPPLES Audio Team</p>
          </div>
        `,
      }),
    });
  } catch {
    // Email is best-effort, don't fail the ticket
  }
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
  const email = body.email.trim().toLowerCase();

  await db.execute({
    sql: `INSERT INTO support_tickets (
      ticket_number, first_name, last_name, email, os_type, os_version,
      computer_model, cpu, uses_rosetta, plugin_name, daw_name, daw_version,
      issue_category, description, screenshot_urls, video_links
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      ticketNumber, body.first_name.trim(), body.last_name.trim(),
      email, body.os_type, body.os_version,
      body.computer_model.trim(), body.cpu.trim(),
      body.os_type === "macOS" ? (body.uses_rosetta ? 1 : 0) : 0,
      body.plugin_name, body.daw_name, body.daw_version.trim(), body.issue_category,
      body.description.trim(), body.screenshot_urls || null, body.video_links || null,
    ],
  });

  // Save to email list (INSERT OR IGNORE — no duplicates)
  await db.execute({
    sql: "INSERT OR IGNORE INTO email_list (email, first_name, last_name, source) VALUES (?, ?, ?, 'support')",
    args: [email, body.first_name.trim(), body.last_name.trim()],
  });

  // Send confirmation email (async, best-effort)
  sendConfirmationEmail(email, body.first_name.trim(), ticketNumber);

  return NextResponse.json({ ticket_number: ticketNumber }, { status: 201 });
}
