// src/components/ui/NavigationButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  disabled?: boolean;
}

export default function NavigationButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  disabled = false
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mt-auto mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </Button>

      <Button
        onClick={onNext}
        disabled={disabled}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 
                   text-white font-medium px-6 py-2 rounded-xl shadow-lg transition-all"
      >
        {nextLabel} <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
