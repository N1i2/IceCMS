'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminRole } from '../user/const/userRoles';
import { useRouter } from 'next/navigation';
import 'tailwindcss';

export default function HomePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
    } else {
      setIsAdmin(role === AdminRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');

    router.push('/login');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Start Page</h1>

      <div className="space-x-4">
        <Button onClick={() => router.push('resource')}>Resources</Button>
        <Button onClick={() => router.push('template')}>Templates</Button>
        <Button onClick={() => router.push('page')}>Pages</Button>

        {isAdmin && <Button onClick={() => router.push('user')}>Users</Button>}
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
