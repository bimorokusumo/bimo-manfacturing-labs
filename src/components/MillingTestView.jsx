import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { millingQuestions } from '../data/questionBankMilling';
import { recordQuizResult } from '../services/sheetService';

const MillingTestView = ({ addXP, onStartPractical }) => {
  const testData = millingQuestions;

  const [activeSubTab, setActiveSubTab] = useState('mcq'); // 'mcq' | 'essay'
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const totalMcq = testData.mcqs.length;
  const answeredMcqCount = Object.keys(mcqAnswers).length;

  const handleSelectOption = (qId, optionId) => {
    if (isSubmitted) return;
    sound.playClick();
    setMcqAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const handleEssayChange = (qId, text) => {
    if (isSubmitted) return;
    setEssayAnswers(prev => ({ ...prev, [qId]: text }));
  };

  // Calculate Score
  let correctCount = 0;
  testData.mcqs.forEach(q => {
    if (mcqAnswers[q.id] === q.correctAnswer) correctCount++;
  });
  const finalScore = Math.round((correctCount / totalMcq) * 100);

  const handleSubmit = () => {
    sound.playSuccess();
    setIsSubmitted(true);

    // Give XP reward
    const xpReward = Math.round(finalScore * 10);
    if (addXP && xpReward > 0) {
      addXP(xpReward);
    }

    // Record result to Google Spreadsheet
    recordQuizResult({
      modul: 'Machine Lab - Milling Test',
      judulKuis: 'Soal Test Kompetensi Mesin Frais',
      skor: finalScore,
      jawabanBenar: correctCount,
      totalSoal: totalMcq,
      detailJawaban: `Pilihan Ganda: ${correctCount}/${totalMcq} Benar. Esai terjawab: ${Object.keys(essayAnswers).length}/${testData.essays.length} soal.`
    });
  };

  const handleResetTest = () => {
    sound.playClick();
    setMcqAnswers({});
    setEssayAnswers({});
    setIsSubmitted(false);
    setShowReview(false);
    setMcqIndex(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid #f59e0b',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
          }}>
            🪵
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>
              SOAL TEST EVALUASI MESIN FRAIS (MILLING)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Uji pemahaman prinsip permesinan frais, ragum & parallel block, jenis cutter (Endmill/Face Mill), Up/Down Milling, dan K3
            </p>
          </div>
        </div>

        {onStartPractical && (
          <button
            onClick={() => { sound.playClick(); onStartPractical(); }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>⚙️ Menuju Simulator Frais</span> →
          </button>
        )}
      </div>

      {/* RESULT CARD IF SUBMITTED */}
      {isSubmitted && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: `2px solid ${finalScore >= 75 ? '#10b981' : '#f59e0b'}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: finalScore >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: `3px solid ${finalScore >= 75 ? '#10b981' : '#f59e0b'}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: finalScore >= 75 ? '#10b981' : '#f59e0b'
              }}>
                {finalScore}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {finalScore >= 75 ? '🎉 Selamat! Hasil Evaluasi Teori Frais Sangat Baik' : '⚠️ Masih Perlu Latihan & Pendalaman Konsep Frais'}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                  Skor Anda: <strong>{finalScore}/100</strong> ({correctCount} dari {totalMcq} Pilihan Ganda Benar). 
                  Nilai otomatis tercatat ke kolom <strong>🪵 Test Teori Mesin Frais</strong> di Spreadsheet!
                </div>
                <div style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800 }}>
                  +{Math.round(finalScore * 10)} XP Diperoleh
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowReview(prev => !prev)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: showReview ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: showReview ? '#0f172a' : '#38bdf8',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {showReview ? 'Sembunyikan Kunci Pembahasan' : '🔍 Lihat Kunci Pembahasan'}
              </button>
              <button
                onClick={handleResetTest}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                🔄 Ulangi Tes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TABS: MCQ VS ESSAY */}
      <div style={{ display: 'flex', gap: '8px', background: '#0b1120', padding: '6px', borderRadius: '10px', border: '1px solid #1e293b' }}>
        <button
          onClick={() => { sound.playClick(); setActiveSubTab('mcq'); }}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: activeSubTab === 'mcq' ? '2px solid #38bdf8' : 'none',
            background: activeSubTab === 'mcq' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeSubTab === 'mcq' ? '#38bdf8' : '#94a3b8',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          📋 Bagian A: Pilihan Ganda ({answeredMcqCount}/{totalMcq} Terjawab)
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveSubTab('essay'); }}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: activeSubTab === 'essay' ? '2px solid #f59e0b' : 'none',
            background: activeSubTab === 'essay' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeSubTab === 'essay' ? '#f59e0b' : '#94a3b8',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          ✍️ Bagian B: Soal Esai Teori ({Object.keys(essayAnswers).length}/{testData.essays.length} Dijawab)
        </button>
      </div>

      {/* SECTION A: MCQ */}
      {activeSubTab === 'mcq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Question Number Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            {testData.mcqs.map((q, idx) => {
              const isAnswered = !!mcqAnswers[q.id];
              const isCurrent = idx === mcqIndex;
              const isCorrect = isSubmitted && mcqAnswers[q.id] === q.correctAnswer;
              const isWrong = isSubmitted && isAnswered && !isCorrect;

              let bgColor = '#1e293b';
              let borderColor = '#334155';
              let textColor = '#94a3b8';

              if (isSubmitted) {
                if (isCorrect) {
                  bgColor = 'rgba(16, 185, 129, 0.25)';
                  borderColor = '#10b981';
                  textColor = '#6ee7b7';
                } else if (isWrong) {
                  bgColor = 'rgba(239, 68, 68, 0.25)';
                  borderColor = '#ef4444';
                  textColor = '#fca5a5';
                }
              } else {
                if (isCurrent) {
                  bgColor = '#0284c7';
                  borderColor = '#38bdf8';
                  textColor = '#ffffff';
                } else if (isAnswered) {
                  bgColor = 'rgba(56, 189, 248, 0.2)';
                  borderColor = '#0284c7';
                  textColor = '#38bdf8';
                }
              }

              return (
                <button
                  key={q.id}
                  onClick={() => { sound.playClick(); setMcqIndex(idx); }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    color: textColor,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active MCQ Question Card */}
          {(() => {
            const currentQ = testData.mcqs[mcqIndex];
            const currentSelected = mcqAnswers[currentQ.id];

            return (
              <div style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px 28px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: '#1e293b',
                    color: '#38bdf8',
                    fontSize: '0.85rem',
                    fontWeight: 800
                  }}>
                    SOAL #{mcqIndex + 1} DARI {totalMcq}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Bobot Nilai: 1 Poin
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.6, marginBottom: '24px' }}>
                  {currentQ.question}
                </div>

                {/* Option Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.options.map(opt => {
                    const isSelected = currentSelected === opt.id;
                    const isCorrect = isSubmitted && opt.id === currentQ.correctAnswer;
                    const isSelectedWrong = isSubmitted && isSelected && !isCorrect;

                    let optBg = '#1e293b';
                    let optBorder = '#334155';
                    let optColor = '#cbd5e1';

                    if (isSubmitted) {
                      if (isCorrect) {
                        optBg = 'rgba(16, 185, 129, 0.2)';
                        optBorder = '#10b981';
                        optColor = '#6ee7b7';
                      } else if (isSelectedWrong) {
                        optBg = 'rgba(239, 68, 68, 0.2)';
                        optBorder = '#ef4444';
                        optColor = '#fca5a5';
                      }
                    } else if (isSelected) {
                      optBg = 'rgba(2, 132, 199, 0.2)';
                      optBorder = '#0284c7';
                      optColor = '#38bdf8';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          background: optBg,
                          border: `1.5px solid ${optBorder}`,
                          color: optColor,
                          fontSize: '0.95rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: isSubmitted ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isSelected ? (isSubmitted ? (isCorrect ? '#10b981' : '#ef4444') : '#0284c7') : '#334155',
                          color: '#ffffff',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}>
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card when submitted or review enabled */}
                {(isSubmitted && showReview) && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: '#38bdf8' }}>💡 Penjelasan & Kunci: </strong>
                    Jawaban yang benar adalah <strong>{currentQ.correctAnswer}</strong>. {currentQ.explanation}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', alignItems: 'center' }}>
                  <button
                    disabled={mcqIndex === 0}
                    onClick={() => { sound.playClick(); setMcqIndex(prev => prev - 1); }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: mcqIndex === 0 ? '#1e293b' : '#334155',
                      border: 'none',
                      color: mcqIndex === 0 ? '#64748b' : '#ffffff',
                      fontWeight: 700,
                      cursor: mcqIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ← Soal Sebelumnya
                  </button>

                  {mcqIndex < totalMcq - 1 ? (
                    <button
                      onClick={() => { sound.playClick(); setMcqIndex(prev => prev + 1); }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: '#0284c7',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Soal Berikutnya →
                    </button>
                  ) : (
                    <button
                      onClick={() => { sound.playClick(); setActiveSubTab('essay'); }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: '#f59e0b',
                        border: 'none',
                        color: '#000000',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Lanjut ke Soal Esai →
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SECTION B: ESSAY */}
      {activeSubTab === 'essay' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#fbbf24',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            ✍️ <strong>Petunjuk Pengerjaan Esai:</strong> Jawablah pertanyaan esai teori mesin frais berikut ini dengan uraian teknis yang jelas. Jawaban Anda akan otomatis tersimpan ke catatan portofolio guru.
          </div>

          {testData.essays.map((essay, idx) => (
            <div key={essay.id} style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#f59e0b',
                  fontSize: '0.85rem',
                  fontWeight: 800
                }}>
                  SOAL ESAI #{idx + 1}
                </span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.5 }}>
                {essay.question}
              </div>
              <textarea
                rows={4}
                disabled={isSubmitted}
                value={essayAnswers[essay.id] || ''}
                onChange={(e) => handleEssayChange(essay.id, e.target.value)}
                placeholder="Tuliskan uraian analisis teknis Anda di sini..."
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '14px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* FOOTER ACTIONS: SUBMIT BUTTON */}
      {!isSubmitted && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Status Pengerjaan: {answeredMcqCount}/{totalMcq} Pilihan Ganda & {Object.keys(essayAnswers).length}/{testData.essays.length} Esai
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Pastikan Anda telah memeriksa kembali seluruh jawaban sebelum mengirimkan hasil tes.
            </div>
          </div>

          <button
            onClick={handleSubmit}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>🚀 Selesai & Kirim Nilai ke Spreadsheet</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default MillingTestView;
