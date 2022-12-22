import { CreateVentaDto } from '../../ventas/dto/create-venta.dto';
import { CreateCompraDto } from '../../compras/dto/create-compra.dto';

export const sumarRepetidos = (array:CreateVentaDto[]|CreateCompraDto[]) => {

    const arrayFinal:CreateVentaDto[]|CreateCompraDto[] = [];
    
     

    for (let i = 0; i<array.length; i++){
        
        if (!arrayFinal.find((item)=>item.cigarrilloId === array[i].cigarrilloId)){
            const amount = array.filter((item)=>item.cigarrilloId === array[i].cigarrilloId).reduce((acc, obj) => {return acc+obj.amount}, 0)
            arrayFinal.push({
                ...array[i],
                amount
            });
        }

    }

    return arrayFinal;
}