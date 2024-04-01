import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center ">
      <div className="container min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-semibold p-2 mt-3">UQ8 Transport Arranger</h1>

        <div className=" flex justify-center gap-10 flex-1 items-center text-2xl">
          <Link href={'/manual'}>
            <div className="flex justify-center items-center h-[200px] w-[200px] bg-yellow-200 rounded-2xl hover:bg-yellow-300">
              Manual
            </div>
          </Link>
          <Link href={'/auto'}>
            <div className="flex justify-center items-center h-[200px] w-[200px] bg-yellow-200 rounded-2xl hover:bg-yellow-300">
              Auto
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
