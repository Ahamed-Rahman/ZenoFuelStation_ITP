// backend/utils/sequenceUtils.js
const ShopInventory = require('../models/ShopInventory');

// Function to generate the next sequential ID
const getNextSequentialId = async () => {
  const result = await ShopInventory.aggregate([
    { $sort: { sequentialId: -1 } },  // Sort by sequentialId in descending order
    { $limit: 1 }                     // Limit to the top 1 result
  ]);

  return result.length > 0 ? result[0].sequentialId + 1 : 1;
};

module.exports = { getNextSequentialId };
