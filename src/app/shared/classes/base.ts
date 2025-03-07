export class Base {
  id: string;
  constructor(item: any) {
    Object.assign(this, item);
  }
}
