import React from 'react';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import type { TokenUsage } from '../utils/tokens/types';

interface TokenCounterProps {
  usage: TokenUsage;
}

export const TokenCounter: React.FC<TokenCounterProps> = ({ usage }) => {
  const used = Math.max(0, usage.used);
  const remaining = Math.max(0, usage.limit - used);
  const percentage = Math.min(100, Math.max(0, (used / usage.limit) * 100));

  const getColor = () => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-green-500";
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <div className="group relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 p-2 rounded-lg bg-black/80 backdrop-blur-sm border border-gray-800 ${getColor()}`}
        >
          <Gauge className="w-5 h-5" />
          <span className="text-sm font-medium">{formatNumber(remaining)}</span>
        </motion.div>

        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
          <div className="bg-black/90 backdrop-blur-sm border border-gray-800 rounded-lg p-3 shadow-xl min-w-[240px]">
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Daily Energy Usage</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-gray-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColor()} transition-all duration-500`}
                    style={{
                      width: `${percentage}%`,
                      minWidth: "2px",
                      background: `linear-gradient(90deg, ${
                        percentage >= 90
                          ? "#ef4444"
                          : percentage >= 75
                          ? "#eab308"
                          : "#22c55e"
                      } 0%, ${
                        percentage >= 90
                          ? "#dc2626"
                          : percentage >= 75
                          ? "#ca8a04"
                          : "#16a34a"
                      } 100%)`,
                    }}
                  />
                </div>
                <span className={`text-xs font-medium ${getColor()}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Used:</span>
                  <span>{formatNumber(used)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Limit:</span>
                  <span>{formatNumber(usage.limit)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Resets daily at midnight UTC
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};