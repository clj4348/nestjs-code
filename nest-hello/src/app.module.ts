import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RunningModule } from './running/running.module';
import { ConfigModule } from '@nestjs/config';
import Configuration from './configuration';
// 日志
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import logger from './log/logger.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import UnifyExceptionFilter from './log/http-exception.filter';
import { UnifyResponseInterceptor } from './log/unify-response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

const winstonLoger = (level: 'info' | 'log' | 'error' | 'warn') => {
  return {
    dirname: `logs`, // 日志保存的目录
    level: level,
    filename: `${level || 'log'}-%DATE%.log`, // 日志名称，占位符 %DATE% 取值为 datePattern 值。
    datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
    zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
    maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
    maxFiles: '14d', // 保留日志文件的最大天数，此处表示自动删除超过 14 天的日志文件。
    // 记录时添加时间戳信息
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.json(),
    ),
  };
};
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),

    UserModule,
    RunningModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.DailyRotateFile(winstonLoger('log')),
        new winston.transports.DailyRotateFile(winstonLoger('info')),
        new winston.transports.DailyRotateFile(winstonLoger('error')),
        new winston.transports.DailyRotateFile(winstonLoger('warn')),
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const db = configService.get('db');
        return {
          type: db.type,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          autoLoadEntities: true, // 告诉TypeORM自动加载所有找到的实体
          synchronize: true, // 开启自动同步，生产环境应该关闭
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: UnifyExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UnifyResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  // 应用全局中间件
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
