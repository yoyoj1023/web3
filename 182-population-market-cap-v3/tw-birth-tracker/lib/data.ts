import sql from './db';

/**
 * 定義資料型別
 */
export interface BirthRecord {
  id: number;
  year: number;
  births: number;
  created_at: Date;
}

/**
 * 取得所有出生人數資料，按年份升序排列
 */
export async function getBirthData(): Promise<BirthRecord[]> {
  try {
    const data = await sql<BirthRecord[]>`
      SELECT id, year, births, created_at 
      FROM taiwan_births 
      ORDER BY year ASC
    `;
    return data;
  } catch (error) {
    console.error('❌ 資料庫查詢失敗:', error);
    throw new Error('Failed to fetch birth data');
  }
}

/**
 * 取得特定年份的出生人數
 */
export async function getBirthByYear(year: number): Promise<BirthRecord | null> {
  try {
    const data = await sql<BirthRecord[]>`
      SELECT id, year, births, created_at 
      FROM taiwan_births 
      WHERE year = ${year}
    `;
    return data[0] || null;
  } catch (error) {
    console.error('❌ 查詢失敗:', error);
    return null;
  }
}

/**
 * 取得出生人數統計資訊
 */
export async function getBirthStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_years,
        AVG(births)::INT as avg_births,
        MAX(births) as max_births,
        MIN(births) as min_births
      FROM taiwan_births
    `;
    return stats[0];
  } catch (error) {
    console.error('❌ 統計查詢失敗:', error);
    throw new Error('Failed to fetch birth statistics');
  }
}