import { useState } from "react";
import { Apple, X } from "lucide-react";

const Auth = ({ onComplete, onClose }) => {

  const handleAuth = (provider) => {
    // Implement actual auth logic here
    console.log(`${provider} auth clicked`);
    // onComplete();
  };

  return (
    <div className="bg-white shadow-lg md:w-[60%] w-[90%] md:max-w-[600px] h-fit rounded-md p-6">
      <div 
      className="bg-white rounded-[32px] w-full p-8 relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign in to continue
        </h2>
        <p className="text-gray-600">
          Let's find your perfect experience
        </p>
      </div>

      {/* Auth Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => handleAuth('google')}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D5445] transition-all duration-200"
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            className="h-5 w-5 mr-3"
            alt="Google logo"
          />
          Continue with Google
        </button>

        <button
          onClick={() => handleAuth('apple')}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D5445] transition-all duration-200"
        >
          <Apple className="h-5 w-5 mr-3" />
          Continue with Apple
        </button>
      </div>

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-gray-500">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#0D5445] hover:text-[#0D5445]/80">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-[#0D5445] hover:text-[#0D5445]/80">
          Privacy Policy
        </a>
      </p>
    </div>  
    </div>
  );
};

export default Auth;
