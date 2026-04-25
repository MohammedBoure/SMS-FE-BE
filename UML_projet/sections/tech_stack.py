from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import title_style, subtitle_style, normal_text, create_indexed_heading

def build(story):
    elements = []
    
    create_indexed_heading(elements, "Technologies & Library Stack", level=0)
    elements.append(Spacer(1, 15))
    
    tech_data = [
        ("Python (PDF Generation)", """
        <b>Current Library Tree:</b>
        <br/>|-- reportlab (Core Engine)
        <br/>|&nbsp;&nbsp;&nbsp;&nbsp;|-- platypus (High-level Layout Elements)
        <br/>|&nbsp;&nbsp;&nbsp;&nbsp;|-- lib.styles (Paragraph Styling)
        <br/>|&nbsp;&nbsp;&nbsp;&nbsp;\-- pdfgen.canvas (Page Marking)
        <br/>\-- svglib (Vector Graphics Processing)
        <br/>&nbsp;&nbsp;&nbsp;&nbsp;\-- svglib.svglib (SVG to RLG Converter)
        """),
        
        ("Rust (Backend Server)", """
        <b>Library Tree:</b>
        <br/>|-- axum (High-performance RESTful API Framework)
        <br/>|-- diesel (Type-safe ORM & MySQL Query Builder)
        <br/>|-- utoipa & swagger-ui (OpenAPI Documentation)
        <br/>|-- serde / serde_json (Data Serialization)
        <br/>|-- o2o (Object-to-Object Data Mapping)
        <br/>\-- tower-http (Middleware, CORS & Security)
        """),

        ("MySQL (Database Management)", """
        The core relational database used for storing 32 relational tables, handling 
        concurrency, and ensuring data ACID properties across all modules.
        """),
        
        ("Vanilla JS (Frontend Engine)", """
        <b>Library Tree:</b>
        <br/>|-- Custom SPA Routing (Hash-based Navigation & Dynamic Page Injection)
        <br/>|-- Layout.js (Shared Layout Engine & UI Component Management)
        <br/>|-- fetch API (AppConfig-based Centralized API Communication)
        <br/>\-- State Management (In-memory Object-based Data Persistence)
        """),

        ("Web Standards (HTML5 & CSS3)", """
                Used for building high-performance Admin dashboards with a custom 
                CSS Variables-based theme system, RTL support, and responsive 
                layouts using Flexbox and Grid.
                """),

        ("UML (System Modeling)", """
                Unified Modeling Language used for Behavioral (Activity, Sequence, State Machine) 
                and Structural (Class, Component, Deployment) analysis of the ERP architecture.
                """)
    ]

    for title, description in tech_data:
        elements.append(Paragraph(f"<b>{title}</b>", subtitle_style))
        elements.append(Paragraph(description, normal_text))
        elements.append(Spacer(1, 10))

    story.append(KeepTogether(elements))
    story.append(PageBreak())