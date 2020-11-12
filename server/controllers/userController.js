import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js';


//@desc Auth user & generate token
//@route POST /api/users/login
//@access Public

const authUser = asyncHandler(async(req, res) => {
  
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if(user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }

})

//@desc user profile 
//@route GET /api/users/profile
//@access Private

const getUserProfile = asyncHandler(async(req, res) => {

  const user = await User.findById(req.user._id)

  if(user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(401);

    throw new Error('User not found');
  }
})
//@desc update user profile 
//@route PUT /api/users/profile
//@access Private

const updateUserProfile = asyncHandler(async(req, res) => {

  const user = await User.findById(req.user._id)

  if(user) {

    user.name = req.body.name || user.name
    user.phone_number = req.body.phone_number || user.phone_number
    user.email = req.body.email || user.email

    if(req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone_number: user.phone_number,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id)
    })
    
  } else {
    res.status(401);

    throw new Error('User not found');
  }
})

//@desc Register new user
//@route POST /api/users/
//@access Public

const registerUser = asyncHandler(async(req, res) => {
  
  const { name, phone_number, email, password } = req.body

  const userExists = await User.findOne({ email })

  if(userExists){
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    phone_number,
    email,
    password,
  })

  if(user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone_number: user.phone_number,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }

})

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile
}
