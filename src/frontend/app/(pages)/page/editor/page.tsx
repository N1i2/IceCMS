'use client';

import { PageModel } from '@/app/models/pageModel';
import { ResourceModel } from '@/app/models/resourceModel';
import { TemplateModel } from '@/app/models/templateModel';
import { ScriptType } from '@/app/models/const/ConstantTypes';
import { useEffect, useState } from 'react';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import { Toaster } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { pageApi } from '@/app/services/api';

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState<PageModel>({
    id: undefined,
    pageId: '',
    name: '',
    templateId: '',
    resources: new Map<string, string>(),
    scripts: [],
    creater: '1',
  });
  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetch('/api/resource');
        const data = await response.json();
        setResources(data);
      } catch (error) {
        sendError('Failed to load resources', 'Please try again later');
      }
    };

    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/template');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        sendError('Failed to load templates', 'Please try again later');
      }
    };

    loadResources();
    loadTemplates();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const loadPage = async () => {
        try {
          const response = await pageApi.getById(id);
          const page = response.data;

          console.log('Response:', page);

          if (!page) {
            throw new Error('Failed to load page data');
          }
          setPage({
            ...page,
            resources: new Map(Object.entries(page.resources || {})),
          });
        } catch (error) {
          sendError('Error loading page', `${error}`);
        }
      };
      loadPage();
    }
  }, [searchParams]);

  const selectedTemplate = templates?.find(
    (template) => template.id === page.templateId,
  );

  const isValidPage = () => {
    if (!page.pageId) {
      sendError('Page ID is required', 'Please change the page ID');
      return false;
    }
    if (!page.name) {
      sendError('Page name is required', 'Please change the page name');
      return false;
    }
    if (!page.templateId) {
      sendError('Template is required', 'Please change the template');
      return false;
    }

    return true;
  };

  const addScript = () => {
    if (selectedScript && !page.scripts.includes(selectedScript)) {
      setPage((prev) => ({
        ...prev,
        scripts: [...prev.scripts, selectedScript],
      }));
      setSelectedScript('');
    }
  };

  const handleSave = async () => {
    try {
      if (!isValidPage()) return;

      const resultPage = {
        ...page,
        resources: Object.fromEntries(page.resources),
      };

      const response = await fetch('/api/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultPage),
      });

      if (!response.ok) {
        throw new Error('Failed to save page.');
      }

      await response.json();
      sendSuccess('Congratulations', 'Page saved successfully');
      ``;
    } catch (error) {
      sendError('Error saving page', 'Please try again later');
    }
  };

  const handleClear = () => {
    setPage(() => ({
      pageId: '',
      name: '',
      templateId: '',
      resources: new Map<string, string>(),
      scripts: [],
      creater: '1',
    }));
    sendSuccess('Cleared', 'The form was cleared.');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Левая часть - большая область для предпросмотра */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#222',
          color: '#fff',
          padding: '16px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Preview / HTML</h2>
        <div
          style={{
            border: '2px solid #444',
            minHeight: '80vh',
            padding: '16px',
          }}
        >
          {/* Здесь может отображаться предпросмотр HTML или любой другой контент */}
          <p>Здесь будет ваш HTML или другой контент для предпросмотра.</p>
        </div>
      </div>

      {/* Правая часть - колонка с настройками */}
      <div
        style={{
          width: '300px',
          backgroundColor: '#333',
          color: '#fff',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Page ID
          </label>
          <input
            type="text"
            value={page.pageId}
            onChange={(e) =>
              setPage((prev) => ({ ...prev, pageId: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '16px',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
            }}
            placeholder="Enter page ID"
          />
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Page Name
          </label>
          <input
            type="text"
            value={page.name}
            onChange={(e) =>
              setPage((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '16px',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
            }}
            placeholder="Enter page name"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Template
          </label>
          <select
            value={page.templateId}
            onChange={(e) =>
              setPage((prev) => ({ ...prev, templateId: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'blue',
              color: '#fff',
            }}
          >
            <option value="" disabled>
              Select a template
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        {/* Первый блок - ввод для Zone name + выбор ресурса */}
        {selectedTemplate &&
          selectedTemplate.zones &&
          selectedTemplate.zones.length > 0 && (
            <>
              {selectedTemplate.zones.map((zone) => (
                <div key={zone}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    {zone}
                  </label>
                  <select
                    value={page.resources.get(zone) || ''}
                    onChange={(e) => {
                      const newResources = new Map(page.resources);
                      newResources.set(zone, e.target.value);
                      setPage((prev) => ({ ...prev, resources: newResources }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'blue',
                      color: '#fff',
                    }}
                  >
                    <option value="">None</option>
                    {resources
                      .filter((resource) => resource.type !== ScriptType)
                      .map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </>
          )}
        {/* Второй блок - выбор скриптов и кнопки */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Select script
          </label>
          <select
            value={selectedScript}
            onChange={(e) => setSelectedScript(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'blue',
              color: '#fff',
            }}
          >
            <option value="">Select a script</option>
            {resources
              .filter(
                (resource) =>
                  resource.type === ScriptType &&
                  !page.scripts.includes(resource.id!),
              )
              .map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
          </select>

          <button
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '8px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
            }}
            onClick={addScript}
          >
            Add script
          </button>

          {page.scripts.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4>Added Scripts</h4>
              {page.scripts.map((scriptId) => {
                const scriptResource = resources.find((r) => r.id === scriptId);
                return (
                  <div
                    key={scriptId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      {scriptResource ? scriptResource.name : scriptId}
                    </span>
                    <button
                      style={{
                        backgroundColor: 'red',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                      }}
                      onClick={() => {
                        setPage((prev) => ({
                          ...prev,
                          scripts: prev.scripts.filter((id) => id !== scriptId),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Кнопки Back и Save */}
        <div style={{ marginTop: 'auto' }}>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
            }}
            onClick={() => router.push('/page')}
          >
            Back to Page
          </button>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
            }}
            onClick={handleClear}
          >
            Clear Form
          </button>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              backgroundColor: 'red',
              color: '#fff',
              border: 'none',
            }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
