"use client";
import React, { useState } from "react";
import OnboardingModal from "./Toutorial";

export default function TutorialLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={() => setIsOpen(true)}
        className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Open Tutorial
      </button>

      <OnboardingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
