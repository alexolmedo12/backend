import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();

// POST /api/carts — crear carrito
router.post('/', async (req, res) => {
    try {
        const cart = new Cart({ products: [] });
        await cart.save();
        res.status(201).send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al crear carrito' });
    }
});

// GET /api/carts/:cid — traer carrito con populate
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });
        res.send({ status: 'success', payload: cart.products });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al obtener carrito' });
    }
});

// POST /api/carts/:cid/product/:pid — agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });

        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity++;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }

        await cart.save();
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al agregar producto al carrito' });
    }
});

// DELETE /api/carts/:cid/products/:pid — eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al eliminar producto del carrito' });
    }
});

// PUT /api/carts/:cid — actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products }, { new: true });
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al actualizar carrito' });
    }
});

// PUT /api/carts/:cid/products/:pid — actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        if (productIndex === -1) return res.status(404).send({ status: 'error', error: 'Producto no encontrado en el carrito' });

        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al actualizar cantidad' });
    }
});

// DELETE /api/carts/:cid — vaciar carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).send({ status: 'error', error: 'Carrito no encontrado' });
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al vaciar carrito' });
    }
});

export default router;