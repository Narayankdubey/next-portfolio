// Browser, OS, and Device detection utilities

export interface VisitorDetails {
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  timezone: string;
  language: string;
  referrer: string;
  userAgent: string;
  latitude?: number;
  longitude?: number;
}

export function detectBrowser(): string {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "";

  if (ua.includes("Firefox/")) {
    browser = "Firefox";
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    browser = "Chrome";
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    browser = "Safari";
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "";
  } else if (ua.includes("Opera/") || ua.includes("OPR/")) {
    browser = "Opera";
    version = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || "";
  }

  return version ? `${browser} ${version}` : browser;
}

export function detectOS(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (platform.includes("Linux")) return "Linux";

  return "Unknown";
}

export function detectDevice(): string {
  const ua = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "Mobile";
  }
  return "Desktop";
}

export function getVisitorDetails(): VisitorDetails {
  return {
    browser: detectBrowser(),
    os: detectOS(),
    device: detectDevice(),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    referrer: document.referrer || "Direct",
    userAgent: navigator.userAgent,
  };
}

export async function getVisitorDetailsWithLocation(): Promise<VisitorDetails> {
  const baseDetails = getVisitorDetails();

  // Try to get geolocation if available
  if ("geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0,
          enableHighAccuracy: true, // Request high accuracy
        });
      });

      console.log("✅ Geolocation obtained:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      return {
        ...baseDetails,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      // User denied permission or error occurred, return without location
      console.log("❌ Geolocation not available:", error);
      return baseDetails;
    }
  }

  console.log("⚠️ Geolocation API not supported");
  return baseDetails;
}
