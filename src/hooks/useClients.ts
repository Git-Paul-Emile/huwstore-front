import { useQuery } from "@tanstack/react-query";
import { getClients } from "../api/clients";

export const useClients = () => useQuery({ queryKey: ["clients"], queryFn: getClients });
