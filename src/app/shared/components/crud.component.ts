import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { Base } from "../classes/base";

export abstract class CrudComponent<T extends Base> {
  isAdmin: boolean = false;
  isShown: boolean = false;
  isEditing: boolean = false;
  items: T[];
  abstract form: FormGroup;
  constructor(
    private crudService: CrudService<T>,
    private authService: AuthService,
    protected confirmService: ConfirmService,
  ) {
    authService
      .admin()
      .pipe(takeUntilDestroyed())
      .subscribe((isAdmin) => (this.isAdmin = isAdmin));
    crudService
      .items()
      .pipe(takeUntilDestroyed())
      .subscribe((items) => {
        if (this.sort) this.sort(items);
        this.items = items;
      });
  }
  protected sort?(items: T[]): void;
  protected cloudinary = async () => await this.crudService.cloudinary().then((cloudinary) => cloudinary);

  async create(item?: any) {
    return await this.crudService.create(item ? item : (this.form.value as T)).then(() => (this.isShown = false));
  }
  async update(item?: any) {
    return await this.crudService.update(item ? item : (this.form.value as T)).then(() => (this.isShown = false));
  }
  delete(item: T, field?: string) {
    field ? this.confirmService.confirm({ message: `Voulez-vous vraiment supprimer '${item[field]}' ?`, accept: () => this.crudService.delete(item) }) : this.crudService.delete(item);
  }

  open(item?: T) {
    this.isEditing = item ? true : false;
    if (item) this.form.setValue(new this.crudService.type(item));
    else this.form.reset();
    this.isShown = true;
  }
}
