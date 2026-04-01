import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const publicKey = configService.get<string>('app.jwtPublicKey')
      || process.env.JWT_PUBLIC_KEY
      || '';

    // Convert literal \n back to real newlines if needed
    const formattedKey = publicKey.includes('\\n')
      ? publicKey.replace(/\\n/g, '\n')
      : publicKey;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: formattedKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: { sub: string; role: string; email: string }) {
    return { userId: payload.sub, role: payload.role, email: payload.email };
  }
}
