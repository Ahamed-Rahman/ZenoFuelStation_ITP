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
router.route("/displayPromo").get((req,res) => {

    promo.find().then((promoCodes) => {
        res.json(promoCodes);
    }).catch((err) => {
        res.status(404).send({status: "Error with getting data", error: err.message});
    })
    
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

// exports Data
module.exports = router;



