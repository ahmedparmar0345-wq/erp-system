import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = ({ onClick, to, label = '← Back' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else if (location.pathname !== '/reports-dashboard') {
            navigate('/reports-dashboard');
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="back-button no-print"
            style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
            }}
        >
            ← {label}
        </button>
    );
};

export default BackButton;