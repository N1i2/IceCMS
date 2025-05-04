"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import "tailwindcss";

export default function HomePage() {
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login'); 
    }
  }, []);

  const { slug } = useParams();

  return (
    <div>
      <h1>Start Page</h1>

      <Button onClick={() => router.push('resource')}>
        Resources
      </Button>
      <Button onClick={() => router.push('template')}>
        Templates
      </Button>
      <Button onClick={() => router.push('page')}>
        Pages
      </Button>
      <Button onClick={() => router.push('user')}>
        Users
      </Button>
    </div>
  );
}
