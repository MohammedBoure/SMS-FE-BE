import re

from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import PROJECT_ROOT, create_indexed_heading, make_table, normal_text


PROJECT_GITHUB_URL = "https://github.com/MohammedBoure/SMS-FE-BE"
BACKEND_API_DIR = PROJECT_ROOT / "backend" / "apis"


def _join_api_path(prefix, route):
    prefix = prefix.rstrip("/")
    if route == "/":
        return prefix or "/"
    if route.startswith("/"):
        return f"{prefix}{route}" if prefix else route
    return f"{prefix}/{route}" if prefix else f"/{route}"


def _humanize_function_name(name):
    return " ".join(part.capitalize() for part in name.split("_"))


def _extract_api_endpoints():
    rows = [["Domain", "Method", "Endpoint", "Purpose"]]
    rows.append(["Root", "GET", "/", "Read root API health message"])

    if not BACKEND_API_DIR.exists():
        return rows

    decorator_pattern = re.compile(
        r"@router\.(get|post|put|patch|delete|websocket)\(\s*['\"]([^'\"]*)['\"]"
    )
    prefix_pattern = re.compile(r"APIRouter\(\s*prefix\s*=\s*['\"]([^'\"]+)['\"]")
    tag_pattern = re.compile(r"tags\s*=\s*\[\s*['\"]([^'\"]+)['\"]")
    function_pattern = re.compile(r"\s*(?:async\s+def|def)\s+([a-zA-Z_][a-zA-Z0-9_]*)")

    for api_file in sorted(BACKEND_API_DIR.glob("*_api.py")):
        text = api_file.read_text(encoding="utf-8")
        prefix_match = prefix_pattern.search(text)
        tag_match = tag_pattern.search(text)
        prefix = prefix_match.group(1) if prefix_match else ""
        domain = tag_match.group(1) if tag_match else api_file.stem.replace("_api", "").replace("_", " ").title()
        lines = text.splitlines()

        for line_index, line in enumerate(lines):
            route_match = decorator_pattern.search(line)
            if not route_match:
                continue

            method, route = route_match.groups()
            function_name = ""
            for next_line in lines[line_index + 1:]:
                function_match = function_pattern.match(next_line)
                if function_match:
                    function_name = function_match.group(1)
                    break

            rows.append([
                domain,
                method.upper() if method != "websocket" else "WS",
                _join_api_path(prefix, route),
                _humanize_function_name(function_name) if function_name else "Endpoint operation",
            ])

    return rows


