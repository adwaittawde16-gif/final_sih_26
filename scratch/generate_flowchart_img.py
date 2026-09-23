import os
from PIL import Image, ImageDraw, ImageFont

def generate_flowchart_image(output_path="frontend/public/model_flowchart_full.png"):
    # Dimensions for high-res 16:9 diagram
    width, height = 2400, 1350
    bg_color = (13, 17, 23) # Dark modern slate #0D1117
    
    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try loading fonts or fallback
    try:
        font_title = ImageFont.truetype("arial.ttf", 46)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_box_title = ImageFont.truetype("arialbd.ttf", 28)
        font_box_tech = ImageFont.truetype("arial.ttf", 22)
        font_box_desc = ImageFont.truetype("arial.ttf", 20)
    except:
        font_title = font_sub = font_box_title = font_box_tech = font_box_desc = ImageFont.load_default()

    # Draw Title Header
    draw.text((100, 60), "NETSENTINEL // AI MODEL & TACTICAL PIPELINE FLOWCHART", fill=(255, 255, 255), font=font_title)
    draw.text((100, 125), "End-to-End Multi-Source Data Processing, Graph Analytics, 100-Point Threat Scoring & XAI Lineage", fill=(139, 150, 169), font=font_sub)
    
    # Grid lines / decorative subtle border
    draw.rectangle([60, 40, width-60, height-60], outline=(31, 42, 61), width=3)
    
    # 5 Pipeline Stage Cards (Horizontal Flow)
    stages = [
        {
            "num": "STAGE 01",
            "title": "MULTI-SOURCE INGESTION",
            "color": (59, 130, 246), # Blue
            "tech": "Parsers & Stream Capture",
            "items": ["• Call Detail Records (CDRs)", "• CCTV Camera Feeds", "• PDF FIR Complaints", "• Bank Financial Ledgers", "• Social Media Footprints"]
        },
        {
            "num": "STAGE 02",
            "title": "FEATURE EXTRACTION & NLP",
            "color": (99, 102, 241), # Indigo
            "tech": "SpaCy NLP & OpenCV",
            "items": ["• FIR Entity Recognition", "• OpenCV Face Match", "• Cell Tower Triangulation", "• Nocturnal Call Parser", "• Financial Flow Mapping"]
        },
        {
            "num": "STAGE 03",
            "title": "GRAPH ANALYTICS ENGINE",
            "color": (16, 185, 129), # Emerald
            "tech": "NetworkX & Clustering",
            "items": ["• Degree Centrality", "• Betweenness Leader Score", "• Louvain Syndicate Clusters", "• Spatiotemporal Mesh", "• Nocturnal Spike Alert"]
        },
        {
            "num": "STAGE 04",
            "title": "100-PT THREAT SCORE & XAI",
            "color": (245, 158, 11), # Amber
            "tech": "Risk Matrix & XAI Engine",
            "items": ["• 6-Vector Threat Classifier", "• Mathematical Attribution", "• Counterfactual Engine", "• Risk Tiers (Red/Orange)", "• Evidentiary Lineage"]
        },
        {
            "num": "STAGE 05",
            "title": "TACTICAL COMMAND & AUDIT",
            "color": (239, 68, 68), # Red
            "tech": "Next.js UI & SHA-256",
            "items": ["• Live Geo-Spatial Map", "• CCTV Video Playback", "• Audio AI Copilot", "• PDF Court Dossier", "• SHA-256 Forensic Audit"]
        }
    ]
    
    card_width = 410
    card_height = 800
    start_x = 100
    spacing = 40
    start_y = 200
    
    for i, st in enumerate(stages):
        cx = start_x + i * (card_width + spacing)
        cy = start_y
        
        # Draw Card background
        draw.rectangle([cx, cy, cx + card_width, cy + card_height], fill=(22, 31, 48), outline=(31, 42, 61), width=2)
        
        # Header strip color accent bar
        draw.rectangle([cx, cy, cx + card_width, cy + 12], fill=st["color"])
        
        # Stage Number
        draw.text((cx + 25, cy + 35), st["num"], fill=st["color"], font=font_box_tech)
        
        # Stage Title
        draw.text((cx + 25, cy + 70), st["title"], fill=(255, 255, 255), font=font_box_title)
        
        # Tech sub-badge
        draw.rectangle([cx + 25, cy + 115, cx + card_width - 25, cy + 155], fill=(17, 24, 38), outline=(48, 60, 80), width=1)
        draw.text((cx + 40, cy + 123), st["tech"], fill=(139, 150, 169), font=font_box_tech)
        
        # Items list
        item_y = cy + 185
        for item in st["items"]:
            draw.text((cx + 30, item_y), item, fill=(230, 234, 242), font=font_box_desc)
            item_y += 45
            
        # Draw connecting arrow to next card if not last
        if i < len(stages) - 1:
            arrow_x = cx + card_width + 5
            arrow_y = cy + card_height // 2
            draw.line([(arrow_x, arrow_y), (arrow_x + 30, arrow_y)], fill=st["color"], width=4)
            draw.polygon([(arrow_x + 35, arrow_y), (arrow_x + 25, arrow_y - 8), (arrow_x + 25, arrow_y + 8)], fill=st["color"])
            
    # Bottom Summary Box
    draw.rectangle([100, 1040, width-100, height-100], fill=(22, 31, 48), outline=(31, 42, 61), width=2)
    draw.text((130, 1060), "SYSTEM FEEDBACK LOOP & DATA FLOW:", fill=(59, 130, 246), font=font_box_title)
    summary_text = (
        "Raw Law Enforcement Records ──► Feature Processing ──► Graph Correlation ──► 100-Point Dynamic Threat Score "
        "──► Court-Admissible Dossier Export & SHA-256 Immutable Audit Log"
    )
    draw.text((130, 1110), summary_text, fill=(230, 234, 242), font=font_sub)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Flowchart image created successfully at: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_flowchart_image()
