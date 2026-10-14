export interface Todo {
  todo: true;
  label: string;
}

/** Marca un dato pendiente. `npm run todo` lista todos los TODO(...) de src/content/links.ts. */
export const TODO = (label: string): Todo => ({ todo: true, label });

export const isTodo = (v: unknown): v is Todo =>
  typeof v === 'object' && v !== null && (v as Todo).todo === true;
