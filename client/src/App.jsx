import React from 'react';

function App() {
  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>Task Manager</h1>
        <div className="subheading">Organize your thoughts</div>
      </header>

      <main>
        {/* We will implement the Task List here */}
        <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
      </main>
    </div>
  );
}

export default App;
