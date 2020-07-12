import addDays from 'date-fns/addDays';
import { v4 as uuid } from 'uuid';

export enum ERating {
  AGAIN = 0, // Complete blackout
  VERYHARD = 1, // Incorrect response; but the correct one remembered
  HARD = 2, // incorrect response; where the correct one seemed easy to recall
  GOOD = 3, // correct response recalled with serious difficulty
  EASY = 4, // correct response after a hesitation
  VERYEASY = 5, // perfect response
}

const MIN_EFACTOR_VALUE = 1.3;

export default class Item {
  id: string = uuid();

  EFactor = 2.5;

  intervalFactor = 0;

  interval = 1;

  howManyTimesWasViewed = 0;

  lastReviewed: Date | null = null;

  dueDate: Date | null = null;

  rating: ERating = ERating.AGAIN;

  constructor(efactor?: number) {
    this.EFactor = efactor || this.EFactor;
  }

  I = (n: number): number => {
    switch (n) {
      case 1:
        return 1;
      case 2:
        return 6;
      default:
        return Math.round(this.I(n - 1) * this.EFactor);
    }
  };

  getHowManyTimesWasViewed(): number {
    return this.howManyTimesWasViewed;
  }

  review(rating: ERating): number {
    this.rating = rating;
    this.lastReviewed = new Date();
    this.howManyTimesWasViewed += 1;
    this.intervalFactor += 1;

    if (rating >= ERating.GOOD) {
      let EF =
        this.EFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
      if (EF < MIN_EFACTOR_VALUE) {
        EF = MIN_EFACTOR_VALUE;
      }
      this.EFactor = EF;
    }
    // restart memo
    if (rating < ERating.GOOD) {
      this.intervalFactor = 1;
    }

    this.interval = this.I(this.intervalFactor);
    this.dueDate = addDays(this.lastReviewed, this.interval);

    return this.interval;
  }
}
