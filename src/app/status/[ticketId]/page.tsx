"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface Reply {
  id: number;
  author: string;
  author_type: string;
  message: string;
  created_at: string;
}

interface Ticket {
  ticket_number: string;
  first_name: string;
  last_name: string;
  email: string;
  plugin_name: string;
  issue_category: string;
  description: string;
  status: string;
  created_at: string;
  replies: Reply[];
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-[#333] text-[#888] border-[#444]",
};

export default function TicketStatusPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTicket(data);
      })
      .catch(() => setError("Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9D391E] border-t-transparent" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#0D0F14] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-4xl mb-4">Ticket Not Found</p>
          <p className="text-[#888]">{error || "This ticket does not exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <header className="border-b border-[#222] bg-[#111]">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#9D391E] flex items-center justify-center font-bold text-lg">R</div>
          <div>
            <h1 className="text-xl font-bold">RIPPLES Audio Support</h1>
            <p className="text-xs text-[#888]">Ticket Status</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {isNew && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-5">
            <h2 className="text-green-400 font-semibold text-lg mb-2">Ticket Submitted Successfully!</h2>
            <p className="text-sm text-green-300/80">
              Thank you for contacting RIPPLES Audio Support! Your ticket number is{" "}
              <span className="font-mono font-bold text-green-400">{ticket.ticket_number}</span>.
              Please save this number for your records. We&apos;ll review your issue and get back to you
              at <span className="font-semibold">{ticket.email}</span> as soon as possible.
            </p>
          </div>
        )}

        {/* Ticket Info */}
        <div className="rounded-lg border border-[#222] bg-[#111] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#888]">Ticket Number</p>
              <p className="font-mono text-lg font-bold text-[#EEE2CC]">{ticket.ticket_number}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>
              {ticket.status.replace("-", " ").toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#888]">Plugin</p>
              <p className="font-medium">{ticket.plugin_name}</p>
            </div>
            <div>
              <p className="text-xs text-[#888]">Category</p>
              <p className="font-medium capitalize">{ticket.issue_category}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#888]">Submitted</p>
              <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#222]">
            <p className="text-xs text-[#888] mb-2">Your Description</p>
            <p className="text-sm text-[#ccc] whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Replies */}
        {ticket.replies && ticket.replies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9D391E]">Responses</h3>
            {ticket.replies.map((reply) => (
              <div key={reply.id} className={`rounded-lg border p-4 ${
                reply.author_type === "admin"
                  ? "border-[#9D391E]/30 bg-[#9D391E]/5"
                  : "border-[#333] bg-[#1A1E28]"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#EEE2CC]">
                    {reply.author_type === "admin" ? "RIPPLES Audio Support" : reply.author}
                  </span>
                  <span className="text-xs text-[#666]">{new Date(reply.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#ccc] whitespace-pre-wrap">{reply.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <a href="/" className="text-sm text-[#9D391E] hover:underline">Submit another ticket</a>
        </div>
      </div>
    </div>
  );
}
