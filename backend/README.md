# Backend

This folder contains the FastAPI backend for the **School Management System**.
It exposes REST API endpoints, manages database access, initializes the MySQL schema, and provides seed scripts for demonstration data.

## Purpose

The backend is responsible for:

- User authentication and role-based data access.
- Managing students, parents, teachers, classes, programs, enrollments, and assignments.
- Managing attendance, schedules, assessments, grades, and educational resources.
- Managing fees, payments, balances, and user transactions.
- Managing posts, notifications, conversations, and messages.
- Initializing the MySQL database schema automatically when the API starts.

## Folder Structure

```text
backend/
|-- README.md
|-- app.py
|-- requirements.txt
|-- database.sql
|-- seed_db.py
|-- seed_db_en.py
|-- inject_data.py
|-- hash_gen.py
|-- apis/
|-- database/
`-- uploads/
```

## Main Files and Folders

| Path | Description |
| --- | --- |
| `app.py` | FastAPI application entry point. It creates the API app, enables CORS, initializes the database, and includes all routers. |
| `requirements.txt` | Python dependencies required to run the backend. |
| `apis/` | FastAPI routers grouped by functional domain. |
| `database/` | Data managers and database initialization logic. |
| `database/base/` | Connection, configuration, schema creation, views, and indexes. |
| `uploads/` | Uploaded learning resources used by the resources API. |
| `database.sql` | SQL reference/export for the database schema. |
| `seed_db.py` | Seeds demonstration data using the main dataset. |
| `seed_db_en.py` | Seeds demonstration data using English names and content. |
| `inject_data.py` | Adds a smaller test dataset for default users. |
| `hash_gen.py` | Utility for generating SHA-256 password hashes. |

## Requirements

Install these system requirements before running the backend:

- Python 3.10 or newer
- MySQL Server
- A MySQL user with permission to create and use the project database

Python packages are installed from:

```text
backend/requirements.txt
```

## Environment Configuration

Create a `.env` file inside `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=SchoolDB
```

Important notes:

- Run backend commands from inside the `backend/` folder so the `.env` file is loaded correctly.
- Hosted MySQL providers may give `host:port`; you can either split them into `DB_HOST` and `DB_PORT`, or set `DB_HOST` to `host:port`.
- `DATABASE_URL` is also supported when your platform provides a MySQL connection URL.
- Do not commit real database passwords.
- The database is created automatically if it does not already exist.

## Installation

From the project root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run the API

From inside `backend/`:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
http://localhost:8000/redoc
```

The root endpoint should return a simple online status message:

```text
GET /
```

## Database Initialization

When the backend starts, it creates or verifies:

- The MySQL database
- Required tables
- Views
- Indexes
- Default roles
- Default administrator account

Default administrator:

```text
Username: admin
Password: python
```

## Seed Demonstration Data

After the database is created, you can add demonstration data.

English seed data:

```bash
python seed_db_en.py
```

Main seed data:

```bash
python seed_db.py
```

Small default test dataset:

```bash
python inject_data.py
```

Seed scripts use this default generated password for created users:

```text
python
```

## API Domains

| Domain | Router Prefix |
| --- | --- |
| Users and login | `/users` |
| Parents | `/parents` |
| Students | `/students` |
| Teachers | `/teachers` |
| Classes | `/classes` |
| Programs | `/programs` |
| Enrollments | `/enrollments` |
| Teacher assignments | `/assignments` |
| Attendance | `/attendance` |
| Schedules | `/schedules` |
| Assessments | `/assessments` |
| Grades | `/grades` |
| Resources | `/resources` |
| Student fees | `/student-fees` |
| Payments | `/payments` |
| Transactions | `/transactions` |
| Conversations | `/conversations` |
| Messages | `/messages` |
| Notifications | `/notifications` |
| Posts | `/posts` |

## Useful Development Commands

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend with auto-reload:

```bash
uvicorn app:app --reload
```

Generate a password hash:

```bash
python hash_gen.py
```

## Troubleshooting

If the backend cannot connect to MySQL:

- Make sure MySQL Server is running.
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env` or in your host environment variables.
- For Render/Aiven, make sure `DB_HOST` is only the host name and `DB_PORT` is the numeric port, or use the provider's `DATABASE_URL`.
- Make sure the command is executed from inside the `backend/` folder.

If imports fail:

- Make sure the virtual environment is activated.
- Make sure dependencies are installed.
- Run commands from the `backend/` directory.

If uploaded resources are missing:

- Check `backend/uploads/resources/`.
- Make sure uploaded files were not removed or ignored during cleanup.
