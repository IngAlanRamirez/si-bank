import type { ServiceBiller } from "./types";

export const SERVICE_BILLERS: ServiceBiller[] = [
  { id: "cfe", name: "CFE", icon: "Zap", category: "Luz" },
  { id: "telmex", name: "Telmex", icon: "Phone", category: "Teléfono" },
  { id: "totalplay", name: "Totalplay", icon: "Tv", category: "Internet" },
  { id: "aguakan", name: "Aguakan", icon: "Droplet", category: "Agua" },
  { id: "predial", name: "Predial", icon: "Building2", category: "Gobierno" },
  { id: "gas", name: "Gas Natural", icon: "Flame", category: "Gas" },
];

export function getServiceBillers(): ServiceBiller[] {
  return SERVICE_BILLERS;
}

export function getServiceById(id: string): ServiceBiller | undefined {
  return SERVICE_BILLERS.find((s) => s.id === id);
}
