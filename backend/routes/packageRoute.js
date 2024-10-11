const express =require("express");
const router=express.Router();
const packageController=require("../controllers/packageController");

//Add new package to the package database
router.route("/add-package").post(packageController.addNewPackage);

//Delete a package from the package database
router.route("/delete-package/:id").delete(packageController.deletePackage);

//Get all packages from the package database
router.route("/get-packages").get(packageController.getAllPackages);

//Get single package from the package database
router.route("/get-package/:id").get(packageController.getPackageById);

//Update an package in the package database
router.route("/update-package/:id").put(packageController.updatePackage);

module.exports=router;