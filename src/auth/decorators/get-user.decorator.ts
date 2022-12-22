import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

type ValidFields = 'id'|'email'|'password'|'fullName'|'isActive'|'roles';

export const GetUser = createParamDecorator(
    (data:ValidFields, ctx:ExecutionContext)=>{

        const req = ctx.switchToHttp().getRequest();

        const user = req.user;

        if (!user) throw new InternalServerErrorException('User not found (request)');

        return (data) ? user[data] : user;
    }
);