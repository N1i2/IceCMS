'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminRole } from '../user/const/userRoles';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { BarChart, BookOpen, FileText, Users } from 'lucide-react';
import { resourceApi, templateApi, pageApi, userApi } from '@/app/services/api';
import 'tailwindcss';

export default function HomePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [resourceStat, setResourceStat] = useState<number | string>('...');
  const [templateStat, setTemplateStat] = useState<number | string>('...');
  const [pageStat, setPageStat] = useState<number | string>('...');
  const [userStat, setUserStat] = useState<number | string>('...');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
      return;
    }

    if (role === AdminRole) {
      setIsAdmin(true);
      document.title = 'Admin Home';
    } else {
      setIsAdmin(false);
      document.title = 'User Home';
    }

    try {
      resourceApi.getAll().then((response) => {
        setResourceStat(response.data.length);
      });
      templateApi.getAll().then((template) => {
        setTemplateStat(template.data.length);
      });
      pageApi.getAll().then((page) => {
        setPageStat(page.data.length);
      });
      userApi.getAll().then((user) => {
        setUserStat(user.data.length - 1);
      });
    }
    catch {
      console.log('resources need some time');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Button onClick={handleLogout} className={styles.buttonBack}>
          Log Out
        </Button>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Start Page</h1>
          </div>

          <div className={styles.statsGrid}>
            <Button
              onClick={() => router.push('resource')}
              className={styles.button}
            >
              Resources
            </Button>
            <Button
              onClick={() => router.push('template')}
              className={styles.button}
            >
              Templates
            </Button>
            <Button
              onClick={() => router.push('page')}
              className={styles.button}
            >
              Pages
            </Button>
            {isAdmin && (
              <Button
                onClick={() => router.push('user')}
                className={styles.button}
              >
                Users
              </Button>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <BookOpen size={32} className={styles.statIcon} />
              <p className={styles.statValue}>{resourceStat}</p>
              <p className={styles.statLabel}>Resources</p>
            </div>
            <div className={styles.statCard}>
              <FileText size={32} className={styles.statIcon} />
              <p className={styles.statValue}>{templateStat}</p>
              <p className={styles.statLabel}>Templates</p>
            </div>
            <div className={styles.statCard}>
              <BarChart size={32} className={styles.statIcon} />
              <p className={styles.statValue}>{pageStat}</p>
              <p className={styles.statLabel}>Pages</p>
            </div>
            <div className={styles.statCard}>
              <Users size={32} className={styles.statIcon} />
              <p className={styles.statValue}>{userStat}</p>
              <p className={styles.statLabel}>Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
