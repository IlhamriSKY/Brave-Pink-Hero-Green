import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CircleFlag } from 'react-circle-flags';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/i18n/languages';

/**
 * Language Switcher Component with Circle Flags
 * Uses react-circle-flags for modern flag icons
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLanguage = getLanguageByCode(i18n.language) || SUPPORTED_LANGUAGES[0];

  /**
   * Change application language
   * @param {string} langCode - Language code to switch to
   */
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Persist language preference
    localStorage.setItem('language', langCode);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: langCode }
    }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-auto px-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
          aria-label={t('navigation.language')}
        >
          <Languages className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <CircleFlag
              countryCode={currentLanguage.countryCode}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium">{currentLanguage.name}</span>
          </span>
          <span className="sm:hidden">
            <CircleFlag
              countryCode={currentLanguage.countryCode}
              className="w-4 h-4"
            />
          </span>
          <ChevronDown className="h-3 w-3 ml-1 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-background/95 backdrop-blur-md border border-border/50 shadow-lg"
        sideOffset={4}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              cursor-pointer px-3 py-2 text-xs transition-colors
              hover:bg-accent hover:text-accent-foreground
              focus:bg-accent focus:text-accent-foreground
              ${i18n.language === language.code
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground'
              }
            `}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                changeLanguage(language.code);
              }
            }}
          >
            <div className="flex items-center gap-3 w-full">
              <CircleFlag
                countryCode={language.countryCode}
                className="w-5 h-5 shrink-0"
              />
              <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground leading-none">
                  {language.name}
                </span>
                <span className="text-xs text-muted-foreground leading-none truncate">
                  {language.nativeName}
                </span>
              </div>
              {i18n.language === language.code && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
