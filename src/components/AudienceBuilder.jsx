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
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // Check login status with credentials
                const response = await axios.get(import.meta.env.VITE_API_URL +'/api/is-logged-in', { withCredentials: true });
                if (response.data.success) {
                    setIsLoggedIn(true);
                }
            } catch (error) {
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
                import.meta.env.VITE_API_URL +'/api/campaigns/preview',
                query,
                { withCredentials: true } // Crucial for sending the session cookie
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
        if (!prompt.trim()) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL +'/api/ai/text-to-rules', { prompt: prompt });
            // Set the query state with the rules from the LLM
            setQuery(response.data);
            setPrompt(''); // Clear the prompt
        } catch (error) {
            console.error('Error generating rules from text:', error);
            alert('Failed to generate rules. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        const campaignName = prompt("Enter a name for your campaign:");
        if (!campaignName) return;

        try {
            setLoading(true);
            const response = await axios.post(
                import.meta.env.VITE_API_URL +'/api/campaigns/create',
                { name: campaignName, rules: query },
                { withCredentials: true } // Crucial for sending the session cookie
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

    

    const handleLogout = () => {
        window.location.href = import.meta.env.VITE_API_URL +'/auth/logout';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        
            
            {isLoggedIn ? (
                <button onClick={handleLogout} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                    Log out
                </button>
            ) : (
                <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
                    <button style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                        Log in with Google
                    </button>
                </a>
            )}
            
            <div style={{ marginTop: '20px' }}>
            <h3>Natural Language Rules</h3>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., spent over $500 and visited in the last 30 days"
                style={{ width: '100%', minHeight: '80px', padding: '10px' }}
            />
            <button
                onClick={handleTextToRules}
                disabled={loading || !prompt.trim()}
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
                    <p>Estimated Audience Size: **{audienceSize}**</p>
                )}
            </div>
            
            <div style={{ marginTop: '10px' }}>
                <button onClick={handleCreateCampaign} disabled={audienceSize === null || loading}>
                    Create Campaign
                </button>
            </div>
        </div>
    );
};

export default AudienceBuilder;