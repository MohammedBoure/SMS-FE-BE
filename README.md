# School Management System

A web-based School Management System that centralizes academic administration, student follow-up, financial operations, learning resources, communication, and role-based dashboards.

The project is organized as a lightweight frontend, a FastAPI backend, a MySQL database layer, and a reproducible UML/PDF report generator.

## Features

- Role-based dashboards for administrator, receptionist, accountant, teacher, student, and parent.
- User, parent, student, teacher, class, program, enrollment, and assignment management.
- Attendance tracking, schedules, assessments, grades, and educational resources.
- Student fees, payments, balances, and financial transactions.
- Internal messaging, conversations, notifications, and posts.
- Multilingual frontend resources through JSON locale files.
- UML documentation and an automatically generated academic PDF report.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Database | MySQL, mysql-connector-python, SQLAlchemy |
| Documentation | PlantUML source files, SVG diagrams, ReportLab, svglib |
| Internationalization | JSON locale files |

## Project Structure

```text
SMS-FE-BE/
+-- backend/
|   +-- app.py
|   +-- apis/
|   +-- database/
|   +-- uploads/
|   +-- requirements.txt
+-- frontend/
|   +-- index.html
|   +-- pages/
|   +-- js/
|   +-- css/
|   +-- locales/
|   +-- assets/
+-- UML_projet/
|   +-- main.py
|   +-- generate_academic_usecase_svgs.py
|   +-- sections/
|   +-- *.wsd
+-- out/
    +-- UML_projet/
```

## Backend Setup

1. Create and activate a Python virtual environment.

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

2. Install backend dependencies.

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in `backend/`.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=SchoolDB
DB_PORT=3306
```

4. Start the backend API.

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

- `http://localhost:8000`
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Frontend Setup

The frontend is a static web application.

```bash
cd frontend
python -m http.server 46758
```

Then open:

```text
http://localhost:46758
```

If the backend URL changes, update:

```text
frontend/js/core/api.js
```

```js
const API_BASE_URL = "http://localhost:8000";
```

## Main API Domains

| Domain | Representative Endpoints |
| --- | --- |
| Users | `/users`, `/users/login`, `/users/search` |
| School structure | `/students`, `/parents`, `/teachers`, `/classes`, `/programs`, `/enrollments`, `/assignments` |
| Learning | `/attendance`, `/schedules`, `/assessments`, `/grades`, `/resources` |
| Finance | `/student-fees`, `/payments`, `/transactions` |
| Communication | `/conversations`, `/messages`, `/notifications`, `/posts` |

## UML Report Generation

The generated academic report is located at:

```text
out/UML_projet/School_Management_System_UML_Report.pdf
```

To regenerate the use case SVG diagrams and the PDF report:

```bash
python UML_projet\generate_academic_usecase_svgs.py
python UML_projet\main.py
```

If report dependencies are missing, install them in the active Python environment:

```bash
pip install reportlab svglib pypdf
```

## Documentation Content

The report includes:

- General context and problem statement.
- Functional and non-functional requirements.
- Academic use case diagrams with `include` and `extend` relationships.
- Class, sequence, and navigation diagrams.
- Backend and frontend design structure.
- API endpoint reference.
- User-interface captures.
- Figure and diagram list with page numbers.
- Technical references.

## Development Notes

- Backend routers are grouped under `backend/apis`.
- Database access is isolated in `backend/database/*_manager.py`.
- Shared frontend logic is under `frontend/js/core`.
- Role-specific frontend behavior is under `frontend/js/roles`.
- Generated report assets are written under `out/UML_projet`.

## Repository

Project repository:

```text
https://github.com/MohammedBoure/SMS-FE-BE
```
