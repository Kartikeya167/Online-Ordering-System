const express = require("express");
const router = express.Router();
const { Cart } = require("../db/cart"); 
const Order  = require("../db/order");
const { User } = require("../db/user");
const userMiddleware = require("../middlewares/auth");

 

router.post('/place-order', async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'Invalid input. Please provide a valid user ID.' });
    }

    // Fetch cart items from the database
    const cart = await Cart.findOne({ user: userId }).populate('items.itemId');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user.' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Create order object
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({ itemId: item.itemId, quantity: item.quantity })),
      totalPrice: totalPrice
    });

    // Save order to database
    await order.save();

    // Clear user's cart (pseudo code)
    // await Cart.deleteMany({ user: userId });

    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/info/:userId", async (req, res) => {
    try {
        const userId = req.params.userId; // Extracting userId from route parameters
        const user = await User.findOne({ _id: userId }, { username: 1 , email:1}); // Finding user by userId

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return user information
        res.json({ user });
    } catch (error) {
        console.error("Error fetching user information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports=router;