# UML Project Documentation

This folder contains the design documentation sources for the **School Management System** project:
UML diagrams, academic report files, supporting assets, and scripts used to generate the final PDF report.

## Purpose

This part of the project is used to:

- Document the system structure and main user scenarios.
- Keep UML diagram source files organized.
- Generate the academic PDF report.
- Store the visual and reference assets used by the report generator.

## Folder Structure

```text
UML_projet/
|-- README.md
|-- main.py
|-- generate_academic_usecase_svgs.py
|-- utils.py
|-- sections/
|-- diagrams/
|   `-- source/
|-- assets/
|-- data/
```

## Files and Folders

| Path | Description |
| --- | --- |
| `main.py` | Main script used to generate the final PDF report. |
| `generate_academic_usecase_svgs.py` | Generates the academic Use Case diagrams as SVG files in `outputs/uml-report/diagrams/use-case`. |
| `utils.py` | Shared helper functions for report styling, diagram rendering, images, and tables. |
| `sections/` | Report sections. Each Python file builds one part of the academic report. |
| `diagrams/source/` | PlantUML source files, including `.wsd` and `.puml` files. |
| `assets/` | Visual assets used by the report, such as the project logo. |
| `data/` | Non-code reference files, such as the SQL documentation copy. |

## Diagram Sources

The UML source files are stored in:

```text
UML_projet/diagrams/source/
```

They include:

- Class diagram: `class.wsd`
- Navigation diagram: `navigation.wsd`
- Sequence diagrams: `Sequence_*.wsd`
- Use Case diagrams: `UseCas*.wsd`
- Shared Use Case style file: `usecase_academic_style.puml`

## Generated Output

Final generated files are not stored directly in this folder. They are written to:

```text
outputs/uml-report/
```

Main outputs include:

- `report/School_Management_System_UML_Report.pdf`
- `diagrams/` for UML diagram SVG files
- `screenshots/` for user interface screenshots used in the report

## Generate Use Case Diagrams

Run this command from the project root:

```bash
python UML_projet/generate_academic_usecase_svgs.py
```

This generates:

```text
outputs/uml-report/diagrams/use-case/Use_Case_*.svg
```

## Generate the Final Report

Run this command from the project root:

```bash
python UML_projet/main.py
```

The final report will be created at:

```text
outputs/uml-report/report/School_Management_System_UML_Report.pdf
```

## Requirements

The report generator requires these Python packages:

```bash
pip install reportlab svglib pypdf
```

If the SVG files are missing, generate them before running `main.py`.

## Organization Notes

- Do not place temporary runtime files or cache folders in this directory.
- Do not place large generated outputs directly inside `UML_projet`; use `outputs/uml-report` instead.
- Python files in this folder and in `sections/` are part of the report generator.
- Non-code files are separated into `diagrams/`, `assets/`, and `data/` to make the project easier to review and submit.
