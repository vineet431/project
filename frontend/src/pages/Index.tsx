import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { LogIn, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <Layout className="gradient-hero min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient particles/stars effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-white" size={32} />
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white">
              VendorBuddy
            </h1>
          </div>
          <p className="text-lg text-white/70 font-light max-w-md mx-auto leading-relaxed">
            Your gateway to smarter business connections
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="max-w-sm mx-auto">
          <div className="glassmorphism rounded-2xl p-8 mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <LogIn className="text-white" size={28} />
              </div>
              <h2 className="text-xl font-light text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-white/60 text-sm font-light">
                Enter your world of possibilities
              </p>
            </div>

            <Button 
              size="lg" 
              className="glass-button text-white w-full rounded-xl py-6 text-lg font-medium tracking-wide"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>

          {/* Subtle call to action */}
          <div className="text-center">
            <p className="text-white/50 text-sm font-light mb-2">
              New to VendorBuddy?
            </p>
            <button 
              className="text-white/80 text-sm underline underline-offset-4 hover:text-white transition-colors font-light"
              onClick={() => navigate("/signup")}
            >
              Create your account
            </button>
          </div>
        </div>

        {/* Minimal footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-white/30 text-xs font-light">
            Connecting vendors • Building futures
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
