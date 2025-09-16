import React from 'react';

function ActivityDetailsModal({ isOpen, onClose, activity }) {
  if (!isOpen || !activity) {
    return null;
  }

  // Helper to format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Activity Details - ${activity.ACTION || 'Activity'}</title>
        <style>
          @media print {
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e1e5e9;
            }
            .print-title {
              font-size: 24px;
              font-weight: 700;
              color: #1a202c;
              margin: 0;
            }
            .detail-group {
              margin-bottom: 20px;
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            .detail-label {
              font-weight: 600;
              color: #4a5568;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-value {
              font-size: 16px;
              color: #1a202c;
              padding: 8px 0;
            }
            .detail-description {
              background: #f7fafc;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #4299e1;
              margin: 0;
            }
            .print-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e1e5e9;
              text-align: center;
              color: #718096;
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">Activity Details</h1>
        </div>
        <div class="detail-group">
          <span class="detail-label">Activity:</span>
          <span class="detail-value">${activity.ACTION || 'No action specified'}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">User:</span>
          <span class="detail-value">${activity.USER || 'N/A'}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${formatDateTime(activity.TIME)}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Location:</span>
          <span class="detail-value">${activity.LOCATION || 'Not specified'}</span>
        </div>
        <div class="detail-group">
          <span class="detail-label">Details:</span>
          <p class="detail-description">${activity.DETAILS || 'No additional details provided.'}</p>
        </div>
        <div class="print-footer">
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyles}>
          <h2 style={modalTitleStyles}>Activity Details</h2>
          <button onClick={onClose} style={closeBtnStyles}>&times;</button>
        </div>
        
        <div style={modalBodyStyles}>
          <div style={detailGroupStyles}>
            <span style={detailLabelStyles}>Activity:</span>
            <span style={detailValueStyles}>{activity.ACTION || 'No action specified'}</span>
          </div>
          
          <div style={detailGroupStyles}>
            <span style={detailLabelStyles}>User:</span>
            <span style={detailValueStyles}>{activity.USER || 'N/A'}</span>
          </div>
          
          <div style={detailGroupStyles}>
            <span style={detailLabelStyles}>Time:</span>
            <span style={detailValueStyles}>{formatDateTime(activity.TIME)}</span>
          </div>
          
          <div style={detailGroupStyles}>
            <span style={detailLabelStyles}>Location:</span>
            <span style={detailValueStyles}>{activity.LOCATION || 'Not specified'}</span>
          </div>
          
          <div style={detailGroupStyles}>
            <span style={detailLabelStyles}>Details:</span>
            <p style={detailDescriptionStyles}>
              {activity.DETAILS || 'No additional details provided.'}
            </p>
          </div>
        </div>
        
        <div style={modalFooterStyles}>
          <button onClick={handlePrint} style={printBtnStyles}>
            <svg style={iconStyles} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 6,2 18,2 18,9"></polyline>
              <path d="M6,18H4a2,2 0 0,1-2-2v-5a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18"></path>
              <polyline points="6,14 18,14 18,22 6,22 6,14"></polyline>
            </svg>
            Print
          </button>
          <button onClick={onClose} style={modalCloseBtnStyles}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Modern CSS-in-JS Styles
const modalOverlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
  animation: 'fadeIn 0.2s ease-out'
};

const modalContentStyles = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideIn 0.3s ease-out'
};

const modalHeaderStyles = {
  padding: '24px 28px 20px 28px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white'
};

const modalTitleStyles = {
  margin: 0,
  fontSize: '20px',
  fontWeight: '700',
  color: 'white'
};

const closeBtnStyles = {
  background: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontSize: '24px',
  width: '36px',
  height: '36px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  ':hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.05)'
  }
};

const modalBodyStyles = {
  padding: '28px',
  overflowY: 'auto',
  flex: 1
};

const detailGroupStyles = {
  marginBottom: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const detailLabelStyles = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.8px'
};

const detailValueStyles = {
  fontSize: '16px',
  color: '#1f2937',
  fontWeight: '500',
  padding: '12px 16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb'
};

const detailDescriptionStyles = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: 0,
  padding: '16px',
  backgroundColor: '#f0f9ff',
  borderRadius: '10px',
  border: '1px solid #e0f2fe',
  borderLeft: '4px solid #0ea5e9'
};

const modalFooterStyles = {
  padding: '20px 28px 28px 28px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  backgroundColor: '#fafafa'
};

const printBtnStyles = {
  backgroundColor: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
  ':hover': {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
  }
};

const modalCloseBtnStyles = {
  backgroundColor: '#6b7280',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: '#4b5563',
    transform: 'translateY(-1px)'
  }
};

const iconStyles = {
  width: '16px',
  height: '16px'
};

// Add keyframe animations via a style tag
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  button:hover {
    transform: translateY(-1px);
  }
`;
document.head.appendChild(styleElement);

export default ActivityDetailsModal;