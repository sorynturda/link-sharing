// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FileList from './components/files/FileList';
import PrivateRoute from './components/layout/PrivateRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/files" 
          element={
            <PrivateRoute>
              <FileList />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;