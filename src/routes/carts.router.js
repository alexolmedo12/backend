import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('./src/data/carts.json');

router.post('/', async (req, res) => {
    try {
        const result = await cartManager.createCart();
        res.send({ status: "success", payload: result });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al crear carrito" });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(parseInt(req.params.cid));
        cart ? res.send({ status: "success", payload: cart.products }) : res.status(404).send({ error: "Carrito no encontrado" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al obtener carrito" });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const result = await cartManager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
        result ? res.send({ status: "success", payload: result }) : res.status(404).send({ error: "No se pudo agregar el producto" });
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al agregar producto al carrito" });
    }
});

export default router;