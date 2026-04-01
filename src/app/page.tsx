"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const PLUGINS = [
  "Cascade", "Clamp", "Confluence", "Crucible", "Detonate",
  "Lunar", "Luster", "Residue", "Seismic", "Tincture",
  "Tributary", "Vortex", "Wildcard",
];

const MAC_VERSIONS = [
  "macOS 26 Tahoe", "macOS 15 Sequoia", "macOS 14 Sonoma",
  "macOS 13 Ventura", "macOS 12 Monterey", "macOS 11 Big Sur",
];
const WIN_VERSIONS = [
  "Windows 11", "Windows 10",
];

const DAWS = [
  "Cubase", "Logic Pro", "Ableton Live", "FL Studio", "Studio One",
  "Pro Tools", "Reaper", "Bitwig Studio", "GarageBand", "Nuendo",
  "Reason", "Other",
];

const CATEGORIES = [
  { value: "installation", label: "Installation Issues" },
  { value: "ui", label: "UI / Display Problems" },
  { value: "daw", label: "DAW Compatibility" },
  { value: "crash", label: "Crash / Freeze" },
  { value: "audio", label: "Audio / DSP Issues" },
  { value: "other", label: "Other" },
];

export default function SupportPage() {
  const router = useRouter();
  const [osType, setOsType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    os_type: "", os_version: "", computer_model: "", cpu: "",
    uses_rosetta: false, plugin_name: "", daw_name: "", daw_version: "",
    issue_category: "", description: "",
    screenshot_urls: "", video_links: "",
  });

  const set = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = "Required";
    if (!form.last_name.trim()) errs.last_name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.os_type) errs.os_type = "Select your OS";
    if (!form.os_version) errs.os_version = "Select your OS version";
    if (!form.computer_model.trim()) errs.computer_model = "Required";
    if (!form.cpu.trim()) errs.cpu = "Required";
    if (!form.plugin_name) errs.plugin_name = "Select a plugin";
    if (!form.daw_name) errs.daw_name = "Select your DAW";
    if (!form.daw_version.trim()) errs.daw_version = "Enter your DAW version";
    if (!form.issue_category) errs.issue_category = "Select a category";
    if (!form.description.trim()) errs.description = "Please describe your issue";
    if (form.description.trim().length < 20) errs.description = "Please provide more detail (at least 20 characters)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/status/${data.ticket_number}?new=1`);
      } else {
        setErrors({ _form: data.error || "Failed to submit" });
      }
    } catch {
      setErrors({ _form: "Network error. Please try again." });
    }
    setSubmitting(false);
  };

  const inputClass = (field: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-[#1A1E28] text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9D391E] ${
      errors[field] ? "border-red-500" : "border-[#333]"
    }`;

  const selectClass = (field: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm bg-[#1A1E28] text-white focus:outline-none focus:ring-2 focus:ring-[#9D391E] ${
      errors[field] ? "border-red-500" : "border-[#333]"
    }`;

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#111]">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center gap-4">
          <Image src="/logo.png" alt="RIPPLES Audio" width={40} height={40} className="rounded-lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">RIPPLES Audio Support</h1>
            <p className="text-xs text-[#888]">Submit a support ticket — we&apos;ll get back to you ASAP</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {errors._form && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
            {errors._form}
          </div>
        )}

        <div className="space-y-8">
          {/* Personal Info */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9D391E] mb-4">Your Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">First Name *</label>
                <input className={inputClass("first_name")} placeholder="First name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
                {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">Last Name *</label>
                <input className={inputClass("last_name")} placeholder="Last name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
                {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-[#999] mb-1">Email Address *</label>
              <input type="email" className={inputClass("email")} placeholder="your@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
          </section>

          {/* System Info */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9D391E] mb-4">Your System</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">Operating System *</label>
                <select className={selectClass("os_type")} value={form.os_type} onChange={(e) => { set("os_type", e.target.value); setOsType(e.target.value); set("os_version", ""); }}>
                  <option value="">Select OS</option>
                  <option value="macOS">macOS</option>
                  <option value="Windows">Windows</option>
                </select>
                {errors.os_type && <p className="text-xs text-red-400 mt-1">{errors.os_type}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">OS Version *</label>
                <select className={selectClass("os_version")} value={form.os_version} onChange={(e) => set("os_version", e.target.value)} disabled={!osType}>
                  <option value="">Select version</option>
                  {(osType === "macOS" ? MAC_VERSIONS : osType === "Windows" ? WIN_VERSIONS : []).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                {errors.os_version && <p className="text-xs text-red-400 mt-1">{errors.os_version}</p>}
              </div>
            </div>

            {osType === "macOS" && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#1A1E28] border border-[#333] p-3">
                <input type="checkbox" id="rosetta" className="h-4 w-4 accent-[#9D391E]" checked={form.uses_rosetta as boolean} onChange={(e) => set("uses_rosetta", e.target.checked)} />
                <label htmlFor="rosetta" className="text-sm">I&apos;m running my DAW under Rosetta (Intel emulation on Apple Silicon)</label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">Computer Model *</label>
                <input className={inputClass("computer_model")} placeholder='e.g. "MacBook Pro 14-inch" or "Custom PC"' value={form.computer_model} onChange={(e) => set("computer_model", e.target.value)} />
                {errors.computer_model && <p className="text-xs text-red-400 mt-1">{errors.computer_model}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">CPU / Processor *</label>
                <input className={inputClass("cpu")} placeholder='e.g. "Apple M1 Pro" or "Intel i7-12700K"' value={form.cpu} onChange={(e) => set("cpu", e.target.value)} />
                {errors.cpu && <p className="text-xs text-red-400 mt-1">{errors.cpu}</p>}
              </div>
            </div>
          </section>

          {/* Plugin & Issue */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9D391E] mb-4">Issue Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">Plugin *</label>
                <select className={selectClass("plugin_name")} value={form.plugin_name} onChange={(e) => set("plugin_name", e.target.value)}>
                  <option value="">Select plugin</option>
                  {PLUGINS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.plugin_name && <p className="text-xs text-red-400 mt-1">{errors.plugin_name}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">DAW *</label>
                <select className={selectClass("daw_name")} value={form.daw_name} onChange={(e) => set("daw_name", e.target.value)}>
                  <option value="">Select DAW</option>
                  {DAWS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.daw_name && <p className="text-xs text-red-400 mt-1">{errors.daw_name}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-[#999] mb-1">DAW Version *</label>
              <input className={inputClass("daw_version")} placeholder='e.g. "13.0.40", "12", "11.3.1"' value={form.daw_version} onChange={(e) => set("daw_version", e.target.value)} />
              {errors.daw_version && <p className="text-xs text-red-400 mt-1">{errors.daw_version}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-xs text-[#999] mb-1">Issue Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => set("issue_category", cat.value)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      form.issue_category === cat.value
                        ? "border-[#9D391E] bg-[#9D391E]/20 text-[#EEE2CC]"
                        : "border-[#333] bg-[#1A1E28] text-[#888] hover:border-[#555]"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              {errors.issue_category && <p className="text-xs text-red-400 mt-1">{errors.issue_category}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-xs text-[#999] mb-1">Describe Your Issue *</label>
              <textarea className={`${inputClass("description")} h-32 resize-y`} placeholder="Please describe the issue in detail. What happened? When does it happen? Any error messages?" value={form.description} onChange={(e) => set("description", e.target.value)} />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>
          </section>

          {/* Attachments */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#9D391E] mb-4">Attachments (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#999] mb-1">Screenshot URLs</label>
                <input className={inputClass("")} placeholder="Paste screenshot links (Imgur, Google Drive, Dropbox, etc.)" value={form.screenshot_urls} onChange={(e) => set("screenshot_urls", e.target.value)} />
                <p className="text-xs text-[#666] mt-1">Upload screenshots to any image hosting service and paste the link(s) here</p>
              </div>
              <div>
                <label className="block text-xs text-[#999] mb-1">Video Links</label>
                <input className={inputClass("")} placeholder="YouTube, Loom, Google Drive video link" value={form.video_links} onChange={(e) => set("video_links", e.target.value)} />
              </div>
            </div>
          </section>

          {/* Submit */}
          <button onClick={submit} disabled={submitting}
            className="w-full rounded-lg bg-[#9D391E] py-3 text-sm font-semibold text-white hover:bg-[#B84A2A] transition disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Submitting..." : "Submit Support Ticket"}
          </button>

          <p className="text-center text-xs text-[#666]">
            All fields marked with * are required. We typically respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
