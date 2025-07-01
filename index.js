const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { query, collection, addDoc, serverTimestamp, getDocs, doc, getDoc, where, orderBy, limit } = require('firebase/firestore');
const { db } = require('./firebase/firebase-config');
require('dotenv').config();

const app = express();

// Express app setup
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
/* app.use(cors()); */
app.use(helmet());
app.use(express.json());

// Routes
app.post('/add-product', async (req, res) => {
    try {
        const {
            name,
            mainImage,
            images,
            availability,
            price,
            description,
            features,
            type,
            TAG,
            stars
        } = req.body;

        if (!name || !mainImage || !price || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newProduct = {
            name,
            mainImage,
            images: images || [],
            availability: availability || 'Unknown',
            price,
            description,
            features: features || {},
            type,
            TAG,
            stars,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'products'), newProduct);
        res.status(201).json({ message: 'Product added successfully', id: docRef.id });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ products, success: true });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', success: false });
    }
});

app.get('/products/news/home', async (req, res) => {
    console.log('Ejecutando consulta... /products/news/home')
    try {
        const q = query(
            collection(db, 'products'),
            where("type", "==", "Nuevo"),
            orderBy("createdAt", "desc"),
            limit(4)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ products, success: true });
        console.log(products)
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', success: false });
    }
});

app.get('/products/populars/home', async (req, res) => {
    console.log('Ejecutando consulta... /products/populars/home')
    try {
        const q = query(
            collection(db, 'products'),
            where("type", "==", "Oferta"),
            orderBy("createdAt", "desc"),
            limit(4)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ products, success: true });
        console.log(products)
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', success: false });
    }
});


app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({ error: 'Missing product ID' });
    }

    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Product not found', success: false });
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data(), success: true });

    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product', success: false });

    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});