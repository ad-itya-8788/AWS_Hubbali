export interface TemplateLanguageOption {
  code: string;
  name: string;
}

export const TEMPLATE_LANGUAGE_OPTIONS: readonly TemplateLanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'en_US', name: 'English (US)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
] as const;

export function isSupportedTemplateLanguage(code: string): boolean {
  return TEMPLATE_LANGUAGE_OPTIONS.some((option) => option.code === code);
}