def build(story):
    create_indexed_heading(story, "Technical Choices", level=1)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The technical choices were selected to keep the application simple to deploy, understandable
        for a bachelor's degree project, and modular enough to evolve. The system relies on standard
        web technologies, a clear REST API, and a relational database.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Area", "Technologies", "Justification"],
        ["Frontend", "HTML5, CSS3, vanilla JavaScript", "Provide a lightweight interface organized by pages, roles, services, and UI components."],
        ["Backend", "Python, FastAPI, Pydantic, Uvicorn", "Expose readable, validated, and easy-to-document REST endpoints."],
        ["Database", "MySQL, mysql-connector-python, SQLAlchemy utilities", "Store relational data with constraints and business relationships."],
        ["Documentation", "PlantUML, SVG, ReportLab, svglib", "Produce versionable diagrams and a reproducible PDF report."],
        ["Internationalization", "JSON translation files", "Prepare the interface for multiple languages."],
    ], [90, 150, 248]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "REST API Design", level=1)
    story.append(Paragraph(
        """
        The backend exposes specialized routers. Each router represents a functional domain and uses
        a data manager responsible for SQL operations. This organization makes endpoints easier to
        test, document, and extend.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["API Family", "Representative Endpoints", "Role"],
        ["Users", "/users, /users/login, /users/search", "Authentication, accounts, search, and user states."],
        ["School structure", "/students, /parents, /teachers, /classes, /programs, /enrollments, /assignments", "Profile management and academic organization."],
        ["Learning", "/attendance, /schedules, /assessments, /grades, /resources", "Daily follow-up, assessments, results, and educational resources."],
        ["Finance", "/student-fees, /payments, /transactions", "Fees, payments, balances, and movements."],
        ["Communication", "/conversations, /messages, /notifications, /posts", "Internal exchanges, alerts, and publications."],
    ], [100, 180, 208]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Backend Design Structure", level=1)
    story.append(Paragraph(
        """
        The backend follows a layered organization. The FastAPI application loads routers, routers
        validate HTTP requests and delegate business operations, and database managers isolate SQL
        access from the API layer.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Backend Element", "Responsibility"],
        ["backend/app.py", "Creates the FastAPI application, enables CORS, initializes the database, and includes all routers."],
        ["backend/apis/*_api.py", "Defines REST and WebSocket endpoints by functional domain: users, students, finance, resources, communication, and academic follow-up."],
        ["backend/apis/dependencies.py", "Provides manager instances through FastAPI dependency injection."],
        ["backend/database/*_manager.py", "Contains data-access operations and domain-specific business queries."],
        ["backend/database/base/*", "Centralizes configuration, connection handling, schema creation, tables, views, and indexes."],
        ["backend/uploads/resources", "Stores uploaded learning resources referenced by the resources API."],
        ["backend/requirements.txt", "Lists Python dependencies required to run the backend service."],
    ], [150, 338]))

    story.append(Spacer(1, 8))
    create_indexed_heading(story, "Backend Request Flow", level=2)
    story.append(make_table([
        ["Step", "Description"],
        ["1. Frontend service call", "A role-specific JavaScript service sends a request to the REST API."],
        ["2. FastAPI router", "The router receives the request, validates parameters and request bodies, and selects the correct operation."],
        ["3. Dependency injection", "FastAPI injects the corresponding database manager from the dependencies module."],
        ["4. Data manager", "The manager executes SQL operations and enforces domain behavior."],
        ["5. Database", "MySQL stores users, school entities, academic records, finance data, and communication content."],
        ["6. Response handling", "The API returns JSON or a file response, then the frontend updates the interface."],
    ], [110, 378]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Frontend Design Structure", level=1)
    story.append(Paragraph(
        """
        The frontend is implemented as a structured static web application. Common services are
        shared in core modules, while role folders contain the behavior and user-interface logic
        specific to each dashboard.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Frontend Element", "Responsibility"],
        ["frontend/index.html", "Entry point used to redirect users to the appropriate login or dashboard page."],
        ["frontend/pages/*.html", "Role-based pages for administrator, receptionist, accountant, teacher, student, parent, and login."],
        ["frontend/js/core", "Shared services for API calls, authentication, routing, preferences, storage, and internationalization."],
        ["frontend/js/roles/<role>", "Role-specific controllers, services, UI logic, and tab modules."],
        ["frontend/css", "Global and role-specific style sheets for dashboards and interface sections."],
        ["frontend/locales/<language>", "Translation dictionaries used by the internationalization layer."],
        ["frontend/assets", "Visual assets such as the logo and favicon."],
        ["frontend/server_http.py", "Small local HTTP server used to serve the static frontend during development or demonstration."],
    ], [150, 338]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "API Endpoint Reference", level=1)
    story.append(Paragraph(
        """
        The following table is generated from the backend router files. It documents the operational
        surface exposed by the system and provides a technical reference for implementation,
        testing, and maintenance.
        """,
        normal_text,
    ))
    story.append(make_table(_extract_api_endpoints(), [70, 42, 172, 204]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Security and Integrity", level=1)
    story.append(Paragraph(
        """
        Security relies on several complementary mechanisms: authentication of active accounts,
        role-based dashboard separation, Pydantic input validation, parameterized SQL queries, and
        relational constraints in the database. Passwords are hashed before comparison during login.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Risk", "Applied Measure"],
        ["Unauthorized access", "Redirection by role and separated interfaces by profile."],
        ["Invalid data", "Pydantic schemas, frontend checks, and HTTP exceptions."],
        ["Relational inconsistencies", "Foreign keys, dedicated managers, and domain-based tables."],
        ["Password exposure", "The password field is removed from user API responses."],
        ["Operation errors", "API failure messages, HTTP status codes, and frontend-side handling."],
    ], [130, 358]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Error Management", level=1)
    story.append(Paragraph(
        """
        Errors are handled at two levels. On the API side, routers raise HTTP exceptions when a
        resource does not exist, a request is invalid, or an operation fails. On the frontend side,
        services interpret responses and show readable feedback inside dashboards.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Repository and Deployment", level=1)
    story.append(Paragraph(
        f"""
        The source code is organized in the following GitHub repository: <b>{PROJECT_GITHUB_URL}</b>.
        The frontend can be served as a static application, while the FastAPI backend runs with
        Uvicorn. Port forwarding and remote-access configuration were prepared for demonstration.
        """,
        normal_text,
    ))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Technical References", level=1)
    story.append(make_table([
        ["Reference", "Use in the Project"],
        ["FastAPI Documentation - https://fastapi.tiangolo.com/", "Backend application, APIRouter structure, HTTP operations, CORS middleware, and WebSocket endpoint."],
        ["Pydantic Documentation - https://docs.pydantic.dev/", "Request-body validation, schema modeling, and structured data transfer."],
        ["MySQL Documentation - https://dev.mysql.com/doc/", "Relational database design, constraints, and SQL storage."],
        ["MDN Web Docs: JavaScript - https://developer.mozilla.org/en-US/docs/Web/JavaScript", "Frontend JavaScript behavior, modules, fetch calls, and browser-side interactions."],
        ["PlantUML Documentation - https://plantuml.com/", "UML notation used for use case, class, sequence, and navigation diagrams."],
        ["ReportLab User Guide - https://docs.reportlab.com/reportlab/userguide/ch1_intro/", "Programmatic generation of the academic PDF report."],
        ["Project Repository - https://github.com/MohammedBoure/SMS-FE-BE", "Source-code reference for the implemented frontend, backend, database, and report-generation scripts."],
    ], [150, 338]))

    create_indexed_heading(story, "Conclusion", level=1)
    story.append(Paragraph(
        """
        The design combines a clear architecture, coherent relational models, UML diagrams, and
        separated application modules. The next chapter presents the implementation and validation.
        """,
        normal_text,
    ))
    story.append(PageBreak())
