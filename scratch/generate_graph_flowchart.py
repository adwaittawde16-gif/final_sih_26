import os
from PIL import Image, ImageDraw, ImageFont

def draw_rounded_rectangle(draw, xy, corner_radius, fill=None, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1 + corner_radius, y1, x2 - corner_radius, y2], fill=fill)
    draw.rectangle([x1, y1 + corner_radius, x2, y2 - corner_radius], fill=fill)
    draw.pieslice([x1, y1, x1 + corner_radius * 2, y1 + corner_radius * 2], 180, 270, fill=fill)
    draw.pieslice([x2 - corner_radius * 2, y1, x2, y1 + corner_radius * 2], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - corner_radius * 2, x1 + corner_radius * 2, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - corner_radius * 2, y2 - corner_radius * 2, x2, y2], 0, 90, fill=fill)
    if outline:
        draw.arc([x1, y1, x1 + corner_radius * 2, y1 + corner_radius * 2], 180, 270, fill=outline, width=width)
        draw.arc([x2 - corner_radius * 2, y1, x2, y1 + corner_radius * 2], 270, 360, fill=outline, width=width)
        draw.arc([x1, y2 - corner_radius * 2, x1 + corner_radius * 2, y2], 90, 180, fill=outline, width=width)
        draw.arc([x2 - corner_radius * 2, y2 - corner_radius * 2, x2, y2], 0, 90, fill=outline, width=width)
        draw.line([x1 + corner_radius, y1, x2 - corner_radius, y1], fill=outline, width=width)
        draw.line([x1 + corner_radius, y2, x2 - corner_radius, y2], fill=outline, width=width)
        draw.line([x1, y1 + corner_radius, x1, y2 - corner_radius], fill=outline, width=width)
        draw.line([x2, y1 + corner_radius, x2, y2 - corner_radius], fill=outline, width=width)

