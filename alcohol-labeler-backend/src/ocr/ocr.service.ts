import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { OcrResult } from '../types';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  
  /**
   * Extract raw text from uploaded image using Tesseract OCR
   */
  async extractRawTextFromImage(imageFile: Express.Multer.File): Promise<OcrResult> {
    if (!imageFile?.path) {
      this.logger.warn('No image file path provided for OCR extraction');
      return { rawText: '', confidence: 0 };
    }

    this.logger.log(`Starting OCR extraction for image: ${imageFile.filename || imageFile.originalname}`);

    try {
      // Run OCR on the saved file path
      const { data } = await Tesseract.recognize(imageFile.path, 'eng');
      const rawText = this.normalizeText(data.text || '');
      const confidence = data.confidence || 0;

      // Log the raw extracted text
      this.logger.log('Raw OCR text extracted:');
      this.logger.log('---START RAW TEXT---');
      this.logger.log(rawText || '(empty)');
      this.logger.log('---END RAW TEXT---');
      this.logger.log(`OCR Confidence: ${confidence.toFixed(2)}%`);

      return { rawText, confidence };
    } catch (error) {
      this.logger.error('OCR processing failed:', error);
      return { rawText: '', confidence: 0 };
    }
  }

  /**
   * Normalize OCR text for better fuzzy matching
   */
  private normalizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s%./()-]/g, ' ') // Remove special characters but keep common ones
      .trim();
  }

}
