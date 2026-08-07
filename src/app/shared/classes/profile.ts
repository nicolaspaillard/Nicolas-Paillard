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
  firstName: new FormControl("", [Validators.required]),
  lastName: new FormControl("", [Validators.required]),
  address: new FormControl("", [Validators.required]),
  phone: new FormControl("", [Validators.required]),
  email: new FormControl("", [Validators.required, Validators.email]),
  linkedin: new FormControl("", [Validators.required]),
  github: new FormControl("", [Validators.required]),
  gitlab: new FormControl("", [Validators.required]),
  title: new FormControl("", [Validators.required]),
});
