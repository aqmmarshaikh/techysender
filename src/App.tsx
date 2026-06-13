import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SendPage } from './pages/SendPage';
import { ReceivePage } from './pages/ReceivePage';
import { PrivacyPage } from './pages/PrivacyPage';

export function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
