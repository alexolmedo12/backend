import { Router } from 'express';
import ProductManager from '../managers/productmanager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.send({ status: "success", payload: products });
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(parseInt(req.params.pid));
    product ? res.send({ payload: product }) : res.status(404).send({ error: "Producto no encontrado" });
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send({ error: "Faltan campos obligatorios" });
    }
    const result = await productManager.addProduct({ 
        title, description, code, price, status: status ?? true, stock, category, thumbnails: thumbnails ?? [] 
    });
    res.send({ status: "success", payload: result });
});

router.put('/:pid', async (req, res) => {
    const result = await productManager.updateProduct(parseInt(req.params.pid), req.body);
    result ? res.send({ status: "success", payload: result }) : res.status(404).send({ error: "No se pudo actualizar" });
});

router.delete('/:pid', async (req, res) => {
    await productManager.deleteProduct(parseInt(req.params.pid));
    res.send({ status: "success", message: "Producto eliminado correctamente" });
});

export default router;