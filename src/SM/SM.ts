import Item, { ERating } from './Item';

export enum EMode {
  LEARNING,
  REVIEWING,
  LAPSED,
}

export default class SuperMemo {
  setItensToLearn = new Array<Item>();

  setItensLearning = new Array<Item>();

  hasItem(item: Item): boolean {
    const ok = this.setItensToLearn.find(resource => {
      return resource.id === item.id;
    });

    if (!ok) {
      return false;
    }

    return true;
  }

  private getItem(id: string): Item | null {
    const item = this.setItensToLearn.find(resource => {
      if (resource.id === id) {
        return resource;
      }
    });

    if (!item) {
      return null;
    }

    return item;
  }

  addItem(item: Item): Item | null {
    try {
      if (this.hasItem(item)) {
        throw new Error('This resource already exist in learning list');
      }
      this.setItensToLearn.push(item);
      return item;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  review(id: string, rating: ERating): Item | null {
    try {
      const item = this.getItem(id);
      if (item) {
        item.review(rating);
        this.setItensLearning.push(item);
      }
      return item;
    } catch (error) {
      return null;
    }
  }

  getNextItem(): Item | null {
    const item = this.setItensLearning.pop();
    if (!item) {
      return null;
    }

    return item;
  }
}
