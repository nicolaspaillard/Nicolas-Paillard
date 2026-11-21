import { Component, DestroyRef, effect, inject } from "@angular/core";
import { usePreset } from "@openng/optimus-ui-themes";
import { Amber } from "@themes/amber.preset";
import { BackgroundService } from "./background.service";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
const FONT_SIZE = 10;
const SHAPES_COUNT = 15;

@Component({
  selector: "app-background",
  templateUrl: "./background.html",
})
export class Background {
  protected readonly background = inject(BackgroundService);
  private destroyRef = inject(DestroyRef);
  private interval?: ReturnType<typeof setInterval>;
  constructor() {
    effect(() => {
      const enableMatrix = this.background.enableMatrix();
      void this.applyPreset(enableMatrix);
    });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.destroyRef.onDestroy(() => {
      clearInterval(this.interval);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    });
  }

  animate = () => {
    clearInterval(this.interval);
    if (this.background.enableMatrix()) this.animateMatrix();
    else this.animateShapes();
  };

  private animateMatrix() {
    const canvas = document.querySelector("canvas")!;
    const context = canvas.getContext("2d")!;
    context.reset();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const drops = Array.from({ length: Math.ceil(canvas.width / FONT_SIZE) }, () => canvas.height + 1);
    this.interval = setInterval(() => {
      context.fillStyle = "rgba(0, 0, 0, .18)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < drops.length; i++) {
        const text = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        context.fillStyle = "rgba(0,200,0,0.8)";
        context.fillText(text, i * FONT_SIZE, drops[i] * FONT_SIZE);
        drops[i]++;
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.99) drops[i] = 0;
      }
    }, 60);
  }

  private animateShapes() {
    if (document.querySelectorAll("#animation>span").length) return;
    const container = document.getElementById("animation")!;
    for (let i = 0; i < SHAPES_COUNT; i++) {
      const shape = document.createElement("span");
      shape.classList.add("border-primary", "border", "border-2", "absolute", "animate-slide", "rounded-lg");
      shape.style.animationDelay = Math.random() * 3 + "s";
      shape.style.animationDuration = Math.random() * 4 + 4 + "s";
      shape.style.setProperty("--slide-distance", (Math.random() < 0.5 ? "" : "-") + Math.random() * 100 + 50 + "px");
      shape.style.width = Math.random() * 250 + 50 + "px";
      shape.style.height = Math.random() * 250 + 50 + "px";
      shape.style.left = Math.random() * 100 + "%";
      shape.style.top = Math.random() * 100 + "%";
      shape.style.opacity = Math.random() * 0.4 + 0.1 + "";
      container.append(shape);
    }
  }
  private async applyPreset(enableMatrix: boolean) {
    const preset = enableMatrix ? (await import("@themes/matrix.preset")).Matrix : Amber;
    if (enableMatrix !== this.background.enableMatrix()) return;
    usePreset(preset);
    requestAnimationFrame(() => this.animate());
  }

  private readonly handleVisibilityChange = () => {
    if (document.hidden) clearInterval(this.interval);
    else this.animate();
  };
}
