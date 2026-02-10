import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.send({ status: "success", payload: products });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al obtener productos" });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(parseInt(req.params.pid));
        product ? res.send({ payload: product }) : res.status(404).send({ error: "Producto no encontrado" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al obtener el producto" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send({ error: "Faltan campos obligatorios" });
        }
        const result = await productManager.addProduct({
            title, description, code, price, status: status ?? true, stock, category, thumbnails: thumbnails ?? []
        });
        res.send({ status: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al agregar producto" });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const result = await productManager.updateProduct(parseInt(req.params.pid), req.body);
        result ? res.send({ status: "success", payload: result }) : res.status(404).send({ error: "No se pudo actualizar" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al actualizar producto" });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        await productManager.deleteProduct(parseInt(req.params.pid));
        res.send({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al eliminar producto" });
    }
});

export default router;