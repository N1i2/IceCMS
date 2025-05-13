'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('userId');
    const userRole = url.searchParams.get('userRole');

    if (token ) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId || '');
      localStorage.setItem('userRole', userRole || '');

      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return <p>Authorization via Google... Wait</p>;
}
