import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { AuthService } from "@services/auth.service";
import { CrudService } from "@services/crud.service";
import { ConfirmService } from "@services/frontend/confirm.service";
import { Base } from "../classes/base";

export abstract class CrudComponent<T extends Base> {
  editing: string = "";
  isAdmin: boolean = false;
  isShown: boolean = false;
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
    this.editing = item ? item.id! : "";
    if (item) {
      let tmp = new this.crudService.type(item);
      delete tmp.id;
      this.form.setValue(tmp as any);
    } else this.form.reset();
    this.isShown = true;
  }
}
