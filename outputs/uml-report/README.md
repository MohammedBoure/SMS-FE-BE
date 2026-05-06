# UML Report Outputs

This directory contains the generated documentation deliverables for the **School Management System** UML report.

## Structure

```text
outputs/uml-report/
|-- README.md
|-- report/
|-- diagrams/
|   |-- class/
|   |-- navigation/
|   |-- sequence/
|   `-- use-case/
`-- screenshots/
```

## Contents

| Folder | Description |
| --- | --- |
| `report/` | Final PDF report generated from `UML_projet/main.py`. |
| `diagrams/class/` | Class diagram SVG files. |
| `diagrams/navigation/` | Role-based navigation diagram. |
| `diagrams/sequence/` | Sequence diagrams by role. |
| `diagrams/use-case/` | Use Case diagrams by role. |
| `screenshots/` | Application screenshots used in the implementation chapter. |

## Main Deliverable

```text
outputs/uml-report/report/School_Management_System_UML_Report.pdf
```

## Regeneration

From the project root:

```bash
python UML_projet/generate_academic_usecase_svgs.py
python UML_projet/main.py
```

The scripts write generated files back into this directory.
