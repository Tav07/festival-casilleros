export interface AsistenteReadRepository {
  existe(id: number): Promise<boolean>;
}