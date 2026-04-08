import imgImage3 from "figma:asset/3a13d255a482184e278d2ef42fffd235d93d8afe.png";

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute h-[927px] left-0 top-0 w-[1287px]" data-name="image 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute bg-[#d9d9d9] h-[219px] left-[152px] top-[137px] w-[197px]" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['CT_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] left-[503px] not-italic text-[12px] text-black top-[200px] tracking-[0.2929px] w-[125px]">
        <p className="leading-[16px]">This is single row text</p>
      </div>
    </div>
  );
}