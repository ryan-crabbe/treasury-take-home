import { Module } from '@nestjs/common';
import { LabelValidationController } from './label-validation.controller';
import { LabelValidationService } from './label-validation.service';

@Module({
  controllers: [LabelValidationController],
  providers: [LabelValidationService]
})
export class LabelValidationModule {}
