import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import ExportPage from './components/ExportPage';
import GalleryPage from './components/GalleryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
