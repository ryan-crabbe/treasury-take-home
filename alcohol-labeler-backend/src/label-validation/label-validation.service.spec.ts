import { Test, TestingModule } from '@nestjs/testing';
import { LabelValidationService } from './label-validation.service';

describe('LabelValidationService', () => {
  let service: LabelValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelValidationService],
    }).compile();

    service = module.get<LabelValidationService>(LabelValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
