import { Content, Review, ERating } from './lib/Content';

import SRRehem from './lib/SRRehem';

const vocab: Array<Content> = [
  {
    id: 'teste01',
    data: {
      fields: ['世界', 'shìjiè', 'world'],
    },
  },
  {
    id: 'teste02',
    data: {
      fields: ['bonjour', 'hello (good day)'],
    },
  },
  {
    id: 'teste02',
    data: {
      fields: ['bonjour', 'hello (good day)'],
    },
  },
];

const reviews: Array<Review> = [];

const reviewRecord: Review = {
  // identify which card we're reviewing
  id: 'teste02',

  // store when we reviewed it
  whenItWasReviewd: new Date(),

  // store how easy it was to remember
  rating: ERating.GOOD,

  data: {
    fields: ['bonjour', 'hello (good day)'],
  },
};

reviews.push(reviewRecord);

const SRR = new SRRehem();

vocab.forEach(content => {
  SRR.addContent(content);
});

reviews.forEach(review => {
  console.log(SRR.addReview(review));
});

const sumary = SRR.summary();
console.info(sumary);
