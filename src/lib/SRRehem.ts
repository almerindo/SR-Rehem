/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import {
  EMode,
  ERating,
  Review,
  Content,
  EContentSchedule,
  ILapsedState,
  ILearningState,
  IReviewingState,
  ISummaryStatistics,
  IContentsSchedule,
} from './Content';

interface IState {
  [key: string]: {
    [id: string]: ILapsedState | ILearningState | IReviewingState;
  };
}

export default class SRRehem {
  // contentState : ILearningState | IReviewingState | ILapsedState;
  INITIAL_FACTOR = 2500;

  INITIAL_DAYS_WITHOUT_JUMP = 4;

  INITIAL_DAYS_WITH_JUMP = 1;

  EASY_BONUS = 2;

  MAX_INTERVAL = 365;

  MIN_FACTOR = 0; // TODO

  MAX_FACTOR = Number.MAX_VALUE;

  contents: Set<Content> = new Set();

  reviews: Array<Review> = [];

  // cachedContentsSchedule: IContentsSchedule = {
  //   due: new Array<string>(),
  //   later: new Array<string>(),
  //   learning: new Array<string>(),
  //   overdue: new Array<string>(),
  // };

  cachedContentsSchedule: IContentsSchedule | null = null;

  state: any = {
    contentStates: [],
  };

  cacheContentSchedule: EContentSchedule | null = null;

  private initialContentState(id: string): ILearningState {
    return {
      id,
      mode: EMode.LEARNING,
      consecutiveCorrect: 0,
    };
  }

  private rebuild(): void {
    console.info('rebuilding state');
    const { contents } = this;
    const { reviews } = this;
    this.contents = new Set();
    this.reviews = [];

    contents.forEach(content => {
      this.addContent(content);
    });

    reviews.forEach(review => {
      this.addReview(review);
    });
  }

  // TODO verificar se o método está retornando corretamente
  private needsRebuild(lastReview: Review): boolean {
    this.reviews.forEach(review => {
      if (lastReview.whenItWasReviewd !== review.whenItWasReviewd) {
        return true;
      }
    });
    return false;
  }

  // assumes that the day starts at 3:00am in the local timezone
  private calculateDueDate(state: IReviewingState): Date {
    const result = new Date(state.lastReviewed);
    result.setHours(3, 0, 0);
    result.setDate(result.getDate() + Math.ceil(state.interval));
    return result;
  }

  private constrainWithin({
    min,
    max,
    n,
  }: {
    min: number;
    max: number;
    n: number;
  }): number {
    if (min > max) {
      throw new Error(`min > max: ${min}=min, ${max}=max`);
    }
    return Math.max(Math.min(n, max), min);
  }

  private dateDiffInDays(a: Date, b: Date): number {
    // adapted from http://stackoverflow.com/a/15289883/251162
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Disstate the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return (utc2 - utc1) / MS_PER_DAY;
  }

  private calculateDaysLate(state: IReviewingState, actual: Date): number {
    const expected = this.calculateDueDate(state);

    const daysLate = this.dateDiffInDays(actual, expected);

    if (daysLate < 0) {
      console.info('last review occured earlier than expected', {
        daysLate,
        actual,
        expected,
      });
      return 0;
    }

    return daysLate;
  }

