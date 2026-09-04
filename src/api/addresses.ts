import { api, unwrap } from "./axiosConfig";

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line: string;
  landmark?: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, "id">;

export const getAddresses = () => unwrap<Address[]>(api.get("/addresses"));

export const createAddress = (input: AddressInput) => unwrap<Address>(api.post("/addresses", input));

export const updateAddress = (id: string, input: Partial<AddressInput>) =>
  unwrap<Address>(api.patch(`/addresses/${id}`, input));

export const setDefaultAddress = (id: string) => unwrap<Address>(api.patch(`/addresses/${id}/default`));

export const deleteAddress = (id: string): Promise<void> => api.delete(`/addresses/${id}`).then(() => undefined);
