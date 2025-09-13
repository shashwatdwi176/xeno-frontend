import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL +'/api/customers', { withCredentials: true });
                setCustomers(response.data.customers);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
                setError("Failed to load customer data. Please log in.");
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading customers...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>All Customers</h2>
            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {customers.map(customer => (
                        <li key={customer.customerId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
                            <p><strong>Name:</strong> {customer.name}</p>
                            <p><strong>Email:</strong> {customer.email}</p>
                            <p><strong>Total Spend:</strong> ${customer.metadata.total_spend}</p>
                            <p><strong>Visit Count:</strong> {customer.metadata.visit_count}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomerList;