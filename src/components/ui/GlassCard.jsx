import { motion } from 'framer-motion';

/**
 * Reusable surface card.
 * Renders a motion.div with the design-system solid surface treatment.
 */
export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      className={`glass-card rounded-3xl ${hover ? 'hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(23,23,23,0.10)] transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
