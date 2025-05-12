'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templateApi } from '@/app/services/api';
import { TemplateModel } from '@/app/models/templateModel';
import { sendSuccess } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { AxiosError } from 'axios';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [nameSort, setNameSort] = useState<'asc' | 'desc' | ''>('');
  const [zonesSort, setZonesSort] = useState<'asc' | 'desc' | ''>('');
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [onlyMyTemplate, setOnlyMyTemplate] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) router.push('/login');
    loadTemplates();

    setUserId(userId);
    document.title = 'Templates';
  }, [router]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await templateApi.getAll();
      setTemplates(response.data);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(`Failed to load templates. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      await templateApi.delete(id);
      const template = templates.find((t) => t.id === id);
      loadTemplates();
      sendSuccess(
        'Congratulations',
        `Template "${template?.name}" deleted successfully!`,
      );
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(`Failed to delete template. ${error.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const filteredTemplates = templates
    .filter((template) =>
      template.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((template) => {
      if (!zoneFilter.trim()) return true;
      const filterNumber = parseInt(zoneFilter);
      return template.zones.length === filterNumber;
    })
    .filter((template) => {
      if (!onlyMyTemplate || !userId) return true;
      return template.creater === userId;
    })
    .sort((a, b) => {
      if (nameSort === 'asc') return a.name.localeCompare(b.name);
      if (nameSort === 'desc') return b.name.localeCompare(a.name);
      return 0;
    })
    .sort((a, b) => {
      if (zonesSort === 'asc') return a.zones.length - b.zones.length;
      if (zonesSort === 'desc') return b.zones.length - a.zones.length;
      return 0;
    });

  return (
    <div className={styles.page}>
      <Toaster />
      <div className={styles.header}>
        <Button onClick={() => router.push('/home')} className={styles.backBtn}>
          Go back to Home
        </Button>
        <h1 className={styles.title}>Templates</h1>
        <Button
          onClick={() => router.push('/template/builder')}
          className={styles.actionBtn}
        >
          Create New Template
        </Button>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search template by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          <div>
            <Button
              onClick={() => setOnlyMyTemplate((prev) => !prev)}
              className={`${styles.toggleBtn} ${
                onlyMyTemplate ? styles.activeToggle : ''
              }`}
            >
              {onlyMyTemplate ? 'Show All Template' : 'Only My Template'}
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
          <div>
            <label>Sort by Zones:</label>
            <select
              value={zonesSort}
              onChange={(e) =>
                setZonesSort(e.target.value as 'asc' | 'desc' | '')
              }
            >
              <option value="">None</option>
              <option value="asc">Fewest Zones</option>
              <option value="desc">Most Zones</option>
            </select>
          </div>

          <div>
            <label>Filter by Zones Count:</label>
            <input
              type="number"
              min="0"
              className={styles.searchInput}
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              placeholder="Enter zone count"
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading templates...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Zones</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className={styles.fadeIn}>
                    <td>{template.name}</td>
                    <td
                      className={
                        template.zones.length === 0 ? styles.noZones : ''
                      }
                    >
                      {template.zones.length > 0 ? (
                        template.zones.join(', ')
                      ) : (
                        <span style={{ color: 'red' }}>No zones</span>
                      )}
                    </td>
                    <td>
                      {loadingRows.includes(template.id!) ? (
                        <div className={styles.loadingIndicator}>
                          Loading...
                        </div>
                      ) : (
                        <div className={styles.actions}>
                          <Button
                            onClick={() =>
                              router.push(`/template/builder?id=${template.id}`)
                            }
                            className={styles.actionBtn}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(template.id!)}
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
                    No templates found.
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