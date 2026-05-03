from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, make_table, normal_text


def build(story):
    create_indexed_heading(story, "Chapter 1 - Existing-System Study and Problem Statement", level=0)
    story.append(Spacer(1, 8))

    create_indexed_heading(story, "Introduction", level=1)
    story.append(Paragraph(
        """
        Before designing a software solution, it is necessary to understand how a school operates and
        where current practices fail. This chapter presents the domain, the main stakeholders, the
        business processes, the limitations of traditional management, and the proposed solution.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Domain Overview", level=1)
    story.append(Paragraph(
        """
        A school manages administrative, academic, financial, and communication activities. These
        activities are connected: student enrollment affects classes, schedules, resources,
        attendance, grades, and fees. A global view is therefore required to avoid disconnected
        processes between departments.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Process", "Managed Data", "Stakeholders"],
        ["Student enrollment and file", "Identity, parent, class, program, and status", "Administration, reception, parent"],
        ["Academic follow-up", "Subjects, assignments, assessments, grades, and attendance", "Teacher, student, parent, administration"],
        ["Financial management", "Fees, payments, transactions, and reminders", "Accountant, reception, parent, administration"],
        ["Communication", "Messages, conversations, notifications, and posts", "All profiles"],
        ["Administrative control", "Users, roles, classes, programs, and resources", "Administrator"],
    ], [120, 210, 158]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Existing-System Study", level=1)
    story.append(Paragraph(
        """
        In many schools, management remains partially manual: paper registers, Excel files,
        uncentralized conversations, and documents kept separately by each service. These tools are
        easy to start with, but they become fragile when the number of students, teachers, and daily
        operations increases.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Existing Solution", "Advantages", "Limitations"],
        ["Paper registers", "Simple and independent from technical infrastructure", "Slow search, risk of loss, duplication, and no reliable backup"],
        ["Excel files", "Flexible and quick for simple lists", "Possible inconsistencies, difficult sharing, and weak access control"],
        ["Informal messaging", "Fast communication between people", "Scattered information, weak traceability, and no business context"],
        ["Disconnected applications", "Automate some isolated tasks", "Limited consistency between academic, financial, and communication modules"],
    ], [120, 180, 188]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Critique of the Existing System", level=1)
    story.append(Paragraph(
        """
        The study reveals recurring issues: redundant data entry, slow information retrieval,
        difficult consolidation of grades and attendance, possible financial errors, lack of
        role-based dashboards, and weak communication follow-up. These limits reduce administrative
        responsiveness and the quality of academic supervision.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Observed Limit", "Consequence", "Expected Response"],
        ["Information dispersion", "Decisions may rely on incomplete data", "Centralized reference system"],
        ["Repeated manual entry", "Errors and time loss", "Controlled forms and shared APIs"],
        ["Undifferentiated access", "Risk of unauthorized consultation or modification", "Role-based dashboards and permissions"],
        ["Unstructured communication", "Lost messages and weak traceability", "Integrated messages and notifications"],
        ["Fragile financial follow-up", "Delays, duplicates, and incorrect balances", "Fees, payments, and transactions linked to students"],
    ], [130, 180, 178]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Problem Statement", level=1)
    story.append(Paragraph(
        """
        The project problem can be stated as follows: how can we build a web application that
        centralizes the main processes of a school, provides each stakeholder with a dedicated
        interface, and ensures reliable information flow between administration, teachers, students,
        parents, and the finance office?
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Proposed Solution", level=1)
    story.append(Paragraph(
        """
        The proposed solution is a role-based web platform called School Management System. It clearly
        separates frontend, backend API, and database responsibilities. Each role has a specific
        dashboard, while the data remains synchronized through common REST services.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Solution Area", "Contribution"],
        ["Functional coverage", "Users, students, parents, teachers, classes, enrollments, attendance, assessments, grades, resources, fees, payments, messages, notifications, and posts."],
        ["Maintainable architecture", "Static frontend organized by roles, modular FastAPI backend, data managers, and MySQL database."],
        ["Role-based approach", "Each profile accesses the features that match its responsibilities."],
        ["Integrated communication", "Messages, conversations, notifications, and posts reduce scattered exchanges."],
        ["Internationalization readiness", "Translation files prepare the interface for multiple languages."],
    ], [130, 358]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Conclusion", level=1)
    story.append(Paragraph(
        """
        The existing-system study confirms the need for a centralized, structured, and extensible
        platform. The next chapter transforms this observation into functional requirements,
        non-functional requirements, and use cases.
        """,
        normal_text,
    ))
    story.append(PageBreak())