  private applyToReviewingContentState(
    prev: IReviewingState,
    when: Date,
    rating: ERating,
  ): ILearningState | IReviewingState | ILapsedState {
    if (rating === ERating.AGAIN) {
      return {
        id: prev.id,

        mode: EMode.LAPSED,
        consecutiveCorrect: 0,
        factor: this.constrainWithin({
          min: this.MIN_FACTOR,
          max: this.MAX_FACTOR,
          n: prev.factor - 200,
        }),
        lapses: prev.lapses + 1,
        interval: prev.interval,
        lastReviewed: when,
      };
    }

    let factorAdj;
    let n;
    const daysLate = this.calculateDaysLate(prev, when);

    switch (rating) {
      case ERating.HARD:
        factorAdj = -150;
        n = (prev.interval + daysLate / 4) * 1.2;
        break;
      case ERating.GOOD:
        factorAdj = 0;
        n = ((prev.interval + daysLate / 2) * prev.factor) / 1000;
        break;
      case ERating.EASY:
        factorAdj = 150;
        n =
          (((prev.interval + daysLate) * prev.factor) / 1000) * this.EASY_BONUS;
        break;
      default:
        factorAdj = undefined;
        n = undefined;
        break;
    }

    const ival = this.constrainWithin({
      min: prev.interval + 1,
      max: this.MAX_INTERVAL,
      n,
    });

    if (!factorAdj || !ival) {
      throw new Error(`invalid rating: ${rating}`);
    }

    return {
      id: prev.id,

      mode: EMode.REVIEWING,
      factor: this.constrainWithin({
        min: this.MIN_FACTOR,
        max: this.MAX_FACTOR,
        n: prev.factor + factorAdj,
      }),
      lapses: prev.lapses,
      interval: ival,
      lastReviewed: when,
    };
  }

  // constants from Anki defaults
  // TODO(April 1, 2017) investigate rationales, consider changing them
  private applyToLearningContentState({
    prev,
    when,
    rating,
  }: {
    prev: ILearningState;
    when: Date;
    rating: ERating;
  }): ILearningState | IReviewingState | ILapsedState {
    if (
      rating === ERating.EASY ||
      (rating === ERating.GOOD && prev.consecutiveCorrect > 0)
    ) {
      return {
        id: prev.id,
        mode: EMode.REVIEWING,
        factor: this.INITIAL_FACTOR,
        lapses: 0,
        interval:
          prev.consecutiveCorrect > 0
            ? this.INITIAL_DAYS_WITHOUT_JUMP
            : this.INITIAL_DAYS_WITH_JUMP,
        lastReviewed: when,
      };
    }
    if (rating === ERating.AGAIN) {
      return {
        id: prev.id,

        mode: EMode.LEARNING,
        consecutiveCorrect: 0,
        lastReviewed: when,
      };
    }
    if (
      (rating === ERating.GOOD || rating === ERating.HARD) &&
      prev.consecutiveCorrect < 1
    ) {
      return {
        id: prev.id,
        mode: EMode.LAPSED,
        consecutiveCorrect: prev.consecutiveCorrect + 1,
        lastReviewed: when,
      };
    }
    throw new Error('logic error');
  }

  private applyToLapsedContentState(
    prev: ILapsedState,
    when: Date,
    rating: ERating,
  ): ILearningState | IReviewingState | ILapsedState {
    if (
      rating === ERating.EASY ||
      (rating === ERating.GOOD && prev.consecutiveCorrect > 0)
    ) {
      return {
        id: prev.id,

        mode: EMode.REVIEWING,
        factor: prev.factor,
        lapses: prev.lapses,
        interval:
          prev.consecutiveCorrect > 0
            ? this.INITIAL_DAYS_WITHOUT_JUMP
            : this.INITIAL_DAYS_WITH_JUMP,
        lastReviewed: when,
      };
    }
    return {
      id: prev.id,

      mode: EMode.LAPSED,
      factor: prev.factor,
      lapses: prev.lapses,
      interval: prev.interval,
      lastReviewed: when,
      consecutiveCorrect:
        rating === ERating.AGAIN ? 0 : prev.consecutiveCorrect + 1,
    };
  }

  private applyToContentState(
    prev: ILearningState | IReviewingState | ILapsedState,
    when: Date,
    rating: ERating,
  ): ILearningState | IReviewingState | ILapsedState {
    if (prev.lastReviewed != null && prev.lastReviewed > when) {
      const p = prev.lastReviewed.toISOString();
      const t = when.toISOString();
      throw new Error(
        `cannot apply review before current lastReviewed: ${p} > ${t}`,
      );
    }

    if (prev.mode === EMode.LEARNING) {
      console.info(EMode.LEARNING);
      return this.applyToLearningContentState({
        prev: prev as ILearningState,
        when,
        rating,
      });
    }
    if (prev.mode === EMode.REVIEWING) {
      console.info(EMode.REVIEWING);
      return this.applyToReviewingContentState(
        prev as IReviewingState,
        when,
        rating,
      );
    }
    if (prev.mode === EMode.LAPSED) {
      console.info(EMode.LAPSED);
      return this.applyToLapsedContentState(prev as ILapsedState, when, rating);
    }
    throw new Error(`invalid mode: ${prev.mode}`);
  }

