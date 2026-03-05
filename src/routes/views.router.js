import { Router } from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = Router();

// GET / — home con productos paginados
router.get('/', async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        let filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = { $regex: query, $options: 'i' };
            }
        }

        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        else if (sort === 'desc') sortOption.price = -1;

        const result = await Product.paginate(filter, {
            limit,
            page,
            sort: Object.keys(sortOption).length ? sortOption : undefined,
            lean: true
        });

        res.render('home', {
            title: 'Productos',
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            query: query || '',
            sort: sort || ''
        });
    } catch (error) {
        res.status(500).send({ error: 'Error al cargar productos' });
    }
});

// GET /products — igual que home
router.get('/products', async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        let filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = { $regex: query, $options: 'i' };
            }
        }

        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        else if (sort === 'desc') sortOption.price = -1;

        const result = await Product.paginate(filter, {
            limit,
            page,
            sort: Object.keys(sortOption).length ? sortOption : undefined,
            lean: true
        });

        res.render('home', {
            title: 'Productos',
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            query: query || '',
            sort: sort || ''
        });
    } catch (error) {
        res.status(500).send({ error: 'Error al cargar productos' });
    }
});

// GET /products/:pid — detalle de un producto
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();
        if (!product) return res.status(404).send({ error: 'Producto no encontrado' });
        res.render('productDetail', { title: product.title, product });
    } catch (error) {
        res.status(500).send({ error: 'Error al cargar producto' });
    }
});

// GET /realtimeproducts — productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
    } catch (error) {
        res.status(500).send({ error: 'Error al cargar productos' });
    }
});

// GET /carts/:cid — vista de carrito específico
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) return res.status(404).send({ error: 'Carrito no encontrado' });
        res.render('cart', { title: 'Mi Carrito', cart, products: cart.products });
    } catch (error) {
        res.status(500).send({ error: 'Error al cargar carrito' });
    }
});

export default router;