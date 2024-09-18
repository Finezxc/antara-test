import { NestFactory } from '@nestjs/core';
import { RedisOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService, EnvVariablesEnum, EnvVariablesType } from '@app/common';
import { MicroserviceOneModule } from './microservice-one.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(MicroserviceOneModule);
  const configService = app.get(ConfigService<EnvVariablesType, true>);
  const redisService = app.get<RedisService>(RedisService);

  const config = new DocumentBuilder()
    .setTitle('Antara test task')
    .setDescription('Two microservices with async and sync operations')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.connectMicroservice<RedisOptions>(redisService.getOptions(), { inheritAppConfig: true });
  await app.startAllMicroservices();
  await app.listen(configService.get<string>(EnvVariablesEnum.APP_PORT));
}

void bootstrap();
