import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Application, formApplication } from "@classes/application";
import { CrudComponent } from "@components/crud.component";
import { AuthService } from "@services/auth.service";
import { ConfirmService } from "@services/confirm.service";
import { CrudService, SERVICE_CONFIG, ServiceConfig } from "@services/crud.service";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";

const SERVICE_VARIABLE: ServiceConfig<Application> = { type: Application, form: formApplication, collection: "applications", order: ["title"], compareFn: (a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0) };

@Component({
  selector: "app-applications",
  imports: [DialogModule, DatePickerModule, ReactiveFormsModule, TooltipModule, SelectModule, ButtonModule, InputGroupModule, FileUploadModule, CommonModule, InputTextModule, TextareaModule, DialogModule, DatePickerModule, TableModule],
  templateUrl: "./applications.component.html",
  providers: [CrudService<Application>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class ApplicationsComponent extends CrudComponent<Application> {
  contacts: string[] = [];
  expandedRows = {};
  links: string[] = [];
  model: string = `
Bonjour,%0D%0A
Je suis récemment tombé sur votre [0], et celle-ci me plait beaucoup !%0D%0A
[link]%0D%0A

En effet, ayant une certaine expérience en développement, je pense pouvoir répondre aisément à vos besoins en m'adaptant aux technologies de vos choix. 
Je saurais aussi vous proposer des solutions adaptées à vos besoins en termes de performances ou de budget.%0D%0A
J'apprécie également travailler dans une équipe bien structurée, ou tous collaborent et apprennent les uns des autres. 
J'ai par exemple travaillé sur figma en collaboration avec un designer lors du développement de kdoons.com. 
J'utilise aussi beaucoup github et gitlab pour faciliter la collaboration entre développeurs, ainsi que pour l'intégration continue.%0D%0A
%0D%0A

En plus d'être passionné de développement et de nouvelles technologies, je m'intéresse beaucoup aux plantes et à leur adaptation à leur milieu de vie, 
et j'adore entretenir et observer les miennes. Je me reconnais donc dans valeurs de respect et de préservation de l'environnement.%0D%0A
%0D%0A

Pour plus de renseignements je vous invite à consulter mon CV en pièce jointe ou mon portfolio (beaucoup plus détaillé) : nicolaspaillard.fr%0D%0A
Je reste à votre entière disposition via ce mail ou mon numéro de portable.%0D%0A
Cordialement%0D%0A
  `;
  constructor(crudService: CrudService<Application>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  add = (item: string, field: string) => {
    this[field].push(item);
    this.form.patchValue({ [field]: this[field].join(";") });
  };
  mail = (application: Application) => {
    let body = this.model;
    [["annonce", "entreprise"]].forEach((value, index) => (body = body.replace(`[${index}]`, value[application.type === "Annonce" ? 0 : 1])));
    [["link", application.links.split(";")[0].split("://").pop()]].forEach(value => (body = body.replace(`[${value[0]}]`, value[1] ? value[1] + "%0D%0A" : "")));
    open("mailto:" + application.contacts.split(",") + "?subject=Candidature " + application.title + " Nicolas Paillard&body=" + body, "_blank");
  };
  move = (item: string, field: string, up: boolean = false) => {
    let fromIndex = this[field].indexOf(item);
    if ((fromIndex == 0 && up) || (fromIndex == this.links.length - 1 && !up)) return;
    var element = this.links[fromIndex];
    this[field].splice(fromIndex, 1);
    this[field].splice(fromIndex + (up ? -1 : 1), 0, element);
    this.form.patchValue({ [field]: this[field].join(";") });
  };
  override open(item?: Application): void {
    this.links = item && item.links ? item.links.split(";") : [];
    this.contacts = item && item.contacts ? item.contacts.split(";") : [];
    super.open(item);
  }
  remove = (item: string, field: string) => {
    this[field] = this[field].filter((itm: string) => itm != item);
    this.form.patchValue({ links: this.links.join(";") });
  };
}
