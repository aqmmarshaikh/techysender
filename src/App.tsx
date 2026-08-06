import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { ShortLinkRedirector } from './pages/ShortLinkRedirector';

function AppContent() {
  const location = useLocation();
  const isDeveloper = location.pathname === '/developer';

  return (
    <>
      {!isDeveloper && <Navbar />}
      <main className={isDeveloper ? 'developer-main-wrapper' : 'page-content'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/s/:shortCode" element={<ShortLinkRedirector />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Routes>
      </main>
      {!isDeveloper && <Footer />}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
