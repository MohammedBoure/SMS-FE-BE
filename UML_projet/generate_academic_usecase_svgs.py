from html import escape
from pathlib import Path
import math
import textwrap


OUT_DIR = Path(__file__).resolve().parents[1] / "out" / "UML_projet"

WIDTH = 1240
HEIGHT = 1754
SYSTEM_X = 250
SYSTEM_Y = 56
SYSTEM_W = 940
SYSTEM_H = 1638
INNER_X = SYSTEM_X + 30
INNER_W = SYSTEM_W - 60
ACTOR_X = 118


STYLE = {
    "ink": "#111111",
    "muted": "#444444",
    "line": "#1F1F1F",
    "soft": "#F4F4F4",
    "white": "#FFFFFF",
}


DIAGRAMS = [
    {
        "filename": "UseCase_Admin.svg",
        "title": "Use Case Diagram - Administrator",
        "actor": "Administrator",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Actor Administration",
                "main": "Administer actors",
                "include": [
                    "Manage users",
                    "Manage parents",
                    "Manage students",
                    "Manage teachers",
                ],
                "extend": ["Consult student file"],
            },
            {
                "title": "Academic Management",
                "main": "Administer academics",
                "include": [
                    "Manage classes",
                    "Manage programs",
                    "Manage enrollments",
                    "Assign teachers",
                    "Manage schedules",
                    "Track attendance",
                    "Manage assessments",
                    "Manage grades",
                    "Manage resources",
                ],
                "extend": [],
            },
            {
                "title": "Financial Management",
                "main": "Administer finance",
                "include": [
                    "Track fees",
                    "Record payments",
                    "Consult transactions",
                ],
                "extend": ["Send financial notice"],
            },
            {
                "title": "Communication",
                "main": "Administer communication",
                "include": [
                    "Manage posts",
                    "Exchange messages",
                    "Consult notifications",
                ],
                "extend": [],
            },
        ],
    },
    {
        "filename": "UseCase_Receptionist.svg",
        "title": "Use Case Diagram - Receptionist",
        "actor": "Receptionist",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Reception and Files",
                "main": "Manage school reception",
                "include": [
                    "Create / update student file",
                    "Create / update parent file",
                ],
                "extend": ["Search a file", "Consult student file"],
            },
            {
                "title": "Reception Payments",
                "main": "Process payments",
                "include": ["Consult fees", "Record payment"],
                "extend": ["Send financial notice"],
            },
            {
                "title": "Communication",
                "main": "Communicate with actors",
                "include": [
                    "Exchange messages",
                    "Consult notifications",
                    "Consult posts",
                ],
                "extend": ["Manage posts"],
            },
        ],
    },
    {
        "filename": "UseCase_Accountant.svg",
        "title": "Use Case Diagram - Accountant",
        "actor": "Accountant",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Financial Management",
                "main": "Manage school finance",
                "include": [
                    "Consult student financial file",
                    "Track fees",
                    "Record payments",
                    "Consult transactions",
                    "Consult attendance",
                ],
                "extend": [
                    "Search student or user",
                    "Send financial notice",
                ],
            },
            {
                "title": "Communication",
                "main": "Communicate with actors",
                "include": ["Exchange messages", "Consult notifications"],
                "extend": ["Mark notifications as read"],
            },
        ],
    },
    {
        "filename": "UseCase_Teacher.svg",
        "title": "Use Case Diagram - Teacher",
        "actor": "Teacher",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Teaching Activities",
                "main": "Manage teaching activities",
                "include": [
                    "Consult assignments",
                    "Consult schedule",
                    "Enter attendance",
                    "Manage assessments",
                    "Enter grades",
                    "Share resources",
                ],
                "extend": [],
            },
            {
                "title": "Communication",
                "main": "Communicate with actors",
                "include": [
                    "Exchange messages",
                    "Consult notifications",
                    "Consult posts",
                ],
                "extend": [],
            },
        ],
    },
    {
        "filename": "UseCase_Student.svg",
        "title": "Use Case Diagram - Student",
        "actor": "Student",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Academic Follow-Up",
                "main": "Consult personal school follow-up",
                "include": [
                    "Consult schedule",
                    "Consult assessments",
                    "Consult grades",
                    "Consult attendance",
                    "Consult resources",
                    "Consult fees",
                    "Consult posts",
                ],
                "extend": [],
            },
            {
                "title": "Communication",
                "main": "Communicate with school",
                "include": ["Exchange messages", "Consult notifications"],
                "extend": [],
            },
        ],
    },
    {
        "filename": "UseCase_Parent.svg",
        "title": "Use Case Diagram - Parent",
        "actor": "Parent",
        "sections": [
            {
                "title": "System Access",
                "main": "Access dashboard",
                "include": ["Authenticate", "Manage session"],
                "extend": ["Change language", "Change theme"],
            },
            {
                "title": "Children Follow-Up",
                "main": "Follow children",
                "include": [
                    "Consult linked children",
                    "Consult grades",
                    "Consult attendance",
                    "Consult fees",
                    "Consult posts",
                ],
                "extend": [],
            },
            {
                "title": "Communication",
                "main": "Communicate with school",
                "include": ["Exchange messages", "Consult notifications"],
                "extend": [],
            },
        ],
    },
]


