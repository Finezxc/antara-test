import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetOperaionStatusOutput } from './dto/output/get-operation-status.output';
import { OperationInput } from './dto/input/operation.input';
import { TerminateClearOutput } from './dto/output/terminate-clear.output';
import { MicroserviceOneService } from './services/microservice-one.service';
import { OperationOutput } from './dto/output/operation.output';

@ApiTags('operations')
@Controller()
export class MicroserviceOneController {
  constructor(private readonly microserviceOneService: MicroserviceOneService) {}

  @Post('async')
  @ApiBody({ type: OperationInput })
  @ApiOperation({
    summary: 'Async operation with immediate response',
  })
  @ApiOkResponse({
    type: GetOperaionStatusOutput,
    description: 'The result of the operation with the `id`, `data` and `status`',
  })
  public async asyncOperation(@Body() operationInput: OperationInput): Promise<GetOperaionStatusOutput> {
    return this.microserviceOneService.asyncOperation(operationInput.data);
  }

  @Post('sync')
  @ApiBody({ type: OperationInput })
  @ApiOperation({
    summary: 'Sync operation that waits for a response',
  })
  @ApiOkResponse({
    type: GetOperaionStatusOutput,
    description: 'The result of the operation with the `id`, `data` and `status`',
  })
  public async syncOperation(@Body() operationInput: OperationInput): Promise<OperationOutput> {
    return this.microserviceOneService.syncOperation(operationInput.data);
  }

  @Get('status/:id')
  @ApiParam({
    description: 'ID of the operation',
    name: 'id',
    required: true,
  })
  @ApiOperation({
    summary: 'Get status of the operation by `ID`',
  })
  @ApiOkResponse({
    type: GetOperaionStatusOutput,
    description: 'The result of the operation with the `id`, `data` and `status`',
  })
  public async getOperationStatus(@Param('id') id: string): Promise<GetOperaionStatusOutput> {
    return this.microserviceOneService.getOperationStatus(id);
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Remove all stored data/statuses (does not clear operations `in process`)',
  })
  @ApiOkResponse({
    type: GetOperaionStatusOutput,
    description: 'The result of the operation with the `message` and `statusCode`',
  })
  public async clear(): Promise<TerminateClearOutput> {
    return this.microserviceOneService.clear();
  }

  @Delete('terminate')
  @ApiOperation({
    summary: 'Stop all operations and clear their data',
  })
  @ApiOkResponse({
    type: GetOperaionStatusOutput,
    description: 'The result of the operation with the `message` and `statusCode`',
  })
  public async terminate(): Promise<TerminateClearOutput> {
    return this.microserviceOneService.terminate();
  }
}
