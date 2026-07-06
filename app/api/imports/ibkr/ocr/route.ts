import PDFParser from 'pdf2json'

export const maxDuration = 60

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser()
      let extractedText = ''

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData)
        const errorMessage = errData instanceof Error ? errData.message : 'PDF parsing failed'
        resolve(`PDF processing failed: ${errorMessage}. Please ensure the PDF file is valid and not password protected.`)
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          pdfData.Pages.forEach((page: any) => {
            page.Texts.forEach((text: any) => {
              text.R.forEach((run: any) => {
                extractedText += decodeURIComponent(run.T) + ' '
              })
            })
            extractedText += '\n'
          })
          resolve(extractedText.trim())
        } catch (processingError) {
          console.error('Error processing PDF data:', processingError)
          const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error'
          resolve(`PDF processing failed: ${errorMessage}. Please ensure the PDF file is valid and not password protected.`)
        }
      })

      pdfParser.parseBuffer(pdfBuffer)
    } catch (error) {
      console.error('Error setting up PDF parser:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      resolve(`PDF processing failed: ${errorMessage}. Please ensure the PDF file is valid and not password protected.`)
    }
  })
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const attachment = json.attachments?.[0]

    if (!attachment) {
      return new Response(JSON.stringify({ error: { code: 'IMPORT_FILE_MISSING', message: 'No file provided' } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (attachment.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: { code: 'IMPORT_FILE_TYPE_INVALID', message: 'Invalid file type. Only PDF files are allowed.' } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!attachment.content || (typeof attachment.content === 'string' && attachment.content.trim() === '')) {
      return new Response(JSON.stringify({ error: { code: 'IMPORT_FILE_EMPTY', message: 'File content is empty' } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let pdfBuffer: Buffer
    try {
      if (attachment.content instanceof ArrayBuffer) {
        pdfBuffer = Buffer.from(attachment.content)
      } else if (typeof attachment.content === 'string') {
        pdfBuffer = Buffer.from(attachment.content, 'base64')
      } else {
        return new Response(JSON.stringify({ error: { code: 'IMPORT_FILE_TYPE_INVALID', message: 'Invalid file content format' } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (error) {
      console.error('Error processing file content:', error)
      return new Response(JSON.stringify({ error: { code: 'IMPORT_FILE_TYPE_INVALID', message: 'Failed to process file content' } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const extractedText = await extractTextFromPdf(pdfBuffer)

    return new Response(JSON.stringify({ text: extractedText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    console.error('Error processing request')
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Failed to process request' } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
