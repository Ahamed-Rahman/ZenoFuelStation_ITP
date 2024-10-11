const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

//Add new bill to the bill database
router.route("/add-bill").post(billController.addNewBill);

//Delete a bill from the bill database
router.route("/delete-bill/:id").delete(billController.deleteBill);

//Get all bills from the bill database
router.route("/get-bills").get(billController.getAllBills);

//Get a single bill from the bill database
router.route("/get-bill/:id").get(billController.getBillById);

//Update an bill in the bill database
router.route("/update-bill/:id").put(billController.updateBill);

//Generate the bill and update inventory
router.route("/generate-bill/:id").post(billController.generateBillAndUpdateInventory);

//Send bill email
router.route("/send-bill-email").post(billController.sendBillEmail);

module.exports = router;