  private applyReview(prev: IState, review: Review): IState {
    const { id } = review;
    const contentState = prev.contentStates[id];
    if (contentState == null) {
      throw new Error(
        `applying review to missing content: ${JSON.stringify(review)}`,
      );
    }

    const state = {
      contentStates: { ...prev.contentStates },
    };
    state.contentStates[id] = this.applyToContentState(
      contentState,
      review.whenItWasReviewd,
      review.rating,
    );

    return state;
  }

  private computeScheduleFromContentState(
    state: ILearningState | IReviewingState | ILapsedState,
    now: Date,
  ): EContentSchedule {
    console.info('COMPUTE CONTENTS3');
    console.info(state.mode);
    if (state.mode === EMode.LAPSED || state.mode === EMode.LEARNING) {
      return EContentSchedule.LEARNING;
    }
    if (state.mode === EMode.REVIEWING) {
      const diff = this.dateDiffInDays(
        this.calculateDueDate(state as IReviewingState),
        now,
      );
      if (diff < 0) {
        return EContentSchedule.LATER;
      }
      if (diff >= 0 && diff < 1) {
        return EContentSchedule.DUE;
      }
      if (diff >= 1) {
        return EContentSchedule.OVERDUE;
      }
    }
    throw new Error('unreachable');
  }

  private computeContentsSchedule(state: IState, now: Date): IContentsSchedule {
    const s: IContentsSchedule = {
      learning: new Array<string>(),
      later: new Array<string>(),
      due: new Array<string>(),
      overdue: new Array<string>(),
    };
    Object.keys(this.state.contentStates).forEach(contentId => {
      const contentState = this.state.contentStates[contentId];
      const index = this.computeScheduleFromContentState(contentState, now);

      switch (index) {
        case EContentSchedule.LATER:
          s.later.push(contentState.id);
          break;
        case EContentSchedule.DUE:
          s.due.push(contentState.id);
          break;
        case EContentSchedule.LEARNING:
          s.learning.push(contentState.id);
          break;
        case EContentSchedule.OVERDUE:
          s.overdue.push(contentState.id);
          break;
        default:
          break;
      }
    });
    return s;
  }

  private getContentsSchedule(): IContentsSchedule {
    if (this.cachedContentsSchedule) {
      return this.cachedContentsSchedule;
    }
    this.cachedContentsSchedule = this.computeContentsSchedule(
      this.state,
      new Date(),
    );
    return this.cachedContentsSchedule;
  }

  addContent(content: Content): void {
    this.contents.add(content);

    this.state.contentStates[content.id] = this.initialContentState(content.id);
    this.cacheContentSchedule = null;
  }

  // Must be add in order by time
  addReview(review: Review): void {
    this.reviews.push(review);
    this.reviews = this.reviews.sort((left, right): number => {
      if (left.whenItWasReviewd < right.whenItWasReviewd) return -1;
      if (left.whenItWasReviewd > right.whenItWasReviewd) return 1;
      return 0;
    });

    const lastReview = this.reviews[this.reviews.length - 1];
    if (this.needsRebuild(lastReview)) {
      this.rebuild();
    } else {
      this.reviews.forEach(reviewElement => {
        this.state = this.applyReview(this.state, reviewElement);
      });
    }
  }

  summary(): ISummaryStatistics {
    const s = this.getContentsSchedule();
    return {
      due: s.due.length,
      later: s.later.length,
      learning: s.learning.length,
      overdue: s.overdue.length,
    };
  }
}
