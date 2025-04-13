"use client";

import { useEffect, useRef, useState } from "react";
import grapesjs, { Editor } from "grapesjs";
import { useRouter, useSearchParams } from "next/navigation";
import "grapesjs/dist/css/grapes.min.css";
import baseBlocksPlugin from "grapesjs-blocks-basic";
import { templateApi } from "@/app/services/api";
import { TemplateModel } from "@/app/models/templateModel";
import { initialHtml, initialCss } from "./const/defaultValues";

export default function HomePage() {
  const editorRef = useRef<Editor | null>(null);
  const [templateName, setTemplateName] = useState<string>("Template 1");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
      const id = searchParams.get("id");
      
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
      
      editorRef.current = editor;

      if (id) {
        loadTemplate(id);
      }

      const bm = editor.BlockManager;
      const dc = editor.DomComponents;
  
      dc.addType("zone", {
        isComponent: (el) => el.tagName === "DIV" && el.hasAttribute("zone-name"),
        model: {
          defaults: {
            tagName: "div",
            draggable: true,
            droppable: false,  
            attributes: { "zone-name": "" },
            style: {
              minHeight: "80px",
              padding: "4px",
              "text-align": "center",
              border: "1px dashed #ccc",
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
  
      bm.add("zone-block", {
        label: "Zone",
        category: "Basic",
        content: {
          type: "zone",
          attributes: { "zone-name": "Zone" },
          style: { width: "100%", display: "inline-block" }
        },
        attributes: { class: "fa fa-square-o" },
      });
  
      bm.remove("video");
      bm.remove("map");
      
      if (!id) {
        editor.setComponents(initialHtml);
        editor.setStyle(initialCss);
      }
  }, []);

  const loadTemplate = async (id: string) => {
    try {
      const response = await templateApi.getById(id);

      const { templateHtml, templateCss } = response.data;
      editorRef.current?.setComponents(templateHtml);
      editorRef.current?.setStyle(templateCss);
      setTemplateName(response.data.name);
    } catch (err: any) {
      console.log("Failed to load templates.");
    } 
  };

  const handlePublish = async () => {
    const html = editorRef.current?.getHtml();
    const css = editorRef.current?.getCss();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || "", "text/html");
    
    const zoneElements = doc.querySelectorAll("[zone-name]");
    const zones: string[] = [];
    
    zoneElements.forEach((el) => {
      const zoneName = el.getAttribute("zone-name");
      if (zoneName) {
        zones.push(zoneName);
      }
    });
    
    try {
      const {data: templates} = await templateApi.getAll();

      const duplicate = templates.find((template: TemplateModel) => template.name === templateName)
      && searchParams.get("id") !== templates.find((res: { name: string }) => res.name === templateName)?.id;
      
      if (duplicate) {
        alert("Template name already exists. Please choose a different name.");
        return;
      }
    } catch (error) {
      console.error("Error checking for duplicate templates", error);
      return;
    }

    const templateModel: TemplateModel = {
      name: templateName,
      templateHtml: html || "",
      templateCss: css || "",
      zones: zones,
      creater: 1,
    };
    
    const currentTemplateId = searchParams.get("id");

    if(currentTemplateId) {
      templateApi.update(currentTemplateId ,templateModel);

      return;
    }

    templateApi.create(templateModel);
  };

  return (
    <div>
      <h1>Smart CMS builder</h1>
      <div className="mb-4">
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter template name"
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <div id="gjs-editor"></div>
        <button
          onClick={handlePublish}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Publish
        </button>
        <button
          onClick={() => router.push("/template")}
          className="mt-4 ml-4 p-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
        >
          Back to Templates
        </button>
      </div>
    </div>
  );
}