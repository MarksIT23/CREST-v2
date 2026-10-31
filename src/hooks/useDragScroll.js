import { useRef, useCallback } from 'react';

/**
 * useDragScroll — enables click-and-drag horizontal scrolling on any container.
 *
 * Usage:
 *   const { ref, onMouseDown } = useDragScroll();
 *   <div ref={ref} onMouseDown={onMouseDown} className="overflow-x-auto ...">
 */
export default function useDragScroll() {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e) => {
    // Only trigger on left-click; ignore if clicking a button/link
    if (e.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.2; // scroll speed multiplier
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  const stopDragging = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = ref.current;
    if (!el) return;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseLeave: stopDragging,
    onMouseUp: stopDragging,
  };
}
