import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <Select value={language} onValueChange={(value: 'ar' | 'en') => setLanguage(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ar">{t('settings.appearance.languageOptions.ar')}</SelectItem>
                    <SelectItem value="en">{t('settings.appearance.languageOptions.en')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

