import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LabelValidationService } from './label-validation.service';
import { LabelValidationResponse, CreateLabelValidationDto } from '../types';

function filenameFactory(_req: any, file: Express.Multer.File, cb: Function) {
  const unique =
    Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname || '');
  cb(null, unique);
}

@Controller('label-validations')
export class LabelValidationController {
  constructor(private readonly labelValidationService: LabelValidationService) {}

  /**
   * Get all label validations
   */
  @Get()
  getAllLabelValidations(): LabelValidationResponse[] {
    return this.labelValidationService.getAllLabelValidations();
  }

  /**
   * Get a single label validation by ID
   */
  @Get(':id')
  getLabelValidation(@Param('id') id: string): LabelValidationResponse {
    return this.labelValidationService.getLabelValidation(id);
  }

  /**
   * Create a new label validation
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('labelImage', {
      storage: diskStorage({
        destination: 'uploads',
        filename: filenameFactory,
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async createLabelValidation(
    @Body('brandName') brandName: string,
    @Body('productClass') productClass: string,
    @Body('alcoholContent') alcoholContent: string,
    @Body('netContents') netContents?: string,
    @UploadedFile() labelImage?: Express.Multer.File,
  ): Promise<LabelValidationResponse> {
    // Validate required fields
    if (!brandName || !productClass || !alcoholContent) {
      throw new BadRequestException('brandName, productClass, and alcoholContent are required');
    }

    if (!labelImage) {
      throw new BadRequestException('labelImage file is required');
    }

    // Parse alcohol content to number
    const alcoholContentNum = parseFloat(alcoholContent);
    if (isNaN(alcoholContentNum)) {
      throw new BadRequestException('alcoholContent must be a valid number');
    }

    // Create DTO
    const dto: CreateLabelValidationDto = {
      brandName,
      productClass,
      alcoholContent: alcoholContentNum,
      netContents,
      labelImage,
    };

    return this.labelValidationService.createLabelValidation(dto);
  }
}
