'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resourceApi } from '@/app/services/api';
import { ResourceModel } from '@/app/models/resourceModel';
import { Toaster } from 'sonner';
import { sendSuccess } from '@/helpModule/Massages';

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadResources();
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
    try {
      await resourceApi.delete(id);
      loadResources();
    } catch (err: any) {
      setError('Failed to delete resource.');
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Resource</h1>
      {error && <div className="bg-red-600 p-3 mb-4 rounded">{error}</div>}

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/resource/creater')}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Create New Resource
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading resource...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr
                  key={resource.id}
                  className="odd:bg-gray-700 even:bg-gray-800"
                >
                  <td className="border p-2">{resource.name}</td>
                  <td className="border p-2">{resource.type}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        router.push(`/resource/creater?id=${resource.id}`)
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(resource.id!);
                        sendSuccess(
                          'Congratulations',
                          `Resource with name ${resource.name} deleted successfully!`,
                        );
                      }}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td className="border p-2 text-center" colSpan={3}>
                    No resources found.
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
