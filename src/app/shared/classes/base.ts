export class Base {
  id: string;
  title: string;
  constructor(item: Record<string, unknown>) {
    Object.assign(this, item);
  }
}

// export const formBase = new FormGroup({
//   id: new FormControl(""),
//   title: new FormControl("", [control => Validators.required(control)]),
// });
