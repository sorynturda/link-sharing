import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FileList from './components/files/FileList';
import PrivateRoute from './components/layout/PrivateRoute';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/files" element={
            <PrivateRoute>
              <FileList />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;