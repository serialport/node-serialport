# Website

- This website is deployed by netlify automatically.
- The framework is https://docusaurus.io/
- Localization is done through https://crowdin.com/project/node-serialport (help needed!)

# Build / Dev
From the monorepo root run
```
npm run docs # build the website
npm run docs:dev # run the development server
```

# Localization

To update the localization add your crowdin keys to the env

```bash
export CROWDIN_DOCUSAURUS_PROJECT_ID=node-serialport
export CROWDIN_DOCUSAURUS_API_KEY=XXXXX
```

Cd into the website directory and run

```bash
npm run crowdin-upload
npm run crowdin-download
```

This will upload new docs and download new translations.

To add new languages add them to `packages/website/languages.js` and run `npm run crowdin-upload`. Also add it as a target within crowdin itself.
