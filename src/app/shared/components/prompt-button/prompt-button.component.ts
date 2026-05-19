import { Component, EventEmitter, Output } from "@angular/core";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-prompt-button",
  imports: [TooltipModule],
  templateUrl: "./prompt-button.component.html",
  styles: ``,
})
export class PromptButtonComponent {
  @Output() onClick = new EventEmitter();
}
