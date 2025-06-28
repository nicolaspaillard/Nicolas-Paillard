import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";

@Component({ selector: "app-dashboard", imports: [ButtonModule], templateUrl: "./dashboard.component.html", styles: `` })
export class DashboardComponent {
  cols: number = 5;
}
