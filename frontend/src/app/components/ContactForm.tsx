import { FormEvent, useState } from "react";
import { submitContactForm } from "../../lib/api";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await submitContactForm(formData);
      setSuccessMessage(response.message || "Message sent successfully.");
      setFormData(initialFormState);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mb-8 border border-[#00ff41]/20 bg-black/40 p-6">
      <div className="mb-4 font-mono text-sm text-[#00ff41]/70">
        <span className="text-[#00ff41]/50">$ </span>
        send_message --secure
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-[#00ff41]/60">
              name
            </span>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full border border-[#00ff41]/30 bg-black px-4 py-3 font-mono text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#00ff41] focus:outline-none"
              placeholder="Aryan Damai"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-[#00ff41]/60">
              email
            </span>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full border border-[#00ff41]/30 bg-black px-4 py-3 font-mono text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#00ff41] focus:outline-none"
              placeholder="you@example.com"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-[#00ff41]/60">
            message
          </span>
          <textarea
            required
            name="message"
            rows={5}
            value={formData.message}
            onChange={(event) =>
              setFormData((current) => ({ ...current, message: event.target.value }))
            }
            className="w-full resize-none border border-[#00ff41]/30 bg-black px-4 py-3 font-mono text-sm leading-7 text-gray-200 placeholder:text-gray-600 focus:border-[#00ff41] focus:outline-none"
            placeholder="Tell me a bit about the project or role."
          />
        </label>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center border-2 border-[#00ff41] px-5 py-3 font-mono text-sm text-[#00ff41] transition-all hover:bg-[#00ff41] hover:text-black disabled:cursor-not-allowed disabled:border-[#00ff41]/30 disabled:text-[#00ff41]/40 disabled:hover:bg-transparent disabled:hover:text-[#00ff41]/40"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          <p className="font-mono text-xs text-gray-500">
            Stored through a custom backend and PostgreSQL.
          </p>
        </div>

        {successMessage ? (
          <p className="font-mono text-sm text-[#00ff41]">{successMessage}</p>
        ) : null}

        {errorMessage ? (
          <p className="font-mono text-sm text-red-400">{errorMessage}</p>
        ) : null}
      </form>
    </div>
  );
}
