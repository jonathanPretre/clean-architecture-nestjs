import { ILogger } from '../../domain/logger/logger.interface';
import { TodoM } from '../../domain/model/todo';
import { TodoRepository } from '../../domain/repositories/todoRepository.interface';

export class addTodoUseCases {
  constructor(private readonly logger: ILogger, private readonly todoRepository: TodoRepository) {}

  async execute(content: string): Promise<TodoM> {
    const todo = new TodoM();
    todo.content = content;
    todo.isDone = false;
    const result = await this.todoRepository.insert(todo);
    this.logger.log('addTodoUseCases execute', 'New todo have been inserted');
    return result;
  }
}
