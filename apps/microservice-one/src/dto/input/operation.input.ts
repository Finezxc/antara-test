import { ApiProperty } from '@nestjs/swagger';

export class OperationInput {
  @ApiProperty({
    description: 'Data of the operation',
    type: String,
  })
  data: string;
}
