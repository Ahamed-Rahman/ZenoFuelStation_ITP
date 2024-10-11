const Package = require("../models/packageModel");
const sendEmail=require("../services/emailService");
const dotenv = require("dotenv");
require("dotenv").config();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS;
const COMPANY_NUMBER = process.env.COMPANY_NUMBER;

// Add new package to the package database
exports.addNewPackage = async (req, res) => {
  try {
    const { packageName, packageDescription, services, items, packagePrice, packageImage } = req.body;

    // Log the received data for debugging
    console.log(req.body);

    // Create an array to hold error messages for missing fields
    const missingFields = [];

    // Check each field and push to missingFields array if not provided
    if (!packageName) missingFields.push("packageName");
    if (!packageDescription) missingFields.push("packageDescription");
    if (!packagePrice) missingFields.push("packagePrice");

    // If there are any missing fields, return a detailed message
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "The following fields are required",
        missingFields
      });
    }

    // Convert packagePrice to a number
    const price = parseFloat(packagePrice);
    if (isNaN(price)) {
      return res.status(400).json({ message: "Invalid packagePrice value" });
    }

    const newPackage = new Package({
      packageName,
      packageDescription,
      services,
      items,
      packagePrice: price, // Use the converted price here
      packageImage
    });

    // Save the new package
    await newPackage.save();

    // Send email to admin
    const packageemailsubject = "New Package Added";
    const packageemailText = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New WASH STATION Package Added</title>
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
    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    ul li {
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    ul li:last-child {
      border-bottom: none;
    }
    .image-container {
      margin: 20px 0;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .call-to-action {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 20px;
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      background-color: #0044cc;
      text-decoration: none;
      border-radius: 5px;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Package Added</h1>
    </div>
    
    <p>Dear Team,</p>
    
    <p>We are thrilled to announce that a new package has been successfully added to our WASH STATION offerings. Here are the details of the new package:</p>
    
    <ul>
      <li><strong>Package Name:</strong> ${packageName}</li>
      <li><strong>Description:</strong> ${packageDescription}</li>
      <li><strong>Services:</strong> ${services.join(", ")}</li>
      <li><strong>Price:</strong> Rs.${price.toFixed(2)}</li>
    </ul>
    
    <div class="image-container">
      <p><strong>Package Image:</strong></p>
      <img src="${packageImage}" alt="Package Image"/>
    </div>
    
    <p>If you have any questions or need further information, please feel free to contact us.</p>
    
    <a href="mailto:${COMPANY_EMAIL}" class="call-to-action">Contact Us</a>
    
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
</html>`;

    await sendEmail(ADMIN_EMAIL, packageemailsubject, packageemailText);

    res.status(201).json({ message: "New package added successfully!" });
  } catch (error) {
    console.error("Error adding new package:", error);
    res.status(500).json({ message: "Failed to add new package." });
  }
};


// Delete a package from the package database
exports.deletePackage = async (req, res) => {
    const packageId = req.params.id;

    await Package.findByIdAndDelete(packageId)
        .then(() => {
            res.status(200).json({ message: "Package deleted successfully!" });
            console.log("Package deleted successfully!");
        })
        .catch((error) => {
            console.log(error.message);
            res.status(500).json({ message: "Failed to delete package." });
        });
};

//Get all packages from the package database
exports.getAllPackages = async (req, res) => {
    try{
        const packages = await Package.find();
        res.status(200).json(packages);
    }catch(error){  
        res.status(500).json({message:"Failed to get packages."});
    }
};

//Get single package from the package database
exports.getPackageById = async (req, res) =>{
    const packageId =req.params.id;
    try{
      const package = await Package.findById(packageId);
      if(!package){
        return res.status(404).json({message:"Package not found!"});
      }
      else{
        res.status(200).json(package);
      }
  
    }catch(error){
      res.status(500).json({message:"Failed to get package."});
      console.log(error.message);
      
    }
  };
// Update a package
exports.updatePackage = async (req, res) => {
  const packageId = req.params.id;
  const { packageName, packageDescription, services, items, packagePrice, packageImage } = req.body;

  // Validate inputs
  if (!(packageName && packageDescription && packagePrice)) {
      return res.status(400).json({ message: "Required fields: packageName, packageDescription, packagePrice" });
  }

  try {
      // Check if package exists in the database
      const existingPackage = await Package.findById(packageId);

      if (!existingPackage) {
          return res.status(404).json({ message: "Package does not exist!" });
      }

      // Update package details
      existingPackage.packageName = packageName;
      existingPackage.packageDescription = packageDescription;
      existingPackage.services = services;
      existingPackage.items = items;
      existingPackage.packagePrice = packagePrice;
      existingPackage.packageImage = packageImage;

      // Save updated package
      const updatedPackage = await existingPackage.save();

      // Check if packagePrice is a valid number before using toFixed
      let formattedPrice;
      if (typeof packagePrice === 'number' && !isNaN(packagePrice)) {
          formattedPrice = packagePrice.toFixed(2);
      } else {
          console.error('Invalid packagePrice:', packagePrice);
          return res.status(400).json({ message: "Invalid package price" });
      }

      // Send email to admins
      const packageEmailSubject = `${packageName} Package Updated`;
      const packageEmailText = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WASH STATION Package Updated</title>
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
  h1 {
    margin: 0;
    font-size: 24px;
  }
  // ... (rest of the email HTML styles)
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${packageName} Package Updated</h1>
  </div>
  
  <p>Dear Team,</p>
  
  <p>We are pleased to inform you that a package has been successfully updated in our WASH STATION offerings. Below are the updated details of the package:</p>

  <ul>
    <li><strong>Package Name:</strong> ${packageName}</li>
    <li><strong>Description:</strong> ${packageDescription}</li>
    <li><strong>Services:</strong> ${services}</li>
    <li><strong>Price:</strong> Rs.${formattedPrice}</li>
  </ul>
  
  <div class="image-container">
    <p><strong>Package Image:</strong></p>
    <img src="${packageImage}" alt="Package Image"/>
  </div>
  
  <p>If you have any questions or need further information, please feel free to contact us.</p>
  
  <a href="mailto:${COMPANY_EMAIL}" class="call-to-action">Contact Us</a>
  
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

      await sendEmail(ADMIN_EMAIL, packageEmailSubject, packageEmailText);

      // Send a single response to the client
      res.status(200).json({ message: "Package updated successfully!", updatedPackage });
      
  } catch (error) {
      console.error("Error updating package:", error.message);
      return res.status(500).json({ message: "Failed to update package." });
  }
};


