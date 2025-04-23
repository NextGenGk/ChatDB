import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Ask me any question in natural language to run SQL queries." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  // Toggle dark mode and store preference in localStorage
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/natural-language", {
        command: input
      });

      const botMessage = {
        role: "assistant",
        content:
          `SQL:\n\`${response.data.sql}\`\n\n` +
          (response.data.result
            ? `Result:\n${JSON.stringify(response.data.result, null, 2)}`
            : response.data.message || "✅ Success")
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Error: " + (error.response?.data?.error || error.message) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} flex flex-col h-screen`}>
      <header className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-4 shadow text-center text-xl font-semibold`}>
        ChatDB
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-3xl p-3 rounded-lg whitespace-pre-wrap ${
              msg.role === "user"
                ? `${darkMode ? "bg-blue-600" : "bg-blue-100"} self-end ml-auto`
                : msg.role === "system"
                ? `${darkMode ? "bg-yellow-500 text-gray-200" : "bg-yellow-50 text-gray-700"} border border-yellow-300 self-center`
                : `${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border"} self-start mr-auto`
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} self-start text-sm`}>Generating SQL...</div>}
      </main>

      <footer className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-4 border-t`}>
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className={`w-full border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
            placeholder="e.g. Show all users over age 30"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </footer>

      {/* Dark Mode Toggle Button in the Bottom-Right Corner */}
      <div className="fixed top-2 right-4 z-10">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-950 text-white p-2 rounded-full"
        >
          {darkMode ? "🌙" : "🌞"}
        </button>
      </div>
    </div>
  );
}

export default App;
