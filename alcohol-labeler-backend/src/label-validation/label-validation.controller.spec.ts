import { Test, TestingModule } from '@nestjs/testing';
import { LabelValidationController } from './label-validation.controller';

describe('LabelValidationController', () => {
  let controller: LabelValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelValidationController],
    }).compile();

    controller = module.get<LabelValidationController>(LabelValidationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
