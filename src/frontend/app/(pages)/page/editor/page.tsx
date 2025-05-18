'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import { Toaster } from 'sonner';
import { pageApi } from '@/app/services/api';
import { PageModel } from '@/app/models/pageModel';
import { ResourceModel } from '@/app/models/resourceModel';
import { TemplateModel } from '@/app/models/templateModel';
import styles from './page.module.css';
import { Button } from '@/components/ui/button';
import { generateRawHtml } from './pageGenerator';
import { UrlResult, HtmlResult, PngResult } from './const/resultType';
import { getUrlPage, getHtmlPage, getPngPage } from './getPage';
import {
  ImageType,
  ScriptType,
  TextType,
} from '@/app/models/const/ConstantTypes';
import { AxiosError } from 'axios';

// Компонент-обертка для безопасного получения searchParams
function SearchParamsProvider({
  children,
}: {
  children: (params: URLSearchParams) => React.ReactNode;
}) {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  if (!searchParams) return <div>Loading...</div>;

  return <>{children(searchParams)}</>;
}

// Основной компонент редактора
function PageEditorContent({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter();
  const [page, setPage] = useState<PageModel>({
    id: undefined,
    pageId: '',
    name: '',
    templateId: '',
    resources: new Map(),
    scripts: [],
    creater: '',
  });

  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [templates, setTemplates] = useState<TemplateModel[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [renderOption, setRenderOption] = useState('url');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/login');
    }

    setPage((prev) => ({ ...prev, creater: userId || '' }));
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
  }, [router]);

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

  useEffect(() => {
    updatePreview();
  }, [page, templates, resources]);

  const selectedTemplate = templates.find((t) => t.id === page.templateId);

  const updatePreview = () => {
    if (!selectedTemplate) return;

    removeScripts();

    const parser = new DOMParser();
    const doc = parser.parseFromString(
      selectedTemplate.templateHtml,
      'text/html'
    );

    selectedTemplate.zones.forEach((zoneName) => {
      const zoneElement = doc.querySelector(`div[zone-name="${zoneName}"]`);
      if (!zoneElement) return;

      const resourceId = page.resources.get(zoneName);
      const resource = resources.find((r) => r.id === resourceId);

      if (resource) {
        if (resource.type === ImageType) {
          const img = doc.createElement('img');
          img.src = resource.value;
          img.style.maxWidth = '100%';
          zoneElement.innerHTML = '';
          zoneElement.appendChild(img);
        } else {
          zoneElement.innerHTML = resource.value;
        }
      } else {
        zoneElement.innerHTML = '[ZONE CONTENT]';
      }
    });

    page.scripts.forEach((scriptId) => {
      const scriptResource = resources.find(
        (r) => r.id === scriptId && r.type === ScriptType
      );
      if (scriptResource) {
        const scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.setAttribute('data-preview', 'true');
        scriptEl.setAttribute('data-script-id', scriptId);
        scriptEl.textContent = `(function(){${scriptResource.value}})()`;
        document.body.appendChild(scriptEl);
      }
    });

    setPreviewHtml(doc.body.innerHTML);
  };

  const removeScripts = (scriptId?: string) => {
    if (scriptId) {
      const scriptToRemove = document.querySelector(
        `script[data-script-id="${scriptId}"]`
      );
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      return;
    }

    const allPreviewScripts = document.querySelectorAll(
      'script[data-preview="true"]'
    );
    allPreviewScripts.forEach((script) => script.remove());
  };

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
      const pagesRes = await pageApi.getAll();
      const pagesList: PageModel[] = pagesRes.data;

      const duplicatePageId = pagesList.find(
        (p) =>
          p.pageId.trim().toLowerCase() === page.pageId.trim().toLowerCase() &&
          p.id !== page.id
      );
      if (duplicatePageId) {
        sendError('Duplicate Page ID', 'A page with this Page ID already exists');
        return;
      }

      const duplicatePageName = pagesList.find(
        (p) =>
          p.name.trim().toLowerCase() === page.name.trim().toLowerCase() &&
          p.id !== page.id
      );
      if (duplicatePageName) {
        sendError('Duplicate Page Name', 'A page with this page name already exists');
        return;
      }

      const payload = {
        ...page,
        resources: Object.fromEntries(page.resources),
        rawHtml: generateRawHtml(
          previewHtml,
          selectedTemplate?.templateCss || '',
          page.scripts.map((s) => resources.find((r) => r.id === s)?.value || '')
        ),
      };

      const idParam = searchParams.get('id');
      const method = idParam ? 'PUT' : 'POST';
      const endpoint = idParam ? `/api/page/${idParam}` : '/api/page';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Result not ok');

      const savedData = await res.json();

      if (renderOption === UrlResult.toLowerCase()) {
        getUrlPage(page.pageId);
      } else if (renderOption === HtmlResult) {
        getHtmlPage(page.name, page.pageId);
      } else if (renderOption === PngResult) {
        getPngPage(page.name, page.pageId);
      }

      sendSuccess('Saved', 'Page saved successfully');

      if (!idParam) {
        router.push(`/page/editor?id=${savedData.id}`);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      sendError('Error saving page', err.response?.data?.message || err.message);
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
      creater: '',
    });
    setPreviewHtml('');
    sendSuccess('Form cleared', 'You can start fresh');
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorPreview}>
        <h1 className={styles.editorTitle}>Page Preview</h1>
        <div id="body-div" className={styles.editorPreviewContent}>
          {selectedTemplate?.templateCss && (
            <style
              dangerouslySetInnerHTML={{ __html: selectedTemplate.templateCss }}
            />
          )}
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>

      <div className={styles.editorSidebar}>
        <h1>Page Editor</h1>
        <label>Page ID</label>
        <input
          type="text"
          value={page.pageId}
          onChange={(e) =>
            setPage((prev) => ({ ...prev, pageId: e.target.value }))
          }
          onBlur={(e) => {
            setPage((prev) => ({
              ...prev,
              pageId: e.target.value.replaceAll(' ', '_'),
            }));
          }}
        />
        <label>Page Name</label>
        <input
          type="text"
          value={page.name}
          onChange={(e) =>
            setPage((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <label>Template</label>
        <select
          value={page.templateId}
          onChange={(e) =>
            setPage((prev) => ({ ...prev, templateId: e.target.value }))
          }
        >
          <option value="" disabled>
            Select Template
          </option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {page.templateId && (
          <Button
            className={styles.outlineButton}
            onClick={() => {
              router.push(`/template/builder?id=${page.templateId}`);
            }}
          >
            Change template
          </Button>
        )}
        {selectedTemplate?.zones.map((zone) => (
          <div key={zone} className={styles.zoneRow}>
            <label>{zone}</label>
            <select
              className={styles.zoneSelect}
              value={page.resources.get(zone) || ''}
              onChange={(e) => {
                const newMap = new Map(page.resources);
                newMap.set(zone, e.target.value);
                setPage((prev) => ({ ...prev, resources: newMap }));
              }}
            >
              <option value="">Select Resource</option>
              {resources
                .filter((r) => r.type === ImageType || r.type === TextType)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>
        ))}

        <label>Script</label>
        <select
          value={selectedScript}
          onChange={(e) => setSelectedScript(e.target.value)}
        >
          <option value="">Select Script</option>
          {resources
            .filter(
              (r) => r.type === ScriptType && !page.scripts.includes(r.id!)
            )
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
        </select>
        <Button
          className={styles.outlineButton}
          onClick={() => {
            if (selectedScript) {
              setPage((prev) => ({
                ...prev,
                scripts: [...prev.scripts, selectedScript],
              }));
              setSelectedScript('');
            }
          }}
        >
          Add Script
        </Button>

        {page.scripts.length > 0 && (
          <div>
            <strong>Added Scripts:</strong>
            {page.scripts.map((scriptId) => {
              const script = resources.find((r) => r.id === scriptId);
              return (
                <div key={scriptId} className={styles.scriptItem}>
                  <span className={styles.scriptName}>{script?.name}</span>
                  <Button
                    onClick={() =>
                      setPage((prev) => ({
                        ...prev,
                        scripts: prev.scripts.filter((id) => id !== scriptId),
                      }))
                    }
                    className={styles.removeButton}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.editorActions}>
          <Button
            className={styles.outlineButton}
            onClick={() => router.push('/page')}
          >
            Back to Pages
          </Button>
          <Button
            className={styles.outlineButton}
            onClick={() => router.push('/resource')}
          >
            Show all resources
          </Button>
          <Button className={styles.outlineButton} onClick={handleClear}>
            Clear Form
          </Button>
          <label>Render Option</label>
          <select
            value={renderOption}
            onChange={(e) => setRenderOption(e.target.value)}
            className={styles.selectedScript}
          >
            <option value={UrlResult}>{UrlResult}</option>
            <option value={HtmlResult}>{HtmlResult} file</option>
            <option value={PngResult}>{PngResult} file</option>
          </select>
          <Button className={styles.button} onClick={handleSave}>
            Page Render
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

// Экспортируемый компонент страницы
export default function PageEditor() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <SearchParamsProvider>
        {(searchParams) => <PageEditorContent searchParams={searchParams} />}
      </SearchParamsProvider>
    </Suspense>
  );
}