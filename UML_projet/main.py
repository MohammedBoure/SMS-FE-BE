from reportlab.platypus import SimpleDocTemplate, PageBreak, Paragraph, Spacer
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus.tableofcontents import TableOfContents
from utils import add_page_number, title_style, styles
from sections import (
    cover_page, use_case,class_diagram, sequence,navigation,conclusion, tech_stack
)

class IndexedDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            text = flowable.getPlainText()
            level = getattr(flowable, 'toc_level', None)
            if level is not None:
                self.notify('TOCEntry', (level, text, self.page))

def build_pdf(output_filename, include_activity=True):
    doc = IndexedDocTemplate(output_filename, pagesize=landscape(A4),
                            rightMargin=50, leftMargin=50,
                            topMargin=50, bottomMargin=50)
    story = []

    cover_page.build(story)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("Table of Contents", title_style))
    story.append(Spacer(1, 10))
    
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            name='TOCLevel0',
            fontSize=14,
            fontName='Helvetica-Bold',
            leftIndent=10,
            firstLineIndent=-10,
            spaceBefore=10,
            leading=16,
            dotsMinSpacing=2
        ),
        ParagraphStyle(
            name='TOCLevel1',
            fontSize=11,
            fontName='Helvetica',
            leftIndent=30,
            spaceBefore=2,
            leading=14,
            dotsMinSpacing=2
        ),
    ]
    story.append(toc)
    story.append(PageBreak())

    use_case.build(story)
    class_diagram.build(story)
    sequence.build(story)
    
    if include_activity:
        pass
        
    navigation.build(story)
    conclusion.build(story)
    tech_stack.build(story)

    doc.multiBuild(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Successfully generated: {output_filename}")

if __name__ == "__main__":
    build_pdf("School_Management_System_Report_Full.pdf", include_activity=True)
    build_pdf("School_Management_System_Report_Short.pdf", include_activity=False)