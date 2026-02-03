/**
 * Generate a unique visitor fingerprint based on browser characteristics
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // User agent
  components.push(navigator.userAgent);

  // Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 0));

  // Device memory (if available)
  if ("deviceMemory" in navigator) {
    components.push(String((navigator as any).deviceMemory));
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Hello, World!", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Hello, World!", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas fingerprinting blocked or failed
    components.push("canvas-blocked");
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    components.push("webgl-blocked");
  }

  // Combine all components and hash
  const fingerprint = await hashString(components.join("|||"));
  return fingerprint;
}

/**
 * Simple hash function using SubtleCrypto API
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  deviceName: string;
} {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let type: "mobile" | "tablet" | "desktop" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    type = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    type = "mobile";
  }

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  // Detect specific device model
  let deviceName = "Unknown Device";

  // Apple devices
  if (ua.includes("macintosh")) {
    if (ua.includes("arm")) {
      deviceName = "MacBook (Apple Silicon)";
    } else {
      deviceName = "MacBook";
    }
    // More specific Mac models
    if (ua.includes("mac")) deviceName = "Mac";
  } else if (ua.includes("iphone")) {
    // Extract iPhone model
    const iphoneMatch = userAgent.match(/iPhone(\d{1,2}[,_]\d)/i);
    if (iphoneMatch) {
      deviceName = `iPhone ${iphoneMatch[1].replace(/[,_]/, ".")}`;
    } else if (ua.includes("iphone")) {
      deviceName = "iPhone";
    }
  } else if (ua.includes("ipad")) {
    deviceName = "iPad";
  }
  // Android devices
  else if (ua.includes("android")) {
    // Samsung
    if (ua.includes("samsung") || ua.includes("sm-")) {
      const samsungMatch = userAgent.match(/SM-([A-Z0-9]+)/i);
      if (samsungMatch) {
        deviceName = `Samsung ${samsungMatch[1]}`;
      } else {
        deviceName = "Samsung";
      }
    }
    // Google Pixel
    else if (ua.includes("pixel")) {
      const pixelMatch = userAgent.match(/Pixel (\d+[a-z]*)/i);
      if (pixelMatch) {
        deviceName = `Google Pixel ${pixelMatch[1]}`;
      } else {
        deviceName = "Google Pixel";
      }
    }
    // OnePlus
    else if (ua.includes("oneplus")) {
      const oneplusMatch = userAgent.match(/ONEPLUS ([A-Z0-9]+)/i);
      if (oneplusMatch) {
        deviceName = `OnePlus ${oneplusMatch[1]}`;
      } else {
        deviceName = "OnePlus";
      }
    }
    // Xiaomi
    else if (ua.includes("mi ") || ua.includes("redmi")) {
      if (ua.includes("redmi")) {
        deviceName = "Xiaomi Redmi";
      } else {
        deviceName = "Xiaomi";
      }
    } else {
      deviceName = "Android Device";
    }
  }
  // Windows devices
  else if (ua.includes("windows")) {
    if (ua.includes("surface")) {
      deviceName = "Microsoft Surface";
    } else {
      deviceName = "Windows PC";
    }
  }
  // Linux
  else if (ua.includes("linux")) {
    deviceName = "Linux PC";
  }

  return { type, os, browser, deviceName };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
