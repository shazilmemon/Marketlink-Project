import { Schema, model, Document } from 'mongoose';

export interface IAIMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt: Date;
}

const aiMessageSchema = new Schema<IAIMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'AIConversation', required: true },
  role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

export const AIMessage = model<IAIMessage>('AIMessage', aiMessageSchema);
