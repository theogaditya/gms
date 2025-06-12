export default function StatCard({ title, value, color = 'text-white' }: { title: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-blue-200 font-medium">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}