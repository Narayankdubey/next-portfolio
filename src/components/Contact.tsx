"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useToast } from "@/context/ToastContext";

export default function Contact() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  const portfolio = usePortfolio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Message sent successfully! I'll get back to you soon.");
        setFormState({ name: "", email: "", message: "" });
      } else {
        showError(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      showError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="min-h-screen flex items-center px-4 md:px-8 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-16 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
        >
          Get In Touch
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6 theme-text">Get in Touch</h3>
              {[
                {
                  Icon: Mail,
                  text: portfolio?.personal?.email || "",
                  href: `mailto:${portfolio?.personal?.email || ""}`,
                },
                {
                  Icon: Phone,
                  text: portfolio?.personal?.phone || "",
                  href: `tel:${portfolio?.personal?.phone || ""}`,
                },
                { Icon: MapPin, text: portfolio?.personal?.location || "", href: "#" },
              ].map(({ Icon, text, href }) => (
                <motion.a
                  key={text}
                  href={href}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-center gap-4 p-4 theme-card border theme-border rounded-xl mb-4 hover:border-blue-500 transition-all group theme-shadow"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="group-hover:text-blue-400 transition-colors theme-text">
                    {text}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { id: "name", label: "Name", type: "text" },
              { id: "email", label: "Email", type: "email" },
            ].map((field) => (
              <div key={field.id} className="relative">
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  value={formState[field.id as keyof typeof formState]}
                  onChange={(e) => setFormState({ ...formState, [field.id]: e.target.value })}
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  className="w-full theme-input-bg border theme-input-border rounded-xl px-4 py-3 theme-text focus:outline-none focus:border-blue-500 transition-all"
                />
                {focusedField === field.id && (
                  <motion.div
                    layoutId="focus"
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                )}
              </div>
            ))}

            <div className="relative">
              <label className="block text-sm font-medium theme-text-secondary mb-2">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Your Message"
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 theme-input-bg border theme-input-border rounded-lg theme-text placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              />
              {focusedField === "message" && (
                <motion.div
                  layoutId="focus"
                  className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2 }}
                />
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:shadow-lg transition-all text-white flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
