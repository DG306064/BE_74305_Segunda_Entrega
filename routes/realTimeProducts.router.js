import { Router } from "express";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from "url";
import ProductsManager from "../services/productsManager.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsManager = new ProductsManager();

//CONFIGURAR EN STORAGE EL LUGAR DONDE GUARDAR LAS IMAGENES

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({storage});

// router.post('/realTimeProducts', upload.single('image'),(req, res) => {
//     res.render('realTimeProducts', {
//         title: 'Productos en tiempo real',
//         msg: `Archivo ${req.file.originalname} subido con exito`
//     })
// })


router.get('/', async (req, res) => {
    const products = await productsManager.getProducts();
    console.log(`Productos enviados a la vista: ${products}`);
    res.render('realTimeProducts', {
        title: 'Productos en tiempo real',
        products,
        isRealTimeProducts: true
    });
});

router.post('/', upload.single('image'), async (req, res) =>{
    try{
        console.log('=== POST /realTimeProducts ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        const newProduct = {
            title: req.body.title,
            description: req.body.description,
            code: req.body.code,
            price: parseFloat(req.body.price),
            status: req.body.status,
            stock: parseInt(req.body.stock),
            category: req.body.category,
            thumbnails: req.file ? `/static/img/${req.file.filename}` : ''
        }

        console.log('newProduct creado:', newProduct);

        if(typeof newProduct.title !== 'string' || newProduct.title.trim().length === 0 ){
            return res.status(400).json("El titulo no es valido")
        }

        if(typeof newProduct.description !== 'string' || newProduct.description.trim().length === 0 ){
            return res.status(400).json("La descripcion no es valida")
        }
        
        if(typeof newProduct.code !== 'string' || newProduct.code.trim().length === 0 ){
            return res.status(400).json("El codigo no es valido")
        }

        if(isNaN(newProduct.price) || newProduct.price <= 0){
            return res.status(400).json("El precio debe ser mayor a 0")
        }

        if(newProduct.status !== 'true' && newProduct.status !== 'false'){
            return res.status(400).json("El status debe ser 'true' o 'false'")
        }

        if(isNaN(newProduct.stock) || newProduct.stock < 0){
            return res.status(400).json("El stock debe ser mayor o igual a 0")
        }

        if(typeof newProduct.category !== 'string' || newProduct.category.trim().length === 0 ){
            return res.status(400).json("La categoria no es valida")
        }

        // Convertir status a boolean después de la validación
        newProduct.status = newProduct.status === 'true';

        const savedProduct = await productsManager.addProduct(newProduct);
        console.log('Producto guardado exitosamente:', savedProduct);

        const products = await productsManager.getProducts();
        console.log('Productos obtenidos después de guardar:', products.length);

        // Emitir evento socket.io
        req.app.get('io').emit('productAdded', {
            message: 'Producto agregado exitosamente',
            products: products
        });

        // Respuesta exitosa
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: products,
            msg: 'Producto agregado correctamente',
            isRealTimeProducts: true
        });
    }catch(error){
        console.error('Error al agregar el producto: ', error);
        const products = await productsManager.getProducts();
        return res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: products,
            msg: 'Error al agregar el producto',
            isRealTimeProducts: true
        });
    }
});

export default router;