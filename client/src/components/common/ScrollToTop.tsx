import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      const scrollingElement = document.scrollingElement;
      const scrollRoots = document.querySelectorAll('[data-scroll-root]');

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (scrollingElement) scrollingElement.scrollTop = 0;
      scrollRoots.forEach((node) => {
        node.scrollTop = 0;
      });
    };

    scrollToTop();
    const rafId = window.requestAnimationFrame(scrollToTop);
    const timerId = window.setTimeout(scrollToTop, 0);
    const delayedTimerId = window.setTimeout(scrollToTop, navigationType === 'POP' ? 80 : 32);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      window.clearTimeout(delayedTimerId);
    };
  }, [key, navigationType]);

  return null;
}
