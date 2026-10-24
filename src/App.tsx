import { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CitizenHomeView } from './components/CitizenHomeView';
import { ReportView } from './components/ReportView';
import { MyReportsView } from './components/MyReportsView';
import { RequestDetailPage } from './components/RequestDetailPage';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ProfileModal } from './components/ProfileModal';
import { CitizenProfileView } from './components/CitizenProfileView';
import { AdminPortalView } from './components/AdminPortalView';
import { CitizenReport } from './types/civic';
import { PROJECT_START_DISPLAY } from './config/projectConfig';
import { INITIAL_REPORTS } from './data/mockCivicData';
import { AuthProvider, useAuth } from './context/AuthContext';

import { ComplaintTrackingView } from './components/ComplaintTrackingView';

// Route parser ensuring "/" ALWAYS renders Citizen Home
function parseRoute(): { isSecureAdmin: boolean; tab: NavTab } {
  if (typeof window === 'undefined') {
    return { isSecureAdmin: false, tab: 'home' };
  }

  const rawPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/$/, '');
  const search = window.location.search.toLowerCase();

  // 1. Explicit admin route: matches /secure-admin, #secure-admin, or search param
  const isSecureAdmin =
    rawPath === '/secure-admin' ||
    rawPath.endsWith('/secure-admin') ||
    rawPath.includes('secure-admin') ||
    rawHash === 'secure-admin' ||
    rawHash.startsWith('secure-admin') ||
    rawHash.includes('secure-admin') ||
    search.includes('secure-admin');

  if (isSecureAdmin) {
    return { isSecureAdmin: true, tab: 'home' };
  }

  // 2. Citizen routes via path, hash, or search
  if (rawPath === '/report' || rawPath.endsWith('/report') || rawHash.includes('report') || search.includes('report')) {
    return { isSecureAdmin: false, tab: 'report' };
  }
  if (rawPath === '/track' || rawPath.endsWith('/track') || rawHash.includes('track') || search.includes('track')) {
    return { isSecureAdmin: false, tab: 'track' };
  }
  if (rawPath === '/my-reports' || rawPath.endsWith('/my-reports') || rawHash.includes('my-reports') || search.includes('my-reports')) {
    return { isSecureAdmin: false, tab: 'my-reports' };
  }
  if (rawPath === '/profile' || rawPath.endsWith('/profile') || rawHash.includes('profile') || search.includes('profile')) {
    return { isSecureAdmin: false, tab: 'profile' };
  }

  // 3. Default fallback: ALWAYS Citizen Home
  return { isSecureAdmin: false, tab: 'home' };
}

