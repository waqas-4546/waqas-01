
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const restaurantRules = rules as Rule[];

const quickTopics = [
  "Menu",
  "Deals",
  "Timings",
  "Location",
  "Delivery",
  "Payment",
];

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

// Match complete words or phrases, not partial words.
// For example, "hi" matches "hi there" but not "this".
function containsWholeKeyword(
  message: string,
  keyword: string
): boolean {
  const escapedKeyword = normalizeText(keyword).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedKeyword}($|[^a-z0-9])`,
    "i"
  );

  return pattern.test(message);
}

function getBotReply(message: string): string {
  const normalizedMessage = normalizeText(message);

  // Rules are checked in JSON order, so specific topics come first.
  // Short greetings are placed last to reduce accidental matches.
  const matchedRule = restaurantRules.find((rule) =>
    rule.keywords.some((keyword) =>
      containsWholeKeyword(normalizedMessage, keyword)
    )
  );

  if (matchedRule) {
    return matchedRule.reply;
  }

  return "Sorry, I didn't quite understand that. 😊\n\nYou can ask me about our menu, deals, delivery, timings, location, payment, or how to order. How can I help you?";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Assalam-o-Alaikum! 👋 Welcome to Desi Bites, Sargodha!\n\nI'm your restaurant assistant. Ask me about our menu, special deals, opening hours, delivery, or anything else about our restaurant.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const nextId = useRef(2);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  function sendMessage(text: string) {
    const trimmedText = text.trim();

    if (!trimmedText || isTyping) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: nextId.current++,
        sender: "user",
        text: trimmedText,
      },
    ]);

    setInput("");
    setIsTyping(true);

    const reply = getBotReply(trimmedText);

    typingTimer.current = setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: nextId.current++,
          sender: "bot",
          text: reply,
        },
      ]);

      setIsTyping(false);
      typingTimer.current = null;
    }, 500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-3 py-5 sm:px-6">
      <section className="flex h-[90vh] min-h-[560px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-xl">
        {/* Restaurant header */}
        <header className="bg-orange-600 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl">
              🍔
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold sm:text-2xl">
                Desi Bites
              </h1>
              <p className="text-sm text-orange-100">
                Restaurant Chatbot · Sargodha
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-orange-100">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                <span>Online · Ready to help</span>
              </div>
            </div>
          </div>
        </header>

        {/* Quick topic buttons */}
        <div className="border-b border-orange-100 bg-orange-50/70 px-3 py-3 sm:px-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Quick topics
          </p>

          <div className="flex flex-wrap gap-2">
            {quickTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                disabled={isTyping}
                onClick={() => sendMessage(topic)}
                className="rounded-full border border-orange-300 bg-white px-3 py-1.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div
          className="flex-1 space-y-4 overflow-y-auto bg-white px-3 py-5 sm:px-6"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[80%] ${
                    isUser
                      ? "rounded-br-sm bg-orange-600 text-white"
                      : "rounded-bl-sm border border-orange-100 bg-orange-50 text-gray-800"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 text-xs font-bold text-orange-700">
                      Desi Bites Bot
                    </p>
                  )}

                  <p className="whitespace-pre-line break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-sm border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-600"
                role="status"
              >
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-orange-100 bg-white p-3 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>

            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about menu, deals, delivery..."
              disabled={isTyping}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            Powered by simple keyword rules · No AI API required
          </p>
        </form>
      </section>
    </main>
  );
}
