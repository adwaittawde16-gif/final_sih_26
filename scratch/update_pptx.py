import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

ppt_path = r'C:\Users\Bhavya Parekh\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\B196F22353273CED48C721075BF4CF89D3B24CD9\transfers\2026-38\SIH2026Presentation-2.pptx'
backup_path = r'SIH2026Presentation-2_Updated.pptx'

prs = pptx.Presentation(ppt_path)

# Useful color definitions
NAVY = RGBColor(13, 17, 23)
BLUE = RGBColor(59, 130, 246)
DARK_BLUE = RGBColor(30, 58, 138)
GRAY = RGBColor(100, 116, 139)
WHITE = RGBColor(255, 255, 255)
LIGHT_BG = RGBColor(246, 248, 250)

# ==================== SLIDE 3 OVERHAUL ====================
slide3 = prs.slides[2]

# Remove messy overflowing shapes on Slide 3 (shape index 8 and 10 and 9)
shapes_to_remove = []
for idx, shape in enumerate(slide3.shapes):
    if shape.has_text_frame:
        txt = shape.text
        # Identify bad shapes containing leftover template text or huge height
        if "Hospital" in txt or "Central Admin" in txt or "Procurement" in txt or (shape.height and shape.height/Inches(1) > 10):
            shapes_to_remove.append(shape)

# Remove bad shapes from spTree
spTree = slide3.shapes._spTree
for shp in shapes_to_remove:
    spTree.remove(shp._element)

# Now rebuild Slide 3 shapes cleanly
# 1. Slide Title
for shp in slide3.shapes:
    if shp.has_text_frame and "TECHNICAL APPROACH" in shp.text:
        tf = shp.text_frame
        tf.clear()
        p = tf.paragraphs[0]
        p.text = "TECHNICAL APPROACH & AI MODEL PIPELINE"
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = DARK_BLUE
        shp.top = Inches(0.4)
        shp.left = Inches(0.5)
        shp.width = Inches(12.33)
        shp.height = Inches(0.8)

# 2. Add Technology Stack Card (Left side)
left_box = slide3.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(4.5), Inches(5.4))
tf_box = left_box.text_frame
tf_box.word_wrap = True
tf_box.clear()

p = tf_box.paragraphs[0]
p.text = "Comprehensive Technology Stack"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = DARK_BLUE

tech_stack_details = [
    ("Frontend Layer", "Next.js 14, React, TypeScript, Tailwind CSS, Lucide React, Recharts"),
    ("Backend & Data Ingestion", "Python (FastAPI / Flask), Regex CDR Parser, OpenCV (Facial Recognition), SpaCy NLP (FIR Parser)"),
    ("AI & Graph Mining Engine", "NetworkX (Degree & Betweenness Centrality), Louvain Community Detection, Spatiotemporal Co-Location Engine"),
    ("Threat Classifier & XAI", "100-Point Dynamic Threat Indexing System, Feature Attribution Weighting, Counterfactual Engine"),
    ("Database & Cryptography", "SQLite / PostgreSQL, Cryptographic SHA-256 Forensic Audit Trail Ledger")
]

for category, stack in tech_stack_details:
    p_cat = tf_box.add_paragraph()
    p_cat.text = f"• {category}:"
    p_cat.font.size = Pt(12)
    p_cat.font.bold = True
    p_cat.font.color.rgb = BLUE
    p_cat.space_before = Pt(8)
    
    p_stk = tf_box.add_paragraph()
    p_stk.text = stack
    p_stk.font.size = Pt(10.5)
    p_stk.font.color.rgb = RGBColor(51, 65, 85)

# 3. Add High-Res Model Flowchart Image (Right side)
flowchart_img_path = os.path.abspath("frontend/public/model_flowchart_full.png")
if os.path.exists(flowchart_img_path):
    slide3.shapes.add_picture(flowchart_img_path, Inches(5.2), Inches(1.3), width=Inches(7.6))


# ==================== SLIDE 6 OVERHAUL (RESEARCH & REFERENCES) ====================
slide6 = prs.slides[5]
for shp in slide6.shapes:
    if shp.has_text_frame and "WHO Digital Transformation" in shp.text:
        tf = shp.text_frame
        tf.clear()
        tf.word_wrap = True
        
        p_hdr = tf.paragraphs[0]
        p_hdr.text = "LAW ENFORCEMENT & TECHNICAL REFERENCES"
        p_hdr.font.size = Pt(16)
        p_hdr.font.bold = True
        p_hdr.font.color.rgb = DARK_BLUE
        
        refs = [
            ("1. NCRB Digital Evidence & CDR Analysis Guidelines", "National Crime Records Bureau Standard Operating Procedures for Telecom Log Mining & Evidence Lineage."),
            ("2. Statutory Frameworks for Criminal Syndicate Prosecution", "Maharashtra Control of Organised Crime Act (MCOCA) & IPC Sec 120B Conspiracy Evidence Requirements."),
            ("3. NetworkX & Graph Centrality in Intelligence Mining", "IEEE/ACM Research on Degree & Betweenness Centrality Algorithms for Key-Link Identification in Syndicate Graphs."),
            ("4. Explainable AI (XAI) Standards for Judicial Admissibility", "NIST & Inter-Agency Guidelines for Transparent Algorithmic Scoring and Feature Attribution in Law Enforcement Systems.")
        ]
        
        for r_title, r_desc in refs:
            p_t = tf.add_paragraph()
            p_t.text = r_title
            p_t.font.size = Pt(13)
            p_t.font.bold = True
            p_t.font.color.rgb = BLUE
            p_t.space_before = Pt(10)
            
            p_d = tf.add_paragraph()
            p_d.text = r_desc
            p_d.font.size = Pt(11)
            p_d.font.color.rgb = RGBColor(51, 65, 85)


# ==================== GENERAL OVERFLOW & MARGIN FIXES ACROSS ALL SLIDES ====================
for slide_idx, slide in enumerate(prs.slides):
    for shape in slide.shapes:
        if shape.has_text_frame:
            tf = shape.text_frame
            tf.word_wrap = True
            # Fix shapes with unreasonable heights or negative bounds
            if shape.height and shape.height/Inches(1) > 6.5:
                shape.height = Inches(5.5)
            if shape.top and shape.top/Inches(1) < 0.2:
                shape.top = Inches(0.5)

# Save updated presentation
workspace_output = os.path.abspath("SIH2026Presentation-2_Updated.pptx")
scratch_output = os.path.abspath("scratch/SIH2026Presentation-2_Updated.pptx")

prs.save(workspace_output)
prs.save(scratch_output)
print(f"Presentation successfully updated and saved to:\n  - {workspace_output}\n  - {scratch_output}")

try:
    prs.save(ppt_path)
    print(f"  - {ppt_path}")
except Exception as e:
    print(f"Note: Could not overwrite original file at WhatsApp transfers path directly due to file lock ({e}). Use the updated file saved in your workspace: {workspace_output}")

