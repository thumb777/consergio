import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "aos/dist/aos.css";
import AOS from "aos";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles

function WaitList() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true, // Whether animation should happen only once
      easing: "ease-in-out", // Easing function
    });
  }, []);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);

      // Navigate to the pending page with state
      navigate("/pending", {
        state: {
          email,
          firstName,
        },
      });
    }
  };

  const handleTwitterShare = () => {
    const twitterText = `Get early access to ${window.location.href}, your personal AI event concierge. Sign up now!`;
    const twitterUrl = window.location.href; // Use the current URL
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterText
    )}&url=${encodeURIComponent(twitterUrl)}`;

    // Open the Twitter share URL in a new tab
    window.open(twitterShareUrl, "_blank");
  };

  const handleShare = () => {
    const shareData = {
      title: `Join the Waitlist for ${window.location.href}!`,
      text: `Get early access to ${window.location.href}, your personal AI event concierge. Sign up now!`,
      url: window.location.href, // Use the current URL
    };

    // Check if the Web Share API is available
    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {})
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      // Fallback for browsers that do not support the Web Share API
      console.log("Web Share API not supported.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] justify-center">
        <div className="text-center w-fit p-4 space-y-4">
          <div className=" text-2xl font-serif">
            {window.location.hostname.replace("www.", "")} is launching soon!
          </div>
          <div className="h-1 w-[95%] bg-gray-400 rounded-full overflow-hidden">
            <div className="h-full w-full loading-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] sm:pt-28 pt-20">
      <ToastContainer />
      {/* Add ToastContainer to enable toast notifications */}
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div
          data-aos="fade-down"
          data-aos-duration="1000"
          className="text-center text-2xl font-serif leading-7 max-w-[400px] pb-12"
        >
          {window.location.hostname.replace("www.", "")} is launching soon!{" "}
          <br /> Sign up to get early access to your personal AI event
          concierge.
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 w-[90%] max-w-[400px]"
        >
          <div
            data-aos="fade-left"
            data-aos-duration="2000"
            // className="animate-border-gradientA"
          >
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full px-4 py-3 rounded-full text-lg bg-white/80 focus:outline-none neon-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div
            data-aos="fade-right"
            data-aos-duration="2000"
            // className="animate-border-gradient"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-full text-lg  bg-white/80 focus:outline-none neon-input"
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting} // Disable the button if submitting
            className={`w-full bg-black text-white py-4 rounded-full text-lg font-medium flex items-center justify-center transition-all duration-300 ${
              isSubmitting ? "cursor-wait opacity-50" : "hover:bg-gray-900"
            }`}
          >
            {isSubmitting ? (
              <div className="loader"></div> // Circular animation
            ) : (
              "Continue"
            )}
          </button>
        </form>
        <div
          data-aos="fade-down"
          data-aos-duration="1000"
          className="w-full text-center text-2xl font-serif leading-7 max-w-[400px] pt-16 pb-4"
        >
          Share the love <br /> and move up the wait list!
        </div>
        <div className="w-full flex items-center justify-center gap-4">
          <img
            data-aos="fade-up"
            data-aos-duration="1000"
            className="cursor-pointer"
            src="/Twitter.svg"
            alt="Twitter"
            onClick={handleTwitterShare}
          />
          <img
            data-aos="fade-up"
            data-aos-duration="1000"
            className="cursor-pointer"
            src="/Share.svg"
            alt="Share"
            onClick={handleShare} // Attach the share handler here
          />
        </div>
      </div>
    </div>
  );
}

export default WaitList;
