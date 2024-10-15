import { plainToClass } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Local = 'local',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  JWT_SECRET: string;
  @IsString()
  JWT_EXPIRATION_TIME: string;
  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;
  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;


  @IsString()
  DATABASE_HOST: string;
  @IsNumber()
  DATABASE_PORT: number;
  @IsString()
  DATABASE_USER: string;
  @IsString()
  DATABASE_PASSWORD: string;
  @IsString()
  DATABASE_NAME: string;
  @IsString()
  DATABASE_SCHEMA: string;
  @IsBoolean()
  DATABASE_SYNCHRONIZE: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
