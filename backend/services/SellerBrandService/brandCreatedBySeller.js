import express from 'express';
import { Brand } from '../../model/model.js';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sellerBrand'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Timestamp to avoid conflicts
  },
});

// Multer configuration with file filter for JPEG and PNG
const uploads = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .png, and .webp files are supported'), false);
    }
  },
}).single('logo');
 // The field name for the uploaded file is 'logo'

// Async function to handle the seller brand upload
const brandCreatedBySeller = async (req, res) => {
  const { userId } = req.user; // Ensure user is authenticated

  uploads(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }

    const { name, slug, description, seoTags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      // Check if the brand with the same slug exists
      const existingBrand = await Brand.findOne({ slug });
      if (existingBrand) {
        return res.status(400).json({ message: 'Brand with this slug already exists.' });
      }

      // Create a new brand object
      const newBrand = new Brand({
        name,
        slug,
        description,
        createdBy: 'seller',
        creatorId: userId,
        logo: `/uploads/sellerBrand/${req.file.filename}`,
        seoTags: {
          title: seoTags.title,
          description: seoTags.description,
          keywords: seoTags.keywords.split(','), // Assuming keywords are comma-separated
        },
        isActive: true,
        status: 'pending',
        official: true,
      });

      // Save the new brand to the database
      const savedBrand = await newBrand.save();

      // Respond with success
      return res.status(201).json({
        message: 'Brand uploaded successfully',
        brand: savedBrand,
      });
    } catch (error) {
      console.error('Error uploading brand:', error);
      return res.status(500).json({ message: 'Server error, please try again later.' });
    }
  });
};

// Function to fetch all brands created by sellers, but only those created by the authenticated seller
const getSellerCreatedBrands = async (req, res) => {
  const { userId } = req.user;

  try {
    const sellerBrands = await Brand.find({ createdBy: 'seller', creatorId: userId });

    if (!sellerBrands.length) {
      // Return a success response with an empty array if no brands exist
      return res.status(200).json({
        message: 'No brands found created by this seller.',
        brands: [],
      });
    }

    return res.status(200).json({
      message: 'Seller brands retrieved successfully',
      brands: sellerBrands,
    });
  } catch (error) {
    console.error('Error fetching seller brands:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};
const getSellerCreatedVerifiedBrands = async (req, res) => {
  const { userId } = req.user;

  try {
    // Fetch brands created by the seller with status 'verified'
    const sellerBrands = await Brand.find({
      createdBy: 'seller', // Filter brands created by a seller
      creatorId: userId, // Match the seller's user ID
      status: 'verified', // Only include verified brands
    });

    if (!sellerBrands.length) {
      // Return a success response with an empty array if no verified brands exist
      return res.status(200).json({
        message: 'No verified brands found created by this seller.',
        brands: [],
      });
    }

    return res.status(200).json({
      message: 'Verified seller brands retrieved successfully',
      brands: sellerBrands,
    });
  } catch (error) {
    console.error('Error fetching verified seller brands:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export { brandCreatedBySeller, getSellerCreatedBrands,getSellerCreatedVerifiedBrands };