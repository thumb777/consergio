import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Play, Square } from "lucide-react";
import EventCards from "../components/EventCards";
import Loading from "../components/Loading";
import Auth from "../components/Auth"; // Import your Auth dialog component
import "../App.css";
import axios from "axios";
import { motion } from "framer-motion";
// const dotenv = require("dotenv");
// dotenv.config();

const categories = ["concerts", "sports", "theater"];

function Home() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(categories);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleClose = () => setIsModalOpen(true);

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/events`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      setEvents(response.data.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Message submitted:", message);
      setMessage("");
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const togglePlay = async () => {
    if (message.trim()) {
      if (!isAuthenticated) {
        // If the user is not authenticated, show the Auth dialog
        console.log("------------");

        setIsModalOpen(false);
        return;
      }

      // If authenticated, proceed to navigate
      setIsLoading(true);
      const chatId = Date.now().toString();

      // Add a delay to show loading animation
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/s/${chatId}`, {
          state: { initialMessage: message },
        });
      }, 1500); // 1.5 second delay
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        togglePlay();
      }
    }
  };

  // const handleAuthComplete = () => {
  //   // Called when the user successfully authenticates
  //   setIsAuthenticated(true);
  //   setShowAuthDialog(false);
  // };

  return (
    <Loading isLoading={isLoading}>
      <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Consigero</h1>
          </div>
          <p className="text-[20px] text-gray-600">
            Let me help you find a fun experience...
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center pt-12 md:w-[60%] w-[90%] max-w-[800px] min-w-[320px]"
        >
          <div className="bg-white w-full flex flex-col items-end pr-4 pb-4 rounded-[32px] shadow-lg transition-shadow duration-200 max-h-[60vh] overflow-y-auto focus-within:shadow-xl focus-within:ring-2 focus-within:ring-stone-300">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I am interested in..."
              className="w-full max-h-[40vh] px-6 pt-6 text-gray-800 rounded-[32px] focus:outline-none bg-transparent resize-none text-lg"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgb(209 213 219) transparent",
              }}
            />
            {message.trim() && (
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className={`bottom-4 w-fit h-fit p-3 rounded-full transition-all duration-200
                  ${
                    isLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-100 hover:bg-orange-200 text-orange-600"
                  }`}
              >
                {isLoading ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-lg min-w-24 ${
                  category === "concerts"
                    ? "bg-[#0D5445]"
                    : category === "sports"
                    ? "bg-[#FFEB3B]"
                    : "bg-[#FFC09A]"
                } bg-opacity-25 text-black font-['Roboto'] transition-shadow duration-100
                ${
                  selectedCategories.includes(category)
                    ? ""
                    : "border-2 border-black border-opacity-50"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full p-12 pt-24 gap-6 pb-4 relative flex overflow-x-hidden"
        >
          {events.map((event, index) => (
            <div
              key={index}
              className="event-card flex-shrink-0 md:w-[500px] w-[300px] animate-marquee whitespace-nowrap"
            >
              <EventCards {...event} />
            </div>
          ))}
        </motion.div>
        {!isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <Auth onComplete={handleAuthComplete} onClose={handleClose} />
          </div>
        )}
      </div>
    </Loading>
  );
}

export default Home;
