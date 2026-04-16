import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegionDetailPage from './pages/RegionDetailPage';
import DistrictDetailPage from './pages/DistrictDetailPage';
import AIChatPage from './pages/AIChatPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/region/:regionId" element={<RegionDetailPage />} />
            <Route path="/district/:regionId/:districtIndex" element={<DistrictDetailPage />} />
            <Route path="/ai" element={<AIChatPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
