'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templateApi } from '@/app/services/api';
import { TemplateModel } from '@/app/models/templateModel';
import { sendSuccess } from '@/helpModule/Massages';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function TemplatesPage() {  
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login'); 
    }
    
    loadTemplates();
    document.title = 'Templates';
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getAll();
      setTemplates(data.data);
    } catch (err: any) {
      setError(`Failed to load templates. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingRows((prev) => [...prev, id]);
    try {
      await templateApi.delete(id);
      const template = templates.find((template) => template.id === id);
      loadTemplates();
      sendSuccess(
        'Congratulations',
        `Template with name \"${template?.name}\" deleted successfully!`,
      );
    } catch (err: any) {
      setError(`Failed to delete template. ${err.message}`);
    } finally {
      setLoadingRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <Button
         onClick={()=>router.push('/home')}
         className={styles.buttonBack}>
          Go back to Home
        </Button>
        <h1 className={styles.title}>Templates</h1>
        <Button
          onClick={() => router.push('/template/builder')}
          className={styles.createButton}
        >
          Create New Template
        </Button>
      </div>

      <div className="p-6">
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tableWrapper}>
          {loading ? (
            <p className="text-white text-center py-10">Loading templates...</p>
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
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <tr key={template.id} className={styles.fadeIn}>
                      <td>{template.name}</td>
                      <td className={template.zones.length === 0 ? styles.noZones : ''}>
                        {template.zones.length > 0 ? template.zones.join(', ') : 'No zones'}
                      </td>
                      <td className="text-center">
                        {loadingRows.includes(template.id!) ? (
                          <div className={styles.loadingIndicator}>
                            Loading...
                          </div>
                        ) : (
                          <div className={styles.actions}>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/template/builder?id=${template.id}`,
                                )
                              }
                              className={styles.changeButton}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(template.id!)}
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
                      No templates found.
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