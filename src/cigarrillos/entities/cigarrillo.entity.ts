import { BeforeInsert, Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";
import { Compra } from '../../compras/entities/compra.entity';
import { Venta } from "../../ventas/entities/venta.entity";

@Entity('cigarrillos')
export class Cigarrillo{
    @PrimaryColumn('uuid', {primary:true})
    @Generated('uuid')
    id:string;

    @Column("text", { unique:true })
    name:string;

    @Column({
        type:'int',
        default:0
    })
    stock:number;

    @Column({
        type:'int'
    })
    buy_price:number;

    @Column({
        type:'int'
    })
    sell_price:number;

    @Column({
        type:'boolean',
        default:true
    })
    isActive:boolean;

    @OneToMany(
        ()=>Compra,
        (compra) => compra.cigarrillo,
    )
    compra:Compra;

    @OneToMany(
        ()=>Venta,
        (venta) => venta.cigarrillo,
    )
    venta:Venta;

    @BeforeInsert()
    beforeInsert(){
        this.name=this.name.toUpperCase();
    }
}
