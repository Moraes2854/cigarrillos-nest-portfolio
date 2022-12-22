import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Repository } from 'typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,
        private readonly configService:ConfigService,
    ){
        super({
            secretOrKey:configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }


    async validate( payload:JwtPayload ):Promise<User>{
        
        const { id } = payload;
        
        if (!id) throw new UnauthorizedException('Token not valid');  

        const user = await this.userRepository.findOneByOrFail({id});

        if (!user) throw new UnauthorizedException('Token not valid');

        if (!user.isActive) throw new UnauthorizedException('User is inactive, talk with and administrator');

        
        return user;
    }


}