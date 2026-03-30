import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Copy,
  ExternalLink
} from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [balance, setBalance] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const walletAddress = "bc1qxy2kgdy6jrsqezq2n0s5v7sc9wd7svhhcl6j0y";

  const nextStep = () => setCurrentStep((prev) => prev + 1);

  const handleMoonPay = () => {
    // Simulate MoonPay Purchase
    setBalance(10000);
    nextStep();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "Secure Your Wallet",
      description: "We've generated a unique personal wallet for your investments.",
      icon: <Wallet className="w-6 h-6 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Your Bitcoin Address</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm break-all font-mono text-slate-700">{walletAddress}</code>
              <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 rounded-md transition-colors">
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
          <button 
            onClick={nextStep}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          >
            I've saved my address <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "Fund Your Account",
      description: "Deposit BTC to your wallet or purchase directly via our partner.",
      icon: <CreditCard className="w-6 h-6 text-purple-500" />,
      content: (
        <div className="space-y-3">
          <button 
            onClick={handleMoonPay}
            className="w-full border-2 border-slate-200 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="text-left">
              <p className="font-bold text-slate-800">Buy with MoonPay</p>
              <p className="text-xs text-slate-500">Fast purchase with Credit Card/Bank</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
          </button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Already have Bitcoin?</span></div>
          </div>
          <button 
            onClick={() => { setBalance(10000); nextStep(); }}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-all"
          >
            Verify External Deposit
          </button>
        </div>
      )
    },
    {
      id: 3,
      title: "Ready to Invest",
      description: "Your balance has been updated. You are now ready to build your portfolio.",
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
            <p className="text-sm text-green-700 font-medium mb-1">Available Balance</p>
            <h3 className="text-4xl font-bold text-slate-900">${balance.toLocaleString()}</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 text-center italic">"Real estate is the safest way to grow wealth over time."</p>
            <button 
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all"
            >
              Browse Properties
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 flex">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`h-full transition-all duration-500 ${step.id <= currentStep ? 'bg-blue-500' : 'bg-transparent'}`}
                  style={{ width: `${100 / steps.length}%` }}
                />
              ))}
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {steps[currentStep - 1].icon}
                    </div>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Step {currentStep} of 3</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-slate-500 mb-8">
                    {steps[currentStep - 1].description}
                  </p>

                  {steps[currentStep - 1].content}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Secure Encrypted Environment
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;