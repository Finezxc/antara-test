import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import Redis from 'ioredis';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { MessageStatusEnum, ClientEnum } from '@app/common';
import { MicroserviceTwoService } from './microservice-two.service';
import { OperationOutput } from '../dto/output/operation.output';
import { TerminateClearOutput } from '../dto/output/terminate-clear.output';
import { GetOperaionStatusOutput } from '../../../microservice-one/src/dto/output/get-operation-status.output';

describe('MicroserviceTwoService', () => {
  let microserviceTwoService: MicroserviceTwoService;
  let redisClient: Redis;

  jest.mock('ioredis');
  const redis = new Redis();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroserviceTwoService,
        {
          provide: ClientEnum.REDIS_CLIENT,
          useValue: redis,
        },
      ],
    }).compile();

    microserviceTwoService = module.get<MicroserviceTwoService>(MicroserviceTwoService);
    redisClient = module.get<Redis>(ClientEnum.REDIS_CLIENT);
  });

  afterAll(async () => {
    await redis.quit();
  });

  describe('On asyncOperation', () => {
    it('should process async operation and set the status to completed', async () => {
      const id = '1';
      const data = 'data';
      const redisSetSpy = jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      microserviceTwoService['simulateMessageProcessing'] = jest.fn().mockResolvedValue(undefined);

      await microserviceTwoService.asyncOperation({ id, data });

      expect(redisSetSpy).toHaveBeenCalledWith(id, JSON.stringify({ status: MessageStatusEnum.PROCESSING }));
      expect(redisSetSpy).toHaveBeenCalledWith(id, JSON.stringify({ status: MessageStatusEnum.COMPLETED, data }));
    });
  });

  describe('On syncOperation', () => {
    it('should return SyncOperationOutput with completed status', async () => {
      const id = '1';
      const data = 'data';
      const redisSetSpy = jest.spyOn(redisClient, 'set').mockResolvedValue('OK');

      microserviceTwoService['simulateMessageProcessing'] = jest.fn().mockResolvedValue(undefined);

      const result: OperationOutput = await microserviceTwoService.syncOperation({ id, data });

      expect(redisSetSpy).toHaveBeenCalledWith(id, JSON.stringify({ status: MessageStatusEnum.PROCESSING }));
      expect(redisSetSpy).toHaveBeenCalledWith(id, JSON.stringify({ status: MessageStatusEnum.COMPLETED, data }));
      expect(result).toEqual({ id, status: MessageStatusEnum.COMPLETED });
    });
  });

  describe('On clear', () => {
    it('should throw NotFoundException if no operations are found', async () => {
      jest.spyOn(redisClient, 'keys').mockResolvedValue([]);

      await expect(microserviceTwoService.clear()).rejects.toThrow(
        new RpcException(new NotFoundException('There are no operations to clear')),
      );
    });

    it('should throw NotFoundException if no completed operations are found', async () => {
      jest.spyOn(redisClient, 'keys').mockResolvedValue(['1']);
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify({ status: MessageStatusEnum.PROCESSING }));

      await expect(microserviceTwoService.clear()).rejects.toThrow(
        new RpcException(new NotFoundException('There are no operations to clear with completed status')),
      );
    });

    it('should clear completed operations', async () => {
      jest.spyOn(redisClient, 'keys').mockResolvedValue(['1']);
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify({ status: MessageStatusEnum.COMPLETED }));
      const redisDelSpy = jest.spyOn(redisClient, 'del').mockResolvedValue(1);

      const result: TerminateClearOutput = await microserviceTwoService.clear();

      expect(redisDelSpy).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'All the data with `completed` status have been cleared',
      });
    });
  });

  describe('On terminate', () => {
    it('should throw NotFoundException if no operations are found', async () => {
      jest.spyOn(redisClient, 'keys').mockResolvedValue([]);

      await expect(microserviceTwoService.terminate()).rejects.toThrow(
        new RpcException(new NotFoundException('There are no operations to clear and terminate')),
      );
    });

    it('should terminate all operations and clear all data', async () => {
      jest.spyOn(redisClient, 'keys').mockResolvedValue(['1']);
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify({ status: MessageStatusEnum.COMPLETED }));
      const redisDelSpy = jest.spyOn(redisClient, 'del').mockResolvedValue(1);

      const result: TerminateClearOutput = await microserviceTwoService.terminate();

      expect(redisDelSpy).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'All operations have been terminated and all data have been cleared',
      });
    });
  });

  describe('On getOperationStatus', () => {
    it('should throw NotFoundException if operation is not found', async () => {
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      await expect(microserviceTwoService.getOperationStatus('1')).rejects.toThrow(
        new RpcException(new NotFoundException('Operation with 1 not found')),
      );
    });

    it('should return the operation status', async () => {
      const id = '1';
      const operationData = { status: MessageStatusEnum.COMPLETED, data: { field: 'value' } };
      jest.spyOn(redisClient, 'get').mockResolvedValue(JSON.stringify(operationData));

      const result: GetOperaionStatusOutput = await microserviceTwoService.getOperationStatus(id);

      expect(result).toEqual({
        id,
        status: MessageStatusEnum.COMPLETED,
        data: operationData.data,
      });
    });
  });
});
