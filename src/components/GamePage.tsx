import React, { useState, useCallback } from "react";
import { TypewriterText } from "./TypewriterText";
import { InputArea } from "./InputArea";
import { QuickActionPrompts } from "./QuickActionPrompts";
import { Message, Difficulty } from "../types/game";
import { motion } from "framer-motion";
import { validateTokenAvailability } from "../utils/tokens/validation";
import type { TokenUsage } from "../utils/tokens/types";

interface GamePageProps {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  onSend: (message: string) => Promise<void>;
  onTypewriterComplete: () => void;
  gameStatus: "playing" | "won" | "lost";
  difficulty?: Difficulty;
  tokenUsage?: TokenUsage;
  onReturnToMain?: () => void;
}

const PortalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5 sm:w-6 sm:h-6"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4"
      strokeLinecap="round"
    />
    <path
      d="M15 12L9 12M9 12L11 14M9 12L11 10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GamePage: React.FC<GamePageProps> = ({
  messages,
  isLoading,
  isGenerating,
  onSend,
  onTypewriterComplete,
  gameStatus,
  difficulty = "adaptive",
  tokenUsage,
  onReturnToMain,
}) => {
  const hasEnoughTokens =
    !tokenUsage || validateTokenAvailability(tokenUsage, "STORY_RESPONSE");

  const [showEnergyWarning, setShowEnergyWarning] = useState(false);

  const handleTypewriterComplete = useCallback(() => {
    if (!hasEnoughTokens) {
      setShowEnergyWarning(true);
    }
    onTypewriterComplete();
  }, [hasEnoughTokens, onTypewriterComplete]);

  const handleQuickAction = (action: string) => {
    if (!isLoading && !isGenerating) {
      onSend(action);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <div className="w-full max-w-3xl mx-auto px-4">
        <motion.button
          onClick={() => window.location.reload()}
          className="fixed top-4 sm:top-6 left-4 sm:left-6 p-2.5 text-gray-400 hover:text-white transition-colors duration-200 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PortalIcon />
        </motion.button>

        <div className="space-y-4 mt-16 mb-24 sm:mt-20 sm:mb-28">
          {messages.map((message, index) => (
            <div key={`${message.content}-${index}`} className="px-2 sm:px-0">
              <TypewriterText
                text={message.content}
                onComplete={handleTypewriterComplete}
              />
            </div>
          ))}
        </div>
      </div>

      {gameStatus === "playing" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
            {!hasEnoughTokens ? (
              showEnergyWarning ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center text-red-400 mb-4">
                    Not enough energy to continue. Return to main page to start
                    a new adventure.
                  </div>
                  <button
                    onClick={onReturnToMain}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Return to Main Page
                  </button>
                </motion.div>
              ) : (
                <div />
              )
            ) : (
              <>
                <QuickActionPrompts
                  currentPrompt={messages[messages.length - 1]?.content || ""}
                  onActionSelect={handleQuickAction}
                  isDisabled={isLoading || isGenerating}
                  difficulty={difficulty}
                  tokenUsage={tokenUsage}
                />
                <InputArea
                  onSend={onSend}
                  isLoading={isLoading}
                  isGenerating={isGenerating}
                  placeholder="What now?"
                  showSendIcon={true}
                  variant="line"
                  showSparkles={false}
                  tokenUsage={tokenUsage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
