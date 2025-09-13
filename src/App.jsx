import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AudienceBuilder from './components/AudienceBuilder';
import CustomerList from './components/CustomerList';
import './App.css';

const navStyle = {
  display: 'flex',
  gap: '20px',
  padding: '10px',
  backgroundColor: '#282c34',
  color: 'white',
  marginBottom: '20px'
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Xeno CRM Platform</h1>
      </header>
      <main>
        <Router>
          <nav style={navStyle}>
            <Link style={{ color: 'white', textDecoration: 'none' }} to="/">Audience Builder</Link>
            <Link style={{ color: 'white', textDecoration: 'none' }} to="/customers">Customer List</Link>
          </nav>
          <Routes>
            <Route path="/" element={<AudienceBuilder />} />
            <Route path="/customers" element={<CustomerList />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}

export default App;