function AppContent() {
  const {
    currentUser,
    userRole,
    switchRole,
    verifyAdmin,
    logoutToCitizen,
    getAuthHeaders,
    isAdmin,
  } = useAuth();

  // Citizen default tab is initialized from route, defaults to 'home'
  const [currentTab, setCurrentTab] = useState<NavTab>(() => parseRoute().tab);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  // Dedicated Protected Route state for /secure-admin
  const [isSecureAdminRoute, setIsSecureAdminRoute] = useState<boolean>(() => parseRoute().isSecureAdmin);

  // Single Source of Truth: Live state initialized with demonstration reports
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<CitizenReport | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleNavigateToTracking = (id?: string) => {
    if (id) {
      setActiveTrackingId(id);
    }
    handleSelectTab('track');
  };

  // Route listener: synchronize route on URL change or popstate
  useEffect(() => {
    const handleUrlCheck = () => {
      const route = parseRoute();
      setIsSecureAdminRoute(route.isSecureAdmin);
      if (route.isSecureAdmin && userRole !== 'admin') {
        switchRole('admin');
      } else if (!route.isSecureAdmin && userRole === 'admin') {
        switchRole('citizen');
      }
      setCurrentTab(route.tab);
    };

    window.addEventListener('hashchange', handleUrlCheck);
    window.addEventListener('popstate', handleUrlCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('popstate', handleUrlCheck);
    };
  }, [userRole, switchRole]);

  /**
   * Fetch current live state from database API using auth headers
   */
  const syncWithDatabase = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const reqResp = await fetch('/api/requests', { headers }).then((r) =>
        r.ok ? r.json() : { requests: [] }
      );

      const fetchedRequests: any[] = reqResp.requests || [];

      // Only accept supported English and Hindi records
      const validRequests = fetchedRequests.filter(
        (r: any) => r.language === 'English' || r.language === 'Hindi'
      );

      // Convert backend Firestore requests to frontend CitizenReport schema
      const mappedReports: CitizenReport[] = validRequests.map((r: any) => ({
        id: r.id,
        ticketNumber: r.ticketNumber,
        ownerId: r.ownerId || currentUser.uid,
        timestamp: PROJECT_START_DISPLAY,
        timeAgo: 'Recently',
        inputMode: r.source || 'voice',
        language: r.language === 'Hindi' ? 'hi' : 'en',
        languageLabel: r.language === 'Hindi' ? 'Hindi' : 'English',
        vernacularTranscript: r.transcript || '',
        englishTranslation: r.description || r.transcript || '',
        locationName: [r.area, r.city, r.district, r.state].filter(Boolean).join(', ') || 'Local Ward',
        state: r.state || '',
        district: r.district || '',
        city: r.city || '',
        area: r.area || '',
        ward: r.area ? `${r.area}, Municipal Ward` : `${r.city || r.district || 'Municipal'}, Ward`,
        category: r.category || 'Road & Drainage',
        categoryConfidence: 96.4,
        priorityScore: r.priorityScore || 85,
        severity: r.severity || 'HIGH',
        status: r.status || 'Submitted',
        evidenceImage: r.photoUrl || undefined,
        citizenClusterCount: r.relatedRequestsCount || 1,
        modelledImpactCitizens: (r.relatedRequestsCount || 1) * 450,
        dispatchTargetHours: r.severity === 'CRITICAL' ? 2 : 4,
        assignedDepartment: r.assignedDepartment || `${r.district || 'AMC'} ${r.category} Department`,
        issueSummary: r.issueSummary,
        recommendedAction: r.recommendedAction,
        additionalDetails: r.additionalDetails,
        adminNote: r.adminNote,
        resolutionNote: r.resolutionNote,
        relatedRequestsCount: r.relatedRequestsCount || 1,
        hotspotClusterId: '01',
        hotspotClusterName: r.area || 'Ahmedabad East',
      }));

      setReports(mappedReports);
    } catch (e) {
      console.warn('Database sync warning:', e);
    }
  }, [getAuthHeaders, currentUser.uid]);

  // Realtime polling
  useEffect(() => {
    syncWithDatabase();
    const interval = setInterval(syncWithDatabase, 4000);
    return () => clearInterval(interval);
  }, [syncWithDatabase]);

  // Handle new report addition
  const handleAddNewReport = (report: CitizenReport) => {
    setReports((prev) => [report, ...prev]);
    showToast(`✓ Ticket ${report.ticketNumber} registered in civic ledger`);
    setTimeout(() => {
      syncWithDatabase();
    }, 400);
  };

  // Admin report edit handler (Requirement 19)
  const handleUpdateReport = async (
    id: string,
    updates: Partial<CitizenReport>
  ): Promise<boolean> => {
    try {
      const resp = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });

      if (resp.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
        );
        showToast(`✓ Report #${id} updated by administrator`);
        syncWithDatabase();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Update report error:', e);
      return false;
    }
  };

  // Complete data reset handler (Requirement 21)
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const resp = await fetch('/api/reset-data', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (resp.ok) {
        setReports([]);
        showToast('✓ Database reset to clean state (Starting 27 September 2026)');
      }
    } catch (e) {
      console.error('Reset error:', e);
    } finally {
      setIsResetting(false);
    }
  };

  // Unified Role Selector Handler: Citizen vs Admin Panel
  const handleSelectRole = (role: 'citizen' | 'admin') => {
    switchRole(role);
    if (role === 'admin') {
      setIsSecureAdminRoute(true);
      if (window.location.pathname !== '/secure-admin') {
        window.history.pushState(null, '', '/secure-admin');
      }
    } else {
      setIsSecureAdminRoute(false);
      setCurrentTab('home');
      if (window.location.pathname !== '/' || window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setIsSecureAdminRoute(false);
    setCurrentTab(tab);
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const exitToCitizen = () => {
    handleSelectRole('citizen');
  };

  // DIRECT ADMIN PANEL ROUTE RENDERING (/secure-admin)
  // Direct access: No lock screen, no clearance screen, no passcode
  if (isSecureAdminRoute) {
    return (
      <AdminPortalView
        reports={reports}
        onExitToCitizen={exitToCitizen}
        onUpdateReport={handleUpdateReport}
        onResetData={handleResetData}
        isResetting={isResetting}
      />
    );
  }

  // PUBLIC CITIZEN FLOW (Requirement 2, 4, 8, 28)
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#15171A] flex flex-col font-sans selection:bg-[#356AE6]/20 selection:text-[#356AE6]">
      {/* Persistent Navigation Header (Desktop 64-68px, Mobile 64px) */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        unreadNotificationsCount={reports.filter((r) => r.severity === 'CRITICAL').length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
      />

      {/* Main Content Area (Safe bottom padding pb-24 on mobile so bottom nav never covers content) */}
      <main className="w-full pt-16 md:pt-[68px] pb-24 md:pb-8 flex-1">
        {/* Home / Citizen Landing View */}
        {currentTab === 'home' && (
          <CitizenHomeView
            reports={reports}
            currentUserId={currentUser.uid}
            onNavigateToReport={() => handleSelectTab('report')}
            onNavigateToMyReports={() => handleSelectTab('my-reports')}
            onNavigateToTracking={handleNavigateToTracking}
            onViewRequestDetail={(rep) => setSelectedReportForDetail(rep)}
          />
        )}

        {/* Report Issue View (Civic Complaint Agent + Voice-First Flow) */}
        {currentTab === 'report' && (
          <ReportView
            onSubmitNewReport={handleAddNewReport}
            onOpenDashboard={() => handleSelectTab('my-reports')}
            onNavigateToTracking={handleNavigateToTracking}
            onViewRequestDetail={(rep) => setSelectedReportForDetail(rep)}
          />
        )}

        {/* Track Status View (Garbathon 2026 Status Agent) */}
        {currentTab === 'track' && (
          <ComplaintTrackingView
            initialTrackingId={activeTrackingId}
            onNavigateToReport={() => handleSelectTab('report')}
            onNavigateToDashboard={() => handleSelectTab('my-reports')}
          />
        )}

        {/* My Reports View (Citizen Personal Tracking) */}
        {currentTab === 'my-reports' && (
          <MyReportsView
            reports={reports}
            currentUserId={currentUser.uid}
            onNavigateToReport={() => handleSelectTab('report')}
            onNavigateToTracking={handleNavigateToTracking}
            onViewRequestDetail={(rep) => setSelectedReportForDetail(rep)}
          />
        )}

        {/* Citizen Profile View (Requirement 8 & 12) */}
        {currentTab === 'profile' && (
          <CitizenProfileView
            currentUser={currentUser}
            reports={reports}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            onNavigateToMyReports={() => handleSelectTab('my-reports')}
          />
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (Requirement 2 & 28) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        unreadCount={reports.filter((r) => r.ownerId === currentUser.uid && r.status === 'PWD Dispatched').length}
      />

      {/* Persistent Clean Civic Footer (Hidden on mobile to prioritize bottom nav) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Detail Dialog */}
      <RequestDetailPage
        report={selectedReportForDetail}
        onClose={() => setSelectedReportForDetail(null)}
        onOpenDashboard={() => {
          setSelectedReportForDetail(null);
          handleSelectTab('my-reports');
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectReportNotification={() => {
          setIsNotificationsOpen(false);
          handleSelectTab('report');
        }}
      />

      {/* Citizen Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#15171A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fadeIn">
          <span className="material-symbols-outlined text-[16px] text-[#3FA7A3]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
