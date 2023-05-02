import { CacheModule, Module } from '@nestjs/common';
import { AdminsController } from './controllers/admins/admins.controller';
import { AdminsService } from './services/admins/admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/typeorm/entities/admin';
import { AdminJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MailService } from 'src/middleware/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    CacheModule.register(), // add CacheModule here
    PassportModule,
    JwtModule.registerAsync({
      imports :[ConfigModule],
      useFactory :async () => ({
        secret : process.env.JWT_SECRET
        ,signOptions: { expiresIn: '1d' },
  
      }),
      inject : [ConfigService]
    })
    ],
  controllers: [AdminsController],
  providers: [AdminsService,AdminJwtStrategy,MailService]
})
export class AdminsModule {}
