import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LabelValidationModule } from './label-validation/label-validation.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({
    isGlobal: true
  }), LabelValidationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
