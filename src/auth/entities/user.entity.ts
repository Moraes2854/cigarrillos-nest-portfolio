import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import  * as bcrypt from 'bcrypt';
import { ValidRoles } from "../interfaces";


@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{
        unique:true,
    })
    email:string;

    @Column('text',{
        select:false,
    })
    password:string;

    @Column('text')
    fullName:string;

    @Column('bool',{
        default:true,
    })
    isActive:boolean;

    @Column('text',{
        array:true,
        default:['user']
    })
    roles:ValidRoles[];

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase();
        // this.password = bcrypt.
        this.password = bcrypt.hashSync(this.password, 10)
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.email = this.email.toLowerCase();
    }
    
}