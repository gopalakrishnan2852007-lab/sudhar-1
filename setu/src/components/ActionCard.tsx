"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ActionCardProps {
  step: number;
  title: string;
  description: string;
}

export function ActionCard({ step, title, description }: ActionCardProps) {
  const [completed, setCompleted] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.1 }}
      className={`neumorphic-card p-5 mb-4 relative overflow-hidden transition-all duration-300 ${completed ? 'brightness-75' : ''}`}
      onClick={() => setCompleted(!completed)}
    >
      {completed && (
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
      )}
      
      <div className="flex gap-4 items-start">
        <button className="mt-1 focus-ring rounded-full">
          {completed ? (
            <CheckCircle2 size={24} className="text-green-500" />
          ) : (
            <Circle size={24} className="text-primary" />
          )}
        </button>
        <div>
          <h3 className="text-lg font-bold text-textMain mb-1">
            <span className="text-primary mr-2">Step {step}:</span>
            {title}
          </h3>
          <p className="text-textMuted leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
