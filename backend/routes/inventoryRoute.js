const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");

//Add new inventory item to ths inventory database
//router.post('/add-inventory-item', InventoryController.addNewInventoryItem);
router.route("/add-inventory-item").post(InventoryController.addNewInventoryItem);

//Delete all inventory item from the inventory database
router.route("/delete-inventory-item/:id").delete(InventoryController.deleteInventoryItem);

//Get all inventory items from the inventory database
router.route("/get-inventory-items").get(InventoryController.getAllInventoryItems);

//Get single inventory item from the inventory database
router.route("/get-inventory-item/:id").get(InventoryController.getInventoryItemById);

//Update an inventory item in the inventory database
router.route("/update-inventory-item/:id").put(InventoryController.updateInventoryItem)


module.exports = router;
