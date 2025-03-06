import { Injectable } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc } from "@angular/fire/firestore";
import { ReplaySubject, Subject } from "rxjs";
import { cloudinaryConfig } from "src/main";

@Injectable({
  providedIn: "root",
})
export class ProjectsService {
  private __projects: Project[] = [];
  private _projects: Subject<Project[]> = new ReplaySubject(1);
  constructor(private db: Firestore) {
    try {
      getDocs(query(collection(this.db, "data", "projects", "projects"), orderBy("start", "desc"))).then((documents) =>
        documents.forEach((doc) => {
          let project: Project = new Project(doc.data() as any);
          project.id = doc.id;
          project.start = doc.data()["start"].toDate();
          project.end = doc.data()["end"].toDate();
          this.__projects.push(project);
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      this._projects.next(this.__projects);
    }
  }
  projects = () => this._projects.asObservable();
  private uploadImages = async (files: File[]) => {
    let cloudinaryKeys: { api_key: string; api_secret: string };
    try {
      cloudinaryKeys = (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as any;
    } catch (error) {
      console.error(error);
      return false;
    }
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let responses: Promise<boolean | string>[] = [];
    for (let file of files) {
      const formData: FormData = new FormData();
      formData.append("file", file);
      formData.append("api_key", cloudinaryKeys.api_key);
      formData.append("upload_preset", "ml_default");
      formData.append("timestamp", timestamp);
      formData.append("signature", sha1.hash(new URLSearchParams({ folder: "nicolasPaillard", timestamp: timestamp, upload_preset: "ml_default" }).toString() + cloudinaryKeys.api_secret));
      formData.append("folder", "nicolasPaillard");
      responses.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, { method: "POST", body: formData })
          .then((response) => response.text())
          .then((result) => {
            const data = JSON.parse(result);
            if (!data.public_id) {
              console.error(data);
              return false;
            }
            return data.public_id.split("/")[1];
          })
          .catch((error) => {
            console.error(error);
            return false;
          }),
      );
    }
    const values = await Promise.all(responses);
    return values.includes(false) ? false : values.join(";");
  };
  private deleteImages = async (images: string) => {
    let cloudinaryKeys: { api_key: string; api_secret: string };
    try {
      cloudinaryKeys = (await getDoc(doc(this.db, "keys", "cloudinary"))).data() as any;
    } catch (error) {
      console.error(error);
      return false;
    }
    const timestamp: string = Math.round(new Date().getTime() / 1000).toString();
    let responses: Promise<boolean>[] = [];
    for (let image of images.split(";")) {
      const formdata = new FormData();
      formdata.append("public_id", "nicolasPaillard/" + image);
      formdata.append("signature", sha1.hash(new URLSearchParams({ public_id: "nicolasPaillard/" + image, timestamp: timestamp }).toString().replace("%2F", "/") + cloudinaryKeys.api_secret));
      formdata.append("api_key", cloudinaryKeys.api_key);
      formdata.append("timestamp", timestamp);
      responses.push(
        fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`, { method: "POST", body: formdata })
          .then((response) => response.text())
          .then((result) => {
            const data = JSON.parse(result);
            if (!["ok", "not found"].includes(data.result)) {
              console.error(data);
              return false;
            }
            return true;
          })
          .catch((error) => {
            console.error(error);
            return false;
          }),
      );
    }
    return !(await Promise.all(responses)).includes(false);
  };
  createProject = async (project: Project, images: File[]) => {
    let result = await this.uploadImages(images);
    if (typeof result === "string")
      try {
        project.images = result;
        project.id = (await addDoc(collection(this.db, "data", "projects", "projects"), project)).id;
        this.__projects.push(project);
        this.__projects = this.__projects.sort((project1, project2) => (project1.start == project2.start ? 0 : project1.start > project2.start ? 1 : -1));
        this._projects.next(this.__projects);
      } catch (error) {
        console.error(error);
      }
  };
  updateProject = async (project: Project, images: File[]) => {
    if (images.length && !(await this.deleteImages(project.images))) return;
    const result = images.length ? await this.uploadImages(images) : "";
    if (typeof result === "string")
      try {
        if (images.length) project.images = result;
        let newProject = new Project(project);
        delete newProject.id;
        setDoc(doc(this.db, "data", "projects", "projects", project.id!), Object.assign({}, newProject));
        this.__projects[this.__projects.findIndex((tmp) => tmp.id === project.id)] = project;
        this._projects.next(this.__projects);
      } catch (error) {
        console.error(error);
      }
  };
  deleteProject = async (project: Project) => {
    if (await this.deleteImages(project.images))
      try {
        deleteDoc(doc(this.db, "data", "projects", "projects", project.id!));
        // prettier-ignore
        this.__projects.splice(this.__projects.findIndex((tmp) => tmp.id === project.id),1);
        this._projects.next(this.__projects);
      } catch (error) {
        console.error(error);
      }
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
