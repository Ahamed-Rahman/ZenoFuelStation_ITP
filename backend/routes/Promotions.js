const router = require("express").Router();
let promo = require("../models/promo.js");

// Create Promo Codes
router.route("/addPromo").post((req, res) => {
    const { promo_code, promo_type, promo_value, promo_startDate, promo_endDate, promo_expire } = req.body;

    // Validate required fields
    if (!promo_code || !promo_type || !promo_value || !promo_startDate || !promo_endDate || !promo_expire) {
        return res.status(400).send({ status: "Error", message: "All fields are required" });
    }

    // Create new promo object
    const newPromo = new promo({
        promo_code,
        promo_type,
        promo_value: Number(promo_value),
        promo_startDate: new Date(promo_startDate),
        promo_endDate: new Date(promo_endDate),
        promo_expire: Number(promo_expire),
    });

    // Save to database
    newPromo.save()
        .then(() => {
            res.json("Promo Code Added!");
        })
        .catch((err) => {
            console.error("Error details:", err);
            if (err.code === 11000) {
                // Handle duplicate key error
                return res.status(409).send({ status: "Error", message: "Promo code already exists" });
            }
            res.status(500).send({ status: "Error with adding data", error: err.message });
        });
});


//Display Promo Codes
router.route("/displayPromo").get((req, res) => {
    const now = new Date();
    promo.find({
        $and: [
            { promo_endDate: { $gt: now } }, // Valid if end date is in the future
            { promo_expire: { $gt: 0 } }     // Valid if usage limit is greater than 0
        ]
    }).then((promoCodes) => {
        res.json(promoCodes);
    }).catch((err) => {
        res.status(404).send({ status: "Error with getting data", error: err.message });
    });
    
})

//Update Promo Codes
router.route("/updatePromo/:promoId").put(async(req,res) => {

    //Find ID and assign it to a variable
    let promoID = req.params.promoId;
    // Fetch incoming data(data that need updating) from the frontend and assign them using destructure method
    const {promo_code,promo_type,promo_value,promo_startDate,promo_endDate,promo_expire} = req.body;

    const updatePromo = {
        promo_code,
        promo_type,
        promo_value,
        promo_startDate,
        promo_endDate,
        promo_expire
    }

    const update = await promo.findByIdAndUpdate(promoID,updatePromo).then(() => {

        res.status(200).send({status: "Promo Code Updated!"});
    }).catch((err) => {

        res.status(404).send({status: "Error with updating data", error: err.message});
    })
  
})

//Delete a Promo Code
router.route("/deletePromo/:promoId").delete(async(req,res) => {

    let promoID = req.params.promoId;
    await promo.findByIdAndDelete(promoID).then(() => {
        res.status(200).send({status: "Promo code deleted!"})
    }).catch((err) => {
        res.status(404).send({status: "Promo code not found!",error:err.message});
    })
})

router.route("/getPromo/:promoId").get(async (req,res) => {

    let promoId = req.params.promoId;
    const getPromo = await promo.findById(promoId).then((Promotions) => {
        res.status(200).send({status: "Promo Code fetched", Promotions})
    }).catch((err) => {
        res.status(404).send({status: "Promo Code not fetched!",error: err.message});
    })
})

// Get expired promotions
router.get('/expiredPromos', async (req, res) => {
    try {
        const now = new Date();
        const expiredPromos = await promo.find({
            $or: [
                { promo_endDate: { $lt: now } },
                { promo_expire: 0 }
            ]
        }).select('promo_code promo_type promo_value promo_endDate promo_expire'); // Make sure promo_code is included

        res.json(expiredPromos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expired promotions', error });
    }
});

// Apply promo code
router.post('/apply-promo', async (req, res) => {
    const { promoCode, totalPrice } = req.body;

    try {
        const promoDoc = await promo.findOne({ promo_code: promoCode });

        if (!promoDoc) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        const currentDate = new Date();
        if (promoDoc.promo_endDate < currentDate || promoDoc.promo_expire <= 0) {
            return res.status(400).json({ message: 'Promo code has expired or reached usage limit' });
        }

        let discountedPrice = totalPrice;
        if (promoDoc.promo_type === 'Percentage') {
            discountedPrice = totalPrice - (totalPrice * promoDoc.promo_value / 100);
        } else if (promoDoc.promo_type === 'Fixed') {
            discountedPrice = totalPrice - promoDoc.promo_value;
        }

        // Decrease usage limit
        promoDoc.promo_expire -= 1;
        await promoDoc.save();

        res.json({
            discountedPrice: discountedPrice,
            message: `Promo code applied. Discounted price: $${discountedPrice.toFixed(2)}`,
            updatedPromo: promoDoc
        });
    } catch (error) {
        console.error('Error applying promo code:', error);
        res.status(500).json({ message: 'Error applying promo code' });
    }
});

// exports Data
module.exports = router;



