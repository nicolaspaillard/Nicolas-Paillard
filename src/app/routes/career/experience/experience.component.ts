import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "@app/layout/services/auth.service";
import { Experience } from "@classes/experience";
import { AccordionModule } from "@openng/optimus-ui/accordion";
import { ButtonModule } from "@openng/optimus-ui/button";
import { TagModule } from "@openng/optimus-ui/tag";
import { TooltipModule } from "@openng/optimus-ui/tooltip";

@Component({
  selector: "app-experience",
  imports: [CommonModule, ButtonModule, TagModule, AccordionModule, RouterLink, TooltipModule],
  templateUrl: "./experience.component.html",
})
export class ExperienceComponent {
  @Output() edit = new EventEmitter<Experience>();
  @Output() link = new EventEmitter<Experience>();
  @Output() remove = new EventEmitter<Experience>();
  experience = input.required<Experience>();
  projects = input.required<{ id: string; title: string }[]>();
  right = input.required<boolean>();
  skills = input.required<
    {
      id: string;
      items: { icon: string; id: string; title: string }[];
      title: string;
    }[]
  >();
  readonly user = inject(AuthService).user;
}
