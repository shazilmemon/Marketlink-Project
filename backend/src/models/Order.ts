import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productNameSnapshot: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  marketId?: mongoose.Types.ObjectId;
  pickupDate: Date;
  pickupTime: string;
  pickupTimeSlot: string;
  items: IOrderItem[];
  products: IOrderItem[];
  subtotal: number;
  total: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  customerNotes?: string;
  farmerNotes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productNameSnapshot: { type: String, default: 'Farm Produce Item' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'kg' },
    unitPrice: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      index: true,
    },
    pickupDate: { type: Date, required: true, index: true },
    pickupTime: { type: String, default: '10:00 AM' },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: [
        'placed',
        'accepted',
        'ready',
        'completed',
        'cancelled',
        'PENDING',
        'CONFIRMED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'CANCELLED',
        'REJECTED',
        'EXPIRED',
      ],
      default: 'placed',
      index: true,
      set: (val: string) => val ? val.toLowerCase() : 'placed',
    },
    customerNotes: { type: String, default: '' },
    farmerNotes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual('products').get(function (this: any) {
  return this.items;
});

OrderSchema.virtual('totalAmount').get(function (this: any) {
  return this.total;
});

OrderSchema.virtual('pickupTimeSlot').get(function (this: any) {
  return this.pickupTime;
});

OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ farmerId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
