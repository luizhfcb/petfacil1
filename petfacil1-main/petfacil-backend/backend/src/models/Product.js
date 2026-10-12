const mongoose = require('mongoose');

const PRODUCT_TYPES = ['Ração', 'Brinquedo', 'Higiene', 'Acessório'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    currentPrice: { type: Number, required: true, min: 0 },
    promotionalPrice: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: PRODUCT_TYPES },
    description: { type: String, required: true },
    expirationDate: { type: String, required: true },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
module.exports.PRODUCT_TYPES = PRODUCT_TYPES;
