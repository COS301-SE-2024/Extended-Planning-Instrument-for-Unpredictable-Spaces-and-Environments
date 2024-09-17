import QRCode from 'qrcode'
import { PDFDocument, rgb } from 'pdf-lib'
import { saveAs } from 'file-saver'

// Function to create a QR code from a data object
async function createQRCode(data: object): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
    width: 200,
    margin: 1
  })
  return qrDataUrl
}

// Create a PDF
export async function createPDF(jsonData: any, shipmentName: string) {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([612, 792]) // Letter size
  const qrSize = 2 * 72 // 2 inches in points
  const margin = 1 * 72 // 1 inch in points
  let yPosition = 10 * 72 // Start from the top of the page

  for (const item of jsonData) {
    // Generate a QR code for each JSON object
    const qrCodeDataUrl = await createQRCode(item)
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl)

    // Add QR code to the page
    page.drawImage(qrImage, {
      x: margin,
      y: yPosition - qrSize,
      width: qrSize,
      height: qrSize
    })

    // Add item details next to the QR code
    page.drawText(`ID: ${item.id}`, {
      x: margin + qrSize + 0.5 * 72,
      y: yPosition - 0.5 * 72,
      size: 12,
      color: rgb(0, 0, 0)
    })

    page.drawText(`Dimensions (W x H x L): ${item.width} x ${item.height} x ${item.length}`, {
      x: margin + qrSize + 0.5 * 72,
      y: yPosition - 0.8 * 72,
      size: 12,
      color: rgb(0, 0, 0)
    })

    page.drawText(`Weight: ${item.weight}`, {
      x: margin + qrSize + 0.5 * 72,
      y: yPosition - 1.1 * 72,
      size: 12,
      color: rgb(0, 0, 0)
    })

    page.drawText(`Volume: ${item.volume}`, {
      x: margin + qrSize + 0.5 * 72,
      y: yPosition - 1.4 * 72,
      size: 12,
      color: rgb(0, 0, 0)
    })

    // Move yPosition down for the next entry
    yPosition -= qrSize + 1.5 * 72 // Adjust spacing between entries

    // Check if we need a new page
    if (yPosition < margin + 1.5 * qrSize) {
      page = pdfDoc.addPage([612, 792]) // Add a new page
      yPosition = 10 * 72 // Reset yPosition to the top of the new page
    }
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save()

  // Save the PDF using FileSaver.js
  saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `${shipmentName}.pdf`)
}
