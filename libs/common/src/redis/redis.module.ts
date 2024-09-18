import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EnvVariablesEnum } from '../env/enums/env-variables.enum';
import { EnvVariablesType } from '../env/types/env-variables.type';
import { RedisService } from './services/redis.service';
import { MicroserviceEnum } from './enums/microservice.enum';

@Module({
  providers: [RedisService, ConfigService],
  exports: [RedisService],
})
export class RedisModule {
  static register(name: MicroserviceEnum): DynamicModule {
    return {
      module: RedisModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService<EnvVariablesType, true>) => ({
              transport: Transport.REDIS,
              options: {
                host: configService.get<string>(EnvVariablesEnum.REDIS_HOST),
                port: parseInt(configService.get<number>(EnvVariablesEnum.REDIS_PORT, { infer: true })),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
