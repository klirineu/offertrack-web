import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Campaigns } from './pages/traffic-filter/Campaigns';
import { Requests } from './pages/traffic-filter/Requests';
import { Domains } from './pages/traffic-filter/Domains';
import { Reports } from './pages/traffic-filter/Reports';
import { CreateCampaign } from './pages/traffic-filter/CreateCampaign';
import { EncryptText } from './pages/tools/EncryptText';
import { Anticlone } from './pages/tools/Anticlone';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/traffic-filter/campaigns" element={<Campaigns />} />
        <Route path="/traffic-filter/campaigns/new" element={<CreateCampaign />} />
        <Route path="/traffic-filter/requests" element={<Requests />} />
        <Route path="/traffic-filter/domains" element={<Domains />} />
        <Route path="/traffic-filter/reports" element={<Reports />} />
        <Route path="/tools/encrypt" element={<EncryptText />} />
        <Route path="/tools/anticlone" element={<Anticlone />} />
      </Routes>
    </Router>
  );
}

export default App;