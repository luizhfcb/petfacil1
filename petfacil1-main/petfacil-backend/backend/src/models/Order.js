const mongoose = require('mongoose');

// Cada item guarda um "retrato" do produto no momento da compra (nome e preço),
// assim o histórico não muda se o catálogo for atualizado depois.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    itemCount: { type: Number, required: true },
    total: { type: Number, required: true },
    // Pagamento no caixa, na retirada (como no app)
    paymentMethod: { type: String, default: 'Retirada na loja' },
    status: { type: String, enum: ['Registrado', 'Pronto para retirada', 'Retirado', 'Cancelado'], default: 'Registrado' },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.purchaseDate = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);
