/* eslint-disable max-classes-per-file */
export class Content {
  id: string;

  data: {};

  constructor(id: string, data: {}) {
    this.id = id;
    this.data = data;
  }
}
export enum ERating {
  EASY,
  GOOD,
  HARD,
  AGAIN,
}
export enum EMode {
  LEARNING,
  REVIEWING,
  LAPSED,
}

export class ILearningState {
  id = '';

  mode: EMode = EMode.LEARNING;

  consecutiveCorrect = 0; // 0 <= consecutiveCorrect < 2, int

  lastReviewed?: Date;
}
export class IReviewingState {
  id = '';

  mode: EMode = EMode.REVIEWING;

  factor = 0.0; // float

  lapses = 0; // int

  interval = 0; // days since lastReviewed

  lastReviewed: Date = new Date();
}

export class ILapsedState {
  id = '';

  mode: EMode = EMode.LAPSED;

  consecutiveCorrect = 0;

  factor = 0;

  lapses = 0;

  interval = 0;

  lastReviewed: Date = new Date();
}

export enum EContentSchedule {
  LATER,
  DUE,
  OVERDUE,
  LEARNING,
}

export class Review {
  id: string;

  data: {};

  whenItWasReviewd: Date;

  rating: ERating;

  constructor(id: string, data: {}, whenItWasReviewd: Date, rating: Rating) {
    this.id = id;
    this.data = data;
    this.rating = rating;
    this.whenItWasReviewd = whenItWasReviewd;
  }
}

export interface ISummaryStatistics {
  later: number;
  due: number;
  overdue: number;
  learning: number;
}

export interface IContentsSchedule {
  later: Array<string>;
  due: Array<string>;
  overdue: Array<string>;
  learning: Array<string>;
}
