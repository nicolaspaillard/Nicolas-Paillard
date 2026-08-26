import { inject, Service } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Profile } from "@classes/profile";
import { Section } from "@classes/section";
import { Skill } from "@classes/skill";
import { format } from "@cloudinary/url-gen/actions/delivery";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { byRadius } from "@cloudinary/url-gen/actions/roundCorners";
import { Cloudinary } from "@cloudinary/url-gen/index";
import { png } from "@cloudinary/url-gen/qualifiers/format";
import { CrudService } from "@services/crud.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CanvasElement, Content, TableLayout, TDocumentDefinitions } from "pdfmake/interfaces";
import { Step } from "./animation.service";

pdfMake.addVirtualFileSystem(pdfFonts);

@Service()
export class PdfmakeService {
  categories: Category[] = [];
  experiences: Experience[] = [];
  profiles: Profile[] = [];
  sections: Section[] = [];
  skills: Skill[] = [];
  private iconCache = new Map<string, string>();
  private profilePicture = "";
  private ready: Promise<void>;
  private sanitizer = inject(DomSanitizer);
  constructor() {
    const crudService = inject<CrudService<Skill>>(CrudService);
    this.ready = Promise.all([
      crudService
        .getData(Section, "sections", ["rank"])
        .then(sections => (this.sections = sections))
        .catch(err => console.error(err)),
      crudService
        .getData(Experience, "experiences", ["start", "desc"])
        .then(experiences => (this.experiences = experiences))
        .catch(err => console.error(err)),
      crudService
        .getData(Category, "categories", ["rank"])
        .then(categories => (this.categories = categories))
        .catch(err => console.error(err)),
      crudService
        .getData(Skill, "skills", ["title"])
        .then(skills => (this.skills = skills))
        .then(skills => Promise.all(skills.filter(skill => skill.icon).map(async skill => this.iconCache.set(skill.icon, await getDeviconSvg(skill.icon)))))
        .catch(err => console.error(err)),
      crudService
        .getData(Profile, "profile", ["lastName"])
        .then(profiles => (this.profiles = profiles))
        .catch(err => console.error(err)),
      fetch(new Cloudinary({ cloud: { cloudName: "dsuvd32up" } }).image("nicolasPaillard/profile").resize(fill().width(200).aspectRatio("1.0")).roundCorners(byRadius(12)).delivery(format(png())).toURL())
        .then(response => {
          if (!response.ok) throw new Error(`Cloudinary fetch failed: ${response.status}`);
          return response.blob();
        })
        .then(blob => getBlobDataURL(blob))
        .then(dataUrl => (this.profilePicture = dataUrl))
        .catch(err => console.error(err)),
    ]).then();
  }
  generate = async () => {
    await this.ready;
    const pageHeight = 841.89;
    const pageWidth = 595.28;
    const margin = 10;
    const padding = 10;
    const colwidth = 27;
    const iconSize = 9;
    const doc: TDocumentDefinitions = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: 0,
      content: [
        {
          columns: [
            {
              width: colwidth + "%",
              layout: getTableLayout(margin + padding, margin + padding, padding, margin + padding),
              table: {
                widths: "*",
                heights: pageHeight - (margin + padding) * 2,
                body: [
                  [
                    {
                      fillColor: "#fbbf24",
                      stack: [
                        ...(this.profilePicture ? [{ image: this.profilePicture, width: pageWidth * (colwidth / 100) - margin - padding * 2, alignment: "center" as const, marginBottom: 3 }] : []),
                        { text: "Coordonnées", style: ["text3"], lineHeight: 1, bold: true },
                        { text: this.profiles[0].phone, link: "tel:" + this.profiles[0].phone.replace(/\s/gm, ""), style: ["link", "text5"] },
                        { text: this.profiles[0].email, link: "mailto:" + this.profiles[0].email, style: ["link", "text5"] },
                        { text: this.profiles[0].address + " - Mobile", style: "text5" },
                        { text: "Permis B - Véhiculé", style: "text5" },
                        { text: this.profiles[0].github, link: "https://" + this.profiles[0].github, style: ["link", "text5"] },
                        { text: this.profiles[0].gitlab, link: "https://" + this.profiles[0].gitlab, style: ["link", "text5"] },
                        { text: this.profiles[0].linkedin, link: "https://" + this.profiles[0].linkedin, style: ["link", "text5"] },
                        { text: "Compétences", style: ["title3", "text3"], bold: true },
                        ...this.categories.map((category, index) => ({
                          stack: [
                            { text: category.title, style: [index === 0 ? "" : "title4", "text4"] },
                            ...this.skills
                              .filter(skill => skill.category == category.id)
                              .map((skill): Content => ({
                                layout: getTableLayout(),
                                table: {
                                  widths: ["auto", "*", "auto"],
                                  body: [[skill.icon ? { svg: this.iconCache.get(skill.icon)!, width: iconSize } : { text: skill.title[0].toUpperCase(), fontSize: iconSize, bold: true }, { text: skill.title, style: "text5", marginLeft: 2, verticalAlignment: "middle" }, { canvas: generateDotsCanvas(skill.level, "#525252"), verticalAlignment: "middle" }]],
                                },
                              })),
                          ],
                        })),
                        { text: "Langues", style: ["title3", "text3"], bold: true },
                        {
                          layout: getTableLayout(),
                          table: {
                            widths: ["auto", "*", "auto"],
                            body: [
                              [
                                { svg: flags.english, width: iconSize, verticalAlignment: "middle" },
                                { text: "Anglais", style: "text5", marginLeft: 2, verticalAlignment: "middle" },
                                { canvas: generateDotsCanvas(3.5, "#525252"), verticalAlignment: "middle" },
                              ],
                              [
                                { svg: flags.spanish, width: iconSize, verticalAlignment: "middle" },
                                { text: "Espagnol", style: "text5", marginLeft: 2, verticalAlignment: "middle" },
                                { canvas: generateDotsCanvas(2.5, "#525252"), verticalAlignment: "middle" },
                              ],
                            ],
                          },
                        },
                      ],
                    },
                  ],
                ],
              },
            },
            {
              width: 100 - colwidth + "%",
              margin: [padding, margin + padding, margin + padding, margin + padding],
              stack: [
                { text: this.profiles[0].firstName + " " + this.profiles[0].lastName, style: ["title1", "text1"] },
                { text: this.profiles[0].title, italics: true, style: ["title1", "text3"] },
                { text: this.sections.map(section => section.text).join(" "), alignment: "justify", style: ["title2", "text5"] },
                { text: "Expérience", style: ["title2", "text2", "header"] },
                ...this.experiences
                  .filter(experience => experience.type === "Expérience")
                  .map((experience, index) => ({
                    stack: [
                      { text: experience.title, style: [index === 0 ? "" : "title3", "text3"] },
                      { text: experience.company + " - " + (!experience.end ? "depuis " : "") + experience.start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) + (!experience.end ? "" : " à " + experience.end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })), style: ["date", "text4"] },
                      ...(experience.description && experience.description.length ? [{ text: experience.description, style: "text5" }] : []),
                      ...(experience.activities && experience.activities.length ? [{ ul: experience.activities, style: "text5" }] : []),
                    ],
                  })),
                { text: "Formation", style: ["title2", "text2", "header"] },
                ...this.experiences
                  .filter(experience => experience.type === "Formation")
                  .map((experience, index) => ({
                    stack: [
                      { text: experience.title, style: [index === 0 ? "" : "title3", "text3"] },
                      { text: experience.company + " - " + (!experience.end ? "depuis " : "") + experience.start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) + (!experience.end ? "" : " à " + experience.end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })), style: ["date", "text4"] },
                      ...(experience.description && experience.description.length ? [{ text: experience.description, style: "text5" }] : []),
                    ],
                  })),
                { text: "Centres d'intérêt", style: ["title2", "text2", "header"] },
              ],
            },
          ],
        },
        {
          columns: [
            {
              width: pageWidth * (colwidth / 100) - margin - padding * 2,
              stack: [
                { text: "CV généré depuis", style: ["text3"], italics: true, alignment: "center" },
                { text: "nicolaspaillard.fr", link: "https://nicolaspaillard.fr/cv", style: ["link", "text5"], alignment: "center" },
              ],
            },
          ],
          absolutePosition: { x: margin + padding, y: pageHeight - margin - padding - 22 },
        },
      ],
      styles: {
        text1: { fontSize: 17 },
        text2: { fontSize: 15 },
        text3: { fontSize: 13 },
        text4: { fontSize: 11 },
        text5: { fontSize: 9 },
        title1: { alignment: "center", lineHeight: 0.8 },
        title2: { marginTop: 5, lineHeight: 1 },
        title3: { marginTop: 3, lineHeight: 1 },
        title4: { marginTop: 1, lineHeight: 1 },
        header: { bold: true, color: "#fbbf24" },
        date: { italics: true },
        link: { noWrap: true },
      },
    };
    return { steps: this.getSteps(), url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(await pdfMake.createPdf(doc).getBlob())) };
  };
  getSteps = (): Step[] => [
    {
      route: "/",
      lines: ["Accueil", ...this.sections.map(section => `nicolaspaillard.fr/about# ` + section.text)],
    },
    {
      route: "career",
      lines: ["Expériences", ...this.experiences.filter(experience => experience.type === "Expérience").map(experience => `nicolaspaillard.fr/career# ` + experience.title)],
    },
    {
      route: "career",
      lines: ["Formations", ...this.experiences.filter(experience => experience.type === "Formation").map(formation => `nicolaspaillard.fr/career# ` + formation.title)],
    },
    {
      route: "skills",
      lines: ["Compétences", ...this.categories.map(category => `nicolaspaillard.fr/skills# ` + category.title)],
    },
  ];
}

