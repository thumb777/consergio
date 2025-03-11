import { useState, useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";

import "../App.css";

const categories = ["concerts", "sports", "theater"];

function WaitList() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] justify-center">
        <div className="text-center w-fit p-4 space-y-4">
          <div className=" text-2xl font-serif">
            LetsGo.ai is launching soon!
          </div>
          <div className="h-1 w-[95%] bg-gray-400 rounded-full overflow-hidden">
            <div className="h-full w-full loading-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[100vw] flex flex-col items-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] pt-28">
      <div className="max-w-md w-full relative">
        {!isSubmitted ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div
              data-aos="fade-down"
              data-aos-duration="1000"
              className="text-center text-2xl font-serif leading-7 max-w-[400px] pb-12"
            >
              LetsGo.ai is launching soon! <br></br> Sign up to get early access
              to your personal AI event concierge.
            </div>
            <form
              onSubmit={handleSubmit}
              className="  space-y-4 w-[90%] max-w-[400px]"
            >
              <input
                data-aos="fade-right"
                data-aos-duration="2000"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-6 py-4 rounded-full border-2 border-gray-100 text-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
                required
                disabled={isSubmitting}
              />
              <button
                data-aos="fade-left"
                data-aos-duration="2000"
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-black text-white py-4 rounded-full text-lg font-medium transition-all duration-300
                  ${isSubmitting ? "cursor-wait" : "hover:bg-gray-900"}`}
              >
                {isSubmitting ? (
                  <span className="loading-shimmer absolute inset-0 bg-white/10"></span>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
            <div
              data-aos="fade-down"
              data-aos-duration="1000"
              className="w-full text-center text-2xl font-serif leading-7 max-w-[400px] pt-16 pb-4"
            >
              Share the love <br></br> and move up the wait list!
            </div>
            <div className="w-full flex items-center justify-center gap-4">
              <img
                data-aos="fade-up"
                data-aos-duration="1000"
                className="cursor-pointer"
                src="/Twitter.svg"
                alt="Twitter"
              />
              <img
                data-aos="fade-up"
                data-aos-duration="1000"
                className="cursor-pointer"
                src="/Share.svg"
                alt="Share"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div
              data-aos="fade-up"
              data-aos-duration="2000"
              className="text-center text-2xl font-serif leading-7 max-w-[400px] pb-12"
            >
              We have your spot in line saved! <br></br> We will be welcoming
              you in soon. Share to move up in line.
            </div>
            <div className="text-center text-2xl font-serif leading-7 max-w-[400px] pb-4">
              Share to move up in line.
            </div>
            <div className="w-full flex items-center justify-center gap-4   pb-12">
              <img
                className="cursor-pointer"
                src="/Twitter.svg"
                alt="Twitter"
              />
              <img className="cursor-pointer" src="/Share.svg" alt="Share" />
            </div>
            <div className="text-center text-2xl font-serif leading-7 max-w-[400px]   pb-4">
              Follow us for updates!
            </div>
            <div className="w-full flex items-center justify-center gap-4   pb-12">
              <img
                className="cursor-pointer"
                src="/BTwitter.svg"
                alt="BTwitter"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitList;
