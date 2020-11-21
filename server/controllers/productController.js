import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';


//@desc Fetch all products
//@route GET /api/products
//@access Public

const getProducts = asyncHandler(async(req, res) => {
  const products = await Product.find({});

  res.json(products);
})



//@desc Fetch single product
//@route GET /api/products/:id
//@access Public

const getProductById = asyncHandler(async(req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product Not Found!');
  }
})

//@desc delete single product
//@route DELETE /api/products/:id
//@access Private, admin

const deleteProduct = asyncHandler(async(req, res) => {

  const product = await Product.findById(req.params.id);
  if (product) {

    await product.remove()
    res.json({message: 'Successfully deleted the product'})
  } else {
    res.status(404);
    throw new Error('Product Not Found!');
  }
})

//@desc Create single product
//@route Post /api/products/
//@access Private, admin

const createProduct = asyncHandler(async(req, res) => {

  const product = new Product({
    name: 'Sample Name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.png',
    brand: 'Sample Brand',
    category: 'Sample Category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample Description'
  })

  const createdProduct = await product.save()

  res.status(201).json(createdProduct);
})

//@desc Updfate single product
//@route Put /api/products/:id
//@access Private, admin

const updateProduct = asyncHandler(async(req, res) => {

  const {name, price, description, image, brand, category, countInStock } = req.body

  const product = await Product.findById(req.params.id)

  if(product){

    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.category = category
    product.countInStock = countInStock
    
    const updatedProduct = await product.save()
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }

  
})


export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct
}