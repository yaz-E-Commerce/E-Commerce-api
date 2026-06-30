const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')

// middleware to parse JSON requests
app.use(bodyParser.json())
app.use(morgan('tiny'))

const productSchema = new mongoose.Schema({
    name: String,
    price: {
        type: Number,
        required: true,
    }
})
const Product = mongoose.model('Product', productSchema)

// Load environment variables from .env file
require('dotenv').config()

const apiUrl = process.env.API_URL || '/api/v1'
// Middleware to parse JSON requests
app.use(express.json())

// http://localhost:3000/api/v1/products
// http://localhost:3000/api/v1/products
app.get(`${apiUrl}/products`, async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({
            error: 'Failed to fetch products',
            success: false,
        });
    }
});

app.post(`${apiUrl}/products`, (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
    })

    product
        .save()
        .then((createdProduct) => {
            res.status(201).json(createdProduct)
        })
        .catch((err) => {
            res.status(500).json({
                error: 'Failed to create product',
                success: false,
            })
        })
})

mongoose
    .connect(process.env.CONNECTION_STRING, {
        dbName: 'shop-database',
    })
    .then(() => {
        console.log('Database connection is ready...')
    })
    .catch((err) => {
        console.log(err)
    })

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port http://localhost:3000')
})
