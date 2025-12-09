import { Injectable, NotFoundException } from '@nestjs/common';
import { 
  LabelValidationResponse, 
  CreateLabelValidationDto, 
  VALIDATION_STATUS,
  ValidationStatusType,
  ExtractedLabelData,
  AlcoholLabelFormData,
  ValidationIssues
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
      // Simulate processing delay
      await this.delay(2000);

      // Extract text from image using OCR service
      const extractedData = await this.ocrService.extractTextFromImage(imageFile);

      // Compare extracted data with form data
      const validation = this.validationsCache.get(id);
      if (!validation) return;

      const comparisonResult = await this.compareExtractedWithFormData(extractedData, validation.formData);

      // Update validation with results
      const updatedValidation: LabelValidationResponse = {
        ...validation,
        status: VALIDATION_STATUS.COMPLETED,
        success: comparisonResult.success,
        extracted: extractedData,
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
   * Compare extracted OCR data with form data
   */
  private async compareExtractedWithFormData(
    extracted: ExtractedLabelData, 
    formData: AlcoholLabelFormData
  ): Promise<{ success: boolean; issues?: ValidationIssues }> {
    // Simulate comparison processing delay
    await this.delay(500);

    const issues: ValidationIssues = {};

    // brandName (soft fuzzy match)
    if (formData.brandName) {
      if (!extracted.brandName) {
        issues.brandName = 'Brand name not detected on label';
      } else if (!this.similarText(extracted.brandName, formData.brandName)) {
        issues.brandName = 'Brand name does not match';
      }
    }

    // productClass (contains match)
    if (formData.productClass) {
      if (!extracted.productClass) {
        issues.productClass = 'Product class not detected';
      } else if (!this.containsText(extracted.productClass, formData.productClass)) {
        issues.productClass = 'Product class does not match';
      }
    }

    // alcoholContent (±0.5 tolerance for MVP)
    if (typeof formData.alcoholContent === 'number') {
      if (typeof extracted.alcoholContent !== 'number') {
        issues.alcoholContent = 'Alcohol content not detected';
      } else if (Math.abs(extracted.alcoholContent - formData.alcoholContent) > 0.5) {
        issues.alcoholContent = 'Alcohol content mismatch (allowed ±0.5)';
      }
    }

    // netContents (normalize to ml and compare)
    if (formData.netContents) {
      const formMl = this.toMl(formData.netContents);
      const extMl = extracted.netContents ? this.toMl(extracted.netContents) : null;

      if (formMl == null) {
        // Can't parse form; skip strict check (MVP)
      } else if (extMl == null) {
        issues.netContents = 'Net contents not detected';
      } else if (Math.abs(extMl - formMl) > 1) {
        issues.netContents = 'Net contents do not match';
      }
    }

    const success = Object.keys(issues).length === 0;
    return { success, issues: success ? undefined : issues };
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

  /**
   * Utility function to simulate async delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
