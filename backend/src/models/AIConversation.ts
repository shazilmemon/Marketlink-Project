import { Schema, model, Document } from 'mongoose';

export interface IAIConversation extends Document {
  userId: Schema.Types.ObjectId;
  role: 'customer' | 'farmer';
  createdAt: Date;
  updatedAt: Date;
}

const aiConversationSchema = new Schema<IAIConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['customer', 'farmer'], required: true },
}, { timestamps: true });

export const AIConversation = model<IAIConversation>('AIConversation', aiConversationSchema);
