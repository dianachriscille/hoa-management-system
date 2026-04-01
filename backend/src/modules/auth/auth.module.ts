import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResidentModule } from '../resident/resident.module';
import { NotificationModule } from '../notification/notification.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKey = (config.get<string>('app.jwtPrivateKey') || process.env.JWT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const publicKey = (config.get<string>('app.jwtPublicKey') || process.env.JWT_PUBLIC_KEY || '').replace(/\\n/g, '\n');
        return {
          privateKey,
          publicKey,
          signOptions: { algorithm: 'RS256', expiresIn: '15m' },
        };
      },
    }),
    ResidentModule,
    NotificationModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
