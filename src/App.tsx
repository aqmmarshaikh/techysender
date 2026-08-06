import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { ShortLinkRedirector } from './pages/ShortLinkRedirector';

export function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/s/:shortCode" element={<ShortLinkRedirector />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
