import { Injectable, isDevMode } from "@angular/core";
import { collection, doc, Firestore, getDoc, getDocs, orderBy, OrderByDirection, query, setDoc } from "@angular/fire/firestore";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { cloneDeep, Font, mm2pt, PDFRenderProps, Plugin, Schema, Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { degrees, degreesToRadians, PDFString } from "@pdfme/pdf-lib";
import { date, dateTime, ellipse, image, line, multiVariableText, rectangle, svg, table, text, time } from "@pdfme/schemas";
import { TextSchema } from "@pdfme/schemas/dist/types/src/text/types";
import { Designer } from "@pdfme/ui";
import { IconNode, Link } from "lucide";
import { cloudinaryConfig } from "src/main";
import { Experience } from "../classes/experience";
import { Section } from "../classes/section";
import { Category, Skill } from "../classes/skill";
import { AnimationService } from "./frontend/animation.service";
import { ToastService } from "./frontend/toast.service";
@Injectable({
  providedIn: "root",
})
export class DesignerService {
  private timer: NodeJS.Timeout;
  designer: Designer;
  blank: Template = { basePdf: { width: 210, height: 297, padding: [10, 10, 10, 10] }, schemas: [[]] };
  constructor(
    private toastService: ToastService,
    private animationService: AnimationService,
    private db: Firestore,
  ) {}
  init = async (containerId: string) => {
    this.designer = new Designer({ domContainer: document.getElementById(containerId)!, template: await this.getTemplate(), plugins: plugins, options: { font: fonts } });
    this.designer.onChangeTemplate(() => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.save(), 10000);
    });
  };
  destroy = () => this.designer.destroy();
  clear = () => this.designer.updateTemplate(this.blank);
  importTemplate = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onloadend = (readerEvent: ProgressEvent<FileReader>) => this.designer.updateTemplate(JSON.parse(readerEvent.target!.result!.toString()));
  };
  exportTemplate = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(this.designer.getTemplate())], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `template.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  import = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onloadend = (readerEvent: ProgressEvent<FileReader>) => this.designer.updateTemplate(Object.assign(cloneDeep(this.designer.getTemplate()), { basePdf: readerEvent.target!.result! }));
  };
  export = async ({ editing, replace }: { editing: boolean; replace: boolean }) => {
    const getData = async <T>(type: { new (...args: any[]): T }, name: string, order: [string, OrderByDirection?]): Promise<T[]> => {
      try {
        return await getDocs(query(collection(this.db, "data", name, name), orderBy(...order))).then((result) => {
          if (type === Category) {
            let categories: T[] = [];
            result.docs.map((doc) => {
              let skill = new Skill(doc.data() as any);
              const categoryId = categories.findIndex((category) => category["title"] === skill.category);
              if (categoryId === -1) categories.push(new type({ title: skill.category, skills: [skill] }));
              else {
                categories[categoryId]["skills"].push(skill);
                categories[categoryId]["skills"].sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0));
              }
            });
            return categories.sort((a, b) => (a["title"] < b["title"] ? -1 : a["title"] > b["title"] ? 1 : 0));
          } else return result.docs.map((doc) => new type(doc.data() as any));
        });
      } catch (error) {
        console.error(error);
        return [];
      }
    };
    let [sections, experiences, categories] = [await getData(Section, "sections", ["rank"]), await getData(Experience, "experiences", ["start", "desc"]), await getData(Category, "skills", ["category"])];
    if (isDevMode()) generate({ template: editing ? this.designer.getTemplate() : await this.getTemplate(), inputs: await this.getInputs(sections, categories, experiences), plugins: plugins, options: { font: fonts } }).then((pdf) => window.open(URL.createObjectURL(new Blob([pdf.buffer], { type: "application/pdf" })), replace ? "_self" : "_blank"));
    else {
      this.animationService.animate({
        callback: async () => generate({ template: editing ? this.designer.getTemplate() : await this.getTemplate(), inputs: await this.getInputs(sections, categories, experiences), plugins: plugins, options: { font: fonts } }).then((pdf) => window.open(URL.createObjectURL(new Blob([pdf.buffer], { type: "application/pdf" })), replace ? "_self" : "_blank")),
        sections: [
          {
            route: "home",
            lines: [
              "Accueil",
              "nicolaspaillard.fr/home# " +
                (await fetch(new Cloudinary({ cloud: { cloudName: cloudinaryConfig.cloudName } }).image("nicolasPaillard/profile").resize(fill().width(500).aspectRatio("1.0")).toURL()).then(
                  (response) =>
                    new Promise(async (resolve, reject) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(await response.blob());
                    }),
                )),
            ],
          },
          { route: "about", lines: ["A propos", ...sections.map((section) => `nicolaspaillard.fr/about# ` + section.text)] },
          { route: "career", lines: ["Carrière", ...experiences.map((experience) => `nicolaspaillard.fr/career# ` + experience.title)] },
          { route: "skills", lines: ["Compétences", ...categories.map((category) => `nicolaspaillard.fr/skills# ` + category.title)] },
        ],
      });
    }
  };
  save = async () => {
    let template = this.designer.getTemplate();
    template.basePdf = this.blank.basePdf;
    try {
      await setDoc(doc(this.db, "data", "template"), { template: JSON.stringify(template) });
      this.toastService.success("Succès", "Sauvegarde effectuée");
    } catch (error) {
      this.toastService.error("Erreur", "Sauvegarde échouée");
      console.error(error);
    }
  };
  private getTemplate = async (): Promise<Template> => await getDoc(doc(this.db, "data", "template")).then((document) => (document.exists() ? JSON.parse(document.data()!["template"]) : this.blank) as Template);
  private getPhoto = async (): Promise<string> =>
    await fetch(new Cloudinary({ cloud: { cloudName: cloudinaryConfig.cloudName } }).image("nicolasPaillard/profile").resize(fill().width(500).aspectRatio("1.0")).toURL()).then(
      (response) =>
        new Promise(async (resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(await response.blob());
        }),
    );
  private getInputs = async (sections: Section[], categories: Category[], experiences: Experience[]): Promise<any> => [
    {
      title: "Nicolas Paillard",
      subtitle: "Développeur Full-Stack",
      picture: await this.getPhoto(),
      intro: [[sections.length ? sections.map((section) => section.text).join("\n") : ""]],
      skills: JSON.stringify(categories.map((category) => ["\t" + category.title + " : " + category.skills.map((skill) => skill.title).join(", ")])),
      experiences: JSON.stringify(
        experiences
          .filter((experience) => experience.end && experience.start.getTime() != experience.end.getTime())
          .map((experience, index) => [
            `${experience.start.toLocaleDateString("fr-FR", { month: "numeric", year: "numeric" })} - ${experience.end.toLocaleDateString("fr-FR", { month: "numeric", year: "numeric" })} : ${experience.title}` +
              (experience.text.length ? `\n\t${experience.text}` : "") +
              (experience.activities ? `\n${"\t- " + experience.activities.split(";").join("\n\t- ")}` : "") +
              (index < experiences.length - 1 ? "\n" : ""),
          ]),
      ),
      address: "Montpellier",
      phone: JSON.stringify([["07 81 48 00 36", "tel:0781480036"]]),
      email: JSON.stringify([["paillard.nicolas.pro@gmail.com", "mailto:paillard.nicolas.pro@gmail.com"]]),
      site: JSON.stringify([["nicolaspaillard.fr", "https://nicolaspaillard.fr/designer"]]),
      github: JSON.stringify([["github.com/nicolaspaillard", "https://github.com/nicolaspaillard"]]),
      gitlab: JSON.stringify([["gitlab.com/nicolaspaillard", "https://gitlab.com/nicolaspaillard"]]),
      linkedin: JSON.stringify([["linkedin.com/in/nicolas--p", "https://www.linkedin.com/in/nicolas--p"]]),
    },
  ];
}
const convertForPdfLayoutProps = ({ schema, pageHeight, applyRotateTranslate = true }: { schema: Schema; pageHeight: number; applyRotateTranslate?: boolean }) => {
  const { width: mmWidth, height: mmHeight, position, rotate, opacity } = schema;
  const { x: mmX, y: mmY } = position;
  const rotateDegrees = rotate ? -rotate : 0;
  const width = mm2pt(mmWidth);
  const height = mm2pt(mmHeight);
  let x = mm2pt(mmX);
  // PDF coordinate system is from bottom left, UI is top left, so we need to flip the y axis
  let y = pageHeight - mm2pt(mmY) - height;
  if (rotateDegrees && applyRotateTranslate) {
    // If rotating we must pivot around the same point as the UI performs its rotation.
    // The UI performs rotation around the objects center point (the pivot point below),
    // pdflib rotates around the bottom left corner of the object.
    // We must therefore adjust the X and Y by rotating the bottom left corner by this pivot point.
    const pivotPoint = { x: x + width / 2, y: pageHeight - mm2pt(mmY) - height / 2 };
    const rotatedPoint = rotatePoint({ x, y }, pivotPoint, rotateDegrees);
    x = rotatedPoint.x;
    y = rotatedPoint.y;
  }
  return {
    position: { x, y },
    height: height,
    width: width,
    rotate: degrees(rotateDegrees),
    opacity,
  };
};
const rotatePoint = (point: { x: number; y: number }, pivot: { x: number; y: number }, angleDegrees: number): { x: number; y: number } => {
  const angleRadians = degreesToRadians(angleDegrees);
  const x = Math.cos(angleRadians) * (point.x - pivot.x) - Math.sin(angleRadians) * (point.y - pivot.y) + pivot.x;
  const y = Math.sin(angleRadians) * (point.x - pivot.x) + Math.cos(angleRadians) * (point.y - pivot.y) + pivot.y;
  return { x, y };
};
const createSvgStr = (icon: IconNode, attrs?: Record<string, string>): string => {
  const createElementString = (node: IconNode): string => {
    const [tag, attributes, children = []] = node;
    const mergedAttributes = tag === "svg" ? { ...attributes, ...attrs } : attributes;
    const attrString = Object.entries(mergedAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    const childrenString = children.map((child) => createElementString(child)).join("");
    return `<${tag} ${attrString}>${childrenString}</${tag}>`;
  };
  return createElementString(icon);
};
interface LinkSchema extends TextSchema {
  url: string;
}
const link: Plugin<LinkSchema> = {
  ui: text.ui,
  pdf: async (arg: PDFRenderProps<LinkSchema>) => {
    const { value, pdfDoc, schema, page, ...rest } = arg;
    const pageHeight = page.getHeight();
    const {
      width,
      height,
      position: { x, y },
    } = convertForPdfLayoutProps({ schema, pageHeight, applyRotateTranslate: false });
    const values: string[][] = JSON.parse(value);
    page.node.addAnnot(
      pdfDoc.context.register(
        pdfDoc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [x, y, x + width, y + height],
          // Border: [0, 0, 0],
          // border color
          // C: [0, 0, 1],
          // URI action
          A: {
            Type: "Action",
            S: "URI",
            URI: PDFString.of(values[0][1]),
            target: "_blank",
          },
        }),
      ),
    );
    const renderArgs = {
      value: values[0][0],
      pdfDoc: pdfDoc,
      schema,
      page: page,
      ...rest,
    };

    await text.pdf(renderArgs);
  },
  propPanel: {
    schema: text.propPanel.schema,
    defaultSchema: {
      ...text.propPanel.defaultSchema,
      rotate: undefined,
      type: "link",
      url: "",
    },
  },
  icon: createSvgStr(Link),
};
const plugins = {
  Text: text,
  Link: link,
  Paragraph: multiVariableText,
  Table: table,
  Line: line,
  Rectangle: rectangle,
  Ellipse: ellipse,
  Image: image,
  SVG: svg,
  DateTime: dateTime,
  Date: date,
  Time: time,
};
const fonts: Font = {
  Roboto: { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Regular.woff", fallback: true },
  "Roboto thin": { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Thin.woff" },
  "Roboto light": { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Light.woff" },
  "Roboto medium": { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Medium.woff" },
  "Roboto bold": { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Bold.woff" },
  "Roboto black": { data: "https://fonts.cdnfonts.com/s/12165/Roboto-Black.woff" },
};
