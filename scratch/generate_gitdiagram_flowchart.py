import os
from PIL import Image, ImageDraw, ImageFont

def draw_rounded_rect(draw, xy, r, fill, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1 + r, y1, x2 - r, y2], fill=fill)
    draw.rectangle([x1, y1 + r, x2, y2 - r], fill=fill)
    draw.pieslice([x1, y1, x1 + r * 2, y1 + r * 2], 180, 270, fill=fill)
    draw.pieslice([x2 - r * 2, y1, x2, y1 + r * 2], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - r * 2, x1 + r * 2, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - r * 2, y2 - r * 2, x2, y2], 0, 90, fill=fill)
    if outline:
        draw.arc([x1, y1, x1 + r * 2, y1 + r * 2], 180, 270, fill=outline, width=width)
        draw.arc([x2 - r * 2, y1, x2, y1 + r * 2], 270, 360, fill=outline, width=width)
        draw.arc([x1, y2 - r * 2, x1 + r * 2, y2], 90, 180, fill=outline, width=width)
        draw.arc([x2 - r * 2, y2 - r * 2, x2, y2], 0, 90, fill=outline, width=width)
        draw.line([x1 + r, y1, x2 - r, y1], fill=outline, width=width)
        draw.line([x1 + r, y2, x2 - r, y2], fill=outline, width=width)
        draw.line([x1, y1 + r, x1, y2 - r], fill=outline, width=width)
        draw.line([x2, y1 + r, x2, y2 - r], fill=outline, width=width)

def draw_arrow(draw, p1, p2, fill=(100, 116, 139), width=2, label=None, font=None, label_color=(71, 85, 105)):
    draw.line([p1, p2], fill=fill, width=width)
    import math
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    angle = math.atan2(dy, dx)
    arrow_len = 10
    a1 = angle + math.pi - math.pi / 6
    a2 = angle + math.pi + math.pi / 6
    x_a1 = p2[0] + arrow_len * math.cos(a1)
    y_a1 = p2[1] + arrow_len * math.sin(a1)
    x_a2 = p2[0] + arrow_len * math.cos(a2)
    y_a2 = p2[1] + arrow_len * math.sin(a2)
    draw.polygon([p2, (x_a1, y_a1), (x_a2, y_a2)], fill=fill)
    
    if label and font:
        mid_x = (p1[0] + p2[0]) / 2
        mid_y = (p1[1] + p2[1]) / 2
        # draw text at midpoint
        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.rectangle([mid_x - tw/2 - 4, mid_y - th/2 - 2, mid_x + tw/2 + 4, mid_y + th/2 + 2], fill=(245, 237, 254))
        draw.text((mid_x - tw/2, mid_y - th/2 - 1), label, fill=label_color, font=font)

