const Inventory = require("../models/inventoryModel");
const sendEmail=require("../services/emailService");
const dotenv = require("dotenv");
require("dotenv").config();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS;
const COMPANY_NUMBER = process.env.COMPANY_NUMBER;

// Add new inventory item to the inventory database
exports.addNewInventoryItem = async (req, res) => {
  try {
    const { itemId, itemName, quantity, wholesaleUnitPrice, valueAddedPrice } = req.body;

    // Log the received data for debugging purposes
    console.log(req.body);

    // Create an array to hold missing fields
    const missingFields = [];
    if (!itemId) missingFields.push("itemId");
    if (!itemName) missingFields.push("itemName");
    if (!quantity) missingFields.push("quantity");
    if (wholesaleUnitPrice === undefined || wholesaleUnitPrice === null) missingFields.push("wholesaleUnitPrice");
    if (valueAddedPrice === undefined || valueAddedPrice === null) missingFields.push("valueAddedPrice");

    // If missing fields, return error
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "The following fields are required",
        missingFields
      });
    }

    // Validate numerical values for wholesaleUnitPrice, valueAddedPrice, and quantity
    const numQuantity = parseFloat(quantity);
    const numWholesaleUnitPrice = parseFloat(wholesaleUnitPrice);
    const numValueAddedPrice = parseFloat(valueAddedPrice);

    if (isNaN(numQuantity) || isNaN(numWholesaleUnitPrice) || isNaN(numValueAddedPrice)) {
      return res.status(400).json({
        message: "Quantity, wholesale unit price, and value-added price must be numbers"
      });
    }

    // Create new inventory item object to store data
    const newInventoryItem = new Inventory({
      itemId,
      itemName,
      quantity: numQuantity,
      wholesaleUnitPrice: numWholesaleUnitPrice,
      valueAddedPrice: numValueAddedPrice
    });

    await newInventoryItem.save();

    // Send email notification to the assigned admin or user
    const newInventoryEmailSubject = "New Inventory Item Added";
    const newInventoryEmailText = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Inventory Item Added</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          width: 90%;
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }
        .header {
          background-color: #0044cc;
          color: #ffffff;
          padding: 15px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        h1 {
          color: white;
          font-size: 28px;
          margin-top: 0;
          font-weight: bold;
          border-bottom: 3px solid #0044cc;
          padding-bottom: 10px;
        }
        p {
          line-height: 1.6;
          font-size: 16px;
          margin: 0 0 15px;
        }
        table.details {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        table.details th, table.details td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        table.details th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #777;
          text-align: center;
        }
        .footer a {
          color: #0044cc;
          text-decoration: none;
        }
        .footer hr {
          border: 0;
          height: 1px;
          background: #ddd;
          margin: 20px 0;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <div class="header">
          <h1>New Inventory Item Added</h1>
        </div>
        
        <p>Dear Team,</p>
        
        <p>We are pleased to inform you that a new inventory item has been added to the Wash Station inventory. Below are the details of the newly added item:</p>
        
        <table class="details">
          <tr>
            <th>Item ID</th>
            <td>${itemId}</td>
          </tr>
          <tr>
            <th>Item Name</th>
            <td>${itemName}</td>
          </tr>
          <tr>
            <th>Quantity</th>
            <td>${numQuantity}</td>
          </tr>
          <tr>
            <th>Wholesale Unit Price</th>
            <td>Rs.${numWholesaleUnitPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Value Added Price</th>
            <td>Rs.${numValueAddedPrice.toFixed(2)}</td>
          </tr>
        </table>
        
        <p>If you have any questions or need further information, please feel free to contact us.</p>
        
        <p>Best regards,</p>
        <p>The Wijeboy Technology Team</p>
        
        <div class="footer">
          <hr>
          <p>Wijeboy Technology<br>
            ${COMPANY_ADDRESS}<br>
            ${COMPANY_NUMBER}<br>
            <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
        </div>
      </div>
      </body>
      </html>
    `;

    await sendEmail(ADMIN_EMAIL, newInventoryEmailSubject, newInventoryEmailText);

    res.status(201).json({ message: "New inventory item added successfully!" });
  } catch (error) {
    console.error("Error adding new inventory item:", error);
    res.status(500).json({ message: "Failed to add new inventory item." });
  }
};


//Delete an inventory item from the inventory database
exports.deleteInventoryItem=async(req,res)=>{
    const InventoryItemId=req.params.id;

    await Inventory.findByIdAndDelete(InventoryItemId)
    .then(()=>{
        res.status(200).json({message:"Inventory item deleted successfully!"});
    }).catch((error)=>{
        res.status(500).json({message:"Failed to delete inventory item."});
    })
};

//Get all inventory items from the inventory database
exports.getAllInventoryItems=async(req,res)=>{
    const Wijeboytech=await Inventory.find()
    .then((Wijeboytech)=>{
        res.status(200).json(Wijeboytech);
    }).catch((error)=>{
        res.status(500).json({message:"Failed to get inventory items."});
    })
};

//Get single inventory item from the inventory database
exports.getInventoryItemById=async(req,res)=>{

    const InventoryItemId = req.params.id;
try {
   const inventoryItem = await Inventory.findById(InventoryItemId);
   if (!inventoryItem) 
    return res.status(404).json({ message: "Inventory item not found!" });
   res.json(inventoryItem);
} catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Failed to get inventory item." });
}
};


//Update an inventory item in the inventory database
exports.updateInventoryItem=async(req,res)=>{
    
       const inventoryItemId = req.params.id;
        const { itemId, itemName, quantity, wholesaleUnitPrice, valueAddedPrice } = req.body;
        
        //Validate input
        if (!(itemId && itemName && quantity && wholesaleUnitPrice && valueAddedPrice)) {
          return res.status(400).json({ message: "Required fields: itemId, item, quantity, wholesaleUnitPrice, valueAddedPrice" });
        }


        try{
            const InventoryItem = await Inventory.findById(inventoryItemId);

            if(!InventoryItem){
                return res.status(404).json({ message: "Inventory item not found!" });
            }
            //Update Inventory item
            const updatedInventoryItem =  await Inventory.findByIdAndUpdate(
              { _id: inventoryItemId },
              {
                itemId,
                itemName,
                quantity,
                wholesaleUnitPrice,
                valueAddedPrice,
              }
            );

            if (updatedInventoryItem.n === 0) {
              return res.status(404).json({ message: "Inventory item not found!" });
            } else if (updatedInventoryItem.nModified > 0) {
            //Send email notification to  assigned admin or user
            const updateInventoryEmailSubject = "Inventory Item Updated";
            const emailText = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inventory Item Added</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      width: 90%;
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }
    .header {
      background-color: #0044cc;
      color: #ffffff;
      padding: 15px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    h1 {
      color: white;
      font-size: 28px;
      margin-top: 0;
      font-weight: bold;
      border-bottom: 3px solid #0044cc;
      padding-bottom: 10px;
    }
    p {
      line-height: 1.6;
      font-size: 16px;
      margin: 0 0 15px;
    }
    table.details {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table.details th, table.details td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    table.details th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #777;
      text-align: center;
    }
    .footer a {
      color: #0044cc;
      text-decoration: none;
    }
    .footer hr {
      border: 0;
      height: 1px;
      background: #ddd;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${itemName} Inventory Item Updated</h1>
    </div>
    
    <p>Dear Team,</p>
    
   <p>We are pleased to inform you that an existing inventory item(${itemName}) has been updated in the Wash Station inventory. Below are the details of the updated item:</p>

    
    <table class="details">
      <tr>
        <th>Item ID</th>
        <td>${itemId}</td>
      </tr>
      <tr>
        <th>Item Name</th>
        <td>${itemName}</td>
      </tr>
      <tr>
        <th>Quantity</th>
        <td>${quantity}</td>
      </tr>
      <tr>
        <th>Wholesale Unit Price</th>
        <td>Rs.${wholesaleUnitPrice.toFixed(2)}</td>
      </tr>
      <tr>
        <th>Value Added Price</th>
        <td>Rs.${valueAddedPrice.toFixed(2)}</td>
      </tr>
    </table>
    
    <p>If you have any questions or need further information, please feel free to contact us.</p>
    
    <p>Best regards,</p>
    <p>The Wijeboy Technology Team</p>
    
    <div class="footer">
      <hr>
      <p>Wijeboy Technology<br>
         ${COMPANY_ADDRESS}<br>
         ${COMPANY_NUMBER}<br>
         <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
`;


            await sendEmail(ADMIN_EMAIL, updateInventoryEmailSubject, emailText);
            res.status(200).json({ message: "Inventory item updated successfully!" });

        
          } else {
            return res.status(200).json({ message: "No changes detected. Inventory item already has the provided details." });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      };