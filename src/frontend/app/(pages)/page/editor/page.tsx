'use client';

import { PageModel } from '@/app/models/pageModel';
import { ResourceModel } from '@/app/models/resourceModel';
import { TemplateModel } from '@/app/models/templateModel';
import { ScriptType } from '@/app/models/const/ConstantTypes';
import { useEffect, useState } from 'react';

export default function ResourcesPage() {
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
        console.error('Failed to load resources', error);
      }
    };

    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/template');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates', error);
      }
    };

    loadResources();
    loadTemplates();
  }, []);

  const selectedTemplate = templates?.find(
    (template) => template.id === page.templateId,
  );

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
          backgroundColor: '#222', // Тёмный/чёрный фон
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
          backgroundColor: '#333', // Тёмный/чёрный фон для панели
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
                      console.log(newResources);
                      console.log(page);

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
            onClick={() => {
              if (selectedScript && !page.scripts.includes(selectedScript)) {
                setPage((prev) => ({
                  ...prev,
                  scripts: [...prev.scripts, selectedScript],
                }));
                setSelectedScript('');
              }
            }}
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
          >
            Back
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
            onClick={async () => {
              try {
                
                const response = await fetch('/api/page', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(page),
                });
                console.log(page);

                console.log(JSON.stringify(page));
                if (!response.ok) {
                  throw new Error('Failed to save page.');
                }
                await response.json();
                alert('Page saved successfully!');
              } catch (error) {
                console.error('Error saving page:', error);
                alert('Error saving page');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
