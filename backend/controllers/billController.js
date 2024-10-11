const express = require("express");
const router = express.Router();
const Bill = require("../models/billModel");
const Inventory = require("../models/inventoryModel");
const sendEmail = require("../services/emailService");
const dotenv = require("dotenv");
require("dotenv").config();
const mongoose = require('mongoose'); 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS;
const COMPANY_NUMBER = process.env.COMPANY_NUMBER;




//Add new bill to the bill database

exports.addNewBill = async (req, res) => {

    try{
        const { 
            customerName, 
            billId, 
            packageName, 
            packagePrice, 
            extraServices , // Default to an empty array if not provided
            customerEmail, 
            items = [] 
        } = req.body;

        //log the received data to debugging purpose
        console.log(req.body);
         
        //Create an array for hold an error for missing fields
        const missingFields = [];

        // Check each field and push to missingFields array if not provided
        if (!customerName) missingFields.push("customerName");
        if (!billId) missingFields.push("billId");
        if (!packageName) missingFields.push("packageName");
        if (packagePrice === undefined) missingFields.push("packagePrice");
        if (!customerEmail) missingFields.push("customerEmail");    

        // If there are any missing fields, return a detailed message
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "The following fields are required", 
                missingFields 
            });
        }
           // Validate the email format
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (!emailRegex.test(customerEmail)) {
               return res.status(400).json({ 
                   message: "Invalid email format" 
               });
           }

        // Calculate the total
        const extraServicesTotal = extraServices.reduce((sum, service) => sum + (service.servicePrice || 0), 0);
        const total = packagePrice + extraServicesTotal;

        // Create a new bill with the calculated total
        const newBill = new Bill({
            customerName,
            billId,
            packageName,
            packagePrice,
            Total: total, // Set the total as the calculated total
            extraServices,
            customerEmail,
            items // Include items in the new bill
        });

        await newBill.save();   

        res.status(201).json({ message: "New bill added successfully!" });
        }catch(error){
            console.log(error.message);
            res.status(500).json({ message: "Failed to add new bill." });
        }
    };

    //Delete a bill from the bill database
   exports.deleteBill = async (req, res) => {

        const billId = req.params.id;

        await Bill.findByIdAndDelete(billId)
        .then(() => {
            res.status(200).json({ message: "Bill deleted successfully!" });
            console.log("Bill deleted successfully!");
        })
        .catch((error) => {
            console.log(error.message);
            res.status(500).json({ message: "Failed to delete bill." });
        });
    };

    //Get all bills from the bill database

    exports.getAllBills = async (req, res) => {
        try{
            const bills = await Bill.find();
            res.json(bills);
        }catch(error){  
            res.status(500).json({message:"Failed to get bills."});
            console.log(error.message);
        }

        
    };

    //Get a single bill from the bill database

    exports.getBillById = async (req, res) => {

        const billId = req.params.id;
        try{
            const bill = await Bill.findById(billId);
            if(!bill){
                return res.status(404).json({message:"Bill not found!"});
            }
            else{
                res.status(200).json(bill);
            }
        }
        catch(error){
            res.status(500).json({message:"Failed to get bill."});
            console.log(error.message);
        }


    };

    //Update an bill in the bill database
    exports.updateBill = async (req, res) => {
        
        const billid = req.params.id;
        const { customerName, packageName, packagePrice, extraServices, customerEmail, items = [] } = req.body;
        
        //Validate inputs
        if(!(customerName && packageName && packagePrice && customerEmail )){
            return res.status(400).json({message: "Required fields: customerName, packageName, packagePrice, customerEmail"});
        }

        try{
            //Check if bill avalible or not
            const Upbill = await Bill.findById(billid);
            if(!Upbill){
                return res.status(404).json({message:"Bill not found!"});
            }
            // Validate the email format
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (!emailRegex.test(customerEmail)) {
               return res.status(400).json({ 
                   message: "Invalid email format" 
               });
           }
            
         // Calculate the total
        const extraServicesTotal = extraServices.reduce((sum, service) => sum + (service.servicePrice || 0), 0);
        const total = packagePrice + extraServicesTotal;
            //Update a bill
            const updatedBill = await Bill.findByIdAndUpdate(billid, {
                customerName,
                packageName,
                packagePrice,
                Total: total,
                extraServices,
                customerEmail,
                createdDate: Date.now(),  // Changed to updatedDate
                items
            }, { new: true });


        if (!updatedBill) {
            return res.status(404).json({ message: "Bill not found!" });
        }

        {
            console.log("Bill updated successfully!");
            res.status(200).json({ message: "Bill updated successfully!" });
            }
    
        }catch(error){
            console.log(error.message);
            res.status(500).json({message:"Failed to update bill."});
        }
    }; 



