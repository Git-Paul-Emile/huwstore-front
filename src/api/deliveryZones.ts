import { api, unwrap } from "./axiosConfig";
import type { Zone } from "../data";

export type DeliveryZoneInput = Omit<Zone, "id">;

export const getDeliveryZones = () => unwrap<Zone[]>(api.get("/delivery-zones"));

export const createDeliveryZone = (input: DeliveryZoneInput) => unwrap<Zone>(api.post("/delivery-zones", input));

export const updateDeliveryZone = (id: string, input: Partial<DeliveryZoneInput>) =>
  unwrap<Zone>(api.patch(`/delivery-zones/${id}`, input));

export const deleteDeliveryZone = (id: string): Promise<void> =>
  api.delete(`/delivery-zones/${id}`).then(() => undefined);
