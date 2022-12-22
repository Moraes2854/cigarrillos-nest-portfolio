import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidRoles } from './interfaces';


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,

        private readonly jwtService:JwtService
    ){}

    
    async createUser(createUserDto: CreateUserDto, roles?:ValidRoles[]){
        
        try {

            const user = this.userRepository.create({
                ...createUserDto,
                roles
            });

            await this.userRepository.save( user );

            delete user.password;

            return {
                ...user,
                token:this.getJwtToken({id:user.id})
            };

        } catch (error) {
            this.handleDBErrors(error);
        }

        
    }

    async loginUser(loginUserDto: LoginUserDto){
      
            const { password, email } = loginUserDto;

            const user = await this.userRepository.findOne({
                where:{
                    email
                },
                select:{email:true, fullName:true, id:true, isActive:true, password:true, roles:true}
            });

            if (!user) throw new UnauthorizedException('Creadential are not valid (email)');

            if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Creadential are not valid (password)');
            
    
            return {
                ...user,
                token:this.getJwtToken({id:user.id})
            };

    }

    async checkAuthStatus(user:User){
        return {
            ...user,
            token:this.getJwtToken({id:user.id})
        };
    }

    async makeAdminUser(user:User){
        await this.userRepository.update(user.id, {
            ...user,
            roles:['user', 'super-user', 'admin']
        });
    
      
        return await this.userRepository.findOneBy({id:user.id});
    }

    private getJwtToken(payload:JwtPayload){
        const token = this.jwtService.sign(payload);
        return token;
    }

    private handleDBErrors(error): never{
        console.log(error);

        if (error.code === '23505') throw new BadRequestException(error.detail);

        throw new InternalServerErrorException('Please check server logs');
    }

}
