export interface DiaReadRepository {
  existe(id: number): Promise<boolean>;
}