import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { User } from "@angular/fire/auth";
import { AuthService } from "@app/shared/services/auth.service";
import { Section } from "@classes/section";
import { ButtonModule } from "@openng/optimus-ui/button";

@Component({
  selector: "app-section",
  imports: [ButtonModule],
  templateUrl: "./section.component.html",
})
export class SectionComponent {
  private authService = inject(AuthService);

  @Output() onEdit = new EventEmitter<Section>();
  @Output() onRemove = new EventEmitter<Section>();
  @Input() section: Section;
  user = signal<{ admin: boolean; user: User } | undefined>(undefined);
  constructor() {
    this.authService
      .user()
      .pipe(takeUntilDestroyed())
      .subscribe((user) => this.user.set(user ? { ...user } : undefined));
  }
}
