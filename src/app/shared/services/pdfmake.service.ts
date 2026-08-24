import { inject, Service } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Category } from "@classes/category";
import { Experience } from "@classes/experience";
import { Profile } from "@classes/profile";
import { Section } from "@classes/section";
import { Skill } from "@classes/skill";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Cloudinary } from "@cloudinary/url-gen/index";
import { Step } from "@services/animation.service";
import { CrudService } from "@services/crud.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CanvasElement, Content, TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.addVirtualFileSystem(pdfFonts);

@Service()
export class PdfmakeService {
  private crudService = inject<CrudService<Skill>>(CrudService);
  private sanitizer = inject(DomSanitizer);

  generate = async () => {
    const [sections, experiences, categories, skills, profile] = [await this.crudService.getData(Section, "sections", ["rank"]), await this.crudService.getData(Experience, "experiences", ["start", "desc"]), await this.crudService.getData(Category, "categories", ["rank"]), await this.crudService.getData(Skill, "skills", ["title"]), await this.crudService.getData(Profile, "profile", ["lastName"])];
    const steps: Step[] = [
      {
        route: "home",
        lines: ["Accueil", ...sections.map(section => `nicolaspaillard.fr/about# ` + section.text)],
      },
      {
        route: "career",
        lines: ["Expériences", ...experiences.filter(experience => experience.type === "Expérience").map(experience => `nicolaspaillard.fr/career# ` + experience.title)],
      },
      {
        route: "career",
        lines: ["Formations", ...experiences.filter(experience => experience.type === "Formation").map(formation => `nicolaspaillard.fr/career# ` + formation.title)],
      },
      {
        route: "skills",
        lines: ["Compétences", ...categories.map(category => `nicolaspaillard.fr/skills# ` + category.title)],
      },
    ];
    const profilePicture = await fetch(
      new Cloudinary({
        cloud: { cloudName: "dsuvd32up" },
      })
        .image("nicolasPaillard/profile")
        .resize(fill().width(300).aspectRatio("1.0"))
        // .roundCorners(max())
        // .delivery(format(png()))
        .toURL(),
    )
      .then(response => response.blob())
      .then(
        blob =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error(reader.error?.message ?? "FileReader error"));
            reader.readAsDataURL(blob);
          }),
      );
    const pageHeight = 841.89;
    const pageWidth = 595.28;
    const margin = 10;
    const padding = 10;
    const colwidth = 30;
    const iconSize = 10;
    const iconCache = new Map<string, string>();
    const getDeviconSvg = async (skl: Skill) => {
      const folder = skl.icon.includes("dot-net") ? "dot-net" : skl.icon.split("-")[0];
      const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${folder}/${skl.icon}.svg`;
      const res = await fetch(url);
      return res.text();
    };
    await Promise.all(skills.filter(skill => skill.icon).map(async skill => iconCache.set(skill.icon, await getDeviconSvg(skill))));
    function generateDotsCanvas(value: number, color = "black", bgColor = "white"): CanvasElement[] {
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
    }
    const doc: TDocumentDefinitions = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: 0,
      content: [
        {
          columns: [
            {
              width: colwidth + "%",
              layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: () => margin + padding,
                paddingRight: () => padding,
                paddingTop: () => margin + padding,
                paddingBottom: () => margin + padding,
              },
              table: {
                widths: ["*"],
                heights: pageHeight - (margin + padding) * 2,
                body: [
                  [
                    {
                      fillColor: "#fbbf24",
                      stack: [
                        {
                          image: profilePicture,
                          width: pageWidth * (colwidth / 100) - margin - padding * 2,
                        },
                        { text: "Coordonnées", style: ["title2", "text3"] },
                        { text: profile[0].address, style: "text4" },
                        { text: profile[0].phone, link: "tel:" + profile[0].phone.replace(/\s/gm, ""), style: ["link", "text4"] },
                        { text: profile[0].email, link: "mailto:" + profile[0].email, style: ["link", "text4"] },
                        { text: profile[0].github, link: "https://" + profile[0].github, style: ["link", "text4"] },
                        { text: profile[0].gitlab, link: "https://" + profile[0].gitlab, style: ["link", "text4"] },
                        { text: profile[0].linkedin, link: "https://" + profile[0].linkedin, style: ["link", "text4"] },
                        { text: "CV généré via mon site", style: ["title2", "text3"] },
                        { text: "nicolaspaillard.fr", link: "https://nicolaspaillard.fr/cv", style: ["link", "text4"] },
                        { text: "Compétences", style: ["title2", "text3"] },
                        ...categories.map((category, index) => ({
                          stack: [
                            { text: category.title, style: [index === 0 ? "" : "title3", "text4"], bold: true },
                            ...skills
                              .filter(skill => skill.category == category.id)
                              .map((skill): Content => ({
                                layout: {
                                  hLineWidth: () => 0,
                                  vLineWidth: () => 0,
                                  paddingLeft: () => 0,
                                  paddingRight: () => 0,
                                  paddingTop: () => 0,
                                  paddingBottom: () => 0,
                                },
                                table: {
                                  widths: ["auto", "*", "auto"],
                                  body: [[skill.icon ? { svg: iconCache.get(skill.icon)!, width: iconSize } : { text: skill.title[0].toUpperCase(), fontSize: iconSize, bold: true }, { text: skill.title, style: "text4", marginLeft: 2, verticalAlignment: "middle" }, { canvas: generateDotsCanvas(skill.level, "#525252"), verticalAlignment: "middle" }]],
                                },
                              })),
                          ],
                        })),
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
                { text: profile[0].firstName + " " + profile[0].lastName, style: ["title1", "text1"] },
                { text: profile[0].title, alignment: "center", italics: true, style: ["text3"] },
                { text: sections.map(section => section.text).join(" "), alignment: "justify", style: ["title3", "text4"] },
                { text: "Expérience", style: ["title3", "text2", "header"] },
                ...experiences
                  .filter(experience => experience.type === "Expérience")
                  .map((experience, index) => ({
                    stack: [
                      { text: experience.title, style: [index === 0 ? "" : "title3", "text3"] },
                      { text: experience.company + " - " + (!experience.end ? "depuis " : "") + experience.start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) + (!experience.end ? "" : " à " + experience.end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })), style: ["date", "text4"] },
                      experience.description && experience.description.length ? { text: experience.description, style: "text4" } : "",
                      experience.activities && experience.activities.length ? { ul: experience.activities.split(";"), style: "text4" } : "",
                    ].filter(Boolean),
                  })),
                { text: "Formation", style: ["title3", "text2", "header"] },
                ...experiences
                  .filter(experience => experience.type === "Formation")
                  .map((experience, index) => ({
                    stack: [
                      { text: experience.title, style: [index === 0 ? "" : "title3", "text3"] },
                      { text: experience.company + " - " + (!experience.end ? "depuis " : "") + experience.start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) + (!experience.end ? "" : " à " + experience.end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })), style: ["date", "text4"] },
                      experience.description && experience.description.length ? { text: experience.description, style: "text4" } : "",
                    ].filter(Boolean),
                  })),
              ],
            },
          ],
        },
      ],
      styles: {
        text1: { fontSize: 18 },
        text2: { fontSize: 15 },
        text3: { fontSize: 12 },
        text4: { fontSize: 9 },
        text5: { fontSize: 8 },
        title1: { alignment: "center" },
        title2: { marginTop: 5, lineHeight: 1 },
        title3: { marginTop: 3, lineHeight: 1 },
        header: { bold: true, color: "#fbbf24" },
        date: { italics: true },
        link: { noWrap: true },
      },
    };
    return { steps: steps, url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(await pdfMake.createPdf(doc).getBlob())) };
  };
  roundedImage = (base64: string, width: number, height: number, radius: number) => {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="round">
            <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" />
          </clipPath>
        </defs>
        <image href="${base64}" width="${width}" height="${height}" clip-path="url(#round)" />
      </svg>
    `;
  };
}
