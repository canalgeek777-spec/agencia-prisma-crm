import React from 'react';

const S = {
  btn: (variant) => {
    const variants = {
      primary: { backgroundColor: '#007bff', color: '#fff' },
      secondary: { backgroundColor: '#6c757d', color: '#fff' },
      danger: { backgroundColor: '#dc3545', color: '#fff' },
      ghost: { backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' },
    };
    return variants[variant] || variants.primary;
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  }
};

const App = () => {
  return (
    <div>
      <h1 style={S.headerTitle}>Welcome to the App</h1>
      <button style={S.btn('primary')}>Primary Button</button>
      <button style={S.btn('secondary')}>Secondary Button</button>
      <button style={S.btn('danger')}>Danger Button</button>
      <button style={S.btn('ghost')}>Ghost Button</button>
    </div>
  );
};

export default App;