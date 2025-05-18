import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  Strategy as GoogleStrategyBase,
  Profile,
} from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GoogleStrategyBase,
  'google',
) {
  constructor() {
    super(<import('passport-google-oauth20').StrategyOptions>{
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `http://localhost:3001/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails } = profile;

    if (!emails || !emails[0]) {
      throw new UnauthorizedException('Email not found in Google profile');
    }

    return {
      email: emails[0].value,
      name: name?.givenName,
      accessToken,
    };
  }
}
