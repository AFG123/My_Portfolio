import { type FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContactSubmissionError, submitContactForm } from "../../lib/api";
import { contactDisabledMessage, writesEnabled } from "../../lib/runtimeConfig";

const empty = { name: "", email: "", message: "" };
export function ContactForm() {
  const [form, setForm] = useState(empty);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!writesEnabled || pending) return;
    setPending(true); setFeedback(null);
    try {
      const result = await submitContactForm(form);
      setFeedback({ ok: true, message: result.message || "Message sent successfully." }); setForm(empty);
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof ContactSubmissionError ? error.message : "Unable to send your message right now." });
    } finally { setPending(false); }
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-topline"><span>NEW MESSAGE</span><span>01 / 03</span></div>
    {!writesEnabled && <p className="form-feedback error" role="status">{contactDisabledMessage}</p>}
    <div className="form-row"><label>Your name<input disabled={!writesEnabled} required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label>Email address<input disabled={!writesEnabled} required type="email" maxLength={255} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label></div>
    <label>Tell me about it<textarea disabled={!writesEnabled} required minLength={10} maxLength={2000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="A little about the role, project, or idea..." /></label>
    <div className="form-bottom"><button className="button button-primary" type="submit" disabled={pending || !writesEnabled}>{pending ? "Sending..." : "Send message"} <ArrowUpRight size={18} /></button><span>{writesEnabled ? "Sent through my own API." : "Email link remains available."}</span></div>
    {feedback && <p className={`form-feedback ${feedback.ok ? "success" : "error"}`} role="status">{feedback.message}</p>}
  </form>;
}
