import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products?limit=10&page=1&sort=asc&query=category:electronica
router.get('/', async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        // Construir filtro
        let filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = { $regex: query, $options: 'i' };
            }
        }

        // Construir ordenamiento
        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        else if (sort === 'desc') sortOption.price = -1;

        const options = {
            limit,
            page,
            sort: Object.keys(sortOption).length ? sortOption : undefined,
            lean: true
        };

        const result = await Product.paginate(filter, options);

        const baseUrl = `${req.protocol}://${req.get('host')}/api/products`;
        const buildLink = (p) => {
            const params = new URLSearchParams({ limit, page: p });
            if (sort) params.set('sort', sort);
            if (query) params.set('query', query);
            return `${baseUrl}?${params.toString()}`;
        };

        res.send({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al obtener productos' });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al obtener el producto' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send({ status: 'error', error: 'Faltan campos obligatorios' });
        }
        const product = new Product({ title, description, code, price, status: status ?? true, stock, category, thumbnails: thumbnails ?? [] });
        await product.save();
        res.status(201).send({ status: 'success', payload: product });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ status: 'error', error: 'El código del producto ya existe' });
        }
        res.status(500).send({ status: 'error', error: 'Error al agregar producto' });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.pid, updateData, { new: true });
        if (!product) return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al actualizar producto' });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.pid);
        if (!product) return res.status(404).send({ status: 'error', error: 'Producto no encontrado' });
        res.send({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).send({ status: 'error', error: 'Error al eliminar producto' });
    }
});

export default router;