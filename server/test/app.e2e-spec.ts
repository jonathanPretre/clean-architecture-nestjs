import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UseCaseProxy } from '../src/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '../src/infrastructure/usecases-proxy/usecases-proxy.module';
import { LoginUseCases } from '../src/usecases/auth/login.usecases';
import { IsAuthenticatedUseCases } from '../src/usecases/auth/isAuthenticated.usecases';
import { AppModule } from '../src/app.module';

describe('infrastructure/controllers/auth', () => {
  let app: INestApplication;
  let loginUseCase: LoginUseCases;
  let isAuthenticatedUseCases: IsAuthenticatedUseCases;

  beforeAll(async () => {
    loginUseCase = {} as LoginUseCases;
    loginUseCase.getCookieWithJwtToken = jest.fn();
    loginUseCase.validateUserForLocalStragtegy = jest.fn();
    loginUseCase.getCookieWithJwtRefreshToken = jest.fn();
    const loginUsecaseProxyService: UseCaseProxy<LoginUseCases> = {
      getInstance: () => loginUseCase,
    } as UseCaseProxy<LoginUseCases>;

    isAuthenticatedUseCases = {} as IsAuthenticatedUseCases;
    isAuthenticatedUseCases.execute = jest.fn();
    const isAuthUsecaseProxyService: UseCaseProxy<IsAuthenticatedUseCases> = {
      getInstance: () => isAuthenticatedUseCases,
    } as UseCaseProxy<IsAuthenticatedUseCases>;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
      .useValue(isAuthUsecaseProxyService)
      .overrideProvider(UsecasesProxyModule.LOGIN_USECASES_PROXY)
      .useValue(loginUsecaseProxyService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET login should return 201`, async (done) => {
    const createDate = new Date().toISOString();
    const updatedDate = new Date().toISOString();
    (loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(
      Promise.resolve({
        id: 1,
        username: 'username',
        createDate: createDate,
        updatedDate: updatedDate,
        lastLogin: null,
        hashRefreshToken: null,
      }),
    );

    await request(app.getHttpServer()).post('/auth/login').send({ username: 'username', password: 'password' }).expect(201);
    done();
  });

  it(`/GET login should return 401`, async (done) => {
    (loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(Promise.resolve(null));
    (loginUseCase.getCookieWithJwtToken as jest.Mock).mockReturnValue(Promise.resolve('hello'));
    await request(app.getHttpServer()).post('/auth/login').send({ username: 'username', password: 'password' }).expect(401);
    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
