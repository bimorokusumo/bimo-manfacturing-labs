import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'vmlab_accessibility_prefs';

export const AccessibilityProvider = ({ children }) => {
  // =========================================================================
  // 1. STATE PREFERENSI INKLUSI & AKSESIBILITAS (PERSISTEN DI LOCALSTORAGE)
  // =========================================================================
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).fontSize || 'normal' : 'normal';
    } catch {
      return 'normal';
    }
  });

  const [isDyslexicFont, setIsDyslexicFont] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? !!JSON.parse(saved).isDyslexicFont : false;
    } catch {
      return false;
    }
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? !!JSON.parse(saved).isHighContrast : false;
    } catch {
      return false;
    }
  });

  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? !!JSON.parse(saved).isReducedMotion : false;
    } catch {
      return false;
    }
  });

  const [showCaptions, setShowCaptions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).showCaptions ?? true : true;
    } catch {
      return true;
    }
  });

  const [speechRate, setSpeechRate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).speechRate || 1.0 : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Modal Aksesibilitas
  const [isModalOpen, setIsModalOpen] = useState(false);

  // =========================================================================
  // 2. STATE AUDIO ENGINE (SPEECH SYNTHESIS)
  // =========================================================================
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentNarrativeTitle, setCurrentNarrativeTitle] = useState('');
  const [currentNarrativeText, setCurrentNarrativeText] = useState('');
  const [spokenSentenceIndex, setSpokenSentenceIndex] = useState(0);

  const utteranceRef = useRef(null);

  // Simpan preferensi ke LocalStorage setiap ada perubahan
  useEffect(() => {
    try {
      const prefs = {
        fontSize,
        isDyslexicFont,
        isHighContrast,
        isReducedMotion,
        showCaptions,
        speechRate
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.warn('Gagal menyimpan preferensi aksesibilitas:', err);
    }
  }, [fontSize, isDyslexicFont, isHighContrast, isReducedMotion, showCaptions, speechRate]);

  // Terapkan class accessibility pada elemen root HTML
  useEffect(() => {
    const root = document.documentElement;

    // Font scaling
    root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge');
    root.classList.add(`a11y-font-${fontSize}`);

    // Dyslexic font
    if (isDyslexicFont) {
      root.classList.add('a11y-dyslexic');
    } else {
      root.classList.remove('a11y-dyslexic');
    }

    // High contrast
    if (isHighContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }

    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('a11y-reduced-motion');
    } else {
      root.classList.remove('a11y-reduced-motion');
    }
  }, [fontSize, isDyslexicFont, isHighContrast, isReducedMotion]);

  // =========================================================================
  // 3. AUDIO NARRATION METHODS
  // =========================================================================
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, []);

  // Membacakan teks narasi
  const speakText = useCallback((text, title = 'Penjelasan Materi', options = {}) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Fitur audio pembaca teks (Speech Synthesis) tidak didukung pada peramban ini.');
      return;
    }

    if (!text || typeof text !== 'string') return;

    // Bersihkan HTML tags atau markdown jika ada
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`#]/g, '')
      .trim();

    if (!cleanText) return;

    // Batalkan audio yang sedang berjalan sebelumnya
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = options.rate || speechRate || 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pilih suara bahasa Indonesia jika tersedia di browser
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentNarrativeTitle(title);
      setCurrentNarrativeText(cleanText);
      setSpokenSentenceIndex(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      // Abaikan cancel biasa
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speechRate]);

  // Toggle play/pause/stop
  const toggleSpeak = useCallback((text, title = 'Penjelasan Materi') => {
    if (isSpeaking && currentNarrativeTitle === title) {
      if (isPaused) {
        resumeSpeech();
      } else {
        stopSpeech();
      }
    } else {
      speakText(text, title);
    }
  }, [isSpeaking, isPaused, currentNarrativeTitle, resumeSpeech, stopSpeech, speakText]);

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const value = {
    // Accessibility state
    fontSize,
    setFontSize,
    isDyslexicFont,
    setIsDyslexicFont,
    isHighContrast,
    setIsHighContrast,
    isReducedMotion,
    setIsReducedMotion,
    showCaptions,
    setShowCaptions,
    speechRate,
    setSpeechRate,

    // Modal state
    isModalOpen,
    setIsModalOpen,

    // Audio narration state & actions
    isSpeaking,
    isPaused,
    currentNarrativeTitle,
    currentNarrativeText,
    spokenSentenceIndex,
    speakText,
    toggleSpeak,
    pauseSpeech,
    resumeSpeech,
    stopSpeech
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility harus digunakan di dalam AccessibilityProvider');
  }
  return context;
};
