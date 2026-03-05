import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import Product from './models/Product.js';

// Conectar a MongoDB
connectDB();

const app = express();
const PORT = 8080;

// Configurar Handlebars
app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar servidor
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Configurar Socket.io
const io = new Server(httpServer);

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    const products = await Product.find().lean();
    socket.emit('updateProducts', products);

    socket.on('addProduct', async (product) => {
        try {
            const newProduct = new Product(product);
            await newProduct.save();
            const products = await Product.find().lean();
            io.emit('updateProducts', products);
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const products = await Product.find().lean();
            io.emit('updateProducts', products);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});