import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  constructor() {}
  setMatrix = (enabled: boolean) => localStorage.setItem("matrix", enabled.toString());
  getMatrix = () => localStorage.getItem("matrix") === "true";
}
