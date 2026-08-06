import { Component, EventEmitter, Output } from "@angular/core";
import { TooltipModule } from "@openng/optimus-ui/tooltip";

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
