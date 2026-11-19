export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="space-y-4">
      <div className="skeleton h-10 w-1/2" />
      <div className="skeleton h-44 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
    </div>
  );
}
