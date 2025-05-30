import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { formProject, Project } from "@classes/project";
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
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { cloudinaryConfig } from "src/main";
import { ProjectComponent } from "./project/project.component";

const SERVICE_VARIABLE: ServiceConfig<Project> = {
  type: Project,
  form: formProject,
  collection: "projects",
  order: ["start", "desc"],
  compareFn: (a, b) => b.start.getTime() - a.start.getTime(),
};

@Component({
  selector: "app-projects",
  imports: [CommonModule, ReactiveFormsModule, ProjectComponent, ButtonModule, DialogModule, TooltipModule, InputGroupModule, DatePickerModule, InputTextModule, TextareaModule, FileUploadModule],
  templateUrl: "./projects.component.html",
  providers: [CrudService<Project>, { provide: SERVICE_CONFIG, useValue: SERVICE_VARIABLE }],
})
export class ProjectsComponent extends CrudComponent<Project> {
  activities: string[] = [];
  images: string;
  constructor(crudService: CrudService<Project>, authService: AuthService, confirmService: ConfirmService) {
    super(crudService, authService, confirmService);
  }
  add = (activity: string) => {
    this.activities.push(activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override async create(images: File[]) {
    const result = images.length ? await this.uploadImages(images) : "";
    if (result === false) return false;
    return await super.create({ ...this.form.value, images: result } as Project);
  }
  move = (activity: string, up: boolean = false) => {
    let fromIndex = this.activities.indexOf(activity);
    if ((fromIndex == 0 && up) || (fromIndex == this.activities.length - 1 && !up)) return;
    var element = this.activities[fromIndex];
    this.activities.splice(fromIndex, 1);
    this.activities.splice(fromIndex + (up ? -1 : 1), 0, element);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override open(item?: Project) {
    this.activities = item ? item.activities.split(";") : [];
    this.images = item ? item.images : "";
    super.open(item);
  }
  remove = (activity: string) => {
    this.activities = this.activities.filter((act) => act != activity);
    this.form.patchValue({ activities: this.activities.join(";") });
  };
  override async update(images: File[]) {
    const result = images.length ? (await this.deleteImages(this.images)) && (await this.uploadImages(images)) : (this.form.value as Project).images;
    if (result === false) return false;
    super.update({ ...this.form.value, images: result } as Project);
    return true;
  }
  private deleteImages = async (images: string) => {
    if (images === "") return true;
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let promises: Promise<boolean>[] = [];
    const cloudinary = (await this.cloudinary())!;
    for (let image of images.split(";")) {
      const formdata = new FormData();
      formdata.append("public_id", "nicolasPaillard/" + image);
      formdata.append("signature", sha1.hash(new URLSearchParams({ public_id: "nicolasPaillard/" + image, timestamp: timestamp }).toString().replace("%2F", "/") + cloudinary.api_secret));
      formdata.append("api_key", cloudinary.api_key);
      formdata.append("timestamp", timestamp);
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`, { method: "POST", body: formdata })
          .then(async (response) => {
            const data = JSON.parse(await response.text());
            if (["ok", "not found"].includes(data.result)) return true;
            console.error(data);
            return false;
          })
          .catch((error) => {
            console.error(error);
            return false;
          }),
      );
    }
    return !(await Promise.all(promises)).includes(false);
  };
  private uploadImages = async (files: File[]) => {
    if (!files.length) return "";
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let promises: Promise<boolean | string>[] = [];
    const cloudinary = (await this.cloudinary())!;
    for (let file of files) {
      const formData: FormData = new FormData();
      formData.append("file", file);
      formData.append("api_key", cloudinary.api_key);
      formData.append("upload_preset", "ml_default");
      formData.append("timestamp", timestamp);
      formData.append("signature", sha1.hash(new URLSearchParams({ folder: "nicolasPaillard", timestamp: timestamp, upload_preset: "ml_default" }).toString() + cloudinary.api_secret));
      formData.append("folder", "nicolasPaillard");
      promises.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, { method: "POST", body: formData })
          .then(async (response) => {
            const data = JSON.parse(await response.text());
            if (data.public_id) return data.public_id.split("/")[1];
            console.error(data);
            return false;
          })
          .catch((error) => {
            console.error(error);
            return false;
          }),
      );
    }
    const responses = await Promise.all(promises);
    return responses.includes(false) ? false : responses.join(";");
  };
}
namespace sha1 {
  var POW_2_24 = Math.pow(2, 24);

  var POW_2_32 = Math.pow(2, 32);

  function hex(n: number): string {
    var s = "",
      v: number;
    for (var i = 7; i >= 0; --i) {
      v = (n >>> (i << 2)) & 0xf;
      s += v.toString(16);
    }
    return s;
  }

  function lrot(n: number, bits: number): number {
    return (n << bits) | (n >>> (32 - bits));
  }

  class Uint32ArrayBigEndian {
    bytes: Uint8Array;
    constructor(length: number) {
      this.bytes = new Uint8Array(length << 2);
    }
    get(index: number): number {
      index <<= 2;
      return this.bytes[index] * POW_2_24 + ((this.bytes[index + 1] << 16) | (this.bytes[index + 2] << 8) | this.bytes[index + 3]);
    }
    set(index: number, value: number) {
      var high = Math.floor(value / POW_2_24),
        rest = value - high * POW_2_24;
      index <<= 2;
      this.bytes[index] = high;
      this.bytes[index + 1] = rest >> 16;
      this.bytes[index + 2] = (rest >> 8) & 0xff;
      this.bytes[index + 3] = rest & 0xff;
    }
  }

  function string2ArrayBuffer(s: string): ArrayBuffer {
    s = s.replace(/[\u0080-\u07ff]/g, function (c: string) {
      var code = c.charCodeAt(0);
      return String.fromCharCode(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    });
    s = s.replace(/[\u0080-\uffff]/g, function (c: string) {
      var code = c.charCodeAt(0);
      return String.fromCharCode(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    });
    var n = s.length,
      array = new Uint8Array(n);
    for (var i = 0; i < n; ++i) {
      array[i] = s.charCodeAt(i);
    }
    return array.buffer;
  }

  export function hash(bufferOrString: any): string {
    var source: ArrayBuffer;
    if (bufferOrString instanceof ArrayBuffer) {
      source = <ArrayBuffer>bufferOrString;
    } else {
      source = string2ArrayBuffer(String(bufferOrString));
    }

    var h0 = 0x67452301,
      h1 = 0xefcdab89,
      h2 = 0x98badcfe,
      h3 = 0x10325476,
      h4 = 0xc3d2e1f0,
      i: number,
      sbytes = source.byteLength,
      sbits = sbytes << 3,
      minbits = sbits + 65,
      bits = Math.ceil(minbits / 512) << 9,
      bytes = bits >>> 3,
      slen = bytes >>> 2,
      s = new Uint32ArrayBigEndian(slen),
      s8 = s.bytes,
      j: number,
      w = new Uint32Array(80),
      sourceArray = new Uint8Array(source);
    for (i = 0; i < sbytes; ++i) {
      s8[i] = sourceArray[i];
    }
    s8[sbytes] = 0x80;
    s.set(slen - 2, Math.floor(sbits / POW_2_32));
    s.set(slen - 1, sbits & 0xffffffff);
    for (i = 0; i < slen; i += 16) {
      for (j = 0; j < 16; ++j) {
        w[j] = s.get(i + j);
      }
      for (; j < 80; ++j) {
        w[j] = lrot(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      }
      var a = h0,
        b = h1,
        c = h2,
        d = h3,
        e = h4,
        f: number,
        k: number,
        temp: number;
      for (j = 0; j < 80; ++j) {
        if (j < 20) {
          f = (b & c) | (~b & d);
          k = 0x5a827999;
        } else if (j < 40) {
          f = b ^ c ^ d;
          k = 0x6ed9eba1;
        } else if (j < 60) {
          f = (b & c) ^ (b & d) ^ (c & d);
          k = 0x8f1bbcdc;
        } else {
          f = b ^ c ^ d;
          k = 0xca62c1d6;
        }

        temp = (lrot(a, 5) + f + e + k + w[j]) & 0xffffffff;
        e = d;
        d = c;
        c = lrot(b, 30);
        b = a;
        a = temp;
      }
      h0 = (h0 + a) & 0xffffffff;
      h1 = (h1 + b) & 0xffffffff;
      h2 = (h2 + c) & 0xffffffff;
      h3 = (h3 + d) & 0xffffffff;
      h4 = (h4 + e) & 0xffffffff;
    }
    return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4);
  }
}
