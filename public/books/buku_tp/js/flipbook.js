/**
 * 3D FLIPBOOK ENGINE (INTERACTIVE PHYSICAL BOOK METAPHOR)
 * Direct Page-Click Turning, Corner Curl Pull, Drag-to-Turn, and Opening Animation
 */

class FlipBook {
  constructor(stageSelector, pageSelector) {
    this.stage = document.querySelector(stageSelector);
    this.pages = Array.from(document.querySelectorAll(pageSelector));
    this.totalPages = this.pages.length;
    this.currentPage = 0; // 0-indexed: 0 = Cover
    this.isSingleMode = window.innerWidth <= 1024;
    this.isAnimating = false;

    // UI elements
    this.btnPrev = document.getElementById('btnPrevPage');
    this.btnNext = document.getElementById('btnNextPage');
    this.pageSlider = document.getElementById('pageSlider');
    this.pageCounter = document.getElementById('pageCounterDisplay');
    this.progressBar = document.getElementById('readingProgressFill');

    this.init();
  }

  init() {
    this.checkDisplayMode();
    window.addEventListener('resize', () => {
      const prevMode = this.isSingleMode;
      this.checkDisplayMode();
      if (prevMode !== this.isSingleMode) {
        this.renderPages();
      }
    });

    // Page slider listener
    if (this.pageSlider) {
      this.pageSlider.max = this.totalPages - 1;
      this.pageSlider.value = 0;
      this.pageSlider.addEventListener('input', (e) => {
        this.goToPage(parseInt(e.target.value, 10));
      });
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => this.prev());
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.next());
    }

    // DIRECT PAGE-CLICK FLIPPING (Klik Halaman untuk Membuka / Membalik Buku)
    this.pages.forEach((page, idx) => {
      page.addEventListener('click', (e) => {
        const mode = document.body.dataset.viewMode;
        if (mode !== 'flipbook') return;

        // Ignore clicks on interactive controls
        if (e.target.closest('button, input, select, textarea, a, .quiz-option, .caliper-sim-container, .arc-lab-container, .apd-item-btn, .r5-badge-card, .electrode-select-pill, .defect-card-wrapper, .modal-window')) {
          return;
        }

        // Clicking on Cover (Page 0) OPENS THE BOOK
        if (this.currentPage === 0) {
          this.next();
          return;
        }

        // In dual-spread mode
        if (!this.isSingleMode) {
          if (page.classList.contains('page-right')) {
            this.next();
          } else if (page.classList.contains('page-left')) {
            this.prev();
          }
        } else {
          // In single page mode, clicking right half moves forward, left half moves back
          const rect = page.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.45) {
            this.next();
          } else {
            this.prev();
          }
        }
      });
    });

    // Dedicated listeners for Corner Curls
    document.querySelectorAll('.corner-curl.bottom-right').forEach(curl => {
      curl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    });

    document.querySelectorAll('.corner-curl.bottom-left').forEach(curl => {
      curl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
      });
    });

    // Cover Prompt Click
    const coverPrompt = document.querySelector('.cover-open-prompt');
    if (coverPrompt) {
      coverPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const mode = document.body.dataset.viewMode;
      if (mode !== 'flipbook') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.prev();
      } else if (e.key === 'Home') {
        this.goToPage(0);
      } else if (e.key === 'End') {
        this.goToPage(this.totalPages - 1);
      }
    });

    // Interactive Drag / Swipe to turn pages
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;

    const startDrag = (x, y) => {
      dragStartX = x;
      dragStartY = y;
      isDragging = true;
    };

    const endDrag = (x, y) => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = x - dragStartX;
      const diffY = y - dragStartY;

      // Check horizontal drag
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    };

    // Mouse drag support
    this.stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, input, select, textarea, a, .quiz-option, .caliper-sim-container, .arc-lab-container')) return;
      startDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      endDrag(e.clientX, e.clientY);
    });

    // Touch support
    this.stage.addEventListener('touchstart', (e) => {
      if (e.target.closest('button, input, select, textarea, a, .quiz-option, .caliper-sim-container, .arc-lab-container')) return;
      startDrag(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
    }, { passive: true });

    this.stage.addEventListener('touchend', (e) => {
      endDrag(e.changedTouches[0].screenX, e.changedTouches[0].screenY);
    }, { passive: true });

    this.renderPages();
  }

  checkDisplayMode() {
    this.isSingleMode = window.innerWidth <= 1024;
    if (this.isSingleMode) {
      this.stage.classList.add('single-page-mode');
    } else {
      this.stage.classList.remove('single-page-mode');
    }
  }

  renderPages() {
    this.pages.forEach((page) => {
      page.className = 'book-page';
      page.style.display = 'none';
      page.style.zIndex = 1;
      page.style.transform = '';
    });

    if (this.isSingleMode) {
      // Single Page Mode
      const current = this.pages[this.currentPage];
      if (current) {
        current.classList.add('page-left');
        current.style.display = 'block';
        current.style.zIndex = 5;
      }
    } else {
      // Dual-Spread Mode (Two pages side by side)
      if (this.currentPage === 0) {
        // Cover is shown centered/right on the closed book
        const cover = this.pages[0];
        cover.classList.add('page-right');
        cover.style.display = 'block';
        cover.style.zIndex = 5;
      } else {
        // Even page on left, odd page on right
        let leftIdx = this.currentPage % 2 === 1 ? this.currentPage : this.currentPage - 1;
        let rightIdx = leftIdx + 1;

        if (leftIdx >= 0 && leftIdx < this.totalPages) {
          const leftPage = this.pages[leftIdx];
          leftPage.classList.add('page-left');
          leftPage.style.display = 'block';
          leftPage.style.zIndex = 5;
        }

        if (rightIdx < this.totalPages) {
          const rightPage = this.pages[rightIdx];
          rightPage.classList.add('page-right');
          rightPage.style.display = 'block';
          rightPage.style.zIndex = 5;
        }
      }
    }

    this.updateControls();
  }

  next() {
    if (this.isAnimating) return;

    const step = this.isSingleMode ? 1 : (this.currentPage === 0 ? 1 : 2);
    const target = this.currentPage + step;

    if (target < this.totalPages) {
      this.animateFlip(this.currentPage, target, 'next');
    }
  }

  prev() {
    if (this.isAnimating) return;

    const step = this.isSingleMode ? 1 : (this.currentPage <= 2 ? 1 : 2);
    const target = Math.max(0, this.currentPage - step);

    if (target !== this.currentPage) {
      this.animateFlip(this.currentPage, target, 'prev');
    }
  }

  goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= this.totalPages) return;
    if (pageIndex === this.currentPage) return;

    const direction = pageIndex > this.currentPage ? 'next' : 'prev';
    this.animateFlip(this.currentPage, pageIndex, direction);
  }

  animateFlip(fromPage, toPage, direction) {
    this.isAnimating = true;

    if (window.appAudio) {
      window.appAudio.playPageTurnSound();
    }

    // Immediate state switch with smooth transition
    this.currentPage = toPage;
    this.renderPages();

    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  updateControls() {
    const displayNum = this.currentPage + 1;
    if (this.pageCounter) {
      if (this.isSingleMode || this.currentPage === 0) {
        this.pageCounter.textContent = `Hal ${displayNum} / ${this.totalPages}`;
      } else {
        const rightNum = Math.min(this.currentPage + 2, this.totalPages);
        this.pageCounter.textContent = `Hal ${displayNum} - ${rightNum} / ${this.totalPages}`;
      }
    }

    if (this.pageSlider) {
      this.pageSlider.value = this.currentPage;
    }

    if (this.progressBar) {
      const pct = (this.currentPage / (this.totalPages - 1)) * 100;
      this.progressBar.style.width = `${pct}%`;
    }

    if (this.btnPrev) {
      this.btnPrev.disabled = this.currentPage <= 0;
    }

    if (this.btnNext) {
      this.btnNext.disabled = this.currentPage >= this.totalPages - 1;
    }
  }
}

window.FlipBook = FlipBook;
