import { Injectable, NotFoundException } from '@nestjs/common';
import * as fuzz from 'fuzzball';
import { 
  LabelValidationResponse, 
  CreateLabelValidationDto, 
  VALIDATION_STATUS,
  ValidationStatusType,
  ExtractedLabelData,
  AlcoholLabelFormData,
  ValidationIssues,
  OcrResult
} from '../types';
import { OcrService } from '../ocr/ocr.service';

@Injectable()
export class LabelValidationService {
  // In-memory cache - key: id, value: LabelValidationResponse
  private readonly validationsCache = new Map<string, LabelValidationResponse>();
  private counter = 1;

  constructor(private readonly ocrService: OcrService) {}


  getAllLabelValidations(): LabelValidationResponse[] {
    return Array.from(this.validationsCache.values());
  }

  /**
   * Get a specific label validation by ID
   */
  getLabelValidation(id: string): LabelValidationResponse {
    const validation = this.validationsCache.get(id);
    if (!validation) {
      throw new NotFoundException(`Label validation with ID ${id} not found`);
    }
    return validation;
  }

  /**
   * Create a new label validation and start processing
   */
  async createLabelValidation(dto: CreateLabelValidationDto): Promise<LabelValidationResponse> {
    // Generate unique ID
    const id = this.generateId();
    
    // Create form data object (excluding the actual file for storage)
    const formData: AlcoholLabelFormData = {
      brandName: dto.brandName,
      productClass: dto.productClass,
      alcoholContent: dto.alcoholContent,
      netContents: dto.netContents,
      labelImage: null
    };

    // Create initial validation response with 'processing' status
    const validation: LabelValidationResponse = {
      id,
      status: VALIDATION_STATUS.PROCESSING,
      createdAt: new Date().toISOString(),
      success: false, // Will be updated when processing completes
      formData
    };

    // Store in cache
    this.validationsCache.set(id, validation);

    // Start the async validation process (no await - fire and forget)
    this.processLabelValidation(id, dto.labelImage);

    return validation;
  }

  /**
   * Process the label validation asynchronously
   */
  private async processLabelValidation(id: string, imageFile: Express.Multer.File): Promise<void> {
    try {
      // Extract raw text from image using OCR service
      const ocrResult = await this.ocrService.extractRawTextFromImage(imageFile);

      // Compare OCR text with form data using fuzzy matching
      const validation = this.validationsCache.get(id);
      if (!validation) return;

      const comparisonResult = await this.fuzzyMatchFormDataWithOcr(ocrResult, validation.formData);

      // Update validation with results
      const updatedValidation: LabelValidationResponse = {
        ...validation,
        status: VALIDATION_STATUS.COMPLETED,
        success: comparisonResult.success,
        issues: comparisonResult.issues
      };

      this.validationsCache.set(id, updatedValidation);
      
    } catch (error) {
      // Handle processing errors
      const validation = this.validationsCache.get(id);
      if (validation) {
        const failedValidation: LabelValidationResponse = {
          ...validation,
          status: VALIDATION_STATUS.FAILED,
          success: false,
          issues: { general: 'Processing failed due to an internal error' }
        };
        this.validationsCache.set(id, failedValidation);
      }
    }
  }


