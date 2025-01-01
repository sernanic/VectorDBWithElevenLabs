import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LoginPage } from "@/pages/public/auth/components/LoginPage";
import { SignupPage } from "@/pages/public/auth/components/SignupPage";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AuthLayout = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const videoUrl = "https://www.dropbox.com/scl/fi/b248pqiy45jtngka8eyhb/loginVideoPage.mp4?rlkey=i7mzs54ql24xabxyea1x2e0y6&dl=1&raw=1";

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location]);

  const slideTransition = {
    duration: 0.6,
    ease: [0.43, 0.13, 0.23, 0.96]
  };

  return (
    <div className="flex h-screen">
      <div className="relative flex w-full">
        {/* Fixed Login Form on the Left */}
        <div 
          className={cn(
            "w-1/2 z-10 transition-opacity duration-300",
            isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <LoginPage onSignupClick={() => setIsLogin(false)} />
        </div>

        {/* Fixed Signup Form on the Right */}
        <div 
          className={cn(
            "w-1/2 z-10 transition-opacity duration-300",
            isLogin ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          )}
        >
          <SignupPage onLoginClick={() => setIsLogin(true)} />
        </div>

        {/* Sliding Video Background */}
        <motion.div
          className="absolute top-0 w-1/2 h-full z-20"
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={slideTransition}
        >
          <div className="relative w-full h-full overflow-hidden bg-gray-900">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Overlay with gradient and gray tint */}
            <div className="absolute inset-0 bg-gray-900/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 to-gray-900/30" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout; 