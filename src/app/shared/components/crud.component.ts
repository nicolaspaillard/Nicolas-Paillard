import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { FormGroup } from "@angular/forms";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { Base } from "../classes/base";

export class CrudComponent<T extends Base> {
  form: FormGroup;
  isEditing: boolean = false;
  isShown: boolean = false;
  items: T[] = [];
  user: { admin: boolean; user: User } | undefined;
  constructor(
    private crudService: CrudService<T>,
    private authService: AuthService,
    protected confirmService: ConfirmService,
  ) {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => (this.user = user));
    this.crudService
      .items()
      .pipe(takeUntilDestroyed())
      .subscribe(items => {
        if (this.sort) this.sort(items);
        this.items = items;
      });
    this.form = this.crudService.form;
  }
  async create(item?: any) {
    await this.crudService.create(item ? item : (this.form.value as T)).then(id => (this.isShown = false));
  }
  delete(item: T, field?: string) {
    this.confirmService.confirm({ message: `Voulez-vous vraiment supprimer '${field ? item[field] : item.title}' ?`, accept: () => this.crudService.delete(item) });
  }
  open(item?: T) {
    this.isEditing = item ? true : false;
    if (item) this.form.setValue(new this.crudService.type(item));
    else this.form.reset();
    this.isShown = true;
  }
  async update(item?: any) {
    await this.crudService.update(item ? item : this.form.value).then(() => (this.isShown = false));
  }

  protected cloudinary = async () => await this.crudService.cloudinary().then(cloudinary => cloudinary);

  protected sort?(items: T[]): void;
}
