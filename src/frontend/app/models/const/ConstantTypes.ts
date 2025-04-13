export const TextType = 'text' as const;
export const ImageType = 'image' as const;
export const ScriptType = 'js' as const;

export type ResourceType = typeof TextType | typeof ImageType | typeof ScriptType;