const Supplier = require('../models/Supplier');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  const { companyName, email } = req.body;

  try {
    const newSupplier = new Supplier({ companyName, email });
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a supplier by ID
exports.updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { companyName, email } = req.body;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { companyName, email },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json(updatedSupplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a supplier by ID
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
