import { useRef, useEffect, useState } from 'react';

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 0.6,
  ease = 'cubic-bezier(0.22,1,0.36,1)',
  from = { opacity: 0, transform: 'translateY(40px)' },
  to   = { opacity: 1, transform: 'translateY(0px)' },
  threshold = 0.1,
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}) => {
  const ref      = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (visible && onLetterAnimationComplete) {
      const chars = Array.from(text);
      const total = (chars.length * delay) / 1000 + duration;
      const t = setTimeout(onLetterAnimationComplete, total * 1000);
      return () => clearTimeout(t);
    }
  }, [visible, text, delay, duration, onLetterAnimationComplete]);

  const chars = Array.from(text);
  const Tag   = tag || 'p';

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{ textAlign, display: 'inline-block', whiteSpace: 'normal', wordWrap: 'break-word' }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            ...from,
            ...(visible ? {
              ...to,
              transition: `opacity ${duration}s ${ease} ${(i * delay) / 1000}s, transform ${duration}s ${ease} ${(i * delay) / 1000}s`,
            } : {}),
          }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
