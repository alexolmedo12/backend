const socket = io();

const form = document.getElementById('formProduct');
const productList = document.getElementById('productList');

//formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const product = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        category: formData.get('category')
    };
    socket.emit('addProduct', product);
    form.reset();
});

// eliminar producto
function deleteProduct(id) {
    socket.emit('deleteProduct', id);
}

// actualización de productos
socket.on('updateProducts', (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.setAttribute('data-id', product.id);
        li.innerHTML = `
            <h3>${product.title}</h3>
            <p>Descripción: ${product.description}</p>
            <p>Precio: $${product.price}</p>
            <p>Stock: ${product.stock}</p>
            <p>Categoría: ${product.category}</p>
            <p>Código: ${product.code}</p>
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
            <hr>
        `;
        productList.appendChild(li);
    });
});