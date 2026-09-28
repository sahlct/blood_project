import prisma from "@/lib/prisma";

// Default application setting values
const DEFAULT_SETTINGS: Record<string, string> = {
  MIN_DONATION_INTERVAL_DAYS: process.env.MIN_DONATION_INTERVAL_DAYS || "90",
  SITE_NAME: "BloodLife Network",
  SITE_TAGLINE: "Every Drop Can Save a Life",
  CONTACT_EMAIL: "support@bloodlife.org",
  CONTACT_PHONE: "+91 98765 43210",
  REQUIRE_DONOR_VERIFICATION: "true",
  PUBLIC_DONOR_VISIBILITY: "true",
  DEFAULT_COUNTRY: "India",
  DEFAULT_STATE: "Kerala",
  ENABLE_REGISTRATIONS: "true",
  MAINTENANCE_MODE: "false",
};

/**
 * Get an application setting by key from the database, falling back to defaults.
 */
export async function getSetting(key: string): Promise<string> {
  try {
    const setting = await prisma.applicationSetting.findUnique({
      where: { key },
    });
    if (setting) return setting.value;
  } catch (error) {
    console.error(`Error fetching setting for key "${key}":`, error);
  }
  return DEFAULT_SETTINGS[key] ?? "";
}

/**
 * Get a numeric setting (such as donation interval days).
 */
export async function getNumericSetting(key: string, fallback = 90): Promise<number> {
  const value = await getSetting(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get all public application settings.
 */
export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const settings = await prisma.applicationSetting.findMany({
      where: { isPublic: true },
    });
    const map = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Upsert an application setting (Admin only).
 */
export async function updateSetting(
  key: string,
  value: string,
  group = "GENERAL",
  description?: string,
  isPublic = false
) {
  return await prisma.applicationSetting.upsert({
    where: { key },
    update: { value, group, description, isPublic },
    create: { key, value, group, description, isPublic },
  });
}
