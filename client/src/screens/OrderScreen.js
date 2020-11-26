import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
//import axios from 'axios'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import CryptoJS from 'crypto-js'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET, ORDER_PAY_FAIL } from '../constants/orderConstants'

// function loadScript() {
//   return new Promise((resolve) => {
    
//   })
// }


const OrderScreen = ({ match, history }) => {

  const orderId = match.params.id

  const [scriptReady, setScriptReady] = useState(false)

  const dispatch = useDispatch();


  const orderDetails = useSelector(state => state.orderDetails)
  const { order, loading, error } = orderDetails

  const orderPay = useSelector(state => state.orderPay)
  const { loading:loadingPay, success:successPay } = orderPay

  const orderDeliver = useSelector(state => state.orderDeliver)
  const { loading:loadingDeliver, success:successDeliver } = orderDeliver

  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  if(!loading){
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }
    //calculate prices
    order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0))

    
  }

  useEffect(() => {

    if(!userInfo){
      history.push('/login')
    }

    const addRazorPayScript = async() => {

      const script = document.createElement('script');
      script.type = 'text/javascript'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true;
      script.onload = () => {
        setScriptReady(true)
      }

      document.body.appendChild(script);

    }

    if(!order || successPay || successDeliver || order._id !== orderId){
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if(!order.isPaid){
      if (!window.Razorpay) {
        addRazorPayScript()
      } else {
        setScriptReady(true)
      }
    }
  }, [dispatch, orderId, order, successPay, successDeliver, userInfo, history])

  const openRazorWindow = () => {
    let options = {
      "key": "rzp_live_sfiQdbNlpqQdxB", 
      "amount": order.totalPrice * 100, 
      "currency": "INR",
      "name": "Bharuch Kirana",
      "description": "Test Transaction",
      "order_id": order.razorpay_order,
      "handler": function (response){
          const generatedSignature = response.razorpay_signature
         // console.log(response)

          const dbSignature = CryptoJS.HmacSHA256(order.razorpay_order + "|" + response.razorpay_payment_id, "FS8y0OzQn44mKvWTqLZ8cUj1")


          const paymentResult = {
            razorpay_order_id:response.razorpay_order_id, 
            razorpay_payment_id:response.razorpay_payment_id, 
            razorpay_signature:response.razorpay_signature
            
          }

          if(generatedSignature == dbSignature){
            updateOrderToDb(paymentResult)
            //successPay === true
          }
      },
      "prefill": {
          "name": order.user.name,
          "email": order.user.email,
          "contact": order.user.phone_number
      },
      "notes": {
          "address": "Bharuch Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
    }

    let razor1 = new window.Razorpay(options);
    razor1.on('payment.failed', function (response){
      dispatch({ type: ORDER_PAY_FAIL })
    });
     
    razor1.open();
  }

  const updateOrderToDb = (paymentResult) => {
    dispatch(payOrder(
      orderId,
      paymentResult
    ));
   // dispatch({ type: ORDER_PAY_RESET })
   // dispatch(getOrderDetails(orderId))
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order))
  }




return loading ? (<Loader />) : error ? (<Message variant='danger'>{error}</Message>) : (<> 
<h1> Order { order._id }</h1>
<Row>
      <Col md={8}>
        <ListGroup variant='flush'>
          <ListGroup.Item>
            <h2>Shipping</h2>
            <p>
            <strong>Name: </strong> {order.user.name} 
            </p>
            <p>
            <strong>Phone Number: </strong> {order.user.phone_number} </p>
            <p>
            <strong>Email: </strong> {order.user.email}
            </p>  

            <p>
              <strong> Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city} 
              {order.shippingAddress.postalcode}, { '' } {order.shippingAddress.country}
            </p>

            {order.isDelivered ? <Message variant='success'>Delivered on {order.deliveredAt} </Message> : 
            <Message variant='danger'>Not Delivered</Message>}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Payment Method</h2>
            <p>
            <strong>Method: </strong>
            {order.paymentMethod}
            </p>



            {order.isPaid ? <Message variant='success'>Paid on {order.paidAt}</Message> : 
            <Message variant='danger'>Not Paid</Message>}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Order Items</h2>
            {order.orderItems.length === 0 ? <Message>
              Your Order is empty!
            </Message> : (
              <ListGroup variant='flush'>
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>

                      <Col>
                      <Link to={`/product/${item.product}`}>
                        {item.name}
                      </Link>
                      </Col>

                      <Col md={4}>
                        {item.qty} x ₹{item.price} = { (item.qty * item.price).toFixed()}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </ListGroup.Item>


        </ListGroup>
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Order Summary</h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col>Items</Col>
                <Col>₹{order.itemsPrice}</Col>
              </Row>
            </ListGroup.Item>

            
            <ListGroup.Item>
              <Row>
                <Col>Shipping</Col>
                <Col>₹{order.shippingPrice}</Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col>Total</Col>
                <Col>₹{order.totalPrice}</Col>
              </Row>
            </ListGroup.Item>
            {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!scriptReady ? (
                    <Loader />
                  ) : (
                    <Button type='button' variant='primary' id='rzp-button1' onClick={openRazorWindow}>Pay with Razorpay</Button>
                  )}
                </ListGroup.Item>
              )}

              {loadingDeliver && <Loader />}

              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button type='button' className='btn btn-block' onClick={deliverHandler}>
                    Mark as Delivered
                  </Button>
                </ListGroup.Item>
              )}
            
          </ListGroup>
        </Card>
      </Col>
    </Row>
      
</>)
}

export default OrderScreen
