# SGP V4

## Overview
A Node.js/Express web application for managing orders, clients, products, and more. It connects to MongoDB Atlas for database operations and uses local JSON files for data storage.

## Project Architecture
- **index.js** - Main Express server entry point (port 5000)
- **views/** - HTML pages (index, login, clients, orders, products, etc.)
- **js/** - Client-side JavaScript files
- **api/** - Server-side API handlers
  - `dataHandler.js` - Local JSON file read/write operations
  - `dbHandler.js` - MongoDB Atlas upload/download logic
  - `descargarbase.js` - Download database from MongoDB Atlas to local JSON
  - `subirbase.js` - Upload local JSON data to MongoDB Atlas
- **assets/** - Static assets (images, brand logos, product images)
- **json/** - Downloaded database collections as JSON files
- **data/** - Local data storage (pedidos, notas)

## Dependencies
- express - Web server framework
- mongoose - MongoDB ODM
- path - Path utilities

## Recent Changes
- 2026-02-20: Initial Replit setup, configured port to 5000, bound to 0.0.0.0
