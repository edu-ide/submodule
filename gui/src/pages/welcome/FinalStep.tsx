"use client";

import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { FolderOpen } from "lucide-react";

export default function FinalStep({ onBack }: { onBack: () => void }) {

  const handleOpenFolder = () => {
    ideMessenger.post("pearWelcomeOpenFolder", undefined);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleOpenFolder();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const ideMessenger = useContext(IdeMessengerContext);
  return (
    <div className="flex w-full overflow-hidden bg-background text-foreground">
      <div className="w-full flex flex-col h-screen">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-10">
          <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            <img
              src={`${window.vscMediaUrl}/logos/pearai-green.svg`}
              alt="PearAI"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            You're all set!
          </h2>

          <div className="flex flex-col items-center gap-3 mb-24">
            <Button
              className="w-[250px] md:w-[280px] text-button-foreground bg-button hover:bg-button-hover py-5 px-2 md:py-6 text-base md:text-lg cursor-pointer relative"
              onClick={handleOpenFolder}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="w-8" />
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  <span>Open a folder</span>
                </div>
                <kbd className="flex items-center font-mono text-sm justify-center bg-[var(--vscode-input-background)] min-w-[1rem]">Enter</kbd>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
