'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resourceApi } from '@/app/services/api';
import { ResourceModel } from '@/app/models/resourceModel';
import { sendSuccess } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { ResourceType, TextType, ImageType, ScriptType } from '@/app/models/const/ConstantTypes';
import { AxiosError } from 'axios';

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all');
  const [onlyMyResources, setOnlyMyResources] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (!token || !storedUserId) {
      router.push('/login');
      return;
    }
    setUserId(storedUserId);
    loadResources();
    document.title = 'Resources';
  }, [router]);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceApi.getAll();
      setResources(response.data);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(`Failed to load resources. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      const resource = resources.find((r) => r.id === id);
      await resourceApi.delete(id);
      loadResources();
      sendSuccess('Congratulations', `Resource "${resource?.name}" deleted successfully!`);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(`Failed to delete resource. ${error.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const filteredResources = resources
    .filter((resource) =>
      resource.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((resource) => {
      if (typeFilter === 'all') return true;
      return resource.type === typeFilter;
    })
    .filter((resource) => {
      if (!onlyMyResources || !userId) return true;
      return resource.creater === userId;
    })
    .sort((a, b) => {
      if (sortDirection === 'asc') return a.name.localeCompare(b.name);
      if (sortDirection === 'desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className={styles.page}>
      <Toaster />
      <div className={styles.header}>
        <Button onClick={() => router.push('/home')} className={styles.backBtn}>
          Go back
        </Button>
        <h1 className={styles.title}>Resources</h1>
        <Button
          onClick={() => router.push('/resource/creater')}
          className={styles.actionBtn}
        >
          New Resource
        </Button>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.filters}>
          <div>
            <Button
              onClick={() => setOnlyMyResources((prev) => !prev)}
              className={`${styles.toggleBtn} ${onlyMyResources ? styles.activeToggle : ''}`}
            >
              {onlyMyResources ? 'Show All Resources' : 'Only My Resources'}
            </Button>
          </div>
          <div>
            <label>Sort:</label>
            <select
              value={sortDirection || ''}
              onChange={(e) => 
                setSortDirection(e.target.value === '' ? null : e.target.value as 'asc' | 'desc')
              }
            >
              <option value="">None</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
          <div>
            <label>Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => 
                setTypeFilter(e.target.value as 'all' | ResourceType)
              }
            >
              <option value="all">All</option>
              <option value={TextType}>Text</option>
              <option value={ImageType}>Image</option>
              <option value={ScriptType}>Script</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading resources...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length ? (
                filteredResources.map((resource) => (
                  <tr key={resource.id} className={styles.fadeIn}>
                    <td>{resource.name}</td>
                    <td>{resource.type}</td>
                    <td>
                      {loadingRows.includes(resource.id!) ? (
                        <span className={styles.loadingIndicator}>Processing...</span>
                      ) : (
                        <div className={styles.actions}>
                          <Button
                            onClick={() =>
                              router.push(`/resource/creater?id=${resource.id}`)
                            }
                            className={styles.actionBtn}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(resource.id!)}
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
                    No resources found.
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