import { z } from "zod";

export type DescricaoID = {
  id: number;
  descricao: string;
};

export type EstadoModel = {
  id: number;
  descricao: string;
  sigla?: string | null;
};

export type MunicipioModel = {
  id: number;
  descricao?: string | null;
  estado?: EstadoModel;
};

export const descricaoIDSchema = z.object({
  id: z.number(),
  descricao: z.string(),
});

export const descricaoIDListSchema = z.array(descricaoIDSchema);

export const estadoModelSchema = z.object({
  id: z.number(),
  descricao: z.string(),
  sigla: z.string().nullable().optional(),
});

export const estadoModelListSchema = z.array(estadoModelSchema);

export const municipioModelSchema = z.object({
  id: z.number(),
  descricao: z.string().nullable().optional(),
  estado: estadoModelSchema.optional(),
});

export const municipioModelListSchema = z.array(municipioModelSchema);
