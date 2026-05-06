# Frontend

This folder contains the static frontend application for the **School Management System**.
It is built with HTML, CSS, and vanilla JavaScript. There is no build step or package manager required for the main frontend.

## Purpose

The frontend provides role-based dashboards for:

- Administrator
- Receptionist
- Accountant
- Teacher
- Student
- Parent

It communicates with the FastAPI backend through REST API calls.

## Folder Structure

```text
frontend/
|-- README.md
|-- index.html
|-- server_http.py
|-- assets/
|-- css/
|-- js/
|   |-- core/
|   `-- roles/
|-- locales/
`-- pages/
```

## Main Files and Folders

| Path | Description |
| --- | --- |
| `index.html` | Entry point. It checks the saved session and redirects the user to login or the correct dashboard. |
| `pages/` | HTML pages for login and each user role. |
| `css/` | Stylesheets shared by the application and role-specific pages. |
| `js/core/` | Shared frontend logic: API client, router, authentication, storage, preferences, and internationalization. |
| `js/roles/` | Role-specific JavaScript modules, services, UI helpers, and tab controllers. |
| `locales/` | Translation JSON files organized by language and page/role. |
| `assets/` | Static assets such as the favicon and logo. |
| `server_http.py` | Optional local Flask server for serving the static frontend. |

## Run the Frontend

From the project root:

```bash
cd frontend
python -m http.server 46758
```

Then open:

```text
http://localhost:46758
```

The application starts from `index.html` and redirects to `pages/login.html` when no session is available.

## Backend API Configuration

The frontend API base URL is defined in:

```text
frontend/js/core/api.js
```

Current setting:

```js
const API_BASE_URL = "http://rtxa.duckdns.org:8000";
```

For local development, change it to:

```js
const API_BASE_URL = "http://localhost:8000";
```

The backend must be running before using the dashboards.

## Role Pages

| Role | Page |
| --- | --- |
| Login | `pages/login.html` |
| Administrator | `pages/admin.html` |
| Receptionist | `pages/receptionist.html` |
| Accountant | `pages/accountant.html` |
| Teacher | `pages/teacher.html` |
| Student | `pages/student.html` |
| Parent | `pages/parent.html` |

## Core JavaScript Modules

| File | Responsibility |
| --- | --- |
| `js/core/api.js` | Sends HTTP requests to the backend API. |
| `js/core/auth.js` | Handles authentication-related frontend behavior. |
| `js/core/router.js` | Redirects users according to their saved role/session. |
| `js/core/storage.js` | Stores and retrieves session data from browser storage. |
| `js/core/preferences.js` | Manages theme and interface preferences. |
| `js/core/i18n.js` | Loads and applies translation files. |

## Internationalization

Translations are stored in:

```text
frontend/locales/
```

Available language folders:

- `ar`
- `en`
- `es`
- `fr`
- `hi`
- `zh`

Each language contains JSON files for the supported pages and dashboards.

## Notes

- This frontend is designed to be served from a local/static HTTP server, not opened directly from the filesystem.
- Some login-page features load external CDN scripts for Markdown, sanitization, and MathJax rendering.
- Keep shared behavior in `js/core/`.
- Keep role-specific behavior inside the matching folder in `js/roles/`.
- Keep translations synchronized across language folders when adding new interface text.
