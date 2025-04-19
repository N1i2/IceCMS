'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templateApi } from '@/app/services/api';
import { TemplateModel } from '@/app/models/templateModel';
import { sendSuccess } from '@/helpModule/Massages';
import { Toaster } from 'sonner';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getAll();
      setTemplates(data.data);
    } catch (err: any) {
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templateApi.delete(id);
      loadTemplates();
    } catch (err: any) {
      setError('Failed to delete template.');
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Templates</h1>
      {error && (
        <div className="bg-red-600 text-red-100 p-3 mb-4 rounded">{error}</div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/template/builder')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Create New Template
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Zones</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="odd:bg-gray-700 even:bg-gray-800"
                >
                  <td className="border p-2">{template.name}</td>
                  <td className="border p-2">{template.zones.join(', ')}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        router.push(`/template/builder?id=${template.id}`)
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(template.id!);
                        sendSuccess(
                          'Congratulations',
                          `Resource with name ${template.name} deleted successfully!`
                        );
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td className="border p-2 text-center" colSpan={3}>
                    No templates found.
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
