import AddJobForm from "@/components/AddJobForm";

export default function AddJobPage() {
  return (
    <div className="mx-auto max-w-3xl p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Add New Job
      </h1>

      <AddJobForm />
    </div>
  );
}