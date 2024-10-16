import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { UseCaseProxy } from '../src/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '../src/infrastructure/usecases-proxy/usecases-proxy.module';
import { LoginUseCases } from '../src/usecases/auth/login.usecases';
import { IsAuthenticatedUseCases } from '../src/usecases/auth/isAuthenticated.usecases';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/infrastructure/common/guards/jwtAuth.guard';
import JwtRefreshGuard from '../src/infrastructure/common/guards/jwtRefresh.guard';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('infrastructure/controllers/auth', () => {
  let app: NestFastifyApplication;
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
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          req.user = { username: 'username' };
          return req.cookies.accessToken === '123456';
        },
      })
      .overrideGuard(JwtRefreshGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          req.user = { username: 'username' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(fastifyCookie);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`/POST login should return 201`, async () => {
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
    (loginUseCase.getCookieWithJwtToken as jest.Mock).mockReturnValue(Promise.resolve({ token: '123456', maxAge: '1800' }));
    (loginUseCase.getCookieWithJwtRefreshToken as jest.Mock).mockReturnValue(
      Promise.resolve({ token: '12345', maxAge: '86400' }),
    );

    await app
      .inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'username', password: 'password' },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.headers['set-cookie']).toEqual([
          `accessToken=123456; Max-Age=1800; Path=/; HttpOnly; Secure`,
          `refreshToken=12345; Max-Age=86400; Path=/; HttpOnly; Secure`,
        ]);
      });
  });

  it(`/POST logout should return 201`, async () => {
    app
      .inject({
        method: 'POST',
        cookies: { accessToken: '123456' },
        url: '/auth/logout',
        payload: { username: 'username', password: 'password' },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        expect(result.headers['set-cookie']).toEqual([
          'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ]);
      });
  });

  it(`/POST login should return 401`, async () => {
    (loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(Promise.resolve(null));

    await app
      .inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'username', password: 'password' },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(401);
      });
  });

  it(`/POST Refresh token should return 201`, async () => {
    (loginUseCase.getCookieWithJwtToken as jest.Mock).mockReturnValue({
      token: '123456',
      maxAge: process.env.JWT_EXPIRATION_TIME,
    });

    app
      .inject({
        method: 'GET',
        url: '/auth/refresh',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.headers['set-cookie']).toEqual('accessToken=123456; Max-Age=1800; Path=/; HttpOnly; Secure');
      });
  });

  it(`/GET is_authenticated should return 200`, async () => {
    (isAuthenticatedUseCases.execute as jest.Mock).mockReturnValue(Promise.resolve({ username: 'username' }));

    app
      .inject({
        method: 'GET',
        url: '/auth/is_authenticated',
        cookies: { accessToken: '123456' },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
      });
  });

  it(`/GET is_authenticated should return 403`, async () => {
    (isAuthenticatedUseCases.execute as jest.Mock).mockReturnValue(Promise.resolve({ username: 'username' }));

    app
      .inject({
        method: 'GET',
        url: '/auth/is_authenticated',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(403);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
