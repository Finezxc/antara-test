import { randomUUID } from 'node:crypto';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MicroserviceEnum, MessageStatusEnum, PatternEnum } from '@app/common';
import { GetOperaionStatusOutput } from '../dto/output/get-operation-status.output';
import { OperationOutput } from '../dto/output/operation.output';

@Injectable()
export class MicroserviceOneService {
  constructor(@Inject(MicroserviceEnum.MICROSERVICE_TWO) private microserviceTwoClient: ClientProxy) {}

  public async getOperationStatus(id: string): Promise<GetOperaionStatusOutput> {
    try {
      return await lastValueFrom(this.microserviceTwoClient.send(PatternEnum.GET_OPERATION_STATUS, { id }));
    } catch (error) {
      throw new HttpException(error.response.message, error.response.statusCode);
    }
  }

  public asyncOperation(data: string): GetOperaionStatusOutput {
    const id = randomUUID();
    this.microserviceTwoClient.emit(PatternEnum.ASYNC_OPERATION, { id, data });

    return {
      id,
      status: MessageStatusEnum.PROCESSING,
    };
  }

  public async syncOperation(data: string): Promise<OperationOutput> {
    const id = randomUUID();

    return lastValueFrom(this.microserviceTwoClient.send(PatternEnum.SYNC_OPERATION, { id, data }));
  }

  public async clear() {
    try {
      return await lastValueFrom(this.microserviceTwoClient.send(PatternEnum.CLEAR, { data: 'clear' }));
    } catch (error) {
      throw new HttpException(error.response.message, error.response.statusCode);
    }
  }

  public async terminate() {
    try {
      return await lastValueFrom(this.microserviceTwoClient.send(PatternEnum.TERMINATE, { data: 'terminate' }));
    } catch (error) {
      throw new HttpException(error.response.message, error.response.statusCode);
    }
  }
}
