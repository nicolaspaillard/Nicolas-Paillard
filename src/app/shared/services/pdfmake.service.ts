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

const iconCache = new Map<string, Promise<string>>();

@Service()
export class PdfmakeService {
  private crudService = inject<CrudService<Skill>>(CrudService);
  private profilePicture = "";
  private ready: Promise<void>;
  private sanitizer = inject(DomSanitizer);
  constructor() {
    this.ready = fetch(new Cloudinary({ cloud: { cloudName: "dsuvd32up" } }).image("nicolasPaillard/profile").resize(fill().width(200).aspectRatio("1.0")).roundCorners(byRadius(12)).delivery(format(png())).toURL())
      .then(response => {
        if (!response.ok) throw new Error(`Cloudinary fetch failed: ${response.status}`);
        return response.blob();
      })
      .then(blob => getBlobDataURL(blob))
      .then(dataUrl => {
        this.profilePicture = dataUrl;
      })
      .catch(err => console.error(err));
  }
  generate = async (sections?: Section[], experiences?: Experience[], categories?: Category[], skills?: Skill[], profile?: Profile) => {
    [sections, experiences, categories, skills, profile] = await Promise.all([
      sections ?? this.crudService.getData(Section, "sections", ["rank"]),
      experiences ?? this.crudService.getData(Experience, "experiences", ["start", "desc"]),
      categories ?? this.crudService.getData(Category, "categories", ["rank"]),
      skills ?? this.crudService.getData(Skill, "skills", ["title"]),
      profile ?? this.crudService.getData(Profile, "profile", ["lastName"]).then(profiles => profiles[0]),
    ]);
    await this.ready;

    const pageHeight = 841.89;
    const pageWidth = 595.28;
    const margin = 10;
    const padding = 10;
    const colwidth = 27;
    const iconSize = 9;
    const skillsByCategory = new Map<string, Skill[]>();
    for (const skill of skills) {
      const list = skillsByCategory.get(skill.category);
      if (list) list.push(skill);
      else skillsByCategory.set(skill.category, [skill]);
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
              layout: getTableLayout(margin + padding, margin + padding, padding, margin + padding),
              table: {
                widths: "*",
                heights: pageHeight - (margin + padding) * 2,
                body: [
                  [
                    {
                      fillColor: "#fbbf24",
                      stack: [
                        ...(this.profilePicture ? [{ image: this.profilePicture, width: pageWidth * (colwidth / 100) - margin - padding * 2, marginBottom: 5 }] : []),
                        { text: "Coordonnées", style: ["text3"], lineHeight: 1, bold: true },
                        { text: profile.phone, link: "tel:" + profile.phone.replace(/\s/gm, ""), style: ["link", "text5"] },
                        { text: profile.email, link: "mailto:" + profile.email, style: ["link", "text5"] },
                        { text: profile.address + " - Mobile", style: "text5" },
                        { text: "Permis B - Véhiculé", style: "text5" },
                        { text: profile.github, link: "https://" + profile.github, style: ["link", "text5"] },
                        { text: profile.gitlab, link: "https://" + profile.gitlab, style: ["link", "text5"] },
                        { text: profile.linkedin, link: "https://" + profile.linkedin, style: ["link", "text5"] },
                        { text: "Compétences", style: ["margin2", "text3"], bold: true },
                        ...(await Promise.all(
                          categories.map(async (category, index) => ({
                            stack: [
                              { text: category.title, style: [index === 0 ? "" : "margin3", "text4"] },
                              ...(await Promise.all(
                                (skillsByCategory.get(category.id) ?? []).map(async (skill): Promise<Content> => ({
                                  layout: getTableLayout(),
                                  table: {
                                    // widths: ["auto", "*", "auto"],
                                    widths: ["auto", "*"],
                                    // body: [[skill.icon ? { svg: await getDeviconSvg(skill.icon), width: iconSize } : { text: skill.title[0].toUpperCase(), fontSize: iconSize, bold: true }, { text: skill.title, style: "text5", marginLeft: 2, verticalAlignment: "middle" }, { canvas: generateDotsCanvas(skill.level, "#525252"), verticalAlignment: "middle" }]],
                                    body: [[skill.icon ? { svg: await getDeviconSvg(skill.icon), width: iconSize } : { text: skill.title[0].toUpperCase(), fontSize: iconSize, bold: true }, { text: skill.title, style: "text5", marginLeft: 2, verticalAlignment: "middle" }]],
                                  },
                                })),
                              )),
                            ],
                          })),
                        )),
                        { text: "Langues", style: ["margin2", "text3"], bold: true },
                        {
                          layout: getTableLayout(),
                          table: {
                            widths: ["auto", "*", "auto"],
                            body: [
                              [
                                { svg: icons.english, width: iconSize, verticalAlignment: "middle" },
                                { text: "Anglais", style: "text5", marginLeft: 2, verticalAlignment: "middle" },
                                { canvas: generateDotsCanvas(3.5, "#525252"), verticalAlignment: "middle" },
                              ],
                              [
                                { svg: icons.spanish, width: iconSize, verticalAlignment: "middle" },
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
              layout: getTableLayout(0, 0, 0, 0),
              margin: [padding, margin + padding, margin + padding, margin + padding],
              table: {
                widths: ["*"],
                body: [
                  [{ text: profile.firstName + " " + profile.lastName, style: ["title", "text1"] }],
                  [{ text: profile.title, italics: true, style: ["title", "text3"] }],
                  [{ text: sections.map(section => section.text).join(" "), alignment: "justify", style: ["margin1", "text5"] }],
                  ...generateHeader("Expérience", icons.suitcase),
                  ...experiences.filter(e => e.type === "Expérience").map(experience => generateExperience(experience)),
                  ...generateHeader("Formation", icons.graduation),
                  ...experiences.filter(e => e.type === "Formation").map(experience => generateExperience(experience)),
                  ...generateHeader("Centres d'intérêt", icons.star),
                  [{ text: "Voyages • Pêche • Randonnée & camping • Cuisine & restaurants • Conception et maintenance d’un système de sonorisation • Organisation d’événements • Cinéma & séries", style: ["text5", "margin2"] }],
                ],
              },
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
        title: { alignment: "center" },
        margin1: { marginTop: 7 },
        margin2: { marginTop: 5 },
        margin3: { marginTop: 3 },
        margin4: { marginTop: 1 },
        header: { bold: true },
        headerIcon: {},
        date: { italics: true },
        link: { noWrap: true },
      },
    };
    return { steps: getSteps(sections, experiences, categories), url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(await pdfMake.createPdf(doc).getBlob())) };
  };
}

const generateExperience = (experience: Experience) => [
  {
    stack: [
      { text: experience.title, style: ["margin2", "text3"] },
      { text: experience.company + formatDateRange(experience.start, experience.end), style: ["date", "text4"] },
      ...(experience.description && experience.description.length ? [{ text: experience.description, style: "text5" }] : []),
      ...(experience.activities && experience.activities.length ? [{ ul: experience.activities, style: "text5" }] : []),
    ],
  },
];

const formatDateRange = (start: Date, end?: Date): string => {
  const formattedStart = start.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  if (!end) return " - depuis " + formattedStart;
  const formattedEnd = end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return " - " + formattedStart + " à " + formattedEnd;
};

const generateHeader = (title: string, icon: string) => [
  [{ text: "", style: "margin1", fontSize: 0 }],
  [
    {
      layout: getTableLayout(),
      table: {
        widths: ["auto", "*"],
        body: [
          [
            { svg: icon, width: 20, marginLeft: 5 },
            { text: title, style: ["text2", "header"], verticalAlignment: "bottom" as const, marginLeft: 5 },
          ],
        ],
      },
    },
  ],
  [{ text: "", fontSize: 0, marginTop: 1, fillColor: "#fbbf24" }],
];

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

const icons = {
  english:
    '<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#F5F5F5"/><rect width="1876" height="988" transform="translate(-1562 -900)" fill="white"/><path d="M30 0H0V20H30V0Z" fill="#F0F0F0"/><path d="M30 2.49976H0V4.99951H30V2.49976Z" fill="#D80027"/><path d="M30 7.49988H0V9.99964H30V7.49988Z" fill="#D80027"/><path d="M30 12.4994H0V14.9991H30V12.4994Z" fill="#D80027"/><path d="M30 17.4996H0V19.9994H30V17.4996Z" fill="#D80027"/><path d="M15 0H0V10.7692H15V0Z" fill="#2E52B2"/><path d="M5.84916 4.41162L5.60758 5.15482H4.82617L5.45846 5.61389L5.21687 6.35703L5.84916 5.89795L6.48104 6.35703L6.23951 5.61389L6.8718 5.15482H6.09033L5.84916 4.41162Z" fill="#F0F0F0"/><path d="M6.09033 7.83676L5.84916 7.09363L5.60758 7.83676H4.82617L5.45846 8.2959L5.21687 9.03904L5.84916 8.5799L6.48104 9.03904L6.23951 8.2959L6.8718 7.83676H6.09033Z" fill="#F0F0F0"/><path d="M2.78766 7.83676L2.54643 7.09363L2.30484 7.83676H1.52344L2.15572 8.2959L1.91414 9.03904L2.54643 8.5799L3.17836 9.03904L2.93684 8.2959L3.569 7.83676H2.78766Z" fill="#F0F0F0"/><path d="M2.54643 4.41162L2.30484 5.15482H1.52344L2.15572 5.61389L1.91414 6.35703L2.54643 5.89795L3.17836 6.35703L2.93684 5.61389L3.569 5.15482H2.78766L2.54643 4.41162Z" fill="#F0F0F0"/><path d="M5.84916 1.72961L5.60758 2.47287H4.82617L5.45846 2.932L5.21687 3.67514L5.84916 3.216L6.48104 3.67514L6.23951 2.932L6.8718 2.47287H6.09033L5.84916 1.72961Z" fill="#F0F0F0"/><path d="M2.54643 1.72961L2.30484 2.47287H1.52344L2.15572 2.932L1.91414 3.67514L2.54643 3.216L3.17836 3.67514L2.93684 2.932L3.569 2.47287H2.78766L2.54643 1.72961Z" fill="#F0F0F0"/><path d="M9.15184 4.41162L8.91031 5.15482H8.12891L8.76113 5.61389L8.51967 6.35703L9.15184 5.89795L9.78383 6.35703L9.54225 5.61389L10.1745 5.15482H9.39312L9.15184 4.41162Z" fill="#F0F0F0"/><path d="M9.39312 7.83676L9.15184 7.09363L8.91031 7.83676H8.12891L8.76113 8.2959L8.51967 9.03904L9.15184 8.5799L9.78383 9.03904L9.54225 8.2959L10.1745 7.83676H9.39312Z" fill="#F0F0F0"/><path d="M12.6958 7.83676L12.4546 7.09363L12.213 7.83676H11.4316L12.0638 8.2959L11.8223 9.03904L12.4546 8.5799L13.0865 9.03904L12.8449 8.2959L13.4772 7.83676H12.6958Z" fill="#F0F0F0"/><path d="M12.4546 4.41162L12.213 5.15482H11.4316L12.0638 5.61389L11.8223 6.35703L12.4546 5.89795L13.0865 6.35703L12.8449 5.61389L13.4772 5.15482H12.6958L12.4546 4.41162Z" fill="#F0F0F0"/><path d="M9.15184 1.72961L8.91031 2.47287H8.12891L8.76113 2.932L8.51967 3.67514L9.15184 3.216L9.78383 3.67514L9.54225 2.932L10.1745 2.47287H9.39312L9.15184 1.72961Z" fill="#F0F0F0"/><path d="M12.4546 1.72961L12.213 2.47287H11.4316L12.0638 2.932L11.8223 3.67514L12.4546 3.216L13.0865 3.67514L12.8449 2.932L13.4772 2.47287H12.6958L12.4546 1.72961Z" fill="#F0F0F0"/></svg>',
  spanish: '<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#F5F5F5"/><rect width="1876" height="988" transform="translate(-1160 -796)" fill="white"/><path d="M30 0H0V20H30V0Z" fill="#FFDA44"/><path d="M30 0H0V6.66643H30V0Z" fill="#D80027"/><path d="M30 13.3329H0V19.9993H30V13.3329Z" fill="#D80027"/></svg>',
  suitcase: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm64,24V200H96V72ZM40,72H80V200H40ZM216,200H176V72h40V200Z"></path></svg>',
  graduation:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"></path></svg>',
};

const getDeviconSvg = async (icon: string): Promise<string> => {
  if (!iconCache.has(icon)) {
    const folder = icon.includes("dot-net") ? "dot-net" : icon.split("-")[0];
    const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${folder}/${icon}.svg`;
    iconCache.set(
      icon,
      fetch(url).then(res => res.text()),
    );
  }
  return iconCache.get(icon)!;
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

const getSteps = (sections: Section[], experiences: Experience[], categories: Category[]): Step[] => [
  {
    route: "/",
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