// Generate the bill and update inventory
exports.generateBillAndUpdateInventory = async (req, res) => {
    try {
      // Fetch the bill details
      const bill = await Bill.findById(req.params.id);
      
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }
  
      // Check if items exist in the bill
      if (!bill.items || bill.items.length === 0) {
        return res.status(400).json({ message: 'No items found in the bill' });
      }
  
      // Extract items and their quantities
      const items = bill.items; // Assuming `items` is an array of objects with `itemName` and `quantity`
      
      // Update inventory
      for (let item of items) {
        const inventoryItem = await Inventory.findOne({ itemName: item.itemName });
  
        if (!inventoryItem) {
          return res.status(404).json({ message: `Inventory item not found: ${item.itemName}` });
        }
  
        if (inventoryItem.quantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient quantity for item: ${item.itemName}` });
        }
  
        // Decrease quantity
        await Inventory.findOneAndUpdate(
          { itemName: item.itemName }, 
          { $inc: { quantity: -item.quantity } }
        );
      }
  
      // Return success response
      res.json({ message: 'Bill generated and inventory updated successfully' });
    } catch (error) {
      console.error("Error in generateBillAndUpdateInventory:", error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };

 // //////////////////////////////////////////
// Send bill email
exports.sendBillEmail = async (req, res) => {
  try {
    const { billId, customerEmail } = req.body;

    // Validate that billId and customerEmail are provided
    if (!billId || !customerEmail) {
      return res.status(400).json({ message: 'Missing bill ID or customer email' });
    }

    // Check if billId is an ObjectId or a custom field
    let bill;

    try {
      // Try to find the bill by ObjectId (_id)
      bill = await Bill.findById(billId);
    } catch (e) {
      // If billId is not an ObjectId, try finding by custom billId field
      bill = await Bill.findOne({ billId: billId });
    }

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Compose the email content
    const emailSubject = 'Your Bill Details';
    const emailText = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background-color: #0044cc; padding: 20px; color: #ffffff; text-align: center; }
        .header img { width: 150px; }
        .content { padding: 20px; }
        .content h1 { color: #333333; font-size: 24px; margin-top: 0; }
        .content p { font-size: 16px; line-height: 1.5; color: #555555; margin: 0 0 15px; }
        .bill-details { background-color: #f9f9f9; border: 1px solid #dddddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .bill-details h2 { font-size: 20px; margin-top: 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { border: 1px solid #dddddd; padding: 10px; text-align: left; }
        .details-table th { background-color: #f2f2f2; }
        .extra-services { margin-top: 20px; }
        .extra-services h3 { margin-top: 0; color: #0044cc; }
        .extra-services p { margin: 5px 0; }
        .total-price { font-size: 24px; font-weight: bold; color: #0044cc; }
        .footer { background-color: #333333; padding: 10px; text-align: center; color: #ffffff; }
        .footer p { font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.jpg" alt="Company Logo">
          <h1>Your Bill Details</h1>
        </div>
        <div class="content">
          <h1>Hello ${bill.customerName},</h1>
          <p>Thank you for using our services. Below are the details of your recent bill:</p>
          <div class="bill-details">
            <h2>Bill Summary</h2>
            <table class="details-table">
              <tr>
                <th>Bill ID</th>
                <td>${bill.billId}</td>
              </tr>
              <tr>
                <th>Package Name</th>
                <td>${bill.packageName}</td>
              </tr>
              <tr>
                <th>Package Price</th>
                <td>$${bill.packagePrice.toFixed(2)}</td>
              </tr>
            </table>
            <div class="extra-services">
              <h3>Extra Services</h3>
              ${bill.extraServices.length > 0 ? bill.extraServices.map(service => `<p><strong>${service.serviceName}:</strong> $${service.servicePrice.toFixed(2)}</p>`).join('') : '<p>No extra services.</p>'}
            </div>
            <p class="total-price">Total Price: $${bill.Total.toFixed(2)}</p>
          </div>
          <p>If you have any questions or need further information, please feel free to contact us.</p>
          <p>Thank you for using our services.</p>
        </div>
        <div class="footer">
          <p>Wash Station Plus<br>
            ${COMPANY_ADDRESS}<br>
            ${COMPANY_NUMBER}<br>
            <a href="mailto:${COMPANY_EMAIL}" style="color: #ffffff;">${COMPANY_EMAIL}</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send the email
    await sendEmail(customerEmail, emailSubject, emailText);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};

 
/*
// Send bill email
exports.sendBillEmail = async (req, res) => {
    try {
      const { billId, customerEmail } = req.body;
  
      // Fetch the bill details
      const bill = await Bill.findById(billId);
      
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }
  
      // Calculate the total price
      const totalExtraServicesPrice = bill.extraServices.reduce((total, service) => total + service.servicePrice, 0);
      const totalPrice = bill.packagePrice + totalExtraServicesPrice;
  
      // Compose the email content
      const emailSubject = 'Your Bill Details';
      const emailText = `Dear ${bill.customerName},\n\nHere are the details of your bill:\n\nBill ID: ${bill.billId}\nPackage Name: ${bill.packageName}\nPackage Price: $${bill.packagePrice}\nExtra Services: ${bill.extraServices.map(service => `${service.serviceName}: $${service.servicePrice}`).join('\n')}\nItems: ${bill.items.map(item => `${item.itemName}: Quantity ${item.quantity}`).join('\n')}\n\nTotal Price: $${totalPrice}\n\nThank you for using our services.\n\nBest regards,\nWash Station Plus`;
  
      // Send the email
      await sendEmail(customerEmail, emailSubject, emailText);
  
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email." });
    }
  };
*/

