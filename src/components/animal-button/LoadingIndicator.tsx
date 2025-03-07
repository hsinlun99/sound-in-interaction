import React from 'react';

interface LoadingIndicatorProps {
  color: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ color }) => (
  <div
    style={{
      width: "110px",
      height: "110px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
    }}
  >
    <div 
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid rgba(0, 0, 0, 0.1)",
        borderLeftColor: color,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);