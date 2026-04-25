from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
from reportlab.graphics import renderPDF

def convert_svg_alternative(input_svg, output_png):
    print("جاري التحميل والمعالجة...")
    # قراءة ملف SVG
    drawing = svg2rlg(input_svg)
    
    # تحديد أبعاد A3 بدقة 300 DPI
    # A3 Landscape: 4962 x 3507 pixels
    scaling_factor = 4.0  # زيادة المقياس لضمان الجودة عند الطباعة
    drawing.width *= scaling_factor
    drawing.height *= scaling_factor
    drawing.scale(scaling_factor, scaling_factor)

    print("جاري حفظ الصورة...")
    renderPM.drawToFile(drawing, output_png, fmt="PNG")
    print(f"تم الحفظ بنجاح: {output_png}")

convert_svg_alternative('SchoolManagementSystem_A3_Landscape.svg', 'School_A3_Output.png')