const router = require("express").Router();
let MinimumPurchase = require("../models/MinPurchase");

// Get the current minimum purchase amount
router.route("/get").get(async (req, res) => {
    try {
        const minPurchase = await MinimumPurchase.findOne();
        res.json({ minimumAmount: minPurchase ? minPurchase.amount : 0 });
    } catch (err) {
        res.status(400).json("Error: " + err);
    }
});

// Set or update the minimum purchase amount
router.route("/set").post(async (req, res) => {
    const { minimumAmount } = req.body;

    try {
        let minPurchase = await MinimumPurchase.findOne();
        if (minPurchase) {
            minPurchase.amount = minimumAmount;
            await minPurchase.save();
        } else {
            minPurchase = new MinimumPurchase({ amount: minimumAmount });
            await minPurchase.save();
        }
        res.json("Minimum purchase amount updated successfully");
    } catch (err) {
        res.status(400).json("Error: " + err);
    }
});

module.exports = router;