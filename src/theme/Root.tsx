import React, {useEffect} from 'react';

export default function Root({children}) {
  useEffect(() => {
    const fixDirection = () => {
      document
        .querySelectorAll<HTMLElement>(
            '.theme-doc-markdown h1, ' +
            '.theme-doc-markdown h2, ' +
            '.theme-doc-markdown h3, ' +
            '.theme-doc-markdown h4, ' +
            '.theme-doc-markdown h5, ' +
            '.theme-doc-markdown h6, ' +
            '.theme-doc-markdown p, ' +
            '.theme-doc-markdown li'
        )
        .forEach((el) => {
            el.removeAttribute('dir');
            el.style.removeProperty('text-align');
        });
    };

    fixDirection();

    const observer = new MutationObserver(fixDirection);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}