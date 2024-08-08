import { DexterButton } from "components/DexterButton";

export default function NotFound() {
  return (
    <div className="w-full mb-20 h-full flex flex-col justify-center items-center">
      <h2 className="bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-80% bg-clip-text text-transparent">
        <span className="max-sm:text-4xl max-lg:text-6xl max-xl:text-7xl text-9xl font-normal max-sm:leading-6 leading-[124px]">
          404 :(
        </span>
      </h2>
      <p className="max-sm:text-base max-lg:text-xl max-xl:text-xl text-2xl font-normal text-white">
        You got the wrong way
      </p>

      <DexterButton title="Back to trade" targetUrl="/trade" />
    </div>
  );
}
