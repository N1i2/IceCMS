'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resourceApi } from '@/app/services/api';
import { ResourceModel } from '@/app/models/resourceModel';
import { sendSuccess } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function ResourcesPage() {  
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login'); 
    }
    
    loadResources();
    document.title = 'Resources';
  }, []);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceApi.getAll();
      setResources(data.data);
    } catch (err: any) {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      await resourceApi.delete(id);
      const resource = resources.find((resource) => resource.id === id);
      loadResources();
      sendSuccess(
        'Congratulations',
        `Resource with name \"${resource?.name}\" deleted successfully!`,
      );
    } catch (err: any) {
      setError('Failed to delete resource.');
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
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
        <h1 className={styles.title}>Resources</h1>
        <Button
          onClick={() => router.push('/resource/creater')}
          className={styles.button}
        >
          Create New Resource
        </Button>
      </div>

      <div className="p-6">
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <p className="text-white text-center py-10">Loading resources...</p>
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
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <tr key={resource.id} className={styles.fadeIn}>
                      <td>{resource.name}</td>
                      <td>{resource.type}</td>
                      <td className="text-center">
                        {loadingRows.includes(resource.id!) ? (
                          <div className={styles.loadingIndicator}>
                            Loading...
                          </div>
                        ) : (
                          <div className={styles.actions}>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/resource/creater?id=${resource.id}`,
                                )
                              }
                              className={styles.changeButton}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(resource.id!)}
                              className={styles.changeButton}
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
                    <td colSpan={3} className="text-center py-10 text-gray-400">
                      No resources found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Toaster/>
    </div>
  );
}
