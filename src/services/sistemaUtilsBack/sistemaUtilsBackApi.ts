import type { AxiosInstance } from "axios";
import { ApiError } from "@/services/http/apiError";
import {
  descricaoIDListSchema,
  estadoModelListSchema,
  municipioModelListSchema,
  type DescricaoID,
  type EstadoModel,
  type MunicipioModel,
} from "./models";

export class SistemaUtilsBackApi {
  constructor(private readonly http: AxiosInstance) {}

  async getTiposLogradouro(): Promise<DescricaoID[]> {
    try {
      const res = await this.http.get("/utils/tipologradouro", { skipAuth: true });
      const parsed = descricaoIDListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar tipos de logradouro.");
    }
  }

  async getTiposTelefone(): Promise<DescricaoID[]> {
    try {
      const res = await this.http.get("/utils/tipotelefone", { skipAuth: true });
      const parsed = descricaoIDListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar tipos de telefone.");
    }
  }

  async getTiposUsuario(): Promise<DescricaoID[]> {
    try {
      const res = await this.http.get("/utils/tipousuario", { skipAuth: true });
      const parsed = descricaoIDListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar tipos de usuário.");
    }
  }

  async getEstados(): Promise<EstadoModel[]> {
    try {
      const res = await this.http.get("/utils/estados", { skipAuth: true });
      const parsed = estadoModelListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar estados.");
    }
  }

  async getMunicipios(): Promise<MunicipioModel[]> {
    try {
      const res = await this.http.get("/utils/municipios", { skipAuth: true });
      const parsed = municipioModelListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar municípios.");
    }
  }

  async getMunicipiosByUf(uf: string): Promise<MunicipioModel[]> {
    try {
      const res = await this.http.get(`/utils/municipios/UF/${encodeURIComponent(uf)}`, { skipAuth: true });
      const parsed = municipioModelListSchema.safeParse(res.data);
      return parsed.success ? parsed.data : [];
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar municípios por UF.");
    }
  }

  async getMunicipioById(id: number): Promise<MunicipioModel | null> {
    try {
      const res = await this.http.get(`/utils/municipios/ID/${id}`, { skipAuth: true });
      const parsed = municipioModelListSchema.safeParse(res.data);
      return parsed.success ? (parsed.data[0] ?? null) : null;
    } catch (err) {
      throw ApiError.fromUnknown(err, "Falha ao buscar município por ID.");
    }
  }
}