const generateDotsCanvas = (value: number, color = "black", bgColor = "white"): CanvasElement[] => {
  const clamped = Math.max(0.5, Math.min(5, Math.round(value * 2) / 2));
  const radius = 3;
  const gap = 1.5;
  const diameter = radius * 2;
  const shapes: CanvasElement[] = [];
  for (let i = 0; i < 5; i++) {
    const fillLevel = clamped - i;
    const cx = radius + i * (diameter + gap);
    const cy = radius;
    shapes.push({
      type: "ellipse",
      x: cx,
      y: cy,
      r1: radius,
      r2: radius,
      color: fillLevel >= 1 ? color : bgColor,
    });
    if (fillLevel >= 0.5 && fillLevel < 1) {
      const points: { x: number; y: number }[] = [];
      for (let a = 90; a <= 270; a += 9) {
        const rad = (a * Math.PI) / 180;
        points.push({ x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) });
      }
      shapes.push({ type: "polyline", closePath: true, color, points });
    }
  }
  return shapes;
};

const flags = {
  english:
    '<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#F5F5F5"/><rect width="1876" height="988" transform="translate(-1562 -900)" fill="white"/><path d="M30 0H0V20H30V0Z" fill="#F0F0F0"/><path d="M30 2.49976H0V4.99951H30V2.49976Z" fill="#D80027"/><path d="M30 7.49988H0V9.99964H30V7.49988Z" fill="#D80027"/><path d="M30 12.4994H0V14.9991H30V12.4994Z" fill="#D80027"/><path d="M30 17.4996H0V19.9994H30V17.4996Z" fill="#D80027"/><path d="M15 0H0V10.7692H15V0Z" fill="#2E52B2"/><path d="M5.84916 4.41162L5.60758 5.15482H4.82617L5.45846 5.61389L5.21687 6.35703L5.84916 5.89795L6.48104 6.35703L6.23951 5.61389L6.8718 5.15482H6.09033L5.84916 4.41162Z" fill="#F0F0F0"/><path d="M6.09033 7.83676L5.84916 7.09363L5.60758 7.83676H4.82617L5.45846 8.2959L5.21687 9.03904L5.84916 8.5799L6.48104 9.03904L6.23951 8.2959L6.8718 7.83676H6.09033Z" fill="#F0F0F0"/><path d="M2.78766 7.83676L2.54643 7.09363L2.30484 7.83676H1.52344L2.15572 8.2959L1.91414 9.03904L2.54643 8.5799L3.17836 9.03904L2.93684 8.2959L3.569 7.83676H2.78766Z" fill="#F0F0F0"/><path d="M2.54643 4.41162L2.30484 5.15482H1.52344L2.15572 5.61389L1.91414 6.35703L2.54643 5.89795L3.17836 6.35703L2.93684 5.61389L3.569 5.15482H2.78766L2.54643 4.41162Z" fill="#F0F0F0"/><path d="M5.84916 1.72961L5.60758 2.47287H4.82617L5.45846 2.932L5.21687 3.67514L5.84916 3.216L6.48104 3.67514L6.23951 2.932L6.8718 2.47287H6.09033L5.84916 1.72961Z" fill="#F0F0F0"/><path d="M2.54643 1.72961L2.30484 2.47287H1.52344L2.15572 2.932L1.91414 3.67514L2.54643 3.216L3.17836 3.67514L2.93684 2.932L3.569 2.47287H2.78766L2.54643 1.72961Z" fill="#F0F0F0"/><path d="M9.15184 4.41162L8.91031 5.15482H8.12891L8.76113 5.61389L8.51967 6.35703L9.15184 5.89795L9.78383 6.35703L9.54225 5.61389L10.1745 5.15482H9.39312L9.15184 4.41162Z" fill="#F0F0F0"/><path d="M9.39312 7.83676L9.15184 7.09363L8.91031 7.83676H8.12891L8.76113 8.2959L8.51967 9.03904L9.15184 8.5799L9.78383 9.03904L9.54225 8.2959L10.1745 7.83676H9.39312Z" fill="#F0F0F0"/><path d="M12.6958 7.83676L12.4546 7.09363L12.213 7.83676H11.4316L12.0638 8.2959L11.8223 9.03904L12.4546 8.5799L13.0865 9.03904L12.8449 8.2959L13.4772 7.83676H12.6958Z" fill="#F0F0F0"/><path d="M12.4546 4.41162L12.213 5.15482H11.4316L12.0638 5.61389L11.8223 6.35703L12.4546 5.89795L13.0865 6.35703L12.8449 5.61389L13.4772 5.15482H12.6958L12.4546 4.41162Z" fill="#F0F0F0"/><path d="M9.15184 1.72961L8.91031 2.47287H8.12891L8.76113 2.932L8.51967 3.67514L9.15184 3.216L9.78383 3.67514L9.54225 2.932L10.1745 2.47287H9.39312L9.15184 1.72961Z" fill="#F0F0F0"/><path d="M12.4546 1.72961L12.213 2.47287H11.4316L12.0638 2.932L11.8223 3.67514L12.4546 3.216L13.0865 3.67514L12.8449 2.932L13.4772 2.47287H12.6958L12.4546 1.72961Z" fill="#F0F0F0"/></svg>',
  spanish: '<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#F5F5F5"/><rect width="1876" height="988" transform="translate(-1160 -796)" fill="white"/><path d="M30 0H0V20H30V0Z" fill="#FFDA44"/><path d="M30 0H0V6.66643H30V0Z" fill="#D80027"/><path d="M30 13.3329H0V19.9993H30V13.3329Z" fill="#D80027"/></svg>',
};

const getDeviconSvg = async (icon: string): Promise<string> => {
  const folder = icon.includes("dot-net") ? "dot-net" : icon.split("-")[0];
  const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${folder}/${icon}.svg`;
  const res = await fetch(url);
  return await res.text();
};

const getBlobDataURL = async (blob: Blob): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(reader.error?.message ?? "FileReader error"));
    reader.readAsDataURL(blob);
  });
};

const getTableLayout = (paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0, hLineWidth = 0, vLineWidth = 0): TableLayout => ({
  hLineWidth: () => hLineWidth,
  vLineWidth: () => vLineWidth,
  paddingLeft: () => paddingLeft,
  paddingTop: () => paddingTop,
  paddingRight: () => paddingRight,
  paddingBottom: () => paddingBottom,
});
