import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, MicroserviceEnum } from '@app/common';
import { MicroserviceOneController } from './microservice-one.controller';
import { MicroserviceOneService } from './services/microservice-one.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/microservice-one/.env',
    }),
    RedisModule.register(MicroserviceEnum.MICROSERVICE_TWO),
  ],
  controllers: [MicroserviceOneController],
  providers: [MicroserviceOneService, ConfigService],
})
export class MicroserviceOneModule {}
