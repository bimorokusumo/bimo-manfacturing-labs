/**
 * MAIN APP CONTROLLER
 * Viewport switching (Flipbook vs Reader), search, bookmarks, themes, audio narration
 */

class AppController {
  constructor() {
    this.currentMode = 'flipbook'; // 'flipbook' or 'reader'
    this.flipbook = null;
    this.init();
  }

  init() {
    document.body.dataset.viewMode = 'flipbook';

    // Initialize Flipbook engine
    this.flipbook = new FlipBook('.flipbook-stage', '.book-page');

    this.initModeSwitcher();
    this.initModals();
    this.initSearch();
    this.initAudioNarration();
    this.initThemeSwitcher();
    this.initTOCLinks();
    this.initStickyReaderSelect();
  }

  initModeSwitcher() {
    const btnToggle = document.getElementById('btnToggleMode');

    if (!btnToggle) return;

    btnToggle.addEventListener('click', () => {
      if (this.currentMode === 'flipbook') {
        // Switch to Reader Mode
        this.currentMode = 'reader';
        document.body.dataset.viewMode = 'reader';
        btnToggle.innerHTML = `<span>📖 Mode Flip Book</span>`;
        btnToggle.classList.add('active');

        // Scroll to corresponding page
        const curPage = this.flipbook.currentPage;
        const targetPage = document.getElementById(`p${curPage}`);
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Switch to Flipbook Mode
        this.currentMode = 'flipbook';
        document.body.dataset.viewMode = 'flipbook';
        btnToggle.innerHTML = `<span>📜 Mode Smart Reader</span>`;
        btnToggle.classList.remove('active');

        this.flipbook.renderPages();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Trigger canvas resize in simulators
      setTimeout(() => {
        if (window.arcLab) window.arcLab.resizeCanvas();
        if (window.caliperSim) window.caliperSim.resizeCanvas();
      }, 250);

      if (window.appAudio) window.appAudio.playClickSound();
    });
  }

  initStickyReaderSelect() {
    const select = document.getElementById('selectReaderJump');
    if (!select) return;

    select.addEventListener('change', (e) => {
      const pageId = `p${e.target.value}`;
      const target = document.getElementById(pageId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Update select on scroll when in reader mode
    window.addEventListener('scroll', () => {
      if (this.currentMode !== 'reader') return;
      const pages = document.querySelectorAll('.book-page');
      let currentIdx = 0;
      pages.forEach((p, idx) => {
        const rect = p.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          currentIdx = idx;
        }
      });
      select.value = currentIdx;
      this.flipbook.currentPage = currentIdx;
    });
  }

  initModals() {
    const openTOC = document.getElementById('btnOpenTOC');
    const modalTOC = document.getElementById('modalTOC');
    const closeTOC = document.getElementById('btnCloseTOC');

    const openSearch = document.getElementById('btnOpenSearch');
    const modalSearch = document.getElementById('modalSearch');
    const closeSearch = document.getElementById('btnCloseSearch');

    if (openTOC && modalTOC) {
      openTOC.addEventListener('click', () => {
        modalTOC.classList.add('active');
      });
      closeTOC.addEventListener('click', () => {
        modalTOC.classList.remove('active');
      });
    }

    if (openSearch && modalSearch) {
      openSearch.addEventListener('click', () => {
        modalSearch.classList.add('active');
        const input = document.getElementById('searchInput');
        if (input) input.focus();
      });
      closeSearch.addEventListener('click', () => {
        modalSearch.classList.remove('active');
      });
    }

    // Close on clicking backdrop
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });
  }

  initTOCLinks() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const modalTOC = document.getElementById('modalTOC');

    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageIdx = parseInt(link.dataset.page, 10);

        if (this.currentMode === 'flipbook') {
          this.flipbook.goToPage(pageIdx);
        } else {
          const target = document.getElementById(`p${pageIdx}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }

        if (modalTOC) modalTOC.classList.remove('active');
      });
    });
  }

  initSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const modalSearch = document.getElementById('modalSearch');

    if (!searchInput || !resultsContainer) return;

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (q.length < 2) {
        resultsContainer.innerHTML = `<li style="padding: 10px; color: #94a3b8; font-size: 0.85rem;">Ketik minimal 2 huruf untuk mencari topik materi...</li>`;
        return;
      }

      const pages = document.querySelectorAll('.book-page');
      let matches = [];

      pages.forEach((page, idx) => {
        const text = page.innerText;
        if (text.toLowerCase().includes(q)) {
          const heading = page.querySelector('h2, h1, .chapter-title')?.innerText || `Halaman ${idx + 1}`;
          const snippetIdx = text.toLowerCase().indexOf(q);
          const snippet = text.substring(Math.max(0, snippetIdx - 40), Math.min(text.length, snippetIdx + 80)).replace(/\n/g, ' ');
          matches.push({
            pageIdx: idx,
            heading: heading,
            snippet: snippet
          });
        }
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<li style="padding: 10px; color: #94a3b8; font-size: 0.85rem;">Tidak ditemukan hasil untuk "${q}".</li>`;
      } else {
        resultsContainer.innerHTML = matches.slice(0, 8).map(m => `
          <li class="search-result-item" data-page="${m.pageIdx}">
            <h4>${m.heading} <span style="font-size: 0.75rem; color: #94a3b8;">(Halaman ${m.pageIdx + 1})</span></h4>
            <p>...${m.snippet}...</p>
          </li>
        `).join('');

        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const pIdx = parseInt(item.dataset.page, 10);
            if (this.currentMode === 'flipbook') {
              this.flipbook.goToPage(pIdx);
            } else {
              const target = document.getElementById(`p${pIdx}`);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
            if (modalSearch) modalSearch.classList.remove('active');
          });
        });
      }
    });
  }

  initAudioNarration() {
    const audioButtons = document.querySelectorAll('.audio-read-btn');
    audioButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = btn.closest('.page-container');
        if (!section) return;

        if (window.appAudio.isSpeaking) {
          window.appAudio.stopSpeaking();
          btn.innerHTML = `🔊 Bacakan`;
        } else {
          btn.innerHTML = `⏹️ Berhenti`;
          window.appAudio.speakText(section.innerText, () => {
            btn.innerHTML = `🔊 Bacakan`;
          });
        }
      });
    });

    // Mute button
    const btnMute = document.getElementById('btnToggleMute');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const active = window.appAudio.toggleMute();
        btnMute.innerHTML = active ? `<span>🔊 Suara ON</span>` : `<span>🔇 Suara OFF</span>`;
        if (active) window.appAudio.playClickSound();
      });
    }
  }

  initThemeSwitcher() {
    const themeSelect = document.getElementById('selectTheme');
    if (!themeSelect) return;

    themeSelect.addEventListener('change', (e) => {
      document.body.dataset.theme = e.target.value;
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