def create_gitdiagram():
    w, h = 2600, 1600
    bg_color = (245, 237, 254) # Lavender background matching gitdiagram.com screenshot
    
    img = Image.new("RGB", (w, h), bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 32)
        font_box = ImageFont.truetype("arialbd.ttf", 16)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_group = ImageFont.truetype("arial.ttf", 15)
        font_lbl = ImageFont.truetype("arial.ttf", 12)
    except:
        font_title = font_box = font_sub = font_group = font_lbl = ImageFont.load_default()

    # Outer Container Groups (Boxes)
    
    # 1. API Gateway Box (Top Center)
    # [x: 800, y: 80, w: 500, h: 220]
    draw_rounded_rect(draw, [800, 70, 1300, 290], 12, fill=(255, 251, 235), outline=(252, 211, 77), width=2)
    draw.text((1010, 80), "API Gateway", fill=(180, 83, 9), font=font_group)
    
    # Node: FastAPI Application
    draw_rounded_rect(draw, [850, 110, 1250, 175], 8, fill=(254, 243, 199), outline=(245, 158, 11), width=2)
    draw.text((950, 125), "FastAPI Application", fill=(180, 83, 9), font=font_box)
    draw.text((1005, 148), "[main.py]", fill=(217, 119, 6), font=font_sub)
    
    # Node: Intelligence Routers
    draw_rounded_rect(draw, [850, 210, 1250, 270], 8, fill=(254, 243, 199), outline=(245, 158, 11), width=2)
    draw.text((965, 230), "Intelligence Routers", fill=(180, 83, 9), font=font_box)

    # 2. Investigating Officer (Left Circle Node)
    draw.ellipse([100, 520, 280, 700], fill=(238, 242, 255), outline=(99, 102, 241), width=3)
    draw.text((130, 600), "Investigating Officer", fill=(67, 56, 202), font=font_box)

    # 3. Security Operations Container (Left)
    draw_rounded_rect(draw, [350, 360, 600, 720], 12, fill=(240, 253, 244), outline=(134, 239, 172), width=2)
    draw.text((415, 372), "Security Operations", fill=(21, 128, 61), font=font_group)
    
    # Audit Middleware
    draw_rounded_rect(draw, [380, 400, 570, 460], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((410, 420), "Audit Middleware", fill=(21, 128, 61), font=font_box)
    
    # Audit Logger
    draw_rounded_rect(draw, [380, 500, 570, 565], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((435, 513), "Audit Logger", fill=(21, 128, 61), font=font_box)
    draw.text((425, 535), "[audit_logger.py]", fill=(22, 101, 52), font=font_sub)
    
    # Alert Notifier
    draw_rounded_rect(draw, [380, 610, 570, 675], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((430, 623), "Alert Notifier", fill=(21, 128, 61), font=font_box)
    draw.text((420, 645), "[alert_notifier.py]", fill=(22, 101, 52), font=font_sub)

    # 4. Evidence Sources (Right Circle Node)
    draw.ellipse([2150, 220, 2330, 400], fill=(238, 242, 255), outline=(99, 102, 241), width=3)
    draw.text((2180, 300), "Evidence Sources", fill=(67, 56, 202), font=font_box)

    # 5. Evidence Ingestion Container (Right Top)
    draw_rounded_rect(draw, [1800, 460, 2450, 720], 12, fill=(240, 253, 244), outline=(134, 239, 172), width=2)
    draw.text((2070, 472), "Evidence Ingestion", fill=(21, 128, 61), font=font_group)
    
    # Ingestion Coordinator
    draw_rounded_rect(draw, [2000, 505, 2250, 565], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((2040, 525), "Ingestion Coordinator", fill=(21, 128, 61), font=font_box)
    
    # Fusion Ingestion
    draw_rounded_rect(draw, [1840, 610, 2070, 675], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((1885, 633), "Fusion Ingestion", fill=(21, 128, 61), font=font_box)
    
    # Social Media Ingestor
    draw_rounded_rect(draw, [2180, 610, 2410, 675], 8, fill=(220, 252, 231), outline=(34, 197, 94), width=2)
    draw.text((2215, 633), "Social Media Ingestor", fill=(21, 128, 61), font=font_box)

    # 6. Analysis Services Container (Center)
    draw_rounded_rect(draw, [750, 460, 1680, 780], 14, fill=(240, 249, 255), outline=(186, 230, 253), width=2)
    draw.text((1160, 472), "Analysis Services", fill=(3, 105, 161), font=font_group)
    
    # Threat Scoring
    draw_rounded_rect(draw, [780, 505, 1020, 575], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((840, 520), "Threat Scoring", fill=(3, 105, 161), font=font_box)
    draw.text((825, 545), "[threat_service.py]", fill=(14, 116, 144), font=font_sub)
    
    # Investigator Copilot
    draw_rounded_rect(draw, [1070, 505, 1360, 575], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((1115, 520), "Investigator Copilot", fill=(3, 105, 161), font=font_box)
    draw.text((1135, 545), "[copilot_engine.py]", fill=(14, 116, 144), font=font_sub)
    
    # Financial Graph Engine
    draw_rounded_rect(draw, [1410, 505, 1650, 575], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((1445, 530), "Financial Graph Engine", fill=(3, 105, 161), font=font_box)
    
    # Anomaly Detection
    draw_rounded_rect(draw, [1070, 640, 1360, 710], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((1130, 655), "Anomaly Detection", fill=(3, 105, 161), font=font_box)
    draw.text((1125, 680), "[anomaly_engine.py]", fill=(14, 116, 144), font=font_sub)
    
    # Network Analytics
    draw_rounded_rect(draw, [1410, 640, 1650, 710], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((1460, 665), "Network Analytics", fill=(3, 105, 161), font=font_box)

    # 7. Command Center (Bottom Center-Left)
    draw_rounded_rect(draw, [750, 920, 1000, 1180], 12, fill=(240, 249, 255), outline=(56, 189, 248), width=2)
    draw.text((830, 935), "Command Center", fill=(3, 105, 161), font=font_group)
    
    draw_rounded_rect(draw, [780, 970, 970, 1040], 8, fill=(224, 242, 254), outline=(56, 189, 248), width=2)
    draw.text((815, 990), "Tactical Web App", fill=(3, 105, 161), font=font_box)
    draw.text((845, 1012), "[page.tsx]", fill=(14, 116, 144), font=font_sub)

    # 8. Intelligence Core (Bottom Right)
    draw_rounded_rect(draw, [1200, 920, 2050, 1180], 14, fill=(254, 242, 242), outline=(252, 165, 165), width=2)
    draw.text((1570, 935), "Intelligence Core", fill=(185, 28, 28), font=font_group)
    
    # Suspect Query Engine
    draw_rounded_rect(draw, [1230, 970, 1460, 1040], 8, fill=(254, 226, 226), outline=(239, 68, 68), width=2)
    draw.text((1255, 985), "Suspect Query Engine", fill=(185, 28, 28), font=font_box)
    draw.text((1285, 1010), "[query_engine.py]", fill=(153, 27, 27), font=font_sub)
    
    # Intelligence State
    draw_rounded_rect(draw, [1510, 970, 1740, 1040], 8, fill=(254, 226, 226), outline=(239, 68, 68), width=2)
    draw.text((1550, 995), "Intelligence State", fill=(185, 28, 28), font=font_box)
    
    # NLP Entity Engine
    draw_rounded_rect(draw, [1790, 970, 2020, 1040], 8, fill=(254, 226, 226), outline=(239, 68, 68), width=2)
    draw.text((1825, 985), "NLP Entity Engine", fill=(185, 28, 28), font=font_box)
    draw.text((1855, 1010), "[nlp_engine.py]", fill=(153, 27, 27), font=font_sub)

    # NOW DRAW ALL CONNECTING ARROWS & LABELS EXACTLY FROM GITDIAGRAM
    
    # 1. Investigating Officer -> Command Center: "uses"
    draw_arrow(draw, (190, 700), (780, 1000), label="uses", font=font_lbl)
    
    # 2. Investigating Officer -> FastAPI Application: "forwards requests"
    draw_arrow(draw, (190, 520), (850, 140), label="forwards requests", font=font_lbl)
    
    # 3. FastAPI App -> Intelligence Routers: "dispatches routes"
    draw_arrow(draw, (1050, 175), (1050, 210), label="dispatches routes", font=font_lbl)
    
    # 4. Intelligence Routers -> Audit Middleware: "installs middleware"
    draw_arrow(draw, (850, 240), (475, 400), label="installs middleware", font=font_lbl)
    
    # 5. Audit Middleware -> Audit Logger: "records access"
    draw_arrow(draw, (475, 460), (475, 500), label="records access", font=font_lbl)
    
    # 6. Audit Logger -> Alert Notifier: "raises alerts"
    draw_arrow(draw, (475, 565), (475, 610), label="raises alerts", font=font_lbl)
    
    # 7. Intelligence Routers -> Threat Scoring: "requests scores"
    draw_arrow(draw, (950, 270), (900, 505), label="requests scores", font=font_lbl)
    
    # 8. Intelligence Routers -> Investigator Copilot: "asks copilot"
    draw_arrow(draw, (1080, 270), (1215, 505), label="asks copilot", font=font_lbl)
    
    # 9. Intelligence Routers -> Financial Graph Engine: "serves finance graph"
    draw_arrow(draw, (1200, 270), (1530, 505), label="serves finance graph", font=font_lbl)
    
    # 10. Intelligence Routers -> Ingestion Coordinator: "starts ingestion"
    draw_arrow(draw, (1250, 240), (2000, 525), label="starts ingestion", font=font_lbl)
    
    # 11. Evidence Sources -> Ingestion Coordinator: "provides evidence"
    draw_arrow(draw, (2200, 400), (2125, 505), label="provides evidence", font=font_lbl)
    
    # 12. Ingestion Coordinator -> Fusion Ingestion: "runs fusion"
    draw_arrow(draw, (2060, 565), (1955, 610), label="runs fusion", font=font_lbl)
    
    # 13. Ingestion Coordinator -> Social Media Ingestor: "runs connector"
    draw_arrow(draw, (2200, 565), (2295, 610), label="runs connector", font=font_lbl)
    
    # 14. Tactical Web App -> FastAPI App: "requests data"
    draw_arrow(draw, (850, 970), (850, 290), label="requests data", font=font_lbl)
    
    # 15. Tactical Web App -> Threat Scoring: "runs searches"
    draw_arrow(draw, (820, 970), (850, 575), label="runs searches", font=font_lbl)
    
    # 16. Threat Scoring -> Tactical Web App: "returns threat data"
    draw_arrow(draw, (900, 575), (870, 970), label="returns threat data", font=font_lbl)
    
    # 17. Threat Scoring -> Intelligence Core: "calculates scores"
    draw_arrow(draw, (950, 575), (1345, 970), label="calculates scores", font=font_lbl)
    
    # 18. Investigator Copilot -> Tactical Web App: "returns briefings"
    draw_arrow(draw, (1200, 575), (920, 970), label="returns briefings", font=font_lbl)
    
    # 19. Investigator Copilot -> Anomaly Detection: "checks anomalies"
    draw_arrow(draw, (1215, 575), (1215, 640), label="checks anomalies", font=font_lbl)
    
    # 20. Financial Graph Engine -> Network Analytics: "analyzes paths"
    draw_arrow(draw, (1530, 575), (1530, 640), label="analyzes paths", font=font_lbl)
    
    # 21. Anomaly Detection -> Intelligence Core: "reads records"
    draw_arrow(draw, (1215, 710), (1345, 970), label="reads records", font=font_lbl)
    
    # 22. Network Analytics -> Intelligence Core: "reads relationships"
    draw_arrow(draw, (1530, 710), (1625, 970), label="reads relationships", font=font_lbl)
    
    # 23. Fusion Ingestion -> Intelligence Core: "updates state"
    draw_arrow(draw, (1955, 675), (1625, 970), label="updates state", font=font_lbl)
    
    # 24. Social Media Ingestor -> NLP Entity Engine: "extracts entities"
    draw_arrow(draw, (2295, 675), (1905, 970), label="extracts entities", font=font_lbl)

    out_path = os.path.abspath("frontend/public/gitdiagram_architecture.png")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path)
    print(f"GitDiagram architecture image rendered successfully to: {out_path}")
    return out_path

if __name__ == "__main__":
    create_gitdiagram()
