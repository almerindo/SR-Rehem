import database from '..';

import { IItemKnowledge } from '../schemas/SpacedRepetition/ItenKnowledge.schema';

import SCHEMAS from '../schemas';

const conn = database.getInstance().getConnection();

export const ItemKnowledgeModel = conn?.model<IItemKnowledge>(
  'ItemKnowledge',
  SCHEMAS.ItemKnowledgeSchema,
);

export default {
  ItemKnowledgeModel,
};
