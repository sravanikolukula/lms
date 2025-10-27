import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/dashboard">
      <div className="flex items-center leading-[117.02%] cursor-pointer font-poppins">
        {/* Gradient "Edu" */}
        <b className="text-[21px] sm:text-[25px] font-semibold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
          Edu
        </b>

        {/* Solid blue "Edu" (optional part?) */}
        <b className="text-[21px] sm:text-[25px] font-semibold text-gray-100">
          Edu
        </b>

        {/* "cation" part */}
        <span className="text-[21px] sm:text-[25px] font-poppins text-teal-400">
          Spark
        </span>
      </div>
    </Link>
  );
};
