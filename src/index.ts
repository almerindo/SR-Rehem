/* eslint-disable no-console */
// import { Content, Review, ERating } from './lib/Content';

// import SRRehem from './lib/SRRehem';

// const vocab: Array<Content> = [
//   {
//     id: 'teste01',
//     data: {
//       fields: ['世界', 'shìjiè', 'world'],
//     },
//   },
//   {
//     id: 'teste02',
//     data: {
//       fields: ['bonjour', 'hello (good day)'],
//     },
//   },
// ];

// const reviews: Array<Review> = [];

// reviews.push({
//   id: 'teste01',
//   whenItWasReviewd: new Date(),
//   rating: ERating.EASY,
//   data: {
//     fields: ['世界', 'shìjiè', 'world'],
//   },
// });

// reviews.push({
//   id: 'teste02',
//   whenItWasReviewd: new Date(),
//   rating: ERating.HARD,
//   data: {
//     fields: ['bonjour', 'hello (good day)'],
//   },
// });

// reviews.push({
//   id: 'teste02',
//   whenItWasReviewd: new Date(),
//   rating: ERating.HARD,
//   data: {
//     fields: ['bonjour', 'hello (good day)'],
//   },
// });

// reviews.push({
//   id: 'teste02',
//   whenItWasReviewd: new Date(),
//   rating: ERating.GOOD,
//   data: {
//     fields: ['bonjour', 'hello (good day)'],
//   },
// });

// const SRR = new SRRehem();

// vocab.forEach(content => {
//   SRR.addContent(content);
// });

// reviews.forEach(review => {
//   console.info('---------BEGIN-------------');
//   console.log('add review -> ', review);
//   SRR.addReview(review);
//   const sumary = SRR.summary();
//   console.info(sumary);
//   console.info('---------END-------------');
// });

// const rev = {
//   id: 'teste02',
//   whenItWasReviewd: new Date(),
//   rating: ERating.GOOD,
//   data: {
//     fields: ['bonjour', 'hello (good day)'],
//   },
// };
// // TODO verificar prev.factor
// SRR.addReview(rev);

import Item, { ERating } from './SM/Item';
import SuperMemo from './SM/SM';

const item = new Item();
const SR = new SuperMemo();
SR.addItem(item);

console.info(JSON.stringify(item, null, 2));

console.info(SR.hasItem(item));

console.info(JSON.stringify(SR.review(item.id, ERating.EASY), null, 2));
console.info(JSON.stringify(SR.review(item.id, ERating.EASY), null, 2));
console.info(JSON.stringify(SR.review(item.id, ERating.EASY), null, 2));
console.info(JSON.stringify(SR.review(item.id, ERating.EASY), null, 2));
console.info(JSON.stringify(SR.review(item.id, ERating.EASY), null, 2));
