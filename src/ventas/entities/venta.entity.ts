import { BeforeInsert, Column, Entity, Generated, ManyToOne, PrimaryColumn } from "typeorm";

import { Cigarrillo } from "../../cigarrillos/entities/cigarrillo.entity";

@Entity('ventas')
export class Venta {

    @PrimaryColumn('uuid', {primary:true})
    @Generated('uuid')
    id:string;

    @Column({
        type:'int'
    })
    amount:number;

    @Column({
        type:'int'
    })
    buy_price:number;

    @Column({
        type:'int'
    })
    sell_price:number;

    @Column({
        type:'timestamp',
    })
    date:Date;

    @ManyToOne(
        ()=>Cigarrillo,
        (c)=>c.venta,
    )
    cigarrillo:Cigarrillo
    
    @BeforeInsert()
    beforeInsert(){
        this.date = new Date(this.date.setHours(0, 0, 0 ,0));
    }
}
