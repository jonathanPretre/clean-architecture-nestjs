import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UsecasesProxyModule } from '../../usecases-proxy/usecases-proxy.module';
import { UseCaseProxy } from '../../usecases-proxy/usecases-proxy';
import { LoginUseCases } from '../../../usecases/auth/login.usecases';
import { LoggerService } from '../../logger/logger.service';
import { ExceptionsService } from '../../exceptions/exceptions.service';
import { TokenPayload } from '../../../domain/model/auth';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    private readonly logger: LoggerService,
    private readonly exceptionService: ExceptionsService,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    if (!username || !password) {
      this.logger.warn('LocalStrategy', `Username or password is missing, BadRequestException`);
      this.exceptionService.UnauthorizedException();
    }
    const user = await this.loginUsecaseProxy.getInstance().validateUserForLocalStragtegy(username, password);
    if (!user) {
      this.logger.warn('LocalStrategy', `Invalid username or password`);
      this.exceptionService.UnauthorizedException({ message: 'Invalid username or password.' });
    }
    return user;
  }
}
