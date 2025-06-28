export default function ComplaintSkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-gray-700 rounded-full animate-pulse w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-5 bg-gray-700 rounded-full animate-pulse w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-16"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
        </div>
      </td>
    </tr>
  );
}