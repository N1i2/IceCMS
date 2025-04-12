"use client";

import { useState, ChangeEvent, useMemo, useEffect } from 'react';
import styles from './page.module.css';
import { resourceApi } from '@/app/services/api';
import Image from 'next/image';
import { ResourceModel, ResourceType } from '@/app/models/resourceModel';
import { useRouter, useSearchParams } from "next/navigation";

export default function ResourceCreater() {
  const [name, setName] = useState('');
  const [type, setType] = useState<ResourceType>('text');
  const [textContent, setTextContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string, file?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const loadResource = async () => {
        try {
          const response = await resourceApi.getById(id)  ;
          const resource: ResourceModel = response.data;
          setName(resource.name);
          setType(resource.type as ResourceType);
          if (resource.type === 'image') {
            setImagePreview(resource.value);
          } else {
            setTextContent(resource.value);
          }
        } catch (error) {
          console.error("Failed to load resource", error);
        }
      };
      loadResource();
    }
  }, [searchParams]);

  const isFormValid = useMemo(() => {
    const isNameValid = name.startsWith('resource_') && name.length > 'resource_'.length;

    if (type === 'image') {
      return isNameValid && (imageFile !== null || imagePreview !== null);
    }
    return isNameValid && textContent.trim() !== '';
  }, [name, type, textContent, imageFile]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  const handleNameFocus = () => {
    if (!name) {
      setName('resource_');
    }
  };

  const handleNameBlur = () => {
    if (name.length <= 'resource_'.length) {
      setName('');
      setErrors(prev => ({ ...prev, name: undefined }));
    } else if (!name.startsWith('resource_')) {
      setName(`resource_${name}`);
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as ResourceType);
    setTextContent('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase()!;
      
      if (!['jpg', 'png', 'jpeg'].includes(extension || '')) {
        setErrors(prev => ({ ...prev, file: "Only JPG or PNG files are allowed" }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      } 

      reader.readAsDataURL(file);

      setErrors(prev => ({ ...prev, file: undefined }));
      setImageFile(file);
    }
  };

  const handleClear = async () => {
    setName('');
    setType('text');
    setTextContent('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleSave = async () => {
    if (!isFormValid) {
      alert('Resource not valid');
      return;
    }
  
    setIsLoading(true); 
  
    try {
      const { data: resources } = await resourceApi.getAll();
  
      if (resources.some((res: { name: string }) => res.name === name)&&
          searchParams.get("id") !== resources.find((res: { name: string }) => res.name === name)?.id) {
        alert('Resource with this name already exists!');
        setIsLoading(false);
        return;
      }
  
      const resData: ResourceModel = {
        name: name,
        type: type,
        value: type === 'image' ? imagePreview || '' : textContent,
        creater: 1,
      };
  
      const id = searchParams.get("id");
      if (id) {
        await resourceApi.update(id, resData);
      } else {
        await resourceApi.create(resData);
      }
  
      alert('Resource saved successfully!');
      handleClear();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    } finally {
      setIsLoading(false); 
    }
  };  

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Resource Builder</h1>
      </div>
      
      <div className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            onFocus={handleNameFocus}
            onBlur={handleNameBlur}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="resource_"
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="type" className={styles.label}>Type</label>
          <select
            id="type"
            value={type}
            onChange={handleTypeChange}
            className={styles.input}
          >
            <option value="text">Text / HTML / CSS</option>
            <option value="image">Image</option>
            <option value="script">Script</option>
          </select>
        </div>

        {(type === 'text' || type === 'script') && (
          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              {type} Content
            </label>
            <textarea
              id="content"
              value={textContent}
              onChange={handleTextChange}
              rows={6}
              className={`${styles.input} ${styles.textarea}`}
              placeholder={`Enter your ${type.toLowerCase()} here...`}
            />
          </div>
        )}

        {type === 'image' && (
          <div className={styles.formGroup}>
            <div className={styles.fileUploadContainer}>
              {!imagePreview ? (
                <label className={styles.fileUploadButton}>
                  Choose File
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </label>
              ) : (
                <label className={styles.imagePreviewContainer}>
                  <div className={styles.imagePreviewWrapper}>
                    <Image
                      src={imagePreview || ''} 
                      alt="Preview"
                      width={500} 
                      height={300}
                      className={styles.imagePreview}
                      priority={false} 
                    />
                    <div className={styles.imageOverlay}>
                      <span className={styles.overlayText}>Click to change image</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </label>
              )}
              {errors.file && <p className={styles.errorText}>{errors.file}</p>}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={() => router.push("/resource")}
            className={`${styles.button} ${styles.backButton}`}
          >
            Back to Resources
          </button>
          <button
            onClick={handleClear}
            className={`${styles.button} ${styles.clearButton}`}
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.saveButton} ${!isFormValid ? styles.disabledButton : ''}`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <span className={styles.loader}></span> 
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}