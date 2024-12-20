import React from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguageStore, languages } from '@/store/useLanguageStore';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: typeof languages[0]) => {
    console.log('Changing language to:', language.code);
    setLanguage(language);
    i18n.changeLanguage(language.code);
  };

  return (
    <div className="px-6 py-4 border-t border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Globe size={16} />
            <span>{currentLanguage.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[140px]">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className={`text-sm cursor-pointer ${
                currentLanguage.code === language.code ? 'bg-gray-50' : ''
              }`}
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
