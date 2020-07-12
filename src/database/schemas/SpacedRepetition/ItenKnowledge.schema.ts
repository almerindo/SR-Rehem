/* eslint-disable @typescript-eslint/camelcase */
import mongoose from 'mongoose';

export enum ERating {
  AGAIN = 0, // Complete blackout
  VERYHARD = 1, // Incorrect response; but the correct one remembered
  HARD = 2, // incorrect response; where the correct one seemed easy to recall
  GOOD = 3, // correct response recalled with serious difficulty
  EASY = 4, // correct response after a hesitation
  VERYEASY = 5, // perfect response
}

export interface IItemKnowledge extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  e_factor: number;

  interval_factor: number;

  interval: number;

  how_many_times_was_viewed: number;

  last_reviewed: Date | null;

  due_date: Date | null;

  rating: ERating;

  user_id: mongoose.Types.ObjectId;
}

export const ItemKnowledgeSchema = new mongoose.Schema(
  {
    e_factor: {
      type: Number,
      required: true,
      default: 2.5,
    },

    interval_factor: {
      type: Number,
      required: true,
      default: 0,
    },

    interval: {
      type: Number,
      required: true,
      default: 1,
    },

    how_many_times_was_viewed: {
      type: Number,
      required: true,
      default: 1,
    },

    last_reviewed: {
      type: Date,
      required: false,
    },

    due_date: {
      type: Date,
      required: false,
    },

    rating: {
      type: ERating,
      required: true,
      default: ERating.AGAIN,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deleted_at: {
      type: Date,
      required: false,
      default: null,
    },
  },
  { collection: 'ItemKnowledge', versionKey: false },
);
