# Contentful Extension Unlink References

## Usage
`Settings` -> `Extensions` -> `Add extension`

Select `Yes, this is a sidebar extension` and Hosting `Self-hosted (src)`, then paste 
```
https://high5digital.github.io/contentful-extension-links/build/
```
to `Self-hosted URL`

## Development
```bash
cd contentful-extension-unlinks
# install dependencies
npm install
# login to contentful
npm run login
# select what space and enviroment you'll be using for development and deployment
npm run configure
# starts development server and publishes the extension in a development mode
npm run start
```

## Production
```bash
cd contentful-extension-unlinks
# builds sources
npm run build
```