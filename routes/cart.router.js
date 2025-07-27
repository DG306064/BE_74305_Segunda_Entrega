import { Router } from "express";
import path from 'path';
import CartsManager from '../services/cartsManager.js'
import ProductsManager from '../services/productsManager.js'

const router = Router();

router.get('/', (req, res) => {
    res.render('cart', {title: 'Carrito'})
})

//Carts management routes

router.get('/:cid', async (req, res) =>{
    const cid = parseInt(req.params.cid)
    const cart = await CartsManager.getCartById(cid)
    res.status(200).json(cart)
})

router.post('/', async (req, res) =>{
    
    const cartProducts = req.body.products
    console.log(cartProducts)

    if(Array.isArray(cartProducts) && cartProducts.length > 0){
        const products = await ProductsManager.getProducts()
        cartProducts.forEach(cartProduct => {
            console.log(cartProduct)
            
            if(typeof cartProduct.id !== 'number' || typeof cartProduct.quantity !== 'number'){
                return res.status(404).json('El id y la cantidad de cada productos deben ser un numero')
            }

            if(!products.some(p => p.id === cartProduct.id)){
                return res.status(404).json('Alguno de los productos tiene un id que no existe')
            }

            if(cartProduct.quantity <= 0){
                return res.status(404).json('Las cantidades no pueden ser menores o iguales a 0')
            }
        });
            
    }else{
        return res.status(404).json('Products no es un Array o esta vacio')
    }
    
    CartsManager.addCart(cartProducts)

    res.status(201).json("Carrito agregado correctamente")

})

router.post(':cid/product/:pid', async (req, res) =>{
    const cid = parseInt(req.params.cid)
    const pid = parseInt(req.params.pid)
    const {quantity} = req.body

    if(typeof quantity === 'number' && quantity > 0){
        const cart = await CartsManager.addProductToCart(cid, pid, quantity)
        return res.status(200).json(cart)
    }else{
        return res.status(404).json("Ocurrio un error")
    }
})

export default router;