import fs from 'fs';

export default class ProductManager {
    constructor(path) {
        this.path = path;
    }

    getProducts = async () => {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf-8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    addProduct = async (product) => {
        const products = await this.getProducts();
        const newProduct = {
            id: products.length === 0 ? 1 : products[products.length - 1].id + 1,
            ...product
        };
        products.push(newProduct);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return newProduct;
    }

    getProductById = async (id) => {
        const products = await this.getProducts();
        return products.find(p => p.id === id) || null;
    }

    updateProduct = async (id, updatedFields) => {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        delete updatedFields.id; // Evita que se cambie el ID
        products[index] = { ...products[index], ...updatedFields };
        
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return products[index];
    }

    deleteProduct = async (id) => {
        const products = await this.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        await fs.promises.writeFile(this.path, JSON.stringify(filteredProducts, null, '\t'));
        return true;
    }
}