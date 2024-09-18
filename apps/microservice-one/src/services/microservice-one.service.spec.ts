import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { MicroserviceOneService } from './microservice-one.service';
import { MicroserviceEnum, MessageStatusEnum, PatternEnum } from '@app/common';
import { GetOperaionStatusOutput } from '../dto/output/get-operation-status.output';
import { OperationOutput } from '../dto/output/operation.output';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid'),
}));

describe('MicroserviceOneService', () => {
  let microserviceOneService: MicroserviceOneService;
  let microserviceTwoClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroserviceOneService,
        {
          provide: MicroserviceEnum.MICROSERVICE_TWO,
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    microserviceOneService = module.get<MicroserviceOneService>(MicroserviceOneService);
    microserviceTwoClient = module.get<ClientProxy>(MicroserviceEnum.MICROSERVICE_TWO);
  });

  describe('On getOperationStatus', () => {
    it('should return operation status from microservice', async () => {
      const expectedResponse: GetOperaionStatusOutput = {
        id: '1',
        status: MessageStatusEnum.COMPLETED,
        data: 'data',
      };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(of(expectedResponse));

      const result = await microserviceOneService.getOperationStatus('1');

      expect(microserviceTwoClient.send).toHaveBeenCalledWith(PatternEnum.GET_OPERATION_STATUS, { id: '1' });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException if microservice returns an error', async () => {
      const errorResponse = { response: { message: 'Not found', statusCode: 404 } };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(throwError(errorResponse));

      await expect(microserviceOneService.getOperationStatus('1')).rejects.toThrow(new HttpException('Not found', 404));
    });
  });

  describe('On asyncOperation', () => {
    it('should emit async operation and return processing status', () => {
      const data = 'test-data';
      const expectedResponse: GetOperaionStatusOutput = {
        id: 'test-uuid',
        status: MessageStatusEnum.PROCESSING,
      };

      const result = microserviceOneService.asyncOperation(data);

      expect(microserviceTwoClient.emit).toHaveBeenCalledWith(PatternEnum.ASYNC_OPERATION, {
        id: 'test-uuid',
        data,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('On syncOperation', () => {
    it('should return sync operation output from microservice', async () => {
      const expectedResponse: OperationOutput = {
        id: 'test-uuid',
        status: MessageStatusEnum.COMPLETED,
      };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(of(expectedResponse));

      const result = await microserviceOneService.syncOperation('test-data');

      expect(microserviceTwoClient.send).toHaveBeenCalledWith(PatternEnum.SYNC_OPERATION, {
        id: 'test-uuid',
        data: 'test-data',
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('On clear', () => {
    it('should return clear response from microservice', async () => {
      const expectedResponse = { status: 'cleared' };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(of(expectedResponse));

      const result = await microserviceOneService.clear();

      expect(microserviceTwoClient.send).toHaveBeenCalledWith(PatternEnum.CLEAR, { data: 'clear' });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException if microservice returns an error', async () => {
      const errorResponse = { response: { message: 'Error clearing', statusCode: 500 } };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(throwError(errorResponse));

      await expect(microserviceOneService.clear()).rejects.toThrow(new HttpException('Error clearing', 500));
    });
  });

  describe('On terminate', () => {
    it('should return terminate response from microservice', async () => {
      const expectedResponse = { status: 'terminated' };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(of(expectedResponse));

      const result = await microserviceOneService.terminate();

      expect(microserviceTwoClient.send).toHaveBeenCalledWith(PatternEnum.TERMINATE, { data: 'terminate' });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException if microservice returns an error', async () => {
      const errorResponse = { response: { message: 'Error terminating', statusCode: 500 } };

      jest.spyOn(microserviceTwoClient, 'send').mockReturnValue(throwError(errorResponse));

      await expect(microserviceOneService.terminate()).rejects.toThrow(new HttpException('Error terminating', 500));
    });
  });
});
