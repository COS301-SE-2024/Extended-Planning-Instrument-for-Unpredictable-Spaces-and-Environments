import json
import qrcode
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from PIL import Image

# Function to create a QR code from a dictionary
def create_qr_code(data):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(json.dumps(data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img

# Load the JSON data
json_data = '''
{
    "data": [
        {
            "id": 1,
            "Shipment_id": 1,
            "Packed_time": "2024-07-22T15:25:45.970034",
            "Width": 500,
            "Length": 500,
            "Height": 500,
            "Weight": 500,
            "Volume": 500
        },
        {
            "id": 2,
            "Shipment_id": 1,
            "Packed_time": "2024-07-22T15:26:29.530949",
            "Width": 500,
            "Length": 500,
            "Height": 500,
            "Weight": 500,
            "Volume": 500
        }
    ]
}
'''

# Parse the JSON data
parsed_data = json.loads(json_data)

# Create a PDF
pdf_filename = f"Shipment{parsed_data['data'][0]['Shipment_id']}.pdf"
c = canvas.Canvas(pdf_filename, pagesize=letter)

# Set up layout parameters
qr_size = 2 * inch
margin = 1 * inch
y_position = 10 * inch  # Start from top of the page

# Create QR codes and add them to the PDF
for item in parsed_data['data']:
    qr_img = create_qr_code(item)
    
    # Save PIL Image to a temporary file
    temp_img_path = f"temp_qr_{item['id']}.png"
    qr_img.save(temp_img_path)
    
    # Add QR code to PDF
    c.drawImage(temp_img_path, margin, y_position - qr_size, width=qr_size, height=qr_size)
    
    # Add text next to QR code
    c.setFont("Helvetica", 12)
    c.drawString(margin + qr_size + 0.5*inch, y_position - 0.5*inch, f"ID: {item['id']}")
    c.drawString(margin + qr_size + 0.5*inch, y_position - 0.8*inch, f"Shipment ID: {item['Shipment_id']}")
    
    # Move to next position
    y_position -= qr_size + inch
    
    # Check if we need a new page
    if y_position < margin:
        c.showPage()
        y_position = 10 * inch  # Reset to top of new page

# Save the PDF
c.save()
print(f"PDF saved as {pdf_filename}")
