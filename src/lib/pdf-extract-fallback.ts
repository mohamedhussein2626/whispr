/**
 * Fallback PDF text extraction utility
 * Used when chunks are missing from database
 */

import { processHybridPdf } from "./pdf-ocr-hybrid";

/**
 * Extract text from PDF file URL as fallback when chunks don't exist
 */
export async function extractTextFromPdfUrl(fileUrl: string): Promise<string> {
  try {
    console.log("🔄 Fallback: Extracting text from PDF URL:", fileUrl);
    
    // Fetch the PDF file
    const response = await fetch(fileUrl, {
      headers: {
        // Include credentials for authenticated requests
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using hybrid PDF processor
    const extractedText = await processHybridPdf(buffer, {
      extractImageText: false, // Disable image OCR for faster fallback
      maxPages: 50,
    });

    if (!extractedText || !extractedText.trim()) {
      throw new Error("No text extracted from PDF");
    }

    console.log(`✅ Fallback extraction successful: ${extractedText.length} characters`);
    return extractedText;
  } catch (error) {
    console.error("❌ Fallback PDF extraction failed:", error);
    throw error;
  }
}

