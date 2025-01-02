import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <AuthLayout>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <LoginForm />
      <div className="text-center mt-4">
        <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
          Don't have an account? Register
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
