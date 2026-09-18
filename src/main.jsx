// =============================================================================
// GITHUB PAGES ASSET PATH RESOLVER
// Automatically fixes absolute paths (/assets/, /images/, /books/, etc.)
// to match the subpath environment (/bimo-manfacturing-labs/)
// Safely wrapped to prevent browser prototype errors from crashing the app
// =============================================================================
try {
  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl && baseUrl !== '/') {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    const fixUrl = (url) => {
      if (typeof url !== 'string') return url;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
      }
      if (url.startsWith('/') && !url.startsWith(cleanBase)) {
        if (
          url.startsWith('/assets/') ||
          url.startsWith('/images/') ||
          url.startsWith('/books/') ||
          url.startsWith('/favicon.svg') ||
          url.startsWith('/icons.svg') ||
          url.startsWith('/Knuth')
        ) {
          return cleanBase + encodeURI(decodeURI(url.slice(1)));
        }
      }
      return url;
    };

    // 1. Hook HTMLImageElement.src property safely
    try {
      const originalImgDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      if (originalImgDescriptor && originalImgDescriptor.set) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
          set(val) {
            return originalImgDescriptor.set.call(this, fixUrl(val));
          },
          get() {
            return originalImgDescriptor.get.call(this);
          }
        });
      }
    } catch (e) {
      console.warn('[AssetResolver] Failed to hook HTMLImageElement.src:', e);
    }

    // 2. Hook Element.prototype.setAttribute safely
    try {
      const originalSetAttr = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function(name, val) {
        if (name === 'src' && typeof val === 'string') {
          val = fixUrl(val);
        }
        return originalSetAttr.call(this, name, val);
      };
    } catch (e) {
      console.warn('[AssetResolver] Failed to hook setAttribute:', e);
    }

    // 3. Hook window.fetch safely
    try {
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        if (typeof input === 'string') {
          input = fixUrl(input);
        }
        return originalFetch.call(this, input, init);
      };
    } catch (e) {
      console.warn('[AssetResolver] Failed to hook window.fetch:', e);
    }

    // 4. Hook XMLHttpRequest.open safely
    try {
      const originalXhrOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string') {
          url = fixUrl(url);
        }
        return originalXhrOpen.call(this, method, url, ...rest);
      };
    } catch (e) {
      console.warn('[AssetResolver] Failed to hook XMLHttpRequest.open:', e);
    }
  }
} catch (err) {
  console.warn('[AssetResolver] Setup error:', err);
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
