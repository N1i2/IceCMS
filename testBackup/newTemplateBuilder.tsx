"use client";

import { useEffect, useRef } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import baseBlocksPlugin from "grapesjs-blocks-basic";

export default function HomePage() {
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const editor = grapesjs.init({
      container: "#gjs-editor",
      plugins: [baseBlocksPlugin],
      pluginsOpts: {
        "gjs-preset-webpage": {},
      },
      height: "600px",
      fromElement: false,
      storageManager: false,
    });

    // Set initial content
    const initialHtml = `
<body>
  <div class="welcome">
    <h1>Hello, GrapesJS!</h1>
    <p>This is a simple starter template.</p>
  </div>
  <div id="i3i6y" class="gjs-row">
    <div class="gjs-cell">
      <div zone-name="Zone" id="i5jwf">[ZONE CONTENT]</div>
    </div>
    <div class="gjs-cell">
      <div zone-name="Zone 2" id="ivgif">[ZONE CONTENT]</div>
    </div>
  </div>
</body>
    `;

    const initialCss = `
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
h1 {
  color: darkblue;
}
.gjs-row {
  display: table;
  padding: 10px;
  width: 100%;
}
.gjs-cell {
  width: 50%;
  display: table-cell;
  height: 75px;
}
#i5jwf, #ivgif {
  min-height: 80px;
  padding: 4px;
  text-align: center;
}
@media (max-width: 768px) {
  .gjs-cell {
    width: 100%;
    display: block;
  }
}
    `;

    const bm = editor.BlockManager;
    const dc = editor.DomComponents;

    // Удаляем стандартные колонки
    bm.remove('column1');
    bm.remove('column2');
    bm.remove('column3');

    // Создаем тип компонента Zone
    dc.addType("zone", {
      isComponent: (el) => el.tagName === "DIV" && el.hasAttribute("zone-name"),
      model: {
        defaults: {
          tagName: "div",
          draggable: true,
          droppable: true,
          attributes: { "zone-name": "" },
          style: {
            minHeight: "80px",
            padding: "4px",
            "text-align": "center",
            "border": "1px dashed #ccc",
            "background-color": "rgba(0,0,0,0.05)"
          },
          components: "[ZONE CONTENT]",
          traits: [
            {
              type: "text",
              label: "Zone Name",
              name: "zone-name",
              placeholder: "e.g. Zone, Zone 2",
            },
          ],
        },
      },
    });

    // Создаем блоки Zone и Zone 2
    bm.add("zone-block", {
      label: "Zone",
      category: "Basic",
      content: {
        type: "zone",
        attributes: { "zone-name": "Zone" },
      },
      attributes: { class: "fa fa-square-o" },
    });

    bm.add("zone-block-2", {
      label: "Zone 2",
      category: "Basic",
      content: {
        type: "zone",
        attributes: { "zone-name": "Zone 2" },
      },
      attributes: { class: "fa fa-square-o" },
    });

    // Создаем блок с двумя зонами (аналог двух колонок)
    bm.add("two-zones", {
      label: "Two Zones",
      category: "Basic",
      content: {
        tagName: "div",
        attributes: { class: "gjs-row" },
        components: [
          {
            type: "zone",
            attributes: { "zone-name": "Zone" },
            style: { width: "50%", display: "inline-block" }
          },
          {
            type: "zone",
            attributes: { "zone-name": "Zone 2" },
            style: { width: "50%", display: "inline-block" }
          }
        ]
      },
      attributes: { class: "fa fa-columns" },
    });

    // Удаляем ненужные блоки
    bm.remove("video");
    bm.remove("map");

    // Реорганизуем порядок блоков
    const allBlocks = bm.getAll();
    const zoneBlocks = [
      allBlocks.get("zone-block"),
      allBlocks.get("zone-block-2"),
      allBlocks.get("two-zones"),
    ].filter(Boolean);

    const otherBlocks = allBlocks.models.filter(
      (m) => !["zone-block", "zone-block-2", "two-zones"].includes(m.id)
    );

    (allBlocks as any).reset([...zoneBlocks, ...otherBlocks]);

    editor.setComponents(initialHtml);
    editor.setStyle(initialCss);

    editorRef.current = editor;
  }, []);

  const handleExport = () => {
    const html = editorRef.current?.getHtml();
    const css = editorRef.current?.getCss();

    fetch("/api/save-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, css }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Smart CMS builder</h1>
      <div>
        <div id="gjs-editor"></div>
        <button
          onClick={handleExport}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Export & Save
        </button>
      </div>
    </div>
  );
}

dc.addType("footer-zone", {
    isComponent: (el) => el.tagName === "FOOTER" && el.hasAttribute("zone-name"),
    model: {
      defaults: {
        tagName: "footer",
        draggable: true,
        droppable: false,
        attributes: { "zone-name": "Footer" },
        style: {
          position: "fixed",
          bottom: "1px",
          left: "1px",
          right: "1px",
          minHeight: "80px",
          padding: "4px",
          "text-align": "center",
          "border": "1px dashed #ccc",
          "background-color": "rgba(0,0,0,0.05)"
        },
        components: "[ZONE CONTENT]",
        traits: [
          {
            type: "text",
            label: "Footer Text",
            name: "footer-text",
            placeholder: "Enter footer text",
            changeProp: true
          }
        ],
      },
      updated(property, value) {
        if (property === 'footer-text') {
          this.components(value || "Footer Content");
        }
      }
    },
  });