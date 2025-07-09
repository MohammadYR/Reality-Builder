'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'fa' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors shadow-sm"
      aria-label={locale === 'en' ? 'Switch to Persian' : 'تغییر به انگلیسی'}
    >
      {locale === 'en' ? 'فارسی (FA)' : 'English (EN)'}
    </button>
  );
};

export default LanguageSwitcher;
