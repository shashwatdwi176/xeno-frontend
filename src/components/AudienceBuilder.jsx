// AudienceBuilder.jsx

import React, { useState, useEffect } from 'react';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import axios from 'axios';

const fields = [
  { name: 'total_spend', label: 'Total Spend', type: 'number' },
  { name: 'visit_count', label: 'Visit Count', type: 'number' },
  { name: 'inactive_days', label: 'Inactive for (days)', type: 'number' },
  { name: 'email', label: 'Email', type: 'text' },
];

const AudienceBuilder = () => {
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });
  const [audienceSize, setAudienceSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nlPrompt, setNlPrompt] = useState(''); // renamed from "prompt"

  // Configure axios defaults for all requests
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log('Checking login status...');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/is-logged-in`,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Login status response:', response.data);
        if (response.data.success) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('Not logged in:', error.response?.data);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    setAudienceSize(null);
  };

  const handlePreviewAudience = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/campaigns/preview`,
        query,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setAudienceSize(response.data.count);
    } catch (error) {
      console.error('Failed to preview audience:', error);
      alert('Failed to get audience size. Please log in first.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextToRules = async () => {
    if (!nlPrompt.trim()) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/text-to-rules`,
        { prompt: nlPrompt },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setQuery(response.data);
      setNlPrompt('');
    } catch (error) {
      console.error('Error generating rules from text:', error);
      alert('Failed to generate rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    const campaignName = window.prompt('Enter a name for your campaign:'); // fixed
    if (!campaignName) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/campaigns/create`,
        { name: campaignName, rules: query },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Campaign created:', response.data);
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please log in first.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Initiating Google OAuth...');
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleLogout = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Xeno CRM Platform</h1>
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Log out
        </button>
      ) : (
        <button
          onClick={handleGoogleLogin}
          style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Log in with Google
        </button>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Natural Language Rules</h3>
        <textarea
          value={nlPrompt}
          onChange={(e) => setNlPrompt(e.target.value)}
          placeholder="e.g., spent over ₹500 and visited in the last 30 days"
          style={{ width: '100%', minHeight: '80px', padding: '10px' }}
        />
        <button
          onClick={handleTextToRules}
          disabled={loading || !nlPrompt.trim()}
          style={{ marginTop: '10px' }}
        >
          Generate Rules
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={handleQueryChange}
          translations={{
            addRule: '+ Add Rule',
            addGroup: '+ Add Group',
            combinators: { and: 'AND', or: 'OR' },
            fields: { title: 'Select a field' },
            operators: { title: 'Select an operator' },
          }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePreviewAudience} disabled={loading}>
          Preview Audience Size
        </button>
        {audienceSize !== null && (
          <p>Estimated Audience Size: <strong>{audienceSize}</strong></p>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleCreateCampaign}
          disabled={audienceSize === null || loading}
        >
          Create Campaign
        </button>
      </div>
    </div>
  );
};

export default AudienceBuilder;
