import { Module } from '@nestjs/common';
import { LabelValidationController } from './label-validation.controller';
import { LabelValidationService } from './label-validation.service';
import { OcrService } from '../ocr/ocr.service';

@Module({
  controllers: [LabelValidationController],
  providers: [LabelValidationService, OcrService]
})
export class LabelValidationModule {}
