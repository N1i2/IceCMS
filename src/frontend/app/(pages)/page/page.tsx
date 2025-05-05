'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/app/services/api';
import { PageModel } from '@/app/models/pageModel';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function PagesPage() {
  const [pages, setPages] = useState<PageModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    }

    loadPages();
    document.title = 'Pages';
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await pageApi.getAll();
      setPages(data.data);
    } catch (err: any) {
      sendError('Error', `Failed to get page. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pageApi.delete(id);
      loadPages();
      const page = pages.find((page) => page.id === id);
      sendSuccess(
        'Congratulations',
        `Page with name \"${page?.name}\" deleted successfully!`,
      );
    } catch (err: any) {
      sendError('Error', `Failed to delete page. ${err.message}`);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <Button
          onClick={() => router.push('/home')}
          className={styles.buttonBack}
        >
          Go back to Home
        </Button>
        <h1 className={styles.title}>Pages</h1>
        <Button
          onClick={() => router.push('/page/editor')}
          className={styles.button}
        >
          Create New Page
        </Button>
      </div>

      <div className="p-6">
        <div className={styles.tableWrapper}>
          {loading ? (
            <p className="text-white text-center py-10">Loading pages...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>PageId</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className={styles.fadeIn}>
                    <td className={styles.border}>{page.name}</td>
                    <td className={styles.border}>{page.pageId}</td>
                    <td className="text-center">
                      <div className={styles.actions}>
                        <Button
                          onClick={() =>
                            router.push(`/page/editor?id=${page.id}`)
                          }
                          className={styles.changeButton}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(page.id!)}
                          className={styles.changeButton}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400">
                      No pages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
