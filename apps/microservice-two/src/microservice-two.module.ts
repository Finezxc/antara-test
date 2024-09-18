import Redis from 'ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvVariablesType, EnvVariablesEnum, RedisModule, ClientEnum } from '@app/common';
import { MicroserviceTwoController } from './microservice-two.controller';
import { MicroserviceTwoService } from './services/microservice-two.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/microservice-two/.env',
    }),
    RedisModule,
  ],
  controllers: [MicroserviceTwoController],
  providers: [
    MicroserviceTwoService,
    {
      provide: ClientEnum.REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvVariablesType, true>) => {
        return new Redis({
          host: configService.get<string>(EnvVariablesEnum.REDIS_HOST),
          port: parseInt(configService.get<number>(EnvVariablesEnum.REDIS_PORT, { infer: true })),
        });
      },
    },
  ],
})
export class MicroserviceTwoModule {}
