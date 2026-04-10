# i18n Configuration

This project uses `react-i18next` for internationalization support.

## Structure

- `config.ts` - i18next configuration
- `locales/` - Translation files directory
  - `en.json` - English translations (default)

## Usage

### In Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');

  return <h1>{t('welcome')}</h1>;
}
```

### With Interpolation

```tsx
const { t } = useTranslation('common');
const count = 5;

return <p>{t('count', { count })}</p>;
```

### Change Language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return <button onClick={() => changeLanguage('en')}>English</button>;
}
```

## Adding New Languages

1. Create a new JSON file in `locales/` (e.g., `sk.json`)
2. Add the language to `supportedLngs` in `config.ts`
3. Import and add to resources in `config.ts`

## Default Language

The default language is **English (en)**. The language is automatically detected from:

1. localStorage (if previously set)
2. Browser navigator
3. HTML lang attribute
