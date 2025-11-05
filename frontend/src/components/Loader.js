import React from 'react';

const Loader = () => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: 'var(--secondary)' }}>Loading...</p>
    </div>
  );
};

export default Loader;