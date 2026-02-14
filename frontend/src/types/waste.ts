export interface WasteCategory {
  id: string;
  name: string;
  parentId: string | null;
  children?: WasteCategory[];
}

export interface WasteItem {
  id: string;
  categoryId: string;
  name: string;
  sizes: WasteSize[];
}

export interface WasteSize {
  id: string;
  label: string;
  description: string;
}
