import React, { useState, Suspense, lazy } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';

// LAZY LOADING MODUL LAB (Mencegah beban unduhan besar diawal & mempercepat akses)
const MachineLab = lazy(() => import('./components/MachineLab'));
const WeldingSimulator = lazy(() => import('./components/WeldingSimulator'));
const SafetyK3Game = lazy(() => import('./components/SafetyK3Game'));
const DesignLab = lazy(() => import('./components/DesignLab'));
const EvaluationView = lazy(() => import('./components/EvaluationView'));
const ModulesView = lazy(() => import('./components/ModulesView'));
const VirtualBengkel = lazy(() => import('./components/VirtualBengkel'));
const MeasuringToolsLab = lazy(() => import('./components/MeasuringToolsLab'));
const CuttingToolsLab = lazy(() => import('./components/CuttingToolsLab'));
const HeatTreatmentLab = lazy(() => import('./components/HeatTreatmentLab'));
const MekanikaTeknikLab = lazy(() => import('./components/MekanikaTeknikLab'));
const TeacherGradebook = lazy(() => import('./components/TeacherGradebook'));
const DiagnosticTestView = lazy(() => import('./components/DiagnosticTestView'));

import StudentLoginModal from './components/StudentLoginModal';
import { sound } from './utils/audio';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { StudentProvider, useStudent } from './context/StudentContext';
import AccessibilityModal from './components/AccessibilityModal';
import AccessibilityFloatingWidget from './components/AccessibilityFloatingWidget';
import LiveCaptionsOverlay from './components/LiveCaptionsOverlay';

