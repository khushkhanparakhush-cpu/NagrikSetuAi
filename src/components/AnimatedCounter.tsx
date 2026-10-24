import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  formatter?: (val: number) => string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  formatter = (v) => v.toLocaleString(),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsChanged(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsChanged(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className={`inline-flex items-baseline overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`tabular-nums font-semibold tracking-tight ${
            isChanged ? 'text-[#356AE6]' : ''
          }`}
        >
          {formatter(value)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
