export default function AdminSkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-full"></div>
        </td>
      ))}
    </tr>
  );
}