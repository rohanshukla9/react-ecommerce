import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Razorpay from 'razorpay'
import { json } from 'express';




//@desc Create new order
//@route POST /api/orders
//@access Private

const addOrderItems = asyncHandler(async(req, res) => {

  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  if(orderItems && orderItems.length === 0) {
    res.status(400)

    throw new Error('No order items')
    return
  } else {
    //instantiate razorpay
    const options = {
      amount: totalPrice * 100,
      currency: 'INR',
      receipt: "bhr-store#1",
    }
    const instance = new Razorpay({
      key_id: process.env.RZR_KEY,
      key_secret: process.env.RZR_SECRET
    })
   
    instance.orders.create(options, async function(err, order){
      try {
        const dbOrder = new Order({
          orderItems, 
          user: req.user._id,
          shippingAddress, 
          paymentMethod, 
          itemsPrice, 
          shippingPrice, 
          totalPrice,
          razorpay_order: order.id
        })
  
        const createdOrder = await dbOrder.save()
        if(createdOrder)
        {
          res.status(201).json(createdOrder) 
        
        } else {
          throw new Error('I give up')
        }
        
      } catch (error) {
        console.error(error)
      }
      
    })

  }
})

//@desc Get ORder by Id
//@route Get /api/orders/:id
//@access Private

const getOrderById = asyncHandler(async(req, res) => {

  const order = await Order.findById(req.params.id).populate('user', 'name email phone_number')

  if(order) {
    res.json(order)
  } else {
    res.status(404);
    throw new Error('Order not found!')
  }
})

//@desc Update order to paid
//@route Get /api/orders/:id/pay
//@access Private

const updateOrderToPaid = asyncHandler(async(req, res) => {

  const order = await Order.findById(req.params.id)

  if(order) {
    order.isPaid = true
    order.paidAt = Date.now();

    order.paymentResult = {
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_signature: req.body.razorpay_signature,
    }
    
    //order.transactionamount = req.body.amount

    const updatedOrder = await order.save()

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found!')
  }
})

//@desc Update order to deliver
//@route Get /api/orders/:id/deliver
//@access Private, admin

const updateOrderToDelivered = asyncHandler(async(req, res) => {

  const order = await Order.findById(req.params.id)

  if(order) {
    order.isDelivered = true
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save()

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found!')
  }
})

//@desc Get logged in user orders
//@route Get /api/orders/myorders
//@access Private

const getAuthUserOrders = asyncHandler(async(req, res) => {

  const orders = await Order.find({ user: req.user._id })

  res.json(orders)
})


//@desc Get all orders
//@route Get /api/orders
//@access Private, admin

const getAllOrders = asyncHandler(async(req, res) => {

  const orders = await Order.find({}).populate('user', 'id name phone_number')

  res.json(orders)
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getAuthUserOrders,
  getAllOrders, 
  updateOrderToDelivered
}