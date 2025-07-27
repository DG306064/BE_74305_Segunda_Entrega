import { Router } from "express";
import ProductsManager from "../services/productsManager.js";

const router = Router();
const productsManager = new ProductsManager();

router.get('/', async (req, res) => {
    const products = await productsManager.getProducts();
    console.log(`Productos enviados a la vista: ${products}`);
    res.render('home', {
        title: 'Inicio',
        products
    });
});

export default router;