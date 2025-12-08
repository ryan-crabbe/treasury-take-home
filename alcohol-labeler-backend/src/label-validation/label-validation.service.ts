import { Injectable, NotFoundException } from '@nestjs/common';
import { 
  LabelValidationResponse, 
  CreateLabelValidationDto, 
  VALIDATION_STATUS,
  ValidationStatusType,
  ExtractedLabelData,
  AlcoholLabelFormData 
} from '../types';

@Injectable()
export class LabelValidationService {
  // In-memory cache - key: id, value: LabelValidationResponse
  private readonly validationsCache = new Map<string, LabelValidationResponse>();
  private counter = 1;


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
      labelImage: null // We don't store the actual file in memory for this MVP
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
   * Process the label validation asynchronously (placeholder implementation)
   */
  private async processLabelValidation(id: string, imageFile: Express.Multer.File): Promise<void> {
    try {
      // Simulate processing delay
      await this.delay(2000);

      // Extract text from image (placeholder)
      const extractedData = await this.extractTextFromImage(imageFile);

      // Compare extracted data with form data (placeholder)
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
   * Placeholder: Extract text from uploaded image
   */
  private async extractTextFromImage(imageFile: Express.Multer.File): Promise<ExtractedLabelData> {
    // Simulate OCR processing delay
    await this.delay(1000);

    // Return mock extracted data for now
    return {
      brandName: 'Mock Brand Name',
      productClass: 'Mock Product Class', 
      alcoholContent: 12.5,
      netContents: '750ml'
    };
  }

  /**
   * Placeholder: Compare extracted data with form data
   */
  private async compareExtractedWithFormData(
    extracted: ExtractedLabelData, 
    formData: AlcoholLabelFormData
  ): Promise<{ success: boolean; issues?: any }> {
    // Simulate comparison processing
    await this.delay(500);

    // Mock comparison logic - for now always return success
    return {
      success: true,
      issues: undefined
    };
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
