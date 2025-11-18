import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const styles = {
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
    },
    modalContainer: {
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    modalHeader: {
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    modalCloseBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    modalImageContainer: {
        width: '100%',
        height: '250px',
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
    },
    imagePlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    modalImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
        display: 'block',
    },
    modalBody: {
        padding: '32px',
        overflowY: 'auto',
        fontSize: '1.1rem',
        lineHeight: 1.8,
        color: '#374151'
    }
};

const FeatureModal = ({ feature, onClose }) => {
    const [imageError, setImageError] = useState(false);

    if (!feature) return null;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <>
            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                `}
            </style>
            <div style={styles.modalBackdrop} onClick={onClose}>
                <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h2 style={{...styles.modalTitle, color: feature.color}}>
                            {feature.icon}
                            {feature.title}
                        </h2>
                        <button
                            onClick={onClose}
                            style={styles.modalCloseBtn}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    {feature.image && !imageError ? (
                        <div style={styles.modalImageContainer}>
                            <img 
                                src={feature.image} 
                                alt={feature.title} 
                                style={styles.modalImage}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onError={handleImageError}
                            />
                        </div>
                    ) : (
                        <div style={styles.modalImageContainer}>
                            <div style={styles.imagePlaceholder}>
                                <ImageIcon size={48} strokeWidth={1} />
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                                    Image not available
                                </span>
                            </div>
                        </div>
                    )}
                    <div style={styles.modalBody}>
                        <p>{feature.details}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeatureModal;