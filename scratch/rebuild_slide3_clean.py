import os, pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

whatsapp_path = r'C:\Users\Bhavya Parekh\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\B196F22353273CED48C721075BF4CF89D3B24CD9\transfers\2026-38\SIH2026Presentation-2.pptx'
local_updated = os.path.abspath('SIH2026Presentation-2_Updated.pptx')

ppt_path = whatsapp_path if os.path.exists(whatsapp_path) else local_updated
print(f"Opening presentation from: {ppt_path}")

prs = pptx.Presentation(ppt_path)
slide3 = prs.slides[2]

DARK_BLUE = RGBColor(30, 58, 138)

# Delete all non-title shapes on slide 3
shapes_to_remove = []
for shape in slide3.shapes:
    if shape.has_text_frame:
        txt = shape.text.strip()
        if "TECHNICAL APPROACH" in txt or "TECHNICAL APPROACH & AI MODEL PIPELINE" in txt:
            shape.text_frame.clear()
            p = shape.text_frame.paragraphs[0]
            p.text = "TECHNICAL APPROACH & AI MODEL PIPELINE"
            p.font.size = Pt(22)
            p.font.bold = True
            p.font.color.rgb = DARK_BLUE
            shape.left = Inches(0.5)
            shape.top = Inches(0.3)
            shape.width = Inches(12.33)
            shape.height = Inches(0.8)
        elif "Ctrl Innovate" in txt or "@SIH Idea submission" in txt or txt == "3" or txt == "":
            continue
        else:
            shapes_to_remove.append(shape)
    else:
        shapes_to_remove.append(shape)

# Remove background/content shapes
spTree = slide3.shapes._spTree
for shp in shapes_to_remove:
    try:
        spTree.remove(shp._element)
    except Exception as e:
        print(f"Removal note: {e}")

# Insert high-res light-themed Graph Model Flowchart
graph_img_path = os.path.abspath("frontend/public/graph_model_flowchart.png")
if os.path.exists(graph_img_path):
    slide3.shapes.add_picture(graph_img_path, Inches(0.5), Inches(1.2), width=Inches(12.33), height=Inches(5.5))
    print("Graph flowchart inserted onto Slide 3 cleanly!")

# Save to new output file to avoid PowerPoint file lock
out_final = os.path.abspath("SIH2026Presentation_Final.pptx")
prs.save(out_final)
print(f"\nPresentation successfully rebuilt and saved to:\n  - {out_final}")

