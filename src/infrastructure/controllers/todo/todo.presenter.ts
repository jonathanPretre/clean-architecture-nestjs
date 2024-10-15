import { ApiProperty } from '@nestjs/swagger';
import { TodoM } from '../../../domain/model/todo';

export class TodoPresenter {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
  @ApiProperty()
  isDone: boolean;
  @ApiProperty()
  createdate: Date;
  @ApiProperty()
  updateddate: Date;

  constructor(todo: TodoM) {
    this.id = todo.id;
    this.content = todo.content;
    this.isDone = todo.isDone;
    this.createdate = todo.createdDate;
    this.updateddate = todo.updatedDate;
  }
}