def label_lines(label, width):
    return textwrap.wrap(label, width=width, break_long_words=False) or [label]


def text_center(x, y, label, size=18, weight="500", width=18, line_height=None):
    lines = label_lines(label, width)
    line_height = line_height or int(size * 1.18)
    top = y - (len(lines) - 1) * line_height / 2
    result = [
        f'<text x="{x:.1f}" y="{top + i * line_height:.1f}" '
        f'font-family="Times New Roman, Times, serif" font-size="{size}" '
        f'font-weight="{weight}" fill="{STYLE["ink"]}" text-anchor="middle" '
        f'dominant-baseline="middle">{escape(line)}</text>'
        for i, line in enumerate(lines)
    ]
    return "\n".join(result)


def ellipse(x, y, rx, ry, label, size=18, width=18, weight="500", stereotype=None):
    body = (
        f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx}" ry="{ry}" '
        f'fill="{STYLE["white"]}" stroke="{STYLE["ink"]}" stroke-width="2"/>'
    )
    if not stereotype:
        return body + "\n" + text_center(x, y, label, size=size, weight=weight, width=width)

    return "\n".join([
        body,
        text_center(x, y - 13, stereotype, size=12.3, weight="600", width=20),
        text_center(x, y + 9, label, size=size, weight=weight, width=width, line_height=int(size * 1.06)),
    ])


def actor(x, y, label):
    return f"""
<g>
  <circle cx="{x}" cy="{y - 72}" r="25" fill="{STYLE["white"]}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>
  <line x1="{x}" y1="{y - 47}" x2="{x}" y2="{y + 45}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>
  <line x1="{x - 48}" y1="{y - 14}" x2="{x + 48}" y2="{y - 14}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>
  <line x1="{x}" y1="{y + 45}" x2="{x - 42}" y2="{y + 112}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>
  <line x1="{x}" y1="{y + 45}" x2="{x + 42}" y2="{y + 112}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>
  {text_center(x, y + 152, label, size=22, weight="600", width=14)}
</g>
"""


def relation(x1, y1, x2, y2, label=None, dashed=False, arrow=False):
    dash = ' stroke-dasharray="7 6"' if dashed else ""
    marker = ' marker-end="url(#arrow)"' if arrow else ""
    mid_x = x1 + (x2 - x1) * 0.5
    path = (
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{STYLE["line"]}" stroke-width="2"{dash}{marker}/>'
    )
    if not label:
        return path
    text = (
        f'<text x="{mid_x:.1f}" y="{(y1 + y2) / 2 - 9:.1f}" '
        f'font-family="Times New Roman, Times, serif" font-size="14" '
        f'fill="{STYLE["ink"]}" text-anchor="middle">{escape(label)}</text>'
    )
    return path + "\n" + text


def poly_relation(points, dashed=True, arrow=True):
    dash = ' stroke-dasharray="7 6"' if dashed else ""
    marker = ' marker-end="url(#arrow)"' if arrow else ""
    commands = " ".join(
        f'{"M" if index == 0 else "L"} {x:.1f} {y:.1f}'
        for index, (x, y) in enumerate(points)
    )
    return (
        f'<path d="{commands}" fill="none" stroke="{STYLE["line"]}" '
        f'stroke-width="1.35" stroke-opacity="0.78"{dash}{marker}/>'
    )


def section_height(section):
    count = len(section["include"]) + len(section["extend"])
    rows = max(1, math.ceil(count / 2))
    return max(210, 146 + (rows - 1) * 72)


