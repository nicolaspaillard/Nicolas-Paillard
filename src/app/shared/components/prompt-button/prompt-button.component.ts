import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-prompt-button",
  imports: [TooltipModule],
  templateUrl: "./prompt-button.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class PromptButtonComponent {
  @Output() onClick = new EventEmitter();
}
