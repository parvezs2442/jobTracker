import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {

    // Later you'll fetch this from your getMe API
    const user = {
        name: "Parvez Saifi",
        email: "parvez@gmail.com",
    };

    return (

        <main className="mx-auto max-w-4xl p-10">

            <div className="rounded-xl bg-white p-8 shadow">

                <div className="flex items-center gap-5">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                        {user.name.charAt(0)}
                    </div>

                    <div>

                        <h1 className="text-3xl font-bold">
                            {user.name}
                        </h1>

                        <p className="text-gray-500">
                            {user.email}
                        </p>

                    </div>

                </div>

                <hr className="my-8" />

                <div className="grid gap-6 md:grid-cols-2">

                    <div className="rounded-lg border p-5">

                        <p className="text-sm text-gray-500">
                            Full Name
                        </p>

                        <h2 className="mt-2 text-lg font-semibold">
                            {user.name}
                        </h2>

                    </div>

                    <div className="rounded-lg border p-5">

                        <p className="text-sm text-gray-500">
                            Email
                        </p>

                        <h2 className="mt-2 text-lg font-semibold">
                            {user.email}
                        </h2>

                    </div>

                </div>

                <div className="mt-10">

                    <LogoutButton />

                </div>

            </div>

        </main>

    );
}