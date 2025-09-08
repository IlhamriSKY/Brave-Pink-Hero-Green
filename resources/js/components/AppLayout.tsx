import React from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, Cat } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { DotPattern } from '@/components/magicui/dot-pattern'
import { SimpleLoveButton } from '@/components/SimpleLoveButton'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'

/**
 * AppLayout Component
 *
 * The main application shell that provides consistent layout structure across all pages.
 *
 * Features:
 * - Responsive floating header with navigation
 * - Themed background with animated dot pattern
 * - shadcn/ui NavigationMenu integration
 * - GitHub repository link with icon
 * - Theme and language switching controls
 * - Mobile-first responsive design
 *
 * @param props - Component props
 * @param props.children - Page content to render in the main area
 */

interface AppLayoutProps {
  /** Content to render within the layout */
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { t, i18n } = useTranslation()

    return (
        <div className="relative min-h-screen bg-background transition-colors duration-300">
            {/* MagicUI Dot Pattern Background with Glow Effect */}
            <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
                <DotPattern
                    width={18}
                    height={18}
                    cx={1}
                    cy={1}
                    cr={1}
                    glow={false}
                    processing={false}
                    className="text-pink-400/30 dark:text-muted-foreground/20"
                />
            </div>

            {/* Floating Header with shadcn/ui Navigation */}
            <header className="fixed top-2 sm:top-4 inset-x-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-background/70 backdrop-blur-xl border border-border/30 rounded-xl shadow-lg ring-1 ring-white/10">
                        <div className="py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between gap-4">
                            {/* Logo & App Name - Clickable to Home */}
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center space-x-3 min-w-0 hover:opacity-80 transition-opacity duration-200 cursor-pointer group"
                                title="Back to Home"
                            >
                                <div className="w-7 h-7 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                    <img
                                        src="/logo.png"
                                        alt={t('accessibility.logoAlt')}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                                        {t('hero.title')}
                                    </h1>
                                </div>
                            </button>

                            {/* Navigation Menu (shadcn/ui) */}
                            <NavigationMenu>
                                <NavigationMenuList className="flex items-center gap-1">
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <a
                                                href="https://github.com/IlhamriSKY/Brave-Pink-Hero-Green.git"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-transparent px-3 py-1 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                                                title={t('navigation.github')}
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </a>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <LanguageSwitcher />
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <ThemeToggle />
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 sm:pt-28 pb-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* Footer Message */}
            <footer className="pb-24 sm:pb-28">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="text-center">
                        {/* Mobile: 2 lines, Desktop: 1 line */}
                        <div className="block sm:hidden">
                            {/* Mobile: First line - Made with icon */}
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                                {t('footer.madeWith')}{' '}
                                {i18n.language === 'ja' ? (
                                    <Cat className="w-3 h-3 text-orange-500 inline flex-shrink-0" />
                                ) : (
                                    <Heart className="w-3 h-3 text-red-500 fill-red-500 inline flex-shrink-0" />
                                )},
                            </p>
                            {/* Mobile: Second line - Inspired by link */}
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                {t('footer.inspiredBy')}{' '}
                                <a
                                    href="https://brave-pink-hero-green.lovable.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 underline transition-colors"
                                >
                                    brave-pink-hero-green.lovable.app
                                </a>.
                            </p>
                        </div>
                        {/* Desktop: Single line */}
                        <div className="hidden sm:block">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                {t('footer.madeWith')}{' '}
                                {i18n.language === 'ja' ? (
                                    <Cat className="w-4 h-4 text-orange-500 inline flex-shrink-0" />
                                ) : (
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500 inline flex-shrink-0" />
                                )}, {' '}
                                {t('footer.inspiredBy')}{' '}
                                <a
                                    href="https://brave-pink-hero-green.lovable.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 underline transition-colors flex-shrink-0"
                                >
                                    brave-pink-hero-green.lovable.app
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Love Button - Floating in bottom right with white circular background */}
            <div className="fixed bottom-8 right-6 z-40">
                <div className="relative">
                    {/* White circular background with 80% transparency */}
                    <div className="absolute inset-0 bg-white/80 rounded-full scale-125"></div>
                    {/* Love button */}
                    <div className="relative">
                        <SimpleLoveButton />
                    </div>
                </div>
            </div>
        </div>
    )
}
