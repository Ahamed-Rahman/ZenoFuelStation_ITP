const express = require('express');
const router = express.Router();
const FuelInventory = require('../models/FuelInventory');
const Sale = require('../models/Sale');
const Fuel = require('../models/Fuel'); // Ensure correct model
const io = require('../socket'); // Import the socket instance

// Route to get all fuel sales records
router.get('/fuel-sales-records', async (req, res) => {
    try {
        const sales = await Sale.find(); // Fetch all records
        res.json(sales);
    } catch (err) {
        console.error('Error fetching fuel sales records:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Fetch all sales records
router.get('/sales-records', async (req, res) => {
    try {
      const salesRecords = await Fuel.find(); // Assuming 'Fuel' is the model for sales records
      res.json(salesRecords);
    } catch (error) {
      res.status(500).json({ message: 'Server error while fetching sales records' });
    }
  });
  
// Route to get all price records
router.get('/price-records', async (req, res) => {
    try {
        const priceRecords = await Sale.find(); // Fetch only price records
        res.json(priceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching price records' });
    }
});


// Route to get all fuel inventory items for dropdown
router.get('/inventory-items', async (req, res) => {
    try {
        const items = await FuelInventory.find({}, 'itemName'); // Fetch only itemName field
        res.json(items);
    } catch (err) {
        console.error('Error fetching inventory items:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Get unit price of a fuel type from the latest sale record
// Get unit price of a fuel type from the latest sale record
router.get('/price/:fuelType', async (req, res) => {
    try {
        const { fuelType } = req.params;
        const latestSale = await Sale.findOne({ fuelType }).sort({ createdAt: -1 }); // Get the latest sale for the fuelType

        if (latestSale) {
            res.json({ unitPrice: latestSale.unitPrice });
        } else {
            res.status(404).json({ message: 'Fuel type not found in sales' });
        }
    } catch (error) {
        console.error('Error fetching unit price from sales:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// Route to set fuel price and process sales (Admin) 

// Route to create a price record
router.post('/admin-sales', async (req, res) => {
    const { fuelType, unitPrice, litres, totalPrice } = req.body;

    // Validate input
    if (!fuelType || typeof unitPrice !== 'number' || typeof litres !== 'number') {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const newSale = new Sale({
            fuelType,
            unitPrice,
            litres,
            totalPrice: totalPrice || (litres * unitPrice)
        });

        await newSale.save();
        res.status(201).json({ message: 'Price record saved successfully!', sale: newSale });
    } catch (error) {
        console.error('Error saving price record:', error);
        res.status(500).json({ message: 'Failed to save price record.' });
    }
});

// Route to record a sale made by a worker
// Route to record a sale made by a worker
router.post('/worker-sales', async (req, res) => {
    const { fuelType, litres, unitPrice } = req.body;

    // Calculate total price
    const totalPrice = litres * unitPrice;

    // Validate input
    if (!fuelType || isNaN(litres) || isNaN(unitPrice)) {
        return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    try {
        const newSale = new Fuel({
            fuelType,
            litres,
            unitPrice,
            totalPrice, // Save the total price
        });

        await newSale.save();

        const inventoryItem = await FuelInventory.findOne({ itemName: fuelType });

        if (inventoryItem) {
            if (inventoryItem.available < litres) {
                return res.status(400).json({ message: 'Insufficient inventory' });
            }

            inventoryItem.sold += litres;
            inventoryItem.available -= litres;

            // Update the inventory
            await inventoryItem.save();

            // Emit updated inventory to connected clients
            const items = await FuelInventory.find(); // Fetch the updated inventory
            io.emit('inventoryUpdate', items); // Emit the updated inventory to all connected clients

            res.status(201).json({ message: 'Sale recorded and inventory updated' });
        } else {
            res.status(404).json({ message: 'Inventory item not found' });
        }
    } catch (error) {
        console.error('Error recording sale or updating inventory:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all worker sales
router.get('/worker-sales', async (req, res) => {
    try {
        const sales = await Fuel.find(); // Fetch only worker sales
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching worker sales' });
    }
});



  


// Route to delete a price record
router.delete('/price-records/:id', async (req, res) => {
    try {
        const result = await Sale.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Price record not found' });
        }
        res.status(200).json({ message: 'Price record deleted successfully' });
    } catch (err) {
        console.error('Error deleting price record:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//update route
router.put('/price-records/:id', async (req, res) => {
    const { id } = req.params;
    const { fuelType,  unitPrice } = req.body;

    if (!fuelType || typeof unitPrice !== 'number' || unitPrice < 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }


    try {
        const updatedSale = await Sale.findByIdAndUpdate(
            id,
            { fuelType, unitPrice }, // Update fields
            { new: true } // Return the updated document
        );

        if (!updatedSale) {
            return res.status(404).json({ message: 'Fuel sale not found' });
        }

        res.status(200).json({ message: 'Fuel sale updated successfully', sale: updatedSale });
    } catch (err) {
        console.error('Error updating fuel sale record:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Update route for price records
router.put('/price-records/:id', async (req, res) => {
    const { fuelType, unitPrice, litres } = req.body;

    if (!fuelType || typeof unitPrice !== 'number' || unitPrice < 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const updatedSale = await Sale.findByIdAndUpdate(
            req.params.id,
            { fuelType, unitPrice, litres }, // Update fields
            { new: true } // Return the updated document
        );

        if (!updatedSale) {
            return res.status(404).json({ message: 'Price record not found' });
        }

        res.status(200).json({ message: 'Price record updated successfully', sale: updatedSale });
    } catch (err) {
        console.error('Error updating price record:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
