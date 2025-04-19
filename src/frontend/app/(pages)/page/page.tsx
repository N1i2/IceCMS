'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/app/services/api';
import { PageModel } from '@/app/models/pageModel';
import { sendSuccess } from '@/helpModule/Massages';
import { Toaster } from 'sonner';

export default function PagesPage() {
  const [pages, setPages] = useState<PageModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pageApi.getAll();
      setPages(data.data);
    } catch (err: any) {
      setError('Failed to load pages.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pageApi.delete(id);
      loadPages();
    } catch (err: any) {
      setError('Failed to delete page.');
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Pages</h1>
      {error && (
        <div className="bg-red-600 text-red-100 p-3 mb-4 rounded">{error}</div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/page/editor')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Create New Page
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading pages...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">PageId</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="odd:bg-gray-700 even:bg-gray-800"
                >
                  <td className="border p-2">{page.name}</td>
                  <td className="border p-2">{page.pageId}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        router.push(`/page/editor?id=${page.id}`)
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(page.id!);
                        sendSuccess(
                          'Congratulations',
                          `Resource with name ${page.name} deleted successfully!`
                        );
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td className="border p-2 text-center" colSpan={3}>
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Toaster />
    </div>
  );
}
