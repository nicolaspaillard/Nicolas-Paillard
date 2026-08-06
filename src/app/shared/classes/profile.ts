import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Base } from "./base";

export class Profile extends Base {
  address: string;
  email: string;
  firstName: string;
  github: string;
  gitlab: string;
  lastName: string;
  linkedin: string;
  phone: string;
  constructor(profile: Profile) {
    super(profile);
  }
}

export const formProfile: FormGroup = new FormGroup({
  id: new FormControl(""),
  firstName: new FormControl("", [control => Validators.required(control)]),
  lastName: new FormControl("", [control => Validators.required(control)]),
  address: new FormControl("", [control => Validators.required(control)]),
  phone: new FormControl("", [control => Validators.required(control)]),
  email: new FormControl("", [control => Validators.required(control), Validators.email]),
  linkedin: new FormControl("", [control => Validators.required(control)]),
  github: new FormControl("", [control => Validators.required(control)]),
  gitlab: new FormControl("", [control => Validators.required(control)]),
  title: new FormControl("", [control => Validators.required(control)]),
});
