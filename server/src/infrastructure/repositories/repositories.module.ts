import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigModule } from '../config/typeorm/typeorm.module';
import { Todo } from '../entities/todo.entity';
import { DatabaseTodoRepository } from './todo.repository';

@Module({
  imports: [TypeOrmConfigModule, TypeOrmModule.forFeature([Todo])],
  providers: [DatabaseTodoRepository],
  exports: [DatabaseTodoRepository],
})
export class RepositoriesModule {}
