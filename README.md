# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.


## Refactored project structure

```text
src/
├── components/
├── context/
├── data/
├── hooks/
├── layouts/
│   └── StudentLayout.tsx
├── lib/
├── pages/
│   ├── announcements/
│   ├── attendance/
│   ├── auth/
│   ├── calendar/
│   ├── classes/
│   ├── coding/
│   ├── courses/
│   ├── dashboard/
│   ├── help/
│   ├── live-classes/
│   ├── materials/
│   ├── mcq-assessments/
│   ├── notes/
│   ├── notifications/
│   ├── performance/
│   ├── profile/
│   ├── results/
│   └── settings/
├── routes/
│   └── AppRoutes.tsx
├── services/
├── types/
├── App.tsx
├── App.css
└── main.tsx
```

The refactor keeps the existing portal screens and service/data layer while separating the page components, layout, routing, navigation data, analytics data, and notification persistence into dedicated files.
