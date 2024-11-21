import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RunningService } from './running.service';

@Controller('running')
export class RunningController {
  constructor(private readonly runningService: RunningService) {}
  @Post()
  create(@Body() data: { id: number }) {
    const id = data.id;
    if (typeof id !== 'number') {
      throw new HttpException('id必须为number类型', HttpStatus.BAD_REQUEST);
    }
    return this.runningService.find(id);
  }
}
