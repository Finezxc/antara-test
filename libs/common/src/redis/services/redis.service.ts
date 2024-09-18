import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { EnvVariablesType } from '../../env/types/env-variables.type';
import { EnvVariablesEnum } from '../../env/enums/env-variables.enum';

@Injectable()
export class RedisService {
  constructor(private readonly configService: ConfigService<EnvVariablesType, true>) {}

  public getOptions(): RedisOptions {
    const host = this.configService.get<string>(EnvVariablesEnum.REDIS_HOST);
    const port = parseInt(
      this.configService.get<number>(EnvVariablesEnum.REDIS_PORT, {
        infer: true,
      }),
    );

    return {
      transport: Transport.REDIS,
      options: {
        host,
        port,
      },
    };
  }
}
