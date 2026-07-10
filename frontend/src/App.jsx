import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import NavBar from './components/common/NavBar';
import Layout from './components/common/Layout';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Landing route: renders with EchoMind's exact dark styling */}
          <Route path="/" element={
            <div className="echomind-page">
              <NavBar />
              <Landing />
            </div>
          } />
          {/* All other routes: use EvoFox's themed Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/upload" element={<Upload />} />
                <Route path="/select-sender" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
