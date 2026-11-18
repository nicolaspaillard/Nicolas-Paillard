import { effect, inject, isDevMode, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@services/auth.service";
import { ClipboardService } from "@services/clipboard.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService } from "@services/crud.service";
import { Base } from "../classes/base";

export class CrudComponent<T extends Base> {
  copy = inject(ClipboardService).copyWith(isDevMode() ? "https://192.168.1.2:4200/" : "https://nicolaspaillard.fr/");
  form: FormGroup;
  fragment = toSignal(inject(ActivatedRoute).fragment);
  isEditing = signal(false);
  isPrompting = signal(false);
  isShown = signal(false);
  items = signal<T[]>([]);
  promptedField = signal("");
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  protected confirmService = inject(ConfirmService);
  private crudService = inject(CrudService<T>);
  constructor() {
    inject(AuthService)
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user ? { ...user } : undefined));
    this.crudService
      .items()
      .pipe(takeUntilDestroyed())
      .subscribe(items => {
        if (this.sort) this.sort(items);
        this.items.set([...items]);
      });
    this.form = this.crudService.form;
    effect(() => this.fragment() && this.items().length && setTimeout(id => document.getElementById(id ?? "")?.scrollIntoView({ behavior: "smooth" }), 300, this.fragment()));
  }
  async create(item?: T) {
    await this.crudService.create(item ? item : (this.form.value as T)).then(() => this.isShown.set(false));
  }
  delete(item: T, field?: string) {
    this.confirmService.confirm({ message: `Voulez-vous vraiment supprimer '${field ? item[field] : item.title}' ?`, accept: () => this.crudService.delete(item) });
  }
  open(item?: T) {
    this.isEditing.set(item ? true : false);
    if (item) this.form.setValue(new this.crudService.type(item as Record<string, unknown>));
    else this.form.reset();
    this.isShown.set(true);
  }
  async update(item?: T) {
    await this.crudService.update(item ? item : (this.form.value as T)).then(() => this.isShown.set(false));
  }

  protected getCloudinary = async () => await this.crudService.getCloudinary().then(cloudinary => cloudinary);
  protected sort?(items: T[]): void;
}
