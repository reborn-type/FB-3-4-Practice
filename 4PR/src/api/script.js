const express = require('express');
const {nanoid} = require('nanoid');
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));



let products = [
    {id: "abc123", name: "Кожанная куртка Guess", price: 12690, category: "jacket", description: "Материал: кожзам.", countInStock: 12},
    {id: "def232", name: "Куртка Homeless", price: 16990, category: "jacket", description: "Кол-во страз: 1000шт.", countInStock: 14}
]


app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] [${res.statusCode} / ${req.path}]`)
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            console.log("Body:", req.body)
        }
    });
    next();
})

function findProductOr404(id, res){
    const product = products.find(p => p.id == id);
    if(!product){
        res.status(404).json({error: "Product not found."});
        return null; 
    }
    return product;
}

app.post("/api/products", (req, res) => {
    const {name, price, description, countInStock, category} = req.body;
    if (!category) {
        return res.status(400).json({ error: 'Категория обязательна' });
    }
    const newProduct = {
        id: nanoid(5), 
        name: name.trim(),
        price: price, 
        category: category.trim(),
        description: description.trim(),
        countInStock: countInStock
    }
    products.push(newProduct);
    res.status(201).json(newProduct)
});

app.get("/api/products", (req,res) => {
    res.json(products);
})

app.get("/api/products/:id", (req, res) => {
    const id = req.params.id; 
    const product = findProductOr404(id, res); 
    if(!product) {
        res.status(404).json("incorrect id or doesn't exist")
        return;
    }
    res.json(product); 
})

app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) {
        res.status(404).json("incorrect id or doesn't exist")
        return;
    }

    if(req.body?.name === undefined && req.body?.price === undefined && req.body?.category === undefined && req.body?.description === undefined &&  req.body?.countInStock === undefined){
        return res.status(400).json({
            error: "Nothing to update",
        });
    }

    const {name, price, category, description, countInStock} = req.body;
    if(name !== undefined) product.name = name;
    if(price !== undefined) product.price = price;
    if(category !== undefined) product.category = category;
    if(description !== undefined) product.description = description;
    if(countInStock !== undefined) product.countInStock = countInStock;

    res.json(product)
})

app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id; 
    const exists = products.some((p) => p.id === id)
    if(!exists) return res.status(404).json({error: "Product not found"});

    products = products.filter(p => p.id !== id);

    res.status(204).send();
});
 
app.use((req, res) => {
    res.status(404).json({error: "Not found"});
})

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({error: "Internal server error"});
})

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`)
})