def generate_graph_flowchart(output_path="frontend/public/graph_model_flowchart.png"):
    # Dimensions for high-res slide inclusion
    w, h = 2400, 1200
    bg = (255, 255, 255) # Light background matching SIH template
    
    img = Image.new("RGB", (w, h), bg)
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 40)
        font_sub = ImageFont.truetype("arial.ttf", 22)
        font_node_title = ImageFont.truetype("arialbd.ttf", 22)
        font_node_sub = ImageFont.truetype("arial.ttf", 18)
        font_badge = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font_title = font_sub = font_node_title = font_node_sub = font_badge = ImageFont.load_default()
        
    # Title Section
    draw.text((80, 40), "AI MODEL PIPELINE & GRAPH NETWORK ARCHITECTURE", fill=(15, 23, 42), font=font_title)
    draw.text((80, 95), "End-to-End Multi-Modal Ingestion -> Graph Mining -> Threat Indexing -> Explainable AI (XAI)", fill=(71, 85, 105), font=font_sub)
    
    # Outer container box
    draw_rounded_rectangle(draw, [50, 30, w-50, h-40], 16, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
    
    # Colors
    c_blue = (37, 99, 235)      # #2563EB
    c_indigo = (79, 70, 229)    # #4F46E5
    c_emerald = (16, 185, 129)  # #10B981
    c_amber = (217, 119, 6)     # #D97706
    c_red = (220, 38, 38)       # #DC2626
    c_dark = (15, 23, 42)       # #0F172A
    
    # Define Nodes (Positioning Graph Layout)
    # Column 1: Multi-Source Inputs (x: 100)
    inputs = [
        ("CDR Phone Logs", "Cell Tower Pings & Time"),
        ("CCTV Camera Feeds", "Video Streams & Frames"),
        ("PDF FIR Complaints", "Legal Text & Suspects"),
        ("Bank Ledgers", "Financial Transactions"),
        ("Social Media", "Network Footprints")
    ]
    
    input_coords = []
    y_start = 180
    for i, (title, sub) in enumerate(inputs):
        ny = y_start + i * 180
        nx = 100
        nw, nh = 340, 130
        draw_rounded_rectangle(draw, [nx, ny, nx+nw, ny+nh], 12, fill=(255, 255, 255), outline=c_blue, width=2)
        # Colored left bar
        draw.rectangle([nx, ny, nx+10, ny+nh], fill=c_blue)
        draw.text((nx+25, ny+25), title, fill=c_dark, font=font_node_title)
        draw.text((nx+25, ny+65), sub, fill=(100, 116, 139), font=font_node_sub)
        input_coords.append((nx+nw, ny+nh//2))

    # Column 2: Ingestion & Feature Extraction (x: 580)
    # Node 2A: Feature Extractor
    x2, y2a, w2, h2a = 550, 220, 380, 280
    draw_rounded_rectangle(draw, [x2, y2a, x2+w2, y2a+h2a], 14, fill=(238, 242, 255), outline=c_indigo, width=2)
    draw.text((x2+25, y2a+25), "STAGE 1: FEATURE EXTRACTION", fill=c_indigo, font=font_node_title)
    draw.text((x2+25, y2a+75), "• SpaCy NLP (FIR Entities)", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2a+115), "• OpenCV Facial Match", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2a+155), "• Regex CDR Triangulation", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2a+195), "• Financial Anomaly Parser", fill=c_dark, font=font_node_sub)
    
    # Node 2B: Preprocessing Data Queue
    y2b, h2b = 600, 260
    draw_rounded_rectangle(draw, [x2, y2b, x2+w2, y2b+h2b], 14, fill=(240, 253, 250), outline=c_emerald, width=2)
    draw.text((x2+25, y2b+25), "STAGE 2: DATA PREPROCESSING", fill=c_emerald, font=font_node_title)
    draw.text((x2+25, y2b+75), "• Spatiotemporal Clustering", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2b+115), "• Nocturnal Call Filtering", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2b+155), "• Co-Location Alignment", fill=c_dark, font=font_node_sub)
    draw.text((x2+25, y2b+195), "• Entity Disambiguation", fill=c_dark, font=font_node_sub)

    # Column 3: CORE GRAPH MINING ENGINE (Center Node) (x: 1050)
    x3, y3, w3, h3 = 1040, 300, 440, 420
    draw_rounded_rectangle(draw, [x3, y3, x3+w3, y3+h3], 20, fill=(255, 255, 255), outline=c_emerald, width=4)
    # Header fill
    draw.rectangle([x3, y3, x3+w3, y3+60], fill=c_emerald)
    draw.text((x3+30, y3+15), "GRAPH NETWORK ENGINE", fill=(255, 255, 255), font=font_node_title)
    
    draw.text((x3+30, y3+85), "Neo4j & NetworkX Core Mesh", fill=c_emerald, font=font_node_title)
    draw.text((x3+30, y3+140), "• Degree Centrality (Hubs)", fill=c_dark, font=font_node_sub)
    draw.text((x3+30, y3+185), "• Betweenness Leader Score", fill=c_dark, font=font_node_sub)
    draw.text((x3+30, y3+230), "• Louvain Syndicate Clusters", fill=c_dark, font=font_node_sub)
    draw.text((x3+30, y3+275), "• Nocturnal Call Graph", fill=c_dark, font=font_node_sub)
    draw.text((x3+30, y3+320), "• Multi-Layer Edge Attribution", fill=c_dark, font=font_node_sub)
    draw.text((x3+30, y3+365), "• Dynamic Syndicate Mapping", fill=c_dark, font=font_node_sub)

    # Column 4: THREAT MODEL & XAI MATRIX (x: 1580)
    x4, y4, w4, h4 = 1580, 220, 380, 640
    draw_rounded_rectangle(draw, [x4, y4, x4+w4, y4+h4], 16, fill=(254, 243, 199), outline=c_amber, width=3)
    draw.text((x4+25, y4+25), "STAGE 4: THREAT SCORER & XAI", fill=c_amber, font=font_node_title)
    
    # Sub box 4A: 100-pt Score
    draw_rounded_rectangle(draw, [x4+15, y4+80, x4+w4-15, y4+330], 10, fill=(255, 255, 255), outline=c_amber, width=1)
    draw.text((x4+30, y4+95), "100-Point Dynamic Classifier", fill=c_dark, font=font_node_title)
    draw.text((x4+30, y4+140), "• CCTV Encounter (+28.6 pts)", fill=(180, 83, 9), font=font_node_sub)
    draw.text((x4+30, y4+180), "• Nocturnal Interceptions (+20)", fill=(180, 83, 9), font=font_node_sub)
    draw.text((x4+30, y4+220), "• FIR IPC Severity (+15 pts)", fill=(180, 83, 9), font=font_node_sub)
    draw.text((x4+30, y4+260), "• Criminal History & Financial", fill=(180, 83, 9), font=font_node_sub)
    
    # Sub box 4B: Explainable AI
    draw_rounded_rectangle(draw, [x4+15, y4+350, x4+w4-15, y4+610], 10, fill=(255, 255, 255), outline=c_amber, width=1)
    draw.text((x4+30, y4+365), "Explainable AI (XAI) Engine", fill=c_dark, font=font_node_title)
    draw.text((x4+30, y4+410), "• Feature Attribution Weighting", fill=c_dark, font=font_node_sub)
    draw.text((x4+30, y4+455), "• Counterfactual Simulator", fill=c_dark, font=font_node_sub)
    draw.text((x4+30, y4+500), "• Statutory Court Proofs", fill=c_dark, font=font_node_sub)
    draw.text((x4+30, y4+545), "• Evidentiary Chain-of-Custody", fill=c_dark, font=font_node_sub)

    # Column 5: COMMAND CENTER & AUDIT LOG (x: 2040)
    x5, y5, w5, h5 = 2020, 300, 330, 420
    draw_rounded_rectangle(draw, [x5, y5, x5+w5, y5+h5], 16, fill=(254, 226, 226), outline=c_red, width=3)
    draw.text((x5+20, y5+25), "TACTICAL OUTPUTS", fill=c_red, font=font_node_title)
    draw.text((x5+20, y5+85), "• Live Command Map", fill=c_dark, font=font_node_sub)
    draw.text((x5+20, y5+130), "• Audio AI Copilot", fill=c_dark, font=font_node_sub)
    draw.text((x5+20, y5+175), "• PDF Court Dossier", fill=c_dark, font=font_node_sub)
    draw.text((x5+20, y5+220), "• Gephi GEXF Network", fill=c_dark, font=font_node_sub)
    draw.text((x5+20, y5+265), "• SHA-256 Audit Log", fill=c_dark, font=font_node_sub)
    draw.text((x5+20, y5+310), "• Field Action Dispatch", fill=c_dark, font=font_node_sub)

    # DRAW CONNECTING DIRECTED EDGES / ARROWS
    # Connect Column 1 to Column 2
    for start_pt in input_coords:
        end_y = y2a + h2a//2 if start_pt[1] < 500 else y2b + h2b//2
        draw.line([start_pt, (x2, end_y)], fill=c_blue, width=3)
        draw.polygon([(x2, end_y), (x2-12, end_y-6), (x2-12, end_y+6)], fill=c_blue)
        
    # Connect Column 2 to Column 3 (Graph Engine)
    draw.line([(x2+w2, y2a+h2a//2), (x3, y3+100)], fill=c_indigo, width=4)
    draw.polygon([(x3, y3+100), (x3-14, y3+93), (x3-14, y3+107)], fill=c_indigo)
    
    draw.line([(x2+w2, y2b+h2b//2), (x3, y3+300)], fill=c_emerald, width=4)
    draw.polygon([(x3, y3+300), (x3-14, y3+293), (x3-14, y3+307)], fill=c_emerald)
    
    # Connect Column 3 (Graph Engine) to Column 4 (Threat & XAI)
    draw.line([(x3+w3, y3+h3//2), (x4, y4+h4//2)], fill=c_emerald, width=4)
    draw.polygon([(x4, y4+h4//2), (x4-14, y4+h4//2-7), (x4-14, y4+h4//2+7)], fill=c_emerald)
    
    # Connect Column 4 to Column 5 (Command Center)
    draw.line([(x4+w4, y4+h4//2), (x5, y5+h5//2)], fill=c_amber, width=4)
    draw.polygon([(x5, y5+h5//2), (x5-14, y5+h5//2-7), (x5-14, y5+h5//2+7)], fill=c_amber)

    # TECH STACK BADGES AT THE BOTTOM
    draw.text((80, 1080), "SYSTEM TECH STACK:", fill=c_dark, font=font_node_title)
    badges = [
        ("Frontend: Next.js 14 / React / Tailwind CSS / Lucide", c_blue),
        ("NLP & Vision: SpaCy / OpenCV / FaceNet", c_indigo),
        ("Graph Mining: Neo4j / NetworkX / Gephi", c_emerald),
        ("Scoring & XAI: Threat Matrix / Counterfactual Engine", c_amber),
        ("Security: Cryptographic SHA-256 Ledger", c_red)
    ]
    bx = 350
    for label, color in badges:
        draw_rounded_rectangle(draw, [bx, 1070, bx+360, 1120], 8, fill=(255, 255, 255), outline=color, width=2)
        draw.text((bx+15, 1083), label, fill=color, font=font_badge)
        bx += 390

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Graph model flowchart generated cleanly at: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_graph_flowchart()
