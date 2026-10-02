import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { latheQuestions } from '../data/questionBankLathe';
import { recordQuizResult } from '../services/sheetService';

const LatheTestView = ({ addXP, onStartPractical }) => {
  const testData = latheQuestions;

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
      modul: 'Machine Lab - Lathe Test',
      judulKuis: 'Soal Test Kompetensi Mesin Bubut',
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
            📝
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>
              SOAL TEST EVALUASI MESIN BUBUT (LATHE)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Uji pemahaman prinsip permesinan bubut, komponen utama, parameter potong RPM, dan keselamatan kerja (K3)
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
            <span>⚙️ Menuju Proses Pemotongan</span> →
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
                  {finalScore >= 75 ? '🎉 Selamat! Hasil Kompetensi Sangat Baik' : '⚠️ Masih Perlu Latihan & Penguatan Konsep'}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                  Skor Anda: <strong>{finalScore}/100</strong> ({correctCount} dari {totalMcq} Pilihan Ganda Benar). 
                  Nilai otomatis tersimpan ke Spreadsheet Nilai Siswa!
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

          {/* Active Question Box */}
          {(() => {
            const currentQ = testData.mcqs[mcqIndex];
            const currentAnswer = mcqAnswers[currentQ.id];

            return (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    SOAL PILIHAN GANDA {mcqIndex + 1} DARI {totalMcq}
                  </span>
                  {currentAnswer ? (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>✓ Sudah Dijawab</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Belum Dijawab</span>
                  )}
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', lineHeight: 1.6 }}>
                  {currentQ.question}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.options.map(opt => {
                    const isSelected = currentAnswer === opt.id;
                    const isKeyCorrect = currentQ.correctAnswer === opt.id;

                    let optBg = '#1e293b';
                    let optBorder = '#334155';
                    let optColor = '#cbd5e1';

                    if (isSubmitted || showReview) {
                      if (isKeyCorrect) {
                        optBg = 'rgba(16, 185, 129, 0.2)';
                        optBorder = '#10b981';
                        optColor = '#6ee7b7';
                      } else if (isSelected && !isKeyCorrect) {
                        optBg = 'rgba(239, 68, 68, 0.2)';
                        optBorder = '#ef4444';
                        optColor = '#fca5a5';
                      }
                    } else if (isSelected) {
                      optBg = 'rgba(2, 132, 199, 0.2)';
                      optBorder = '#38bdf8';
                      optColor = '#ffffff';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          background: optBg,
                          border: `1.5px solid ${optBorder}`,
                          cursor: isSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? '#38bdf8' : '#334155',
                          color: isSelected ? '#0f172a' : '#ffffff',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 900,
                          fontSize: '0.85rem'
                        }}>
                          {opt.id}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.92rem', color: optColor, fontWeight: isSelected ? 700 : 500 }}>
                          {opt.text}
                        </div>
                        {(isSubmitted || showReview) && isKeyCorrect && (
                          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>✓ Jawaban Benar</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {(showReview || isSubmitted) && currentQ.explanation && (
                  <div style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.1)',
                    border: '1px solid #0284c7',
                    fontSize: '0.88rem',
                    color: '#cbd5e1',
                    lineHeight: 1.5
                  }}>
                    💡 <strong style={{ color: '#38bdf8' }}>Pembahasan:</strong> {currentQ.explanation}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                  <button
                    disabled={mcqIndex === 0}
                    onClick={() => { sound.playClick(); setMcqIndex(prev => Math.max(0, prev - 1)); }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: mcqIndex === 0 ? '#64748b' : '#ffffff',
                      cursor: mcqIndex === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    ← Sebelumnya
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {mcqIndex < totalMcq - 1 ? (
                      <button
                        onClick={() => { sound.playClick(); setMcqIndex(prev => prev + 1); }}
                        style={{
                          padding: '8px 20px',
                          borderRadius: '8px',
                          background: '#0284c7',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        Selanjutnya →
                      </button>
                    ) : (
                      !isSubmitted && (
                        <button
                          onClick={handleSubmit}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                          }}
                        >
                          Kirim & Selesaikan Tes 🚀
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* SECTION B: ESSAYS */}
      {activeSubTab === 'essay' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {testData.essays.map((essay, idx) => (
            <div key={essay.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                SOAL ESAI {idx + 1}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', lineHeight: 1.5 }}>
                {essay.question}
              </div>

              <textarea
                rows="4"
                disabled={isSubmitted}
                placeholder="Tuliskan jawaban analisis Anda di sini..."
                value={essayAnswers[essay.id] || ''}
                onChange={(e) => handleEssayChange(essay.id, e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />

              {(showReview || isSubmitted) && essay.modelAnswer && (
                <div style={{ marginTop: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #d97706', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#fde68a' }}>
                  💡 <strong>Kunci Jawaban Model:</strong> {essay.modelAnswer}
                </div>
              )}
            </div>
          ))}

          {!isSubmitted && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                Kirim & Selesaikan Tes 🚀
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default LatheTestView;
