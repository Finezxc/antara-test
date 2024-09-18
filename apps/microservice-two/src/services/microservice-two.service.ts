import Redis from 'ioredis';
import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MessageStatusEnum, ClientEnum } from '@app/common';
import { OperationOutput } from '../dto/output/operation.output';
import { GetOperaionStatusOutput } from '../../../microservice-one/src/dto/output/get-operation-status.output';
import { OperationInput } from '../dto/input/async-operation.input';
import { TerminateClearOutput } from '../dto/output/terminate-clear.output';

@Injectable()
export class MicroserviceTwoService {
  constructor(@Inject(ClientEnum.REDIS_CLIENT) private readonly redisClient: Redis) {}

  public async asyncOperation({ id, data }: OperationInput): Promise<void> {
    await this.redisClient.set(id, JSON.stringify({ status: MessageStatusEnum.PROCESSING }));
    await this.simulateMessageProcessing();
    await this.redisClient.set(id, JSON.stringify({ status: MessageStatusEnum.COMPLETED, data }));
  }

  public async syncOperation({ id, data }: OperationInput): Promise<OperationOutput> {
    await this.redisClient.set(id, JSON.stringify({ status: MessageStatusEnum.PROCESSING }));
    await this.simulateMessageProcessing();
    await this.redisClient.set(id, JSON.stringify({ status: MessageStatusEnum.COMPLETED, data }));

    return {
      id,
      status: MessageStatusEnum.COMPLETED,
    };
  }

  public async clear(): Promise<TerminateClearOutput> {
    const keys = await this.redisClient.keys('*');

    if (!keys.length) {
      throw new RpcException(new NotFoundException(`There are no operations to clear`));
    }

    let operationsWithCompletedStatusExists = false;

    for (const key of keys) {
      const resultString = await this.redisClient.get(key);
      if (!resultString) {
        throw new RpcException(new NotFoundException(`Operation with ${key} not found`));
      }

      const result = JSON.parse(resultString);
      if (result.status === MessageStatusEnum.COMPLETED) {
        operationsWithCompletedStatusExists = true;
        await this.redisClient.del(key);
      }
    }

    if (!operationsWithCompletedStatusExists) {
      throw new RpcException(new NotFoundException(`There are no operations to clear with completed status`));
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'All the data with `completed` status have been cleared',
    };
  }

  public async terminate(): Promise<TerminateClearOutput> {
    const keys = await this.redisClient.keys('*');

    if (!keys.length) {
      throw new RpcException(new NotFoundException(`There are no operations to clear and terminate`));
    }

    for (const key of keys) {
      const resultString = await this.redisClient.get(key);
      if (!resultString) {
        throw new RpcException(new NotFoundException(`Operation with ${key} not found`));
      }

      await this.redisClient.del(key);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'All operations have been terminated and all data have been cleared',
    };
  }

  public async getOperationStatus(id: string): Promise<GetOperaionStatusOutput> {
    const operationString = await this.redisClient.get(id);

    if (!operationString) {
      throw new RpcException(new NotFoundException(`Operation with ${id} not found`));
    }

    const operation = JSON.parse(operationString);

    return {
      id,
      status: operation.status,
      data: operation.data,
    };
  }

  private async simulateMessageProcessing(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds delay
  }
}
