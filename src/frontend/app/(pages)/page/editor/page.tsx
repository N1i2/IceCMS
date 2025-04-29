'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import { Toaster } from 'sonner';
import { pageApi } from '@/app/services/api';
import { PageModel } from '@/app/models/pageModel';
import { ResourceModel } from '@/app/models/resourceModel';
import { TemplateModel } from '@/app/models/templateModel';
import { ImageType, ScriptType } from '@/app/models/const/ConstantTypes';

export default function PageEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState<PageModel>({
    id: undefined,
    pageId: '',
    name: '',
    templateId: '',
    resources: new Map(),
    scripts: [],
    creater: '1',
  });

  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    document.title = 'Page Editor';

    const fetchData = async () => {
      try {
        const [resourcesRes, templatesRes] = await Promise.all([
          fetch('/api/resource').then((res) => res.json()),
          fetch('/api/template').then((res) => res.json()),
        ]);
        setResources(resourcesRes);
        setTemplates(templatesRes);
      } catch {
        sendError('Failed to load data', 'Please try again later');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    const loadPage = async () => {
      try {
        const res = await pageApi.getById(id);
        const data = res.data;
        setPage({
          ...data,
          resources: new Map(Object.entries(data.resources || {})),
        });
      } catch (err) {
        sendError('Error loading page', String(err));
      }
    };

    loadPage();
  }, [searchParams]);

  const selectedTemplate = templates.find((t) => t.id === page.templateId);

  const updatePreview = () => {
    const template = selectedTemplate;
    if (!template) return;
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(template.templateHtml, 'text/html');
  
    // Для каждой зоны вставляем контент
    template.zones.forEach((zoneName) => {
      const zoneElement = doc.querySelector(`div[zone-name="${zoneName}"]`);
      if (!zoneElement) return;
  
      const resourceId = page.resources.get(zoneName);
      const resource = resources.find((r) => r.id === resourceId);
  
      if (resource) {
        if (resource.type === ImageType) {
          // Вставка изображения
          const img = doc.createElement('img');
          img.src = resource.value;
          img.style.maxWidth = '100%';
          zoneElement.innerHTML = '';
          zoneElement.appendChild(img);
        } else {
          // Вставка HTML или текста
          zoneElement.innerHTML = resource.value;
        }
      } else {
        // Если ресурс не выбран — оставить зону пустой
        zoneElement.innerHTML = '[ZONE CONTENT]';
      }
    });
  
    // Обновляем HTML предпросмотра
    setPreviewHtml(doc.body.innerHTML);
  };
  

  useEffect(() => {
    updatePreview();
  }, [page.templateId, page.resources, templates, resources]);

  const isValidPage = () => {
    if (!page.pageId) {
      sendError('Page ID is required', 'Please enter a valid ID');
      return false;
    }
    if (!page.name) {
      sendError('Page name is required', 'Please enter a name');
      return false;
    }
    if (!page.templateId) {
      sendError('Template is required', 'Select a template');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!isValidPage()) return;

    try {
      const payload = {
        ...page,
        resources: Object.fromEntries(page.resources),
      };

      const res = await fetch('/api/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      sendSuccess('Saved', 'Page saved successfully');
    } catch (err) {
      sendError('Error', 'Saving page failed');
    }
  };

  const handleClear = () => {
    setPage({
      id: undefined,
      pageId: '',
      name: '',
      templateId: '',
      resources: new Map(),
      scripts: [],
      creater: '1',
    });
    setPreviewHtml('');
    sendSuccess('Form cleared', 'You can start fresh');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left - Preview */}
      <div style={{ flex: 1, backgroundColor: '#222', color: '#fff', padding: '16px' }}>
        <h2>Page Preview</h2>
        <div style={{ border: '2px solid #444', padding: '16px', minHeight: '80vh' }}>
          {selectedTemplate?.templateCss && (
            <style dangerouslySetInnerHTML={{ __html: selectedTemplate.templateCss }} />
          )}
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>

      {/* Right - Settings */}
      <div style={{ width: '350px', backgroundColor: '#333', color: '#fff', padding: '16px' }}>
        <label>Page ID</label>
        <input
          type="text"
          value={page.pageId}
          onChange={(e) => setPage((prev) => ({ ...prev, pageId: e.target.value }))}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <label>Page Name</label>
        <input
          type="text"
          value={page.name}
          onChange={(e) => setPage((prev) => ({ ...prev, name: e.target.value }))}
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />
        <label>Template</label>
        <select
          value={page.templateId}
          onChange={(e) => setPage((prev) => ({ ...prev, templateId: e.target.value }))}
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        >
          <option value="">Select Template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Zones */}
        {selectedTemplate?.zones.map((zone) => (
          <div key={zone} style={{ marginBottom: '12px' }}>
            <label>{zone}</label>
            <select
              value={page.resources.get(zone) || ''}
              onChange={(e) => {
                const newMap = new Map(page.resources);
                newMap.set(zone, e.target.value);
                setPage((prev) => ({ ...prev, resources: newMap }));
              }}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select Resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Scripts */}
        <label>Script</label>
        <select
          value={selectedScript}
          onChange={(e) => setSelectedScript(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        >
          <option value="">Select Script</option>
          {resources
            .filter((r) => r.type === ScriptType && !page.scripts.includes(r.id!))
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
        </select>
        <button
          onClick={() => {
            if (selectedScript) {
              setPage((prev) => ({
                ...prev,
                scripts: [...prev.scripts, selectedScript],
              }));
              setSelectedScript('');
            }
          }}
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        >
          Add Script
        </button>

        {/* Added scripts */}
        {page.scripts.length > 0 && (
          <div>
            <strong>Added Scripts:</strong>
            {page.scripts.map((scriptId) => {
              const script = resources.find((r) => r.id === scriptId);
              return (
                <div key={scriptId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{script?.name}</span>
                  <button
                    onClick={() =>
                      setPage((prev) => ({
                        ...prev,
                        scripts: prev.scripts.filter((id) => id !== scriptId),
                      }))
                    }
                    style={{ backgroundColor: 'red', color: '#fff', border: 'none' }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => router.push('/page')}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          >
            Back
          </button>
          <button
            onClick={handleClear}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          >
            Clear Form
          </button>
          <button onClick={handleSave} style={{ width: '100%', padding: '8px' }}>
            Save Page
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
