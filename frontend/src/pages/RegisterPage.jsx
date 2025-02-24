import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create new account
      </h2>
      <RegisterForm onSuccess={() => navigate('/login')} />
      <div className="text-center mt-4">
        <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
          Already have an account? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
