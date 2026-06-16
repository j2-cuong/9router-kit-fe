'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound, LogIn, Sparkles } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExpiredPage() {
  const { t } = useI18n();

  return (
    <main className="shell-grid min-h-screen flex items-center justify-center">
      <div className="noise" />
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/"><ArrowLeft size={16} /> {t('expired.home')}</Link>
        </Button>
        <ThemeToggle />
      </nav>
      <Card className="mx-auto max-w-md w-full mx-4">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <Badge variant="outline" className="gap-1.5">
            <KeyRound size={14} /> {t('expired.badge')}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">{t('expired.title')}</h1>
          <p className="text-muted-foreground leading-relaxed">{t('expired.text')}</p>
          <div className="flex gap-3 mt-2">
            <Button asChild>
              <Link href="/login"><LogIn size={18} /> {t('expired.login')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/"><Sparkles size={18} /> {t('expired.home')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
