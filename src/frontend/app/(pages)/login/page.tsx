'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import userApi from '@/app/services/api';
import { UserRole } from '../user/const/userRoles';
import { sendError } from '@/helpModule/Massages';
import { Toaster } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() =>{
    document.title = "Login";
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      let response;
  
      if (isRegister) {
        response = await userApi.post('/auth/register', {
          email,
          password,
          lock: false,
          role: UserRole,
        });
      } else {
        response = await userApi.post('/auth/login', {
          email,
          password,
        });
      }
  
      const token = response.data.access_token;
      const role = response.data.user?.role || UserRole
  
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role); 
      }
  
      router.push('/home');
    } catch (err: any) {
      sendError(
        'Error',
        'Error: ' + (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">
          {isRegister ? 'Register' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            {isRegister
              ? 'Have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
