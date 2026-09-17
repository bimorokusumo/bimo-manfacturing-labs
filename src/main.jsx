// =============================================================================
// GITHUB PAGES ASSET PATH RESOLVER
// Automatically fixes absolute paths (/assets/, /images/, /books/, etc.)
// to match the subpath environment (/bimo-manfacturing-labs/)
// =============================================================================
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

  // 1. Hook HTMLImageElement.src property
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

  // 2. Hook Element.prototype.setAttribute
  const originalSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, val) {
    if (name === 'src' && typeof val === 'string') {
      val = fixUrl(val);
    }
    return originalSetAttr.call(this, name, val);
  };

  // 3. Hook window.fetch
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string') {
      input = fixUrl(input);
    }
    return originalFetch.call(this, input, init);
  };

  // 4. Hook XMLHttpRequest.open
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string') {
      url = fixUrl(url);
    }
    return originalXhrOpen.call(this, method, url, ...rest);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