def draw_section(section, top, height):
    x = INNER_X
    w = INNER_W
    header_h = 44
    main_rx = 118
    main_ry = 44
    detail_rx = 108
    detail_ry = 34
    main_x = x + 150
    details_x = x + 520
    left_bus_x = main_x + main_rx + 70
    right_bus_x = x + w - 18
    top_lane_y = top + header_h + 12
    main_y = top + header_h + (height - header_h) / 2
    details = [(label, "<<include>>") for label in section["include"]]
    details += [(label, "<<extend>>") for label in section["extend"]]
    cols = 2
    col_w = 240
    row_h = 72
    start_y = top + header_h + 50
    start_x = details_x

    container_parts = [
        f'<rect x="{x}" y="{top}" width="{w}" height="{height}" fill="{STYLE["white"]}" stroke="{STYLE["ink"]}" stroke-width="1.8"/>',
        f'<rect x="{x}" y="{top}" width="{w}" height="{header_h}" fill="{STYLE["soft"]}" stroke="{STYLE["ink"]}" stroke-width="1.8"/>',
        f'<text x="{x + 18}" y="{top + 29}" font-family="Times New Roman, Times, serif" font-size="21" font-weight="700" fill="{STYLE["ink"]}">{escape(section["title"])}</text>',
    ]
    relation_parts = []
    use_case_parts = [
        ellipse(main_x, main_y, main_rx, main_ry, section["main"], size=16.5, width=17, weight="600"),
    ]

    for index, (label, relation_label) in enumerate(details):
        row = index // cols
        col = index % cols
        dx = start_x + col * col_w
        dy = start_y + row * row_h
        detail_left = dx - detail_rx
        detail_right = dx + detail_rx
        main_right = main_x + main_rx

        if col == 0:
            path_points = [
                (main_right, main_y),
                (left_bus_x, main_y),
                (left_bus_x, dy),
                (detail_left, dy),
            ]
        else:
            path_points = [
                (main_right, main_y),
                (left_bus_x, main_y),
                (left_bus_x, top_lane_y),
                (right_bus_x, top_lane_y),
                (right_bus_x, dy),
                (detail_right, dy),
            ]

        if relation_label == "<<extend>>":
            path_points = list(reversed(path_points))

        relation_parts.append(poly_relation(path_points))
        use_case_parts.append(ellipse(
            dx,
            dy,
            detail_rx,
            detail_ry,
            label,
            size=13.7,
            width=18,
            stereotype=relation_label,
        ))

    return "\n".join(container_parts + relation_parts + use_case_parts), (main_x - main_rx, main_y)


def draw_diagram(diagram):
    sections = diagram["sections"]
    heights = [section_height(section) for section in sections]
    available = SYSTEM_H - 140
    gap = 18
    total = sum(heights) + gap * (len(heights) - 1)
    if total > available:
        scale = available / total
        heights = [max(170, int(height * scale)) for height in heights]

    current_y = SYSTEM_Y + 96
    main_positions = []
    section_parts = []
    for section, height in zip(sections, heights):
        svg, main_pos = draw_section(section, current_y, height)
        section_parts.append(svg)
        main_positions.append(main_pos)
        current_y += height + gap

    actor_y = SYSTEM_Y + SYSTEM_H / 2 - 70
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}px" height="{HEIGHT}px" viewBox="0 0 {WIDTH} {HEIGHT}">',
        '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M1,1 L9,5 L1,9 Z" fill="#111111"/></marker></defs>',
        f'<rect x="0" y="0" width="{WIDTH}" height="{HEIGHT}" fill="{STYLE["white"]}"/>',
        f'<text x="{WIDTH / 2}" y="34" font-family="Times New Roman, Times, serif" font-size="26" font-weight="700" fill="{STYLE["ink"]}" text-anchor="middle">{escape(diagram["title"])}</text>',
        f'<rect x="{SYSTEM_X}" y="{SYSTEM_Y}" width="{SYSTEM_W}" height="{SYSTEM_H}" fill="{STYLE["white"]}" stroke="{STYLE["ink"]}" stroke-width="2.5"/>',
        f'<text x="{SYSTEM_X + 22}" y="{SYSTEM_Y + 38}" font-family="Times New Roman, Times, serif" font-size="21" font-weight="700" fill="{STYLE["ink"]}">School Management System</text>',
        actor(ACTOR_X, actor_y, diagram["actor"]),
    ]
    parts.extend(section_parts)

    actor_anchor_x = ACTOR_X + 52
    actor_anchor_y = actor_y - 14
    actor_bus_x = SYSTEM_X - 30
    main_y_values = [main_y for _main_x, main_y in main_positions]
    bus_top = min([actor_anchor_y] + main_y_values)
    bus_bottom = max([actor_anchor_y] + main_y_values)
    parts.append(relation(actor_anchor_x, actor_anchor_y, actor_bus_x, actor_anchor_y))
    parts.append(relation(actor_bus_x, bus_top, actor_bus_x, bus_bottom))
    for main_x, main_y in main_positions:
        parts.append(relation(actor_bus_x, main_y, main_x, main_y))

    parts.append("</svg>")
    return "\n".join(parts)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for diagram in DIAGRAMS:
        output = OUT_DIR / diagram["filename"]
        output.write_text(draw_diagram(diagram), encoding="utf-8")
        print(f"Generated {output}")


if __name__ == "__main__":
    main()
