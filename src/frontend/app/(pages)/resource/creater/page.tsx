'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { sendSuccess, sendError } from '@/helpModule/Massages';
import Image from 'next/image';
import { resourceApi } from '@/app/services/api';
import { ResourceModel } from '@/app/models/resourceModel';
import {
  ResourceType,
  TextType,
  ImageType,
  ScriptType,
} from '@/app/models/const/ConstantTypes';
import styles from './page.module.css';

export default function ResourceCreater() {
  const [resource, setResource] = useState<Omit<ResourceModel, 'id'>>({
    name: '',
    type: TextType,
    value: '',
    creater: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; file?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    document.title = 'Resource Creator';
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const loadResource = async () => {
        try {
          const response = await resourceApi.getById(id);
          const loadedResource: ResourceModel = response.data;
          setResource({
            name: loadedResource.name,
            type: loadedResource.type,
            value: loadedResource.value,
            creater: loadedResource.creater,
          });
          if (loadedResource.type === ImageType) {
            setImageFile(null);
          }
        } catch (error) {
          console.error('Failed to load resource', error);
        }
      };
      loadResource();
    }
  }, [searchParams]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (!['jpg', 'png', 'jpeg'].includes(extension || '')) {
        setErrors((prev) => ({
          ...prev,
          file: 'Only JPG or PNG files are allowed',
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setResource((prev) => ({
          ...prev,
          value: reader.result as string,
        }));
      };

      reader.readAsDataURL(file);
      setImageFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleClear = () => {
    setResource({
      name: '',
      type: TextType,
      value: '',
      creater: 1,
    });
    setImageFile(null);
    setErrors({});

    sendSuccess('Success', 'Resource clear successfully!');
  };

  const isFormValid = () => {
    const newErrors: { name?: string; file?: string } = {};

    if (!resource.name || resource.name.length <= 0) {
      newErrors.name = 'Invalid name';
    }

    if (resource.type !== ImageType && resource.value.length <= 0) {
      sendError('Invalid content', 'Please enter content');
      return false;
    }

    if (resource.type === ImageType && !resource.value) {
      sendError('Invalid content', 'Please upload an image');
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      sendError('Validation error', 'Please check the form');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);

    try {
      const { data: existingResources } = await resourceApi.getAll();
      const id = searchParams.get('id');

      if (
        existingResources.some(
          (res) => res.name === resource.name && (!id || res.id !== id),
        )
      ) {
        sendError(
          'Name conflict',
          `Resource with name "${resource.name}" already exists`,
        );
        return;
      }

      if (id) {
        await resourceApi.update(id, resource);
      } else {
        await resourceApi.create(resource);
        handleClear();
      }

      sendSuccess('Success', 'Resource saved successfully!');
    } catch (error) {
      console.error('Error saving resource:', error);
      sendError('Error', 'Failed to save resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Resource Creator</h1>

      <Card className={styles.card}>
        <CardContent className={styles.content}>
          <div className={styles.formGroup}>
            <Label htmlFor="name" className={styles.label}>
              Name
            </Label>
            <Input
              id="name"
              value={resource.name}
              onChange={(e) =>
                setResource((prev) => ({ ...prev, name: e.target.value }))
              }
              className={styles.input}
              placeholder="Resource name"
            />
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="type" className={styles.label}>
              Type
            </Label>
            <Select
              value={resource.type}
              onValueChange={(value) => {
                setResource((prev) => ({
                  ...prev,
                  type: value as ResourceType,
                  value: '',
                }));
                setImageFile(null);
              }}
            >
              <SelectTrigger
                className={`${styles.input} ${styles.selectTrigger}`}
                id="type"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className={styles.selectContent}>
                <SelectItem className={styles.selectItem} value={TextType}>
                  Text / HTML / CSS
                </SelectItem>
                <SelectItem className={styles.selectItem} value={ImageType}>
                  Image
                </SelectItem>
                <SelectItem className={styles.selectItem} value={ScriptType}>
                  Script
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(resource.type === TextType || resource.type === ScriptType) && (
            <div className={styles.formGroup}>
              <Label htmlFor="content" className={styles.label}>
                {resource.type.toLowerCase()} content
              </Label>
              <Textarea
                id="content"
                value={resource.value}
                onChange={(e) =>
                  setResource((prev) => ({ ...prev, value: e.target.value }))
                }
                rows={6}
                className={`${styles.input} ${styles.textarea}`}
                placeholder={`Enter your ${resource.type.toLowerCase()} here...`}
              />
            </div>
          )}

          {resource.type === ImageType && (
            <div className={styles.formGroup}>
              <Label className={styles.label}>Image</Label>
              <div className={styles.imagePreview}>
                <label className={styles.imageUploadLabel}>
                  {!resource.value ? (
                    <div className={styles.emptyImagePlaceholder}>
                      <svg
                        className={styles.uploadIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className={styles.uploadHint}>
                        Click to upload image
                      </span>
                    </div>
                  ) : (
                    <div className={styles.imageContainer}>
                      <Image
                        src={resource.value}
                        alt="Preview"
                        width={500}
                        height={300}
                        className={styles.image}
                      />
                      <div className={styles.imageOverlay}>
                        <span className={styles.overlayText}>
                          Click to change image
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </label>
                {errors.file && (
                  <p className={styles.errorText}>{errors.file}</p>
                )}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={() => router.push('/resource')}
              className={styles.outlineButton}
            >
              Back to Resources
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className={styles.outlineButton}
            >
              Clear
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className={styles.loader}>↻</span>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
