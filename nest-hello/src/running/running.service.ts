import { Injectable } from '@nestjs/common';

@Injectable()
export class RunningService {
  find(id: number) {
    const list = [];
    for (let i = 0; i < id; i++) {
      list.push(i + 1);
    }
    return {
      code: 0,
      data: {
        list,
      },
    };
  }
}
