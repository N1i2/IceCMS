'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/app/services/api';
import { PageModel } from '@/app/models/pageModel';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { AxiosError } from 'axios';

export default function PagesPage() {
  const [pages, setPages] = useState<PageModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [nameSort, setNameSort] = useState<'asc' | 'desc' | ''>('');
  const [onlyMyPage, setOnlyMyPage] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) router.push('/login');

    loadPages();

    setUserId(userId);
    document.title = 'Pages';
  }, [router]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await pageApi.getAll();
      setPages(data.data);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      sendError('Error', `Failed to get pages. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      await pageApi.delete(id);
      const deletedPage = pages.find((p) => p.id === id);
      sendSuccess(
        'Congratulations',
        `Page "${deletedPage?.name}" deleted successfully!`,
      );
      loadPages();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      sendError('Error', `Failed to delete page. ${error.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const filteredPages = pages
    .filter((page) =>
      page.name.toLowerCase().includes(searchName.toLowerCase()),
    )
    .filter((page) =>
      page.pageId.toLowerCase().includes(searchId.toLowerCase()),
    )
    .filter((page) => {
      if (!onlyMyPage || !userId) return true;
      return page.creater === userId;
    })
    .sort((a, b) => {
      if (nameSort === 'asc') return a.name.localeCompare(b.name);
      if (nameSort === 'desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className={styles.page}>
      <Toaster />

      <div className={styles.header}>
        <Button onClick={() => router.push('/home')} className={styles.backBtn}>
          Go back to Home
        </Button>
        <h1 className={styles.title}>Pages</h1>
        <Button
          onClick={() => router.push('/page/editor')}
          className={styles.actionBtn}
        >
          Create New Page
        </Button>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by Page ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <div className={styles.filters}>
          <div>
            <Button
              onClick={() => setOnlyMyPage((prev) => !prev)}
              className={`${styles.toggleBtn} ${
                onlyMyPage ? styles.activeToggle : ''
              }`}
            >
              {onlyMyPage ? 'Show All Page' : 'Only My Page'}
            </Button>
          </div>
          <div>
            <label>Sort by Name:</label>
            <select
              value={nameSort}
              onChange={(e) =>
                setNameSort(e.target.value as 'asc' | 'desc' | '')
              }
            >
              <option value="">None</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading pages...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Page ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <tr key={page.id} className={styles.fadeIn}>
                    <td>{page.name}</td>
                    <td>{page.pageId}</td>
                    <td>
                      {loadingRows.includes(page.id!) ? (
                        <div className={styles.loadingIndicator}>
                          Loading...
                        </div>
                      ) : (
                        <div className={styles.actions}>
                          <Button
                            onClick={() =>
                              router.push(`/page/editor?id=${page.id}`)
                            }
                            className={styles.actionBtn}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(page.id!)}
                            className={styles.actionBtn}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.noData}>
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