function AppInner() {
  const { isLoggedIn, openLoginModal, isTeacher } = useStudent();
  const [isStarted, setIsStarted] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSoundMuted, setIsSoundMuted] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalXP, setGlobalXP] = useState(0); // Dimulai dari 0
  const [completedMissions, setCompletedMissions] = useState(0); // Dimulai dari 0
  
  const totalMissions = 18;

  // Calculate Level (Max Level 10, each level requires 500 XP)
  const calculateLevel = (xp) => {
    const level = Math.min(10, Math.floor(xp / 500) + 1);
    
    // Level Titles
    const titles = [
      "Newbie", "Trainee", "Mechanical Apprentice", "Machinist I",
      "Machinist II", "Senior Machinist", "Expert Operator", 
      "Master Operator", "CNC Specialist", "Grandmaster"
    ];
    
    const title = titles[level - 1] || "Apprentice";
    const nextLevelXP = level < 10 ? level * 500 : xp; // If max level, next XP is just current XP
    const currentLevelBaseXP = (level - 1) * 500;
    
    // XP progress in current level
    const xpInCurrentLevel = xp - currentLevelBaseXP;
    const xpNeededForNextLevel = 500;
    
    return { level, title, nextLevelXP, currentLevelBaseXP, xpInCurrentLevel, xpNeededForNextLevel };
  };

  const levelInfo = calculateLevel(globalXP);

  const addXP = (amount) => {
    setGlobalXP(prev => prev + amount);
  };

  const addMissionCompleted = () => {
    setCompletedMissions(prev => Math.min(totalMissions, prev + 1));
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsSidebarOpen(isSidebarOpen); // Just to satisfy linter or avoid unused
    setIsSoundMuted(muted);
  };

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return <DashboardView onSelectLab={(lab) => setActiveMenu(lab)} globalXP={globalXP} levelInfo={levelInfo} completedMissions={completedMissions} totalMissions={totalMissions} />;
      case 'modules':
        return <ModulesView />;
      case 'machine':
        return <MachineLab addXP={addXP} addMissionCompleted={addMissionCompleted} />;
      case 'cutting-tools':
        return <CuttingToolsLab addXP={addXP} addMissionCompleted={addMissionCompleted} />;
      case 'heat-treatment':
      case 'heat-treatment-hardening':
      case 'heat-treatment-quenching':
      case 'heat-treatment-tempering':
      case 'heat-treatment-annealing':
      case 'heat-treatment-normalizing':
      case 'heat-treatment-case-hardening':
      case 'heat-treatment-blackening':
        return (
          <HeatTreatmentLab
            initialTab={
              activeMenu === 'heat-treatment-blackening' ? 'blackening' :
              activeMenu === 'heat-treatment-quenching' ? 'quenching' :
              activeMenu === 'heat-treatment-tempering' ? 'tempering' :
              activeMenu === 'heat-treatment-annealing' ? 'annealing' :
              activeMenu === 'heat-treatment-normalizing' ? 'normalizing' :
              activeMenu === 'heat-treatment-case-hardening' ? 'case-hardening' :
              'hardening'
            }
            addXP={addXP}
            addMissionCompleted={addMissionCompleted}
          />
        );
      case 'mechanics':
      case 'mechanics-torque':
      case 'mechanics-lever':
      case 'mechanics-equilibrium':
      case 'mechanics-stress':
      case 'mechanics-pulley':
      case 'mechanics-friction':
      case 'mechanics-calculator':
        return (
          <MekanikaTeknikLab
            initialTab={
              activeMenu === 'mechanics-torque' ? 'torque' :
              activeMenu === 'mechanics-lever' ? 'lever' :
              activeMenu === 'mechanics-equilibrium' ? 'equilibrium' :
              activeMenu === 'mechanics-stress' ? 'stress' :
              activeMenu === 'mechanics-pulley' ? 'pulley' :
              activeMenu === 'mechanics-friction' ? 'friction' :
              activeMenu === 'mechanics-calculator' ? 'calculator' :
              'torque'
            }
            addXP={addXP}
            addMissionCompleted={addMissionCompleted}
          />
        );
      case 'welding':
        return <WeldingSimulator />;
      case 'measuring':
        return <MeasuringToolsLab addXP={addXP} addMissionCompleted={addMissionCompleted} />;
      case 'safety':
        return <SafetyK3Game />;
      case 'virtual-bengkel':
        return <VirtualBengkel />;
      case 'design':
        return <DesignLab />;

      case 'diagnostic':
      case 'diagnostic-komprehensif':
      case 'diagnostic-mesin_konvensional':
      case 'diagnostic-alat_ukur':
      case 'diagnostic-k3_5r':
      case 'diagnostic-pengelasan': {
        const cat = activeMenu.startsWith('diagnostic-') ? activeMenu.replace('diagnostic-', '') : 'komprehensif';
        return <DiagnosticTestView initialCategory={cat} />;
      }
      case 'evaluasi':
      case 'evaluasi-c1':
        return <EvaluationView />;
      case 'gradebook':
        return isTeacher ? (
          <TeacherGradebook />
        ) : (
          <DashboardView onSelectLab={(lab) => setActiveMenu(lab)} globalXP={globalXP} levelInfo={levelInfo} completedMissions={completedMissions} totalMissions={totalMissions} />
        );
      default:
        return <DashboardView onSelectLab={(lab) => setActiveMenu(lab)} globalXP={globalXP} levelInfo={levelInfo} completedMissions={completedMissions} totalMissions={totalMissions} />;
    }
  };

  if (!isStarted) {
    return (
      <>
        <LandingPage
          onStart={() => {
            if (isLoggedIn) {
              setIsStarted(true);
            } else {
              openLoginModal(() => setIsStarted(true));
            }
          }}
          onOpenGradebook={() => {
            if (isTeacher) {
              setIsStarted(true);
              setActiveMenu('gradebook');
            }
          }}
          onOpenLogin={() => openLoginModal()}
        />
        <StudentLoginModal />
        <AccessibilityModal />
      </>
    );
  }

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-game)' }}>
      {/* BACKDROP OVERLAY FOR MOBILE & LANDSCAPE */}
      {isSidebarOpen && (
        <div 
          className="app-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        onLogout={() => setIsStarted(false)} 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <div 
        className="app-main-content"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? '260px' : '0',
          width: isSidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: isSidebarOpen ? 'calc(100vw - 260px)' : '100vw',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out, max-width 0.3s ease-in-out',
          overflowX: 'hidden'
        }}
      >
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenGradebook={() => setActiveMenu('gradebook')}
          onLogout={() => setIsStarted(false)}
        />
        
        <main className="app-main-body" style={{ padding: '20px 16px', flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, maxWidth: '100%' }}>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '55vh',
              gap: '16px'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                border: '4px solid rgba(245, 158, 11, 0.2)',
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{
                fontWeight: 800,
                color: '#f59e0b',
                fontSize: '0.92rem',
                letterSpacing: '1px',
                fontFamily: "'Chakra Petch', sans-serif"
              }}>
                MEMUAT MODUL LAB...
              </div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>
      </div>

      {/* GLOBAL SOUND TOGGLE */}
      <div className="app-sound-toggle-btn" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        <button 
          onClick={toggleSound}
          style={{
            background: isSoundMuted ? 'var(--bg-card-light)' : 'var(--game-primary)',
            color: isSoundMuted ? 'var(--text-muted)' : '#000',
            border: '1px solid var(--border-light)',
            padding: '12px',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title={isSoundMuted ? "Sound Off" : "Sound On"}
        >
          {isSoundMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 9L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 9L23 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.07 4.92999C20.9447 6.80527 21.9979 9.34835 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
      </div>

      {/* INCLUSION & ACCESSIBILITY WIDGETS */}
      <AccessibilityFloatingWidget />
      <LiveCaptionsOverlay />
      <AccessibilityModal />
      <StudentLoginModal />
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <StudentProvider>
        <AppInner />
      </StudentProvider>
    </AccessibilityProvider>
  );
}

export default App;
