export function TaskTableSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
      <div className="h-16 bg-gray-200 mb-4"></div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-6 py-3 text-left">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="border-b">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
