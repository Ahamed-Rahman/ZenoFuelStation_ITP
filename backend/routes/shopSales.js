const express = require('express');
const router = express.Router();
const ShopInventory = require('../models/ShopInventory');
const ShopSales = require('../models/ShopSales');
const Promo = require('../models/promo'); 
const MinimumPurchase = require('../models/MinPurchase'); // Adjust the path as necessary


// Create a new sale
router.post('/sales', async (req, res) => {
    const { itemId, quantity } = req.body;

    try {
        const item = await ShopInventory.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (item.quantityAvailable < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const totalPrice = item.retailPrice * quantity;

        const sale = new ShopSales({
            itemId,
            quantity,
            totalPrice,
            processed: false // Mark as unprocessed initially
        });

        await sale.save();

        item.itemsSold += quantity;
        item.quantityAvailable -= quantity;
        await item.save();

        return res.status(201).json({ message: 'Sale processed successfully', sale });
    } catch (error) {
        console.error("Error creating sale:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch all sales and available promo codes for the view bill
router.get('/view-bill', async (req, res) => {
    try {
        // Fetch unprocessed sales
        const sales = await ShopSales.find({ processed: false })
            .populate('itemId')
            .exec();

        const formattedSales = sales.map(sale => {
            if (!sale.itemId) {
                // Skip sales where itemId is null or not populated
                return null;
            }

            return {
                itemId: sale.itemId._id,
                itemName: sale.itemId.itemName,
                quantity: sale.quantity,
                unitPrice: sale.itemId.retailPrice,
                photo: sale.itemId.photo,
                totalPrice: sale.totalPrice,
                saleDate: sale.saleDate
            };
        }).filter(sale => sale !== null); // Filter out null entries

        // Fetch all active promo codes
        const currentDate = new Date(); // Get current date
        const activePromos = await Promo.find({
            promo_startDate: { $lte: currentDate },
            promo_endDate: { $gte: currentDate }
        });

        res.json({
            sales: formattedSales,
            promos: activePromos // Include promo codes in the response
        });
    } catch (error) {
        console.error('Error fetching sales and promos:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to get all past orders
router.get('/view-orders', async (req, res) => {
    try {
        const orders = await ShopSales.find({ isDeleted: false })
            .populate('itemId')
            .exec();

        const formattedOrders = orders.map(order => {
            if (!order.itemId) {
                // Skip orders where itemId is null or not populated
                return null;
            }

            return {
                itemId: order.itemId._id,
                itemName: order.itemId.itemName,
                quantity: order.quantity,
                totalPrice: order.totalPrice,
                saleDate: order.saleDate // Use saleDate for order date
            };
        }).filter(order => order !== null); // Filter out null entries

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});




// Route to handle deleting a sale
router.delete('/sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await ShopSales.findByIdAndUpdate(id, { isDeleted: true }); // Mark as deleted
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sale' });
    }
});



// Route to handle checkout
// Route to handle checkout
// Route to handle checkout
// Route to handle checkout
router.post('/checkout', async (req, res) => {
    const { promoCode, totalPrice, sales, date } = req.body;

    try {
        let discount = 0;
        const minimumPurchase = await MinimumPurchase.findOne();
        const minPurchaseAmount = minimumPurchase ? minimumPurchase.amount : 0;

        // Check if the total price meets the minimum purchase amount
        if (totalPrice < minPurchaseAmount) {
            return res.status(400).json({ message: `Minimum purchase amount is ${minPurchaseAmount} Rs to apply promo code.` });
        }

        // Check for promo code
        if (promoCode) {
            const currentDate = new Date();
            const promo = await Promo.findOne({
                promo_code: promoCode,
             
            });

            if (!promo) {
                return res.status(400).json({ message: 'Invalid or expired promo code' });
            }

            // Apply discount
            if (promo.promo_type === 'Percentage') {
                discount = (promo.promo_value / 100) * totalPrice;
            } else if (promo.promo_type === 'Fixed') {
                discount = promo.promo_value;
            }
        }

        const finalPrice = totalPrice - discount;

        // Process sales logic...
        await ShopSales.updateMany({ processed: false }, { processed: true });

        res.status(200).json({ message: 'Checkout successful', finalPrice });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Error during checkout' });
    }
});



// Route to get promo details by promo code
router.get('/promos/:promoCode', async (req, res) => {
    const promoCode = req.params.promoCode;
    
    try {
        // Fetch promo details directly from the Promo model
        const promo = await Promo.findOne({ promo_code: promoCode });
        
        if (!promo) {
            return res.status(404).send({ message: 'Promo code not found' });
        }
        
        res.status(200).send(promo);
    } catch (error) {
        console.error('Error fetching promo details:', error);
        res.status(500).send({ message: 'Server error' });
    }
});


module.exports = router;
