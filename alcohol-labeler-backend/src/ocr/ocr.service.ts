import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { ExtractedLabelData } from '../types';

@Injectable()
export class OcrService {
  /**
   * Extract text from uploaded image using Tesseract OCR
   */
  async extractTextFromImage(imageFile: Express.Multer.File): Promise<ExtractedLabelData> {
    if (!imageFile?.path) {
      return this.createEmptyExtractedLabelData();
    }

    try {
      // Run OCR on the saved file path
      const { data } = await Tesseract.recognize(imageFile.path, 'eng');
      const rawText = (data.text || '').trim();

      // Parse into ExtractedLabelData
      return this.parseExtractedText(rawText);
    } catch (error) {
      console.error('OCR processing failed:', error);
      return this.createEmptyExtractedLabelData();
    }
  }

  /**
   * Parse OCR text into structured label data
   */
  private parseExtractedText(text: string): ExtractedLabelData {
    const raw = text || '';
    const normalized = raw.replace(/\r/g, '');
    const lines = normalized
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const whole = normalized.replace(/\s+/g, ' ');

    // brandName: try explicit hints first, then guess from top lines
    const brandFromHint = this.pick(whole, [/brand[:\-\s]+(.{2,60})/i], 1);
    const brandFromTop = (() => {
      for (const l of lines.slice(0, 5)) {
        if (
          /^[A-Z0-9 '&\-]{3,}$/.test(l) &&
          !/%|ML|OZ|ALC|VOL|CLASS|TYPE/i.test(l)
        ) {
          return l;
        }
      }
      return null;
    })();
    const brandName = brandFromHint || brandFromTop || undefined;

    // productClass: look for "Class:" or "Type:"
    const productClass =
      this.pick(whole, [/class[:\-\s]+(.{2,60})/i, /type[:\-\s]+(.{2,60})/i], 1) ||
      undefined;

    // alcoholContent: prefer percentages, fallback to "ALC 12.5"
    const alcMatch =
      whole.match(/(\d+(?:\.\d+)?)\s*%/) ||
      whole.match(/alc[^0-9]{0,10}(\d+(?:\.\d+)?)/i);
    const alcoholContent = alcMatch ? Number(alcMatch[1]) : undefined;

    // netContents: 750 ml, 1.5 L, 12 fl oz, 16 oz
    const netMatch = whole.match(
      /\b(\d+(?:\.\d+)?)\s*(ml|l|fl\s*oz|oz)\b/i
    );
    const netContents = netMatch
      ? `${netMatch[1]} ${netMatch[2]}`
          .replace(/\s+/g, ' ')
          .toLowerCase()
      : undefined;

    return { brandName, productClass, alcoholContent, netContents };
  }

  /**
   * Helper function to pick the first matching pattern from text
   */
  private pick(text: string, patterns: RegExp[], group: number): string | null {
    for (const re of patterns) {
      const m = text.match(re);
      if (m && m[group]) return m[group].trim();
    }
    return null;
  }

  /**
   * Create an empty ExtractedLabelData object
   */
  private createEmptyExtractedLabelData(): ExtractedLabelData {
    return {
      brandName: undefined,
      productClass: undefined,
      alcoholContent: undefined,
      netContents: undefined
    };
  }
}
