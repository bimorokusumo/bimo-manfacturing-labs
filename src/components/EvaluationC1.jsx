import React, { useState } from 'react';
import { c1MultipleChoice, c1Essays } from '../data/questionBankC1';
import { sound } from '../utils/audio';

const EvaluationC1 = () => {
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleMcqSelect = (questionId, option) => {
    if (!isSubmitted) {
      sound.playClick();
      setMcqAnswers(prev => ({
        ...prev,
        [questionId]: option
      }));
    }
  };

  const handleEssayChange = (questionId, text) => {
    if (!isSubmitted) {
      setEssayAnswers(prev => ({
        ...prev,
        [questionId]: text
      }));
    }
  };

  const handleSubmit = () => {
    // Calculate Score for MCQ
    let correctCount = 0;
    c1MultipleChoice.forEach(q => {
      if (mcqAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });
    
    // MCQ Score out of 100 (each worth 4 points)
    const calculatedScore = (correctCount / c1MultipleChoice.length) * 100;
    setScore(calculatedScore);
    setIsSubmitted(true);
    sound.playSuccess();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setMcqAnswers({});
    setEssayAnswers({});
    setIsSubmitted(false);
    setScore(0);
    sound.playClick();
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* HEADER */}
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#050a14',
        padding: '40px',
        color: 'var(--text-main)',
        border: '1px solid rgba(0,225,255,0.2)',
        boxShadow: '0 0 30px rgba(0, 225, 255, 0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="game-badge badge-blue" style={{ marginBottom: '16px' }}>EVALUASI KOGNITIF (C1)</span>
          <h1 className="cyber-font" style={{ fontSize: '2.5rem', fontWeight: 800, textShadow: '0 0 10px rgba(0,225,255,0.5)', margin: '0 0 16px 0' }}>
            Dasar Teknik Manufaktur
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px' }}>
            Uji pengetahuan fundamental Anda meliputi Keselamatan Kerja (K3), Mesin Bubut, Mesin Frais, CNC, dan Ilmu Bahan. Ujian ini terdiri dari 25 soal pilihan ganda (Auto-grade) dan 5 soal essay (Manual-grade).
          </p>
        </div>
        
        {/* Decorative Grid Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'linear-gradient(rgba(0, 225, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 225, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px', opacity: 0.3, pointerEvents: 'none'
        }} />
      </div>

      {/* RESULTS BANNER (IF SUBMITTED) */}
      {isSubmitted && (
        <div style={{
          background: 'rgba(0, 255, 102, 0.1)',
          border: '1px solid var(--game-success)',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0,255,102,0.2)'
        }}>
          <h2 className="cyber-font" style={{ color: 'var(--game-success)', fontSize: '2rem', margin: '0 0 10px 0' }}>
            EVALUASI SELESAI
          </h2>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', textShadow: '0 0 15px var(--game-success)', margin: '20px 0' }}>
            {score.toFixed(0)} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
            Nilai di atas merupakan skor untuk Pilihan Ganda. Hasil Essay akan dievaluasi secara manual oleh instruktur.
          </p>
          <button 
            onClick={handleReset}
            className="btn-game btn-game-primary" 
            style={{ marginTop: '20px', padding: '12px 30px' }}
          >
            Ulangi Evaluasi
          </button>
        </div>
      )}

      {/* MULTIPLE CHOICE SECTION */}
      <h3 className="cyber-font" style={{ color: 'var(--game-tp)', fontSize: '1.8rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '10px', marginBottom: '24px' }}>
        A. Pilihan Ganda
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', gap: '20px', marginBottom: '50px' }}>
        {c1MultipleChoice.map((q, index) => (
          <div key={q.id} className="game-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 225, 255, 0.1)', border: '1px solid var(--game-tp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--game-tp)' }}>
                {index + 1}
              </div>
              <h4 style={{ flex: 1, margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {q.question}
              </h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {q.options.map((opt, i) => {
                const isSelected = mcqAnswers[q.id] === opt;
                let optionStyle = {
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--game-tp)' : '1px solid var(--border-light)',
                  background: isSelected ? 'rgba(0, 225, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? 'var(--game-tp)' : 'var(--text-muted)',
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                };

                // Coloring after submission
                if (isSubmitted) {
                  if (opt === q.answer) {
                    optionStyle.background = 'rgba(0, 255, 102, 0.1)';
                    optionStyle.border = '1px solid var(--game-success)';
                    optionStyle.color = 'var(--game-success)';
                  } else if (isSelected && opt !== q.answer) {
                    optionStyle.background = 'rgba(255, 51, 102, 0.1)';
                    optionStyle.border = '1px solid var(--game-danger)';
                    optionStyle.color = 'var(--game-danger)';
                  }
                }

                return (
                  <div 
                    key={i} 
                    onClick={() => handleMcqSelect(q.id, opt)}
                    style={optionStyle}
                    className={!isSubmitted ? 'hover-highlight' : ''}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', 
                      border: `2px solid ${isSelected ? 'currentColor' : 'var(--border-light)'}`,
                      background: isSelected ? 'currentColor' : 'transparent',
                      boxShadow: isSelected ? 'inset 0 0 0 3px var(--bg-card)' : 'none'
                    }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Show Explanation if submitted */}
            {isSubmitted && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--game-tp)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--game-tp)', fontWeight: 'bold', marginBottom: '4px' }}>PEMBAHASAN:</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{q.explanation}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ESSAY SECTION */}
      <h3 className="cyber-font" style={{ color: 'var(--game-purple)', fontSize: '1.8rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '10px', marginBottom: '24px' }}>
        B. Essay
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '50px' }}>
        {c1Essays.map((q, index) => (
          <div key={q.id} className="game-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid var(--game-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--game-purple)' }}>
                {index + 1}
              </div>
              <h4 style={{ flex: 1, margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {q.question}
              </h4>
            </div>
            
            <textarea 
              value={essayAnswers[q.id] || ''}
              onChange={(e) => handleEssayChange(q.id, e.target.value)}
              disabled={isSubmitted}
              placeholder={isSubmitted ? "Jawaban telah dikirim." : "Ketikkan jawaban Anda di sini..."}
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none',
                opacity: isSubmitted ? 0.7 : 1
              }}
            />
            
            {/* Show Expected Points if submitted */}
            {isSubmitted && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '8px', border: '1px dashed var(--game-purple)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--game-purple)', fontWeight: 'bold', marginBottom: '8px' }}>KUNCI JAWABAN (REFERENSI INSTRUKTUR):</div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {q.expectedPoints.map((point, ptIdx) => (
                    <li key={ptIdx} style={{ marginBottom: '4px' }}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SUBMIT BUTTON */}
      {!isSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <button 
            onClick={handleSubmit}
            className="btn-game btn-game-primary cyber-font"
            style={{ 
              fontSize: '1.2rem', 
              padding: '16px 48px', 
              boxShadow: '0 0 20px rgba(0, 225, 255, 0.4)' 
            }}
          >
            KIRIM JAWABAN
          </button>
        </div>
      )}

      {/* Global CSS injected specifically for option hover */}
      <style>{`
        .hover-highlight:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default EvaluationC1;
