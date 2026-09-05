import { Application, formApplication } from "@classes/application";
import { Category, formCategory } from "@classes/category";
import { Experience, formExperience } from "@classes/experience";
import { Profile, formProfile } from "@classes/profile";
import { Project, formProject } from "@classes/project";
import { Section, formSection } from "@classes/section";
import { Skill, formSkill } from "@classes/skill";
import { ServiceConfig } from "@services/crud.service";

export const CONFIG_PROJECTS: ServiceConfig<Project> = { type: Project, form: formProject, collection: "projects", order: ["start", "desc"] };
export const CONFIG_PROFILES: ServiceConfig<Profile> = { type: Profile, form: formProfile, collection: "profile", order: ["lastName"] };
export const CONFIG_SECTIONS: ServiceConfig<Section> = { type: Section, form: formSection, collection: "sections", order: ["rank"] };
export const CONFIG_EXPERIENCES: ServiceConfig<Experience> = { type: Experience, form: formExperience, collection: "experiences", order: ["start", "desc"] };
export const CONFIG_APPLICATIONS: ServiceConfig<Application> = { type: Application, form: formApplication, collection: "applications", order: ["title"] };
export const CONFIG_SKILLS: ServiceConfig<Skill> = { type: Skill, form: formSkill, collection: "skills", order: ["title"] };
export const CONFIG_CATEGORIES: ServiceConfig<Category> = { type: Category, form: formCategory, collection: "categories", order: ["rank"] };