  /**
   * Compare form data with raw OCR text using fuzzy matching
   */
  private async fuzzyMatchFormDataWithOcr(
    ocrResult: OcrResult,
    formData: AlcoholLabelFormData
  ): Promise<{ success: boolean; issues?: ValidationIssues }> {
    const issues: ValidationIssues = {};
    const rawText = ocrResult.rawText.toLowerCase();

    console.log('Starting fuzzy matching validation...');
    console.log(`Raw OCR text: "${rawText}"`);

    // Brand Name - Use fuzzy matching with 50% threshold (lowered)
    if (formData.brandName) {
      const brandMatch = this.fuzzyMatchField(rawText, formData.brandName, 60);
      console.log(`Brand match: "${formData.brandName}" -> ${brandMatch.confidence}%`);
      if (!brandMatch.found) {
        issues.brandName = `Brand name not found in label (confidence: ${brandMatch.confidence}%)`;
      }
    }

    // Product Class - Use fuzzy matching with 45% threshold (lowered)
    if (formData.productClass) {
      const classMatch = this.fuzzyMatchField(rawText, formData.productClass, 60);
      console.log(`Product class match: "${formData.productClass}" -> ${classMatch.confidence}%`);
      if (!classMatch.found) {
        issues.productClass = `Product class not found in label (confidence: ${classMatch.confidence}%)`;
      }
    }

    // Alcohol Content - Fuzzy match the percentage string
    if (typeof formData.alcoholContent === 'number') {
      const alcoholText = `${formData.alcoholContent}%`;
      const alcoholMatch = this.fuzzyMatchField(rawText, alcoholText, 90);
      console.log(`Alcohol content match: "${alcoholText}" -> ${alcoholMatch.confidence}%`);
      if (!alcoholMatch.found) {
        // Try without the % symbol
        const alcoholNoPercent = formData.alcoholContent.toString();
        const alcoholMatch2 = this.fuzzyMatchField(rawText, alcoholNoPercent, 90);
        console.log(`Alcohol content match (no %): "${alcoholNoPercent}" -> ${alcoholMatch2.confidence}%`);
        if (!alcoholMatch2.found) {
          issues.alcoholContent = `Alcohol content "${alcoholText}" not found in label`;
        }
      }
    }

    // Net Contents - Fuzzy match the volume string
    if (formData.netContents) {
      const volumeMatch = this.fuzzyMatchField(rawText, formData.netContents, 60);
      console.log(`Volume match: "${formData.netContents}" -> ${volumeMatch.confidence}%`);
      if (!volumeMatch.found) {
        issues.netContents = `Net contents "${formData.netContents}" not found in label (confidence: ${volumeMatch.confidence}%)`;
      }
    }

    const success = Object.keys(issues).length === 0;
    console.log(`Fuzzy matching completed. Success: ${success}, Issues: ${Object.keys(issues).length}`);
    
    return { success, issues: success ? undefined : issues };
  }

  /**
   * Fuzzy match a field value against raw OCR text using fuzzball
   */
  private fuzzyMatchField(rawText: string, expectedValue: string, threshold: number): { found: boolean; confidence: number } {
    const normalizedExpected = expectedValue.toLowerCase();
    const normalizedOcr = rawText.toLowerCase();
    
    // Try multiple fuzzy matching algorithms and take the best score
    const scores = [
      fuzz.partial_ratio(normalizedExpected, normalizedOcr),
      fuzz.token_set_ratio(normalizedExpected, normalizedOcr),
      fuzz.token_sort_ratio(normalizedExpected, normalizedOcr),
      fuzz.ratio(normalizedExpected, normalizedOcr)
    ];
    
    const confidence = Math.max(...scores);
    
    return {
      found: confidence >= threshold,
      confidence
    };
  }

  /**
   * Normalize text for comparison (remove diacritics, punctuation, normalize spaces)
   */
  private normText(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if two text strings are similar (fuzzy matching for brand names)
   */
  private similarText(a: string, b: string): boolean {
    const na = this.normText(a);
    const nb = this.normText(b);
    if (!na || !nb) return false;
    if (na === nb) return true;
    // contains heuristic for longer strings
    if (na.length >= 6 && (na.includes(nb) || nb.includes(na))) return true;
    return false;
  }

  /**
   * Check if source text contains target text (for product class matching)
   */
  private containsText(source: string, target: string): boolean {
    const ns = this.normText(source);
    const nt = this.normText(target);
    if (!ns || !nt) return false;
    return ns.includes(nt) || nt.includes(ns);
  }

  /**
   * Convert volume string to milliliters
   */
  private toMl(s: string): number | null {
    if (!s) return null;
    const t = this.normText(s);

    // 750 ml
    let m = t.match(/(\d+(?:\.\d+)?)\s*ml\b/);
    if (m) return Number(m[1]);

    // 1.5 l
    m = t.match(/(\d+(?:\.\d+)?)\s*l\b/);
    if (m) return Number(m[1]) * 1000;

    // 12 fl oz
    m = t.match(/(\d+(?:\.\d+)?)\s*fl\s*oz\b/);
    if (m) return Number(m[1]) * 29.5735;

    // 16 oz (assume fluid ounces)
    m = t.match(/(\d+(?:\.\d+)?)\s*oz\b/);
    if (m) return Number(m[1]) * 29.5735;

    return null;
  }

  /**
   * Generate unique ID for label validation
   */
  private generateId(): string {
    return (this.counter++).toString();
  }
}
