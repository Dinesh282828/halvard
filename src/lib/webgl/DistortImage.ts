import { gsap, damp } from "../motion";

/**
 * A single textured quad with pointer-reactive displacement.
 *
 * Written directly against WebGL rather than pulling in a scene graph — the
 * whole effect is one quad, and this keeps the bundle at a few hundred bytes
 * instead of a few hundred kilobytes.
 *
 * All instances share gsap's ticker, so N cards cost one rAF loop, and each
 * instance parks itself when scrolled out of view.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;

uniform sampler2D uTex;
uniform vec2  uPointer;      // 0..1, y measured from the bottom
uniform vec2  uVel;          // pointer velocity
uniform float uHover;        // eased 0..1
uniform float uTime;
uniform float uPlaneAspect;
uniform float uImgAspect;
uniform float uZoom;
uniform float uRipple;
uniform float uChroma;
uniform float uWave;

varying vec2 vUv;

/* Fit the texture to the plane the way object-fit: cover would. */
vec2 cover(vec2 uv) {
  vec2 r = vec2(
    min(uPlaneAspect / uImgAspect, 1.0),
    min(uImgAspect / uPlaneAspect, 1.0)
  );
  return (uv - 0.5) * r + 0.5;
}

void main() {
  vec2 uv = vUv;

  /* Zoom toward centre while hovered. */
  uv = (uv - 0.5) / (1.0 + uZoom * uHover) + 0.5;

  /* Slow shear that varies down the frame — driven by scroll velocity. */
  uv.x += sin(uv.y * 3.14159 + uTime * 0.35) * uWave;

  /* A decaying ring travelling out from the pointer. */
  vec2 d = uv - uPointer;
  d.x *= uPlaneAspect;
  float dist = length(d);
  float ring = sin(dist * 26.0 - uTime * 3.2) * exp(-dist * 6.0);
  uv -= normalize(d + 1e-5) * ring * uRipple * uHover;

  /* Smear against the direction of travel. */
  uv -= uVel * 0.05 * uHover;

  vec2 base = cover(uv);

  /* Split channels along travel, falling back to radial when still. */
  vec2 dir = length(uVel) > 0.001 ? normalize(uVel) : normalize(d + 1e-5);
  float amt = uChroma * (0.35 + length(uVel) * 6.0) * uHover;

  gl_FragColor = vec4(
    texture2D(uTex, base + dir * amt).r,
    texture2D(uTex, base).g,
    texture2D(uTex, base - dir * amt).b,
    1.0
  );
}`;

export type DistortOptions = {
  /** Extra scale applied while hovered. */
  zoom?: number;
  /** Ring displacement strength. */
  ripple?: number;
  /** Channel separation strength. */
  chroma?: number;
  /** Hover easing rate — higher settles faster. */
  ease?: number;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("shader: " + log);
  }
  return sh;
}

export class DistortImage {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private tex: WebGLTexture | null = null;
  private buf: WebGLBuffer | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};

  private ro?: ResizeObserver;
  private io?: IntersectionObserver;
  private visible = true;
  private ready = false;

  /* animated state */
  private hover = 0;
  private hoverTarget = 0;
  private pointer = { x: 0.5, y: 0.5 };
  private pointerEased = { x: 0.5, y: 0.5 };
  private vel = { x: 0, y: 0 };
  private velEased = { x: 0, y: 0 };
  private time = 0;
  private imgAspect = 1.5;

  /** Extra shear, driven externally from scroll velocity. */
  wave = 0;
  /** Multiplies ripple/chroma — animate this for a load-in settle. */
  intensity = 1;

  private opts: Required<DistortOptions>;
  private canvas: HTMLCanvasElement;
  private tick = (_t: number, dt: number) => this.render(dt);

  constructor(canvas: HTMLCanvasElement, src: string, opts: DistortOptions = {}) {
    this.canvas = canvas;
    this.opts = { zoom: 0.06, ripple: 0.018, chroma: 0.004, ease: 6, ...opts };

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    this.gl = gl;

    try {
      this.setup(src);
    } catch {
      /* Any GL failure leaves the underlying <img> visible. */
      this.gl = null;
    }
  }

  private setup(src: string) {
    const gl = this.gl!;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error("link: " + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);
    this.program = prog;

    this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), // oversized tri covers the quad
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of [
      "uTex", "uPointer", "uVel", "uHover", "uTime",
      "uPlaneAspect", "uImgAspect", "uZoom", "uRipple", "uChroma", "uWave",
    ]) {
      this.u[n] = gl.getUniformLocation(prog, n);
    }

    /* Placeholder texture so the first frames are never garbage. */
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([237, 234, 227, 255]),
    );

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (!this.gl) return;
      this.imgAspect = img.naturalWidth / img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.ready = true;
      this.canvas.dataset.ready = "true";
    };
    img.src = src;

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);

    this.io = new IntersectionObserver(
      ([e]) => (this.visible = e.isIntersecting),
      { rootMargin: "200px" },
    );
    this.io.observe(this.canvas);

    gsap.ticker.add(this.tick);
  }

  private resize() {
    const gl = this.gl;
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      /* Resizing clears the drawing buffer, so a plate that had settled and
         stopped drawing must be woken up or it stays blank. */
      this.settled = 0;
    }
    gl.viewport(0, 0, w, h);
  }

  /** Pointer position in client coordinates. */
  setPointer(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = (clientX - r.left) / r.width;
    const y = 1 - (clientY - r.top) / r.height; // GL origin is bottom-left
    this.vel.x = x - this.pointer.x;
    this.vel.y = y - this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
  }

  setHover(on: boolean) {
    this.hoverTarget = on ? 1 : 0;
  }

  private render(dt: number) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    const s = Math.min(dt, 50) / 1000;
    this.hover = damp(this.hover, this.hoverTarget, this.opts.ease, s);
    this.pointerEased.x = damp(this.pointerEased.x, this.pointer.x, 9, s);
    this.pointerEased.y = damp(this.pointerEased.y, this.pointer.y, 9, s);
    this.velEased.x = damp(this.velEased.x, this.vel.x, 5, s);
    this.velEased.y = damp(this.velEased.y, this.vel.y, 5, s);
    this.vel.x *= 0.9;
    this.vel.y *= 0.9;
    this.time += s;

    /* Nothing to show until the texture lands, and nothing to redraw while
       off-screen. Once the hover has fully decayed we draw two more frames to
       land on the resting image, then stop until something moves again. */
    if (!this.ready || !this.visible) return;
    const settled =
      this.hover < 0.002 && this.hoverTarget === 0 && Math.abs(this.wave) < 1e-4;
    if (settled && this.settled > 2) return;
    this.settled = settled ? this.settled + 1 : 0;

    gl.useProgram(this.program);
    gl.uniform1i(this.u.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform2f(this.u.uPointer, this.pointerEased.x, this.pointerEased.y);
    gl.uniform2f(this.u.uVel, this.velEased.x, this.velEased.y);
    gl.uniform1f(this.u.uHover, this.hover);
    gl.uniform1f(this.u.uTime, this.time);
    gl.uniform1f(this.u.uPlaneAspect, this.canvas.width / this.canvas.height);
    gl.uniform1f(this.u.uImgAspect, this.imgAspect);
    gl.uniform1f(this.u.uZoom, this.opts.zoom);
    gl.uniform1f(this.u.uRipple, this.opts.ripple * this.intensity);
    gl.uniform1f(this.u.uChroma, this.opts.chroma * this.intensity);
    gl.uniform1f(this.u.uWave, this.wave);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Consecutive frames drawn since the effect came to rest. */
  private settled = 0;

  destroy() {
    gsap.ticker.remove(this.tick);
    this.ro?.disconnect();
    this.io?.disconnect();
    const gl = this.gl;
    if (!gl) return;
    gl.deleteTexture(this.tex);
    gl.deleteBuffer(this.buf);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl = null;
  }
}
