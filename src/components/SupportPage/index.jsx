import React, { useState, useEffect, useRef } from "react";
import { Send, Plus, Trash2 } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import api from "../../config/axiosConfig";

const TypingIndicator = () => (
  <div className="inline-flex items-center space-x-1 bg-gray-200 rounded-lg px-3 py-3">
    <div
      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}
    ></div>
  </div>
);

const CustomerSupportPage = () => {
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadThreadsFromLocalStorage();
  }, []);

  useEffect(() => {
    if (currentThreadId) {
      loadMessagesForThread(currentThreadId);
    }
  }, [currentThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadThreadsFromLocalStorage = () => {
    const savedThreads =
      JSON.parse(localStorage.getItem("supportThreads")) || [];
    setThreads(savedThreads);
    if (savedThreads.length > 0 && !currentThreadId) {
      setCurrentThreadId(savedThreads[0].id);
    }
  };

  const saveThreadsToLocalStorage = (updatedThreads) => {
    localStorage.setItem("supportThreads", JSON.stringify(updatedThreads));
  };

  const loadMessagesForThread = (threadId) => {
    const savedThreads =
      JSON.parse(localStorage.getItem("supportThreads")) || [];
    const thread = savedThreads.find((t) => t.id === threadId);
    if (thread) {
      setMessages(thread.messages || []);
    } else {
      setMessages([]);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await api.post("/ai/start");
      const newThread = {
        id: response.data.threadId,
        name: `Thread ${threads.length + 1}`,
        messages: [],
      };
      const updatedThreads = [newThread, ...threads];
      setThreads(updatedThreads);
      saveThreadsToLocalStorage(updatedThreads);
      setCurrentThreadId(newThread.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new thread:", error);
    }
  };

  const deleteThread = (threadId) => {
    const updatedThreads = threads.filter((thread) => thread.id !== threadId);
    setThreads(updatedThreads);
    saveThreadsToLocalStorage(updatedThreads);

    if (currentThreadId === threadId) {
      setCurrentThreadId(updatedThreads[0]?.id || null);
      setMessages(updatedThreads[0]?.messages || []);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !currentThreadId || isLoading) return;

    const newMessage = { text: inputMessage, sender: "user" };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post("/ai/message", {
        threadId: currentThreadId,
        message: inputMessage,
      });

      setIsTyping(false);
      const aiResponse = { text: response.data.response, sender: "ai" };
      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);

      // Update thread in localStorage
      const updatedThreads = threads.map((thread) =>
        thread.id === currentThreadId
          ? { ...thread, messages: finalMessages }
          : thread
      );
      setThreads(updatedThreads);
      saveThreadsToLocalStorage(updatedThreads);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setMessages([
        ...updatedMessages,
        {
          text: "Sorry, there was an error processing your request.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto py-8 flex-grow flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md rounded-lg mr-4 p-4 flex flex-col">
          <button
            onClick={createNewThread}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center mb-4"
          >
            <Plus size={20} className="mr-2" />
            New Thread
          </button>
          <div
            className="space-y-2 overflow-y-auto flex-grow"
            style={{ maxHeight: "calc(100vh - 250px)" }}
          >
            {threads.map((thread) => (
              <div key={thread.id} className="flex items-center">
                <button
                  onClick={() => setCurrentThreadId(thread.id)}
                  className={`flex-grow text-left p-2 rounded overflow-hidden truncate ${
                    currentThreadId === thread.id
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {(thread.messages[0] && thread.messages[0].text) ||
                    thread.name}
                </button>
                <button
                  onClick={() => deleteThread(thread.id)}
                  className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="flex-grow bg-white rounded-lg shadow-md p-6 flex flex-col"
          style={{ maxWidth: "calc(100% - 16rem)" }}
        >
          <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
          <div
            className="flex-grow overflow-y-auto mb-4 space-y-4"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading || !currentThreadId}
              ref={inputRef}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={isLoading || !currentThreadId}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerSupportPage;
