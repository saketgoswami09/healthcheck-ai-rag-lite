"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2, ChevronRight } from "lucide-react";
import styles from "./HealthChat.module.css";

export default function HealthChat() {
  const [document, setDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [fullReply, setFullReply] = useState("");
  const [displayedReply, setDisplayedReply] = useState("");
  const [loading, setLoading] = useState(false);

  // ⌨️ Typewriter Effect
  useEffect(() => {
    if (fullReply) {
      setDisplayedReply("");
      let index = 0;

      const interval = setInterval(() => {
        if (index < fullReply.length) {
          setDisplayedReply((prev) => prev + fullReply.charAt(index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [fullReply]);

  const sendMessage = async () => {
    if (!document.trim() || !question.trim()) return;

    setLoading(true);
    setFullReply("");
    setDisplayedReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document,
          question,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setFullReply(data.error);
      } else {
        setFullReply(data.reply);
      }
    } catch (error) {
      setFullReply("Unable to analyze health report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 🏥 Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.iconBox}>
            <Activity size={24} />
          </div>
          <div>
            <h1 className={styles.title}>HealthCheck AI</h1>
            <p className={styles.subtitle}>Diagnostic Analysis Engine</p>
          </div>
        </div>
      </header>

      {/* 📊 Output Area */}
      <main className={styles.main}>
        {displayedReply && (
          <div className={styles.resultCard}>
            <div className={styles.badgeRow}>
              <span className={styles.pulseDot} />
              <span className={styles.badgeText}>Analysis Result</span>
            </div>
            <div className={styles.typewriterText}>
              {displayedReply}
              <span className={styles.cursor} />
            </div>
          </div>
        )}
      </main>

      {/* 📝 Input Section */}
      <footer className={styles.footer}>
        <div className={styles.inputWrapper}>
          {/* Document Textarea */}
          <textarea
            className={styles.textarea}
            placeholder="Paste full medical report here..."
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={6}
          />

          {/* Question Input */}
          <input
            className={styles.questionInput}
            type="text"
            placeholder="Ask a question about the report..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* Send Button */}
          <button
            className={styles.sendButton}
            onClick={sendMessage}
            disabled={loading || !document.trim() || !question.trim()}
          >
            {loading ? (
              <Loader2 className={styles.spin} size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
