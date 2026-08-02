import { getBirthData, getBirthStats } from '@/lib/data';

export default async function Home() {
  // 並行查詢（Promise.all）
  const [birthData, stats] = await Promise.all([
    getBirthData(),
    getBirthStats(),
  ]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          台灣出生人口趨勢
        </h1>
        <p className="text-gray-600 mb-8">
          資料年份：{birthData[0].year} - {birthData[birthData.length - 1].year}
        </p>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="資料年數" value={stats.total_years} />
          <StatCard title="平均出生數" value={stats.avg_births.toLocaleString()} />
          <StatCard title="最高記錄" value={stats.max_births.toLocaleString()} />
          <StatCard title="最低記錄" value={stats.min_births.toLocaleString()} />
        </div>

        {/* 資料表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  年份
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  出生人數
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  年變化
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {birthData.map((record, index) => {
                const previousBirths = index > 0 ? birthData[index - 1].births : null;
                const change = previousBirths ? record.births - previousBirths : null;
                const changePercent = previousBirths 
                  ? ((change! / previousBirths) * 100).toFixed(2) 
                  : null;

                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {record.births.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      change === null ? 'text-gray-400' : change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change === null ? '-' : (
                        <>
                          {change > 0 ? '+' : ''}{change.toLocaleString()} 
                          <span className="text-xs ml-1">({changePercent}%)</span>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// 統計卡片組件
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}