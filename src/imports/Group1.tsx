function Blocks() {
  return (
    <div className="absolute grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(3,_minmax(0px,_1fr))] h-[87px] left-0 top-[44px] w-[364px]" data-name="Blocks">
      <div className="[grid-area:1_/_1] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:1_/_2] bg-[#b649fe] h-[29px] relative shrink-0 w-[122px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:1_/_3] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:2_/_1] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:2_/_2] bg-[#b649fe] h-[29px] relative shrink-0 w-[122px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:2_/_3] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:3_/_1] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:3_/_2] bg-[#b649fe] h-[29px] relative shrink-0 w-[122px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
      <div className="[grid-area:3_/_3] bg-[#b649fe] h-[29px] relative shrink-0 w-[121px]" data-name="block">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-[-0.5px] pointer-events-none" />
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-white h-[521px] left-0 top-0 w-[364px]" data-name="frame" />
      <Blocks />
      <div className="absolute left-[182px] size-[41px] top-[393px]" data-name="ball">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 41">
          <circle cx="20.5" cy="20.5" fill="var(--fill-0, black)" id="ball" r="20.5" />
        </svg>
      </div>
      <div className="absolute bg-[#9b9b9b] h-[9px] left-[173px] rounded-[5px] top-[442px] w-[100px]" data-name="paddle" />
    </div>
  );
}