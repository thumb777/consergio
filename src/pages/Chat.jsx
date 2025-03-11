import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Send,
  Play,
  Square,
  ArrowLeft,
  ArrowRight,
  BotIcon,
  Calendar,
  Search,
  Sparkles,
} from "lucide-react";
import EventCards from "../components/EventCards";
import axios from "axios";
import EventSkeleton from "../components/EventCardSkeletion";
import { Sheet } from "react-modal-sheet";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../components/Loading";
// const dotenv = require("dotenv");
// dotenv.config();
// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textAreaHeight, setTextAreaHeight] = useState("auto");
  const textAreaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 9;
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [chatEvents, setChatEvents] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize chat with the initial message if it exists
    if (location.state?.initialMessage) {
      // Only add the user message to the state, don't send API request yet
      setMessages([{ type: "user", content: location.state.initialMessage }]);
      // Open the sheet when there's an initial message
      if (window.innerWidth < 768) {
        setOpen(true);
      }
    }
  }, []); // Run only once on mount

  // New useEffect to handle API requests when messages change
  useEffect(() => {
    const handleNewMessage = async () => {
      // Only send API request if the last message is from the user
      if (
        messages.length > 0 &&
        messages[messages.length - 1].type === "user"
      ) {
        await sendMessageToAPI(
          messages[messages.length - 1].content,
          messages.slice(0, -1) // Pass all messages except the last one as history
        );
      }
    };

    handleNewMessage();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTextAreaHeight = (e) => {
    setNewMessage(e.target.value);
    setTextAreaHeight("auto");
    if (textAreaRef.current) {
      setTextAreaHeight(`${textAreaRef.current.scrollHeight}px`);
    }
  };

  const sendMessageToAPI = async (message, history) => {
    setIsLoading(true);
    // Reset pagination when sending a new message
    setCurrentPage(1);

    try {
      const response = await api.post("/chat/completion", {
        message,
        pageSize: eventsPerPage,
        pageNum: 1, // Always start from page 1 for new messages
        chatHistory: history.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        { 
          type: "ai", 
          content: response.data.message,
          suggestions: response.data.subcategories || [] // Store suggestions with message
        },
      ]);
      // Update Events based on user's conversation
      if (response.data.events) {
        setChatEvents(response.data.events);
        setCurrentPage(response.data.currentPage);
        setTotalEvents(response.data.totalEvents);
        setTotalPages(response.data.totalPages);
      }
      if (response.data.subcategories) {
        setSubcategories(response.data.subcategories);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I encountered an error. Please try again.",
          suggestions: []
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = newMessage.trim();
      setNewMessage("");
      setTextAreaHeight("auto");

      // Only add user message to chat - the useEffect will handle the API call
      setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    suggestion  = "I'm interested in " + suggestion + " events";
    setNewMessage(suggestion);
    handleSubmit({ preventDefault: () => {} });
  };

  const handlePageChange = async (pageNumber) => {
    setIsPaginationLoading(true);
    try {
      // Get the last user message from the chat history
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.type === "user");

      if (lastUserMessage) {
        const response = await api.post("/chat/completion", {
          message: lastUserMessage.content,
          pageSize: eventsPerPage,
          pageNum: pageNumber,
          chatHistory: messages.slice(0, -1).map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        });

        if (response.data.events) {
          setChatEvents(response.data.events);
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        }
      }
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];

    if (totalPages <= 4) {
      // If 4 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-full ${
              currentPage === i
                ? "bg-orange-400 text-white"
                : "bg-orange-200 text-orange-700 hover:bg-orange-300"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-orange-400 text-white"
              : "bg-orange-200 text-orange-700 hover:bg-orange-300"
          }`}
        >
          1
        </button>
      );

      // Add ellipsis and middle pages
      if (currentPage > 2) {
        pages.push(<span key="ellipsis1">...</span>);
      }

      // Current page and surrounding pages
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-orange-400 text-white"
                : "bg-orange-200 text-orange-700 hover:bg-orange-300"
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 1) {
        pages.push(<span key="ellipsis2">...</span>);
      }
    }

    return pages;
  };

  const handleClose = () => setOpen(false);

  return (
    <div className="flex md:flex-row flex-col w-full h-screen p-8 bg-gradient-to-b from-[#FFFFFF] to-[#faebe3]">
      {/* Left Side - Chat */}
      <div className=" lg:w-1/4 sm:w-1/3 md:flex hidden flex-col border-2 rounded-2xl border-stone-400">
        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            scrollbarWidth: "inherit",
            scrollbarColor: "rgb(209 213 219) transparent",
          }}
        >
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              <div
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                    message.type === "user"
                      ? "bg-orange-300 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
              {/* Render suggestions if they exist and message is from AI */}
              {message.type === "ai" && message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                <span className="dots"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-gray-200">
          <div className="flex gap-2">
            <textarea
              ref={textAreaRef}
              value={newMessage}
              onChange={handleTextAreaHeight}
              placeholder="Type your message..."
              style={{ height: textAreaHeight }}
              className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none overflow-hidden"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`self-end bottom-4 w-fit h-fit p-3 rounded-full transition-all duration-200
                ${
                  isLoading
                    ? "bg-orange-200 text-gray-500 cursor-not-allowed"
                    : "bg-orange-200 hover:bg-orange-300 text-orange-700"
                }`}
            >
              {isLoading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Right Side - Events */}
      <div className="lg:w-3/4 sm:w-2/3 w-full p-6 overflow-y-auto">
        {isLoading ? (
          <div className="w-full h-full inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-neutral-200 border-t-neutral-800 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-neutral-800 animate-pulse" />
                </div>
              </div>
              <div className="text-neutral-800 font-medium text-lg animate-pulse">
                Searching for events...
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-neutral-800 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="font-inter text-lg font-semibold text-gray-800 mb-4">
              We found <span className="text-2xl font-bold">{totalEvents}</span>{" "}
              events similar to what you're looking for...
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={chatEvents.length} // Force re-render on events change
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-6"
              >
                {isPaginationLoading
                  ? Array.from({ length: eventsPerPage }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <EventSkeleton />
                      </motion.div>
                    ))
                  : chatEvents.map((event, index) => (
                      <motion.div
                        key={`${event.id}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="h-full"
                      >
                        <EventCards {...event} />
                      </motion.div>
                    ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isPaginationLoading}
                  className={`px-2 py-2 rounded-full ${
                    currentPage === 1 || isPaginationLoading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-200 text-orange-700 hover:bg-orange-300"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isPaginationLoading}
                  className={`px-2 py-2 rounded-full ${
                    currentPage === totalPages || isPaginationLoading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-200 text-orange-700 hover:bg-orange-300"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Replace the mobile input with Sheet component */}
      <Sheet isOpen={isOpen} onClose={handleClose} detent="content-height">
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div className="flex flex-col h-[80vh]">
              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                  scrollbarWidth: "inherit",
                  scrollbarColor: "rgb(209 213 219) transparent",
                }}
              >
                {messages.map((message, index) => (
                  <div key={index} className="flex flex-col">
                    <div
                      className={`flex ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                          message.type === "user"
                            ? "bg-orange-300 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                    {/* Render suggestions if they exist and message is from AI */}
                    {message.type === "ai" && message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                      <span className="dots"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex gap-2">
                  <textarea
                    ref={textAreaRef}
                    value={newMessage}
                    onChange={handleTextAreaHeight}
                    placeholder="Type your message..."
                    style={{ height: textAreaHeight }}
                    className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none overflow-hidden"
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`self-end bottom-4 w-fit h-fit p-3 rounded-full transition-all duration-200
                      ${
                        isLoading
                          ? "bg-orange-200 text-gray-500 cursor-not-allowed"
                          : "bg-orange-200 hover:bg-orange-300 text-orange-700"
                      }`}
                  >
                    {isLoading ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>

      {/* Mobile Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-4 right-4 p-4 hover:bg-orange-500 transition-all duration-200 bg-orange-400 text-white rounded-full shadow-lg"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  );
}

export default Chat;
