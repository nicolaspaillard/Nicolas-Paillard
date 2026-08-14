import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  getMatrix = () => localStorage.getItem("matrix") === "true";
  setMatrix = (enabled: boolean) => localStorage.setItem("matrix", enabled.toString());
}
