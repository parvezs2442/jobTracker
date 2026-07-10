export default function Features() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 py-20 md:grid-cols-4">

      <div className="rounded-xl border p-8">
        <h3 className="text-xl font-bold">Dashboard</h3>
        <p className="mt-3 text-gray-600">
          View all application statistics.
        </p>
      </div>

      <div className="rounded-xl border p-8">
        <h3 className="text-xl font-bold">Manage Jobs</h3>
        <p className="mt-3 text-gray-600">
          Create, update and delete jobs.
        </p>
      </div>

      <div className="rounded-xl border p-8">
        <h3 className="text-xl font-bold">Analytics</h3>
        <p className="mt-3 text-gray-600">
          Track interviews and offers.
        </p>
      </div>

      <div className="rounded-xl border p-8">
        <h3 className="text-xl font-bold">Secure</h3>
        <p className="mt-3 text-gray-600">
          JWT Authentication with protected routes.
        </p>
      </div>

    </section>
  );
}