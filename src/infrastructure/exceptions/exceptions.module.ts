import { Module } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';

@Module({
  providers: [ExceptionsService],
  exports: [ExceptionsService],
})
export class ExceptionsModule {}
