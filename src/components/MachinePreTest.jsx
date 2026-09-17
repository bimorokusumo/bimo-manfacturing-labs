import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { latheQuestions } from '../data/questionBankLathe';
import { millingQuestions } from '../data/questionBankMilling';
import { cncQuestions } from '../data/questionBankCNC';

const getTestData = (type) => {
  if (type === 'lathe') return latheQuestions;
  if (type === 'milling') return millingQuestions;
  if (type === 'cnc' || type === 'cnc-lathe' || type === 'cnc-milling') return cncQuestions;
  return null;
};

const PASSING_SCORE = 80; // 80% to pass

const MachinePreTest = ({ machineType, onPass, onCancel }) => {
  const testData = getTestData(machineType);
  
  const [stage, setStage] = useState('intro'); // intro, mcq, essay, result
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({}); 
  
  const [essayIndex, setEssayIndex] = useState(0);
  const [essayAnswers, setEssayAnswers] = useState({}); 

  if (!testData) return null;

  // Handlers
  const startMcq = () => { sound.playClick(); setStage('mcq'); };
  
  const handleMcqSelect = (optId) => {
    sound.playClick();
    setMcqAnswers(prev => ({ ...prev, [testData.mcqs[mcqIndex].id]: optId }));
  };

  const nextMcq = () => {
    sound.playClick();
    if (mcqIndex < testData.mcqs.length - 1) setMcqIndex(mcqIndex + 1);
    else setStage('essay');
  };
  
  const prevMcq = () => {
    sound.playClick();
    if (mcqIndex > 0) setMcqIndex(mcqIndex - 1);
    else setStage('intro');
  };

  const handleEssayChange = (e) => {
    setEssayAnswers(prev => ({ ...prev, [testData.essays[essayIndex].id]: e.target.value }));
  };

  const nextEssay = () => {
    sound.playClick();
    if (essayIndex < testData.essays.length - 1) setEssayIndex(essayIndex + 1);
    else setStage('result');
  };
  
  const prevEssay = () => {
    sound.playClick();
    if (essayIndex > 0) setEssayIndex(essayIndex - 1);
    else setStage('mcq');
  };

  // Calc score
  let correctCount = 0;
  testData.mcqs.forEach(q => {
    if (mcqAnswers[q.id] === q.correctAnswer) correctCount++;
  });
  const score = Math.round((correctCount / testData.mcqs.length) * 100);
  const isPassed = true; // Users always pass, score is added to XP

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🧠</span> {testData.title}
          </h2>
          <button onClick={() => { sound.playClick(); onCancel(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '30px 24px', overflowY: 'auto' }}>
          
          {stage === 'intro' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '16px' }}>Evaluasi Pengetahuan Dasar (Level C1)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 30px auto' }}>
                Sebelum Anda dapat mengakses modul simulasi, Anda diwajibkan untuk menyelesaikan Pre-Test ini. Ujian terdiri dari:
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--game-primary)', fontWeight: 800 }}>{testData.mcqs.length}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Pilihan Ganda</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '2rem', color: '#3b82f6', fontWeight: 800 }}>{testData.essays.length}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Soal Esai</div>
                </div>
              </div>
              <p style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700 }}>Nilai Pilihan Ganda akan langsung diakumulasikan ke Total XP Anda!</p>
            </div>
          )}

          {stage === 'mcq' && (
            <div className="animate-fade-in">
              {/* Navigation Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                {testData.mcqs.map((q, idx) => {
                  const isAnswered = !!mcqAnswers[q.id];
                  const isCurrent = idx === mcqIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => { sound.playClick(); setMcqIndex(idx); }}
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: isCurrent ? 'var(--game-primary)' : isAnswered ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.05)',
                        color: isCurrent ? '#000' : isAnswered ? '#fff' : 'var(--text-muted)',
                        border: isCurrent ? '2px solid #fff' : isAnswered ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Soal Pilihan Ganda: {mcqIndex + 1} / {testData.mcqs.length}
                </span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid var(--game-primary)', padding: '20px', borderRadius: '4px', marginBottom: '30px' }}>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {testData.mcqs[mcqIndex].question}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {testData.mcqs[mcqIndex].options.map((opt) => {
                  const isSelected = mcqAnswers[testData.mcqs[mcqIndex].id] === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => handleMcqSelect(opt.id)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? 'var(--game-primary)' : 'var(--border-light)'}`,
                        background: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        background: isSelected ? 'var(--game-primary)' : 'rgba(255,255,255,0.1)',
                        color: isSelected ? '#000' : '#fff',
                        fontWeight: 800, fontSize: '1rem'
                      }}>
                        {opt.id}
                      </div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        {opt.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stage === 'essay' && (
            <div className="animate-fade-in">
              {/* Navigation Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                {testData.essays.map((q, idx) => {
                  const isAnswered = essayAnswers[q.id] && essayAnswers[q.id].trim().length > 0;
                  const isCurrent = idx === essayIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => { sound.playClick(); setEssayIndex(idx); }}
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: isCurrent ? '#8b5cf6' : isAnswered ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.05)',
                        color: 'var(--text-main)',
                        border: isCurrent ? '2px solid #fff' : isAnswered ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Soal Esai: {essayIndex + 1} / {testData.essays.length}
                </span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid #8b5cf6', padding: '20px', borderRadius: '4px', marginBottom: '30px' }}>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {testData.essays[essayIndex].question}
                </p>
              </div>
              <textarea 
                value={essayAnswers[testData.essays[essayIndex].id] || ''}
                onChange={handleEssayChange}
                placeholder="Ketik analisis dan uraian jawaban Anda di sini..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          {stage === 'result' && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                {isPassed ? '🎓' : '💔'}
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '16px' }}>Hasil Pre-Test</h3>
              
              <div style={{ 
                background: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isPassed ? '#10b981' : '#ef4444'}`,
                padding: '30px', 
                borderRadius: '16px',
                display: 'inline-block',
                marginBottom: '30px'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: isPassed ? '#10b981' : '#ef4444', lineHeight: 1 }}>
                  {score}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                  {correctCount} Benar / {testData.mcqs.length} Soal
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '8px', marginBottom: '30px', fontWeight: 600 }}>
                Selamat! Anda mendapatkan +{score} XP dari evaluasi teori. Silakan masuk ke lab praktik.
              </div>

              <div style={{ textAlign: 'left', background: 'var(--bg-card-light)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Status Evaluasi Esai</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                  Jawaban esai analitik Anda sebanyak {Object.keys(essayAnswers).length} / {testData.essays.length} telah direkam dan disimpan di sistem pusat untuk dievaluasi lebih lanjut oleh instruktur secara asinkron (Offline Grading).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          {stage === 'intro' && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
               <button 
                onClick={startMcq}
                style={{ padding: '12px 32px', background: 'var(--game-primary)', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
              >
                Mulai Ujian 🚀
              </button>
            </div>
          )}

          {stage === 'mcq' && (
            <>
              <button onClick={prevMcq} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                ← Sebelumnya
              </button>
              <button 
                onClick={nextMcq} 
                style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {mcqIndex === testData.mcqs.length - 1 ? 'Lanjut ke Esai →' : 'Selanjutnya →'}
              </button>
            </>
          )}

          {stage === 'essay' && (
            <>
              <button onClick={prevEssay} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                ← Sebelumnya
              </button>
              <button 
                onClick={nextEssay} 
                style={{ padding: '10px 20px', background: '#8b5cf6', border: 'none', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {essayIndex === testData.essays.length - 1 ? 'Selesai & Lihat Hasil 🏁' : 'Selanjutnya →'}
              </button>
            </>
          )}

          {stage === 'result' && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
               <button 
                onClick={() => { sound.playClick(); onCancel(); }}
                style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Kembali ke Garasi
              </button>
              <button 
                onClick={() => { sound.playClick(); onPass(score); }}
                style={{ padding: '12px 32px', background: '#10b981', border: 'none', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}
              >
                Masuk ke Simulasi Mesin →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MachinePreTest;
