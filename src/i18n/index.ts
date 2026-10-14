import es from './es';
import en from './en';
import type { Locale, SiteContent } from './types';

const content: Record<Locale, SiteContent> = { es, en };

export const getContent = (locale: Locale): SiteContent => content[locale];
