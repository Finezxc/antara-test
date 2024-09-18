import { NestFactory } from '@nestjs/core';
import { RedisOptions } from '@nestjs/microservices';
import { MicroserviceTwoModule } from './microservice-two.module';
import { RedisService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(MicroserviceTwoModule);
  const redisService = app.get<RedisService>(RedisService);

  app.connectMicroservice<RedisOptions>(redisService.getOptions(), { inheritAppConfig: true });
  await app.startAllMicroservices();
}

void bootstrap();
