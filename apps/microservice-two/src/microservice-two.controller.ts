import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PatternEnum } from '@app/common';
import { MicroserviceTwoService } from './services/microservice-two.service';
import { OperationInput } from './dto/input/async-operation.input';
import { GetOperaionStatusOutput } from '../../microservice-one/src/dto/output/get-operation-status.output';

@Controller()
export class MicroserviceTwoController {
  constructor(private readonly microserviceTwoService: MicroserviceTwoService) {}

  @EventPattern(PatternEnum.ASYNC_OPERATION)
  public async handleAsyncOperation(@Payload() payload: OperationInput): Promise<void> {
    this.microserviceTwoService.asyncOperation(payload);
  }

  @MessagePattern(PatternEnum.SYNC_OPERATION)
  public async handleSyncOperation(@Payload() payload: OperationInput): Promise<GetOperaionStatusOutput> {
    return this.microserviceTwoService.syncOperation(payload);
  }

  @MessagePattern(PatternEnum.GET_OPERATION_STATUS)
  public async handleGetOperationStatus(@Payload() { id }: { id: string }): Promise<GetOperaionStatusOutput> {
    return this.microserviceTwoService.getOperationStatus(id);
  }

  @MessagePattern(PatternEnum.CLEAR)
  public async handleClear() {
    return this.microserviceTwoService.clear();
  }

  @MessagePattern(PatternEnum.TERMINATE)
  public async handleTerminate() {
    return this.microserviceTwoService.terminate();
  }
}